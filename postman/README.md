# CAB Postman — bộ kiểm thử giai đoạn 6

Nguồn API hiện hành: [10 OpenAPI YAML](../docs/api/), [contracts.md](../docs/api/contracts.md), [SRS](../docs/SRS.md), [Bounded Context](../docs/Bounded-Context.md) và [Architecture](../docs/ARCHITECTURE.md). `documents/legacy/` chỉ là kho lưu, không phải nguồn API/test hiện hành.

**Collection chính:** [CAB-MVP.postman_collection.json](collections/CAB-MVP.postman_collection.json), 142 request, 12 folder, gồm API catalog đủ 47 operation.

**Environment đi kèm giai đoạn 6:** [CAB-Local.postman_environment copy.json](<environments/CAB-Local.postman_environment copy.json>). Tên file có chữ `copy` là tên hiện có; dùng đúng file này với các biến `snake_case`. [Manifest](documents/api-source-manifest.json) ghi rõ cặp collection/environment chính, SHA-256, nguồn API, hợp đồng và tài liệu kiểm thử.

[CAB-System.postman_collection.json](collections/CAB-System.postman_collection.json) cùng [CAB-Local.postman_environment.json](environments/CAB-Local.postman_environment.json) là bộ catalog trước đó, dùng `camelCase`, được giữ để tương thích và đối chiếu. Không trộn hai environment hoặc dùng số lượng 78 request của bộ cũ để báo độ phủ bộ giai đoạn 6. Cả hai collection đều được bảo toàn trong lần rà soát này, không tái sinh hoặc ghi đè.

**Trạng thái thực tế:** chưa có backend/hạ tầng trong repository này; chưa thực hiện kiểm thử HTTP. 103 case và đúng 30 mục chấm vẫn `BLOCKED`/`NOT_RUN`; kiểm tra tĩnh hoặc sandbox mô phỏng không phải PASS nghiệp vụ.

## Import và fixture local

1. Import collection **CAB-MVP** và environment có chữ **copy** ở trên, chọn environment giai đoạn 6.
2. `base_url=http://localhost:3000`, không thêm `/api/v1`. Request nghiệp vụ đã có `/api/v1`; health dùng `/health`, `/ready`, `/health/services` ở root Gateway. Biến `baseUrl` thuộc catalog cũ, không đổi tên hàng loạt biến giai đoạn 6 chỉ để thống nhất cách viết.
3. Điền credential local cho CUSTOMER, CUSTOMER thứ hai, DRIVER và ADMIN bằng các biến `customer_phone/customer_password`, `customer2_phone/customer2_password`, `driver_phone/driver_password`, `admin_phone/admin_password`. ADMIN phải được seed; không có đăng ký ADMIN công khai. Các tài khoản seed phải ACTIVE; Customer profile sẵn sàng; Driver có profile, BIKE và đã APPROVED.
4. Login lưu riêng `customer_token`, `customer2_token`, `driver_token`, `admin_token`. Giữ Account ID và profile ID tách biệt. Bộ test có các ID/key/snapshot riêng cho happy path, cancel, retry, onboarding, rate-limit và NO_DRIVER; không hoán đổi fixture giữa các nhánh.
5. `pickup_lat/pickup_lon`, `destination_lat/destination_lon` phải hợp lệ, khác nhau và phù hợp vị trí Driver seed. Bài nearby/history cần ít nhất 5 Driver/Booking theo case tương ứng. `poll_limit` mặc định trong script là 20, có chặn tối đa 40 lượt; khoảng nghỉ Runner phải phù hợp thời gian expiry offer và mục tiêu đồng bộ của case.
6. Export phiên local vào `.local/session.postman_environment.json` hoặc `.env.postman-session.json`. Cả hai được Git bỏ qua. Không ghi đè environment mẫu bằng token/password thật, không đồng bộ file local vào workspace chung. `postman/globals/workspace.globals.yaml` được giữ nguyên.

Đọc [Test-Cases.md](documents/Test-Cases.md), [coverage.md](documents/coverage.md), [manual-checks.md](documents/manual-checks.md) và [grading-checklist.md](documents/grading-checklist.md) trước khi chạy. 103 case tương ứng AC01–AC105 trừ AC57–AC58 ngoài phạm vi tiền mặt, không phải 103 test tự động đã hoàn tất.

