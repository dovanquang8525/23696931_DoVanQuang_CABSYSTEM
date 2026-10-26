# Rà soát Postman và công cụ — 27/10/2026

## Kết quả

Đã rà SRS, Bounded Context, Architecture, 10 YAML trong `docs/api/`, `contracts.md`, bộ kiểm thử giai đoạn 6 và sáu script được yêu cầu. Không sinh lại collection, không chạy đồng bộ vào repository, không gửi HTTP hoặc triển khai backend.

Hai collection và cả ba environment JSON hiện có được giữ nguyên từng byte. Các assertions, biến, fixture, ID request, polling và thứ tự folder của giai đoạn 6 không bị sửa. 10 YAML, SRS, Bounded Context, `.env`, `.env.example` và archive legacy cũng giữ nguyên SHA-256. Không có file gốc bị xóa; không commit/push hoặc sửa Git index trong nhiệm vụ này.

## Phát hiện và xử lý

| Phát hiện | Xử lý |
| --- | --- |
| README trỏ collection CAB-System 78 request và environment camelCase; chưa chỉ ra bộ giai đoạn 6 | Chọn CAB-MVP 142 request và environment có chữ `copy`, dùng snake_case, làm bộ chạy chính; giữ bộ cũ để kiểm tương thích |
| Manifest có đúng hash của 10 YAML nhưng chưa xác định collection/environment chính | Giữ source hashes; bổ sung đường dẫn, hash, vai trò primary/compatibility, contracts và tài liệu kiểm thử |
| Hai checker chỉ kiểm bộ catalog cũ, nên kết quả đạt chưa bao phủ giai đoạn 6 | Thêm kiểm tra cả 142 request, 47 catalog operation, biến/control flow, 103 case và đúng 30 mục; giữ các regression cũ |
| sync_postman.py thực thi ngay khi import/chạy và dùng write_text ghi đè CAB-System/manifest | Đưa logic sinh vào hàm, import không ghi; mặc định từ chối; chỉ cho xuất ứng viên vào thư mục mới dưới .local/postman-candidates; ghi file bằng chế độ exclusive |
| Generator không giữ được luồng/assertions/fixture của giai đoạn 6 | Không dùng để đồng bộ bộ test; chưa sinh ứng viên. Cần review bảo toàn riêng trước khi áp dụng bất kỳ bản sinh nào |
| Hai signer có hai họ biến, một signer có prompt; prepare_callback ghi đè output và chưa kiểm hết miền giá trị | Chọn prepare_callback làm chính; kiểm contract/placeholder, giữ raw UTF-8, key chỉ từ MOCK_CALLBACK_SECRET, output private và không ghi đè. Signer cũ trở thành CLI tương thích gọi chung implementation; alias key cũ chỉ nhận từ process environment |
| Output mặc định .local chưa có quy tắc ignore tường minh | Bổ sung .local/ và kiểm git check-ignore; writer kiểm Git ignore với output trong repository |
| Tham chiếu srs2.md, api-specifications/, reference/ và docs/coverage.md lỗi thời | Sửa các tham chiếu tại AGENTS, Architecture, contracts và Test-Cases; không thay đổi quy tắc nghiệp vụ |

README mới tách luồng chính 00–05, các nhánh thủ công 06/07/08/11, API catalog 09 và rate-limit 10. Không hướng dẫn Run toàn collection. Điểm chờ callback trong happy path được ghi rõ; 11 request rate-limit không được coi là bằng chứng >1000 request/giây.

Signer chính tạo callback_payload/callback_timestamp/callback_signature cùng metadata fixture, bảo toàn token/ID/snapshot khác của phiên local. Ký trên ASCII(timestamp)+LF+raw UTF-8 body, serialize một lần. Replay gửi đúng bytes cũ, không ký lại. Script từ chối key trong Postman làm nguồn ký, loại signing secrets khỏi output, chặn placeholder có thể bị Postman thay bytes, không ghi đè file local. Hai CLI đã được so cùng timestamp/eventId bằng key giả, cho cùng raw body và chữ ký.

## File chỉnh sửa

- `.gitignore`, `AGENTS.md`.
- `docs/ARCHITECTURE.md`, `docs/api/contracts.md`: chỉ sửa đường dẫn/thông tin hiện trạng contract.
- `postman/README.md`, `postman/documents/api-source-manifest.json`, `postman/documents/Test-Cases.md`.
- `scripts/check_postman.py`, `scripts/check_postman.cjs`, `scripts/sync_postman.py`, `scripts/prepare_callback.py`, `scripts/sign_mock_callback.py`.
- Thêm `scripts/test_postman_tools.py` và báo cáo `postman/documents/AUDIT.md`.