## Luồng chạy chính

**Không Run toàn bộ collection.** Chạy theo folder/đoạn được chọn và chỉ tiếp tục khi fixture cùng dependency đã sẵn sàng. `pm.execution.setNextRequest` chỉ điều khiển Runner/Newman; bấm Send không tự lặp polling hoặc tự đi tới request kế tiếp.

| Folder | Cách chạy và điều kiện |
| --- | --- |
| 00 Health — run first | Kiểm health/ready và đúng 12 thành phần healthy. 503 là chưa sẵn sàng, không coi là đạt luồng healthy. |
| 01 Tokens — seed accounts | Login bốn tài khoản seed, đọc hai Customer profile và Driver profile. Lưu đủ token và ID trước khi chạy nghiệp vụ. |
| 02 Happy path — fresh booking | Driver location/ONLINE → nearby → Booking mới → poll đúng invitation → ACCEPT → ARRIVED → IN_PROGRESS → location → COMPLETED/cước → Payment. Cần xử lý điểm dừng callback bên dưới. |
| 03 Replay — after Happy path | Dùng key/body/snapshot gốc của folder 02. So sánh toàn bộ snapshot Booking/Payment, không chỉ ID. Không chạy lại bước tạo gốc trước khi replay vì nó sinh key mới. |
| 04 Cancel assigned — separate booking | Dùng cancel_booking_id/cancel_trip_id riêng; tạo và nhận chuyến riêng rồi preview/confirm/replay hủy. Không hủy Trip happy path đã hoàn thành. |
| 05 Negative security — after 00 to 04 | Chạy từng case với token đúng và fixture đi tới được nhánh lỗi cần kiểm; 503/500 không thay được 400/401/403/409. Xem lưu ý fixture ở manual-checks.md. |

**Điểm dừng Payment trong folder 02:** sau `Create mock Payment`, `Poll successful Payment` chờ callback COMPLETED. Nếu mock adapter SUCCESS thực sự chạy thì có thể tiếp tục polling hữu hạn. Nếu chỉ có công cụ ký thủ công, dừng trước request poll: export environment đang dùng → chuẩn bị callback bằng script chính → import/chọn environment đã merge → gửi riêng request callback hợp lệ ở folder 07 → quay lại `Poll successful Payment`, rồi tiếp tục Review, Booking final view, Driver released, notifications và history. Không Run liên tục folder 02 khi chưa có nguồn gửi callback.

Các snapshot `booking_original`, `payment_original`, `retry_original` là expected response gốc phục vụ replay. Không sửa snapshot theo response hiện tại để làm assertion đạt; hợp đồng yêu cầu replay trả snapshot đã lưu, còn GET trả trạng thái hiện tại.

## Kịch bản thủ công và fixture riêng

| Folder | Cách dùng |
| --- | --- |
| 06 Register and onboard — optional new phones | Phone mới, OTP mock DRIVER còn hạn và chưa tiêu thụ; hoàn thiện profile/BIKE rồi submit PENDING, ADMIN duyệt. Tách khỏi tài khoản Driver seed của happy path. |
| 07 Manual signed callback — run one request | Chọn một request đúng fixture: callback mới hợp lệ, replay nguyên callback cũ, hoặc signed wrong-data. Không Run cả folder. Callback sai chữ ký kiểm riêng ở folder 05. |
| 08 Retry — manual FAILED fixture | Cần attempt FAILED mới nhất, failed_payment_id và Trip riêng đã COMPLETED. Tạo retry với key mới → replay đúng key/snapshot → ký callback mới cho retry_payment_id với reference/amount của attempt mới → đọc kết quả. Không vượt 3 attempt. |
| 11 No Driver — isolated empty area | Dùng vùng không có Driver phù hợp; tạo fixture riêng rồi poll NO_DRIVER, xác nhận chưa có Trip. Không tự offline Driver đang chạy chuyến khác. |

Callback âm phải giữ nguyên fixture khi kiểm trước/sau: amount/reference sai hoặc event mới stale có chữ ký hợp lệ mong đợi 400; payment ID không tồn tại mong đợi 404; chữ ký sai luôn 401; event/payload conflict hoặc trái kết quả cuối mong đợi 409. Không ký lại callback hợp lệ sau khi sửa raw body trong Postman. Những biến thể chưa có công cụ/fixture phù hợp phải ghi BLOCKED, không thay đổi nghiệp vụ để đạt assertion.

## API catalog

Folder **09 API catalog — do not Run folder** là thư viện 47 operation theo 10 YAML, không phải luồng nghiệp vụ. Chọn từng request, chọn role/ID phù hợp rồi chạy. Không chạy tuần tự folder này: nó có create/update/state-change và callback, dùng fixture phụ thuộc nhau theo cách khác luồng chính.

Bộ catalog cũ CAB-System được kiểm tra riêng với environment camelCase của nó để phát hiện tham chiếu lỗi thời; không thay thế luồng, polling, assertions hoặc evidence giai đoạn 6.

## Rate-limit tách riêng

Folder **10 Rate limit — isolated clean window** chỉ chạy ở một cửa sổ 60 giây sạch, với CUSTOMER fixture riêng hoặc đã chờ hết quota của mọi bài trước. Không chạy cùng happy path hoặc bài tải cao.

Chuỗi hiện có: chuẩn bị Driver/location → request Booking 01 dùng key mới, mong đợi 201 → request 02–10 giữ đúng key và body, mong đợi 200/replay cùng bookingId → request 11 vẫn đi qua limiter, mong đợi 429/RATE_LIMITED và Retry-After → đọc trạng thái fixture và chỉ cleanup khi SEARCHING. Cách này kiểm limiter đếm request tạo Booking kể cả replay, đồng thời tránh tạo 10 booking mới. Không đổi key, hạ quota hoặc bỏ assertions chỉ để bài test đạt.

Rate-limit phải chạy trong cùng cửa sổ và không vướng quota IP; nếu không bảo đảm fixture/thời gian thì ghi BLOCKED và chuẩn bị lại, không sửa response kỳ vọng. 11 request tuần tự **không chứng minh >1000 requests/sec**. Yêu cầu tải cao, Redis lỗi/restart và TTL cần công cụ/bằng chứng riêng theo TC97 và manual-checks.md; chưa đo thì phần đó vẫn BLOCKED.

## Script ký callback chính

Dùng [prepare_callback.py](../scripts/prepare_callback.py) cho giai đoạn 6. Khóa chỉ đọc từ biến môi trường tiến trình **MOCK_CALLBACK_SECRET**, phải trùng khóa được cấu hình cho payment_service/mock adapter sau này. Script không lấy key từ `.env`, environment Postman hoặc prompt, không lưu key vào output. Cấp khóa vào tiến trình bằng cách quản lý secret local của bạn; không hardcode vào command history, Git hoặc collection.

Ví dụ sau khi export phiên local (thay các placeholder bằng dữ liệu Payment thực):

```powershell
python -B scripts/prepare_callback.py --env-in ".local/session.postman_environment.json" --out ".local/callback-completed.postman_environment.json" --payment-id "<paymentId>" --reference "<referenceCode>" --amount <amount> --result COMPLETED
```

Đường dẫn output phải mới; script từ chối ghi đè. Output giữ token/ID/snapshot của env-in, thêm `callback_payload`, `callback_timestamp`, `callback_signature`, `callback_payment_id`, `callback_expected_status`, `callback_duplicate_expected=false`. Các biến chứa signing secret bị loại; nếu key còn trong metadata thì script từ chối xuất.

Công thức ký đúng [contracts.md §6](../docs/api/contracts.md):

```text
signedBytes = ASCII(decimalUnixTimestamp) + LF + raw UTF-8 body
X-Mock-Signature = sha256=<lowercase HMAC-SHA256 hex>
X-Mock-Timestamp = decimalUnixTimestamp = body.timestamp
```

Body chỉ serialize **một lần** trước ký và được giữ nguyên trong `callback_payload`. Folder 07 gửi nguyên giá trị đó; không format, thêm newline, chèn biến hoặc parse/serialize lại sau khi ký. Trường có dấu `{{...}}` bên trong dữ liệu ký bị script từ chối để tránh Postman thay bytes. Import output vào local và gửi callback mới trong ±300 giây; `--timestamp`/`--event-id` chỉ dùng khi chủ động chuẩn bị biến thể kiểm thử.