## Lệnh và kết quả thực tế

Lệnh đầu vào: `git status --short`, đọc các file/tài liệu và rà tham chiếu bằng `rg`. Đã chụp hash toàn bộ file ngoài `.git` trước chỉnh sửa và đối chiếu file bảo vệ sau chỉnh sửa. Không đọc/in giá trị secret để làm báo cáo.

Trong môi trường hiện tại PyYAML có sẵn ở thư mục công cụ tạm từ lần làm trước; trước khi chạy checker Python đã đặt:

```powershell
$env:PYTHONPATH="$env:TEMP\cab-pdf-reader"
$env:PYTHONDONTWRITEBYTECODE='1'
```

Không cài dependency dự án hoặc npm trong nhiệm vụ này. Khi chạy ở máy khác, cần có PyYAML/jsonschema trong Python environment phát triển.

| Lệnh | Kết quả |
| --- | --- |
| python -B scripts/check_postman.py | Đạt kiểm offline: 142 request giai đoạn 6, 47/47 catalog operation, artifact/source hashes, biến, route, expected status, control-flow targets; 103 case và đúng 30 tiêu chí. Bộ tương thích 78 request vẫn được kiểm riêng. Schema và signer kiểm bằng dữ liệu giả. |
| node scripts/check_postman.cjs | Parse 440 script của 142+78 request; fixture SDK giả kiểm role isolation, thiếu tiên quyết, full replay snapshot, polling hữu hạn, HTTP status, raw callback và chuỗi rate 201/200/429. |
| python -B scripts/test_postman_tools.py | 6 bài unittest công cụ đạt: HMAC UTF-8, bảo toàn biến/snapshot, input validation, private/exclusive output, CLI key từ môi trường, cùng bytes giữa hai CLI và generator guard. |
| node --check scripts/check_postman.cjs | Cú pháp hợp lệ. |
| compile() cho các file Python, không xuất pyc | Cú pháp hợp lệ. |
| Kiểm đích liên kết Markdown hiện hành | 26 liên kết kiểm tra đều tồn tại. |
| git check-ignore -v -- .local/session.postman_environment.json .local/callback.postman_environment.json .env.postman-session.json | Các đường dẫn local đều bị ignore. |
| git diff --check | Không có lỗi whitespace; Git có cảnh báo LF→CRLF cho SRS/Bounded Context từ các thay đổi đã có. |

Unittest chỉ gọi generator với **không có tham số** và với `--output-dir` trỏ đích hiện hành để kiểm việc từ chối; cả hai trả mã khác 0, không ghi file. Import generator cũng được kiểm không có side effect. Không gọi `generate()` hoặc chạy một lần sinh ứng viên hợp lệ. Hash collection/environment/manifest được so trước và sau các kiểm tra từ chối.

## Còn bị chặn

- Không có code backend/Compose trong các thư mục triển khai được khảo sát. Chưa gửi request tới Gateway, chưa chạy Postman/Newman; không có PASS/FAIL nghiệp vụ từ lần rà soát này. Baseline test cases/grading checklist vẫn BLOCKED và actual/evidence chưa có.
- Bounded Context còn mô tả CASH, cash-confirmation, route `/api/...` và một số event cũ; SRS 2.0/contracts/YAML hiện hành chỉ MOCK_ONLINE và REST `/api/v1`. Cần thống nhất tài liệu trước triển khai. Không thêm endpoint hoặc CASH để chiều theo tài liệu cũ.
- Quy tắc tổng quát AGENTS nhắc baseUrl nhưng giai đoạn 6 dùng base_url; README và manifest chỉ rõ hai họ biến. Chưa đổi tên biến trong collection/fixture; migration cần kế hoạch bảo toàn riêng.
- Chưa kiểm HTTP, DB/seed, signature phía server, callback/retry/concurrency, Redis/broker/recovery, encryption at rest, browser XSS hoặc tải >1000 request/giây. Các case cần công cụ/fixture bổ sung giữ trạng thái BLOCKED, không hạ yêu cầu hoặc chấp nhận 503 thay lỗi nghiệp vụ mong đợi.
- Tái sinh catalog cũ không bảo toàn giai đoạn 6. Việc xem xét một bản ứng viên, hợp nhất assertions/fixture và áp dụng vào bộ hiện hành chưa được thực hiện.

Không thêm tiêu chí chấm thứ 31. Kết quả trong báo cáo là kiểm định artifact/công cụ, không phải nghiệm thu hệ thống.