Replay callback: chọn `Replay exact prepared callback`, giữ nguyên body/timestamp/signature/eventId cũ, không chạy signer lần nữa. Hợp đồng cho duplicate đã xử lý trả kết quả cũ dù timestamp cũ, nhưng luôn xác minh chữ ký. Với retry, lấy referenceCode/amount của attempt mới trước khi ký; không dùng lại callback của failed_payment_id.

[sign_mock_callback.py](../scripts/sign_mock_callback.py) được giữ làm CLI tương thích cho catalog camelCase, gọi chung implementation ký của script chính; không còn prompt hoặc thuật toán ký riêng. Nó đọc MOCK_CALLBACK_SECRET (hoặc alias môi trường cũ CAB_MOCK_CALLBACK_SECRET; nếu hai giá trị khác nhau thì từ chối), nhận cờ CLI cũ và thêm callbackRawBody/callbackTimestamp/callbackSignature. Không dùng output camelCase để thay environment giai đoạn 6.

## Generator và kiểm tra tĩnh

[sync_postman.py](../scripts/sync_postman.py) trước đây ghi đè CAB-System collection và manifest khi chạy/import. Nó không bảo toàn 142 request, các biến snake_case, fixture, full-snapshot assertions hoặc control flow của giai đoạn 6.

Sau rà soát, import không ghi file; gọi mặc định bị từ chối trước khi sinh dữ liệu. Chỉ cho phép xuất ứng viên vào **thư mục mới** dưới `.local/postman-candidates/` bằng `--output-dir`; mọi đường dẫn hiện hành bị chặn, output có sẵn không bị ghi đè. **Chưa chạy đồng bộ hoặc sinh ứng viên trong lần rà soát này.** Trước khi áp dụng ứng viên phải đối chiếu assertions/biến/fixture/polling/luồng/evidence bằng diff và có quyết định riêng; generator này không phải công cụ đồng bộ tự động cho bộ giai đoạn 6.

Công cụ kiểm tra cần Python với PyYAML/jsonschema và Node.js. Chạy tại root:

```text
python -B scripts/check_postman.py
node scripts/check_postman.cjs
python -B scripts/test_postman_tools.py
```

Các lệnh trên không gửi HTTP. Python kiểm manifest/hashes, 10 nguồn, 47 operation, cả hai catalog, request/schema/biến/control-flow, 103 case và đúng 30 tiêu chí. JS parse cả 440 script, kiểm mô phỏng các bước quan trọng bằng SDK stub. Bộ test công cụ kiểm HMAC UTF-8, bảo toàn biến/snapshot, key chỉ từ process environment, không xuất key, từ chối output công khai/ghi đè và generator từ chối đích hiện hành. Kiểm từ chối generator không thực hiện sinh collection.

Bằng chứng runtime dùng [run-record.template.json](evidence/run-record.template.json); giữ baseline test-cases/grading-checklist, ghi kết quả từng biến thể vào bản local đã che secret. Không đổi hàng loạt trạng thái sang PASS sau kiểm tĩnh.

## Điểm còn cần làm rõ trước triển khai

- Bounded Context hiện có vẫn nhắc CASH, các route `/api/...`, cash-confirmation và một số event cũ; SRS 2.0 và API hiện hành chỉ BIKE/MOCK_ONLINE, REST nghiệp vụ `/api/v1`. Đây là sai khác tài liệu, không được giải quyết bằng cách thêm endpoint hoặc hỗ trợ CASH vào collection/backend chỉ để giữ tương thích.
- AGENTS dùng tên biến baseUrl trong quy tắc tổng quát, bộ test giai đoạn 6 dùng base_url. Rà soát này giữ tên biến đang được assertions/fixture sử dụng; đổi tên cần migration đồng bộ riêng.
- Chưa có backend, Compose, DB/seed, broker/Redis, mock adapter hoặc bằng chứng HTTP. Còn bị chặn: chạy luồng, kiểm isolation/ownership thực, callback/retry/concurrency, DB encryption, recovery/events, browser XSS và tải cao.
- Không dùng documents/legacy làm đầu vào các checker/generator/signer. Không thêm tiêu chí chấm 31.
