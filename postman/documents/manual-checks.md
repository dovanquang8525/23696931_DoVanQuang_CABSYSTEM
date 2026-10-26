# Kiểm tra bổ sung ngoài collection tuần tự

## 1. Fixture và mã phản hồi cụ thể

Không dùng một fixture sai nhiều điều kiện rồi suy ra mọi kiểm tra đã hoạt động. Ví dụ Review đã tồn tại có thể che kiểm điểm/ownership; mỗi loại lỗi cần fixture cho phép đi tới đúng nhánh đang thử. Dùng đúng field phone của Login, không lấy payload email từ phiếu rồi gửi vào field không tồn tại và kết luận query đã an toàn.

| Tình huống | Expected |
| --- | --- |
| JSON/type/unknown field/min-max/XSS sai | 400 INVALID_INPUT, không ghi dữ liệu |
| OTP sai mã, chưa hết lượt | 400 INVALID_INPUT; failedAttempts tăng |
| OTP expired/invalidated/consumed hoặc trạng thái không hợp lệ | 409 INVALID_STATE; không verify/register |
| OTP sau 5 lần sai; cooldown/request/IP limit | 429 RATE_LIMITED; Retry-After; không vượt quota |
| JWT thiếu/sai/hết hạn; credential login sai | 401; không token hoặc dữ liệu nghiệp vụ |
| Token hợp lệ sai role/ownership; Account DISABLED | 403, không trả dữ liệu ngoài quyền |
| Driver online thiếu điều kiện, hồ sơ chưa đủ gửi duyệt, state transition sai | 409 INVALID_STATE |
| Key cũ khác payload; duplicate Review | 409 IDEMPOTENCY_CONFLICT hoặc DUPLICATE_RESOURCE tương ứng |
| Preview hủy hợp lệ về input nhưng trạng thái không được phép | 200 allowed=false; không hủy |
| Confirm hủy khi IN_PROGRESS/COMPLETED/NO_DRIVER | 409; preview cũ không bỏ bước kiểm tra lại |
| Callback sai signature | 401, kể cả eventId đã biết |
| Callback đúng signature, sai amount/reference/VND hoặc event mới stale | 400; state giữ nguyên |
| Callback đúng signature và dữ liệu nhưng Payment không tồn tại | 404 |
| Callback eventId conflict hoặc trái kết quả cuối | 409; không đổi trạng thái cuối |
| Dependency lỗi hoặc profile đang chờ | 503; không dùng để PASS test lỗi nghiệp vụ |
| gRPC write timeout | 504; tra cứu cùng key/operation trước khi thử lại |

Các nhánh này cụ thể hóa domain error đã có trong YAML 400/409/429; Codex cần dùng cùng quy ước khi triển khai. Một response đúng mã chưa đủ nếu dữ liệu đã bị ghi sai: luôn kiểm trước/sau với case bảo mật/trạng thái/idempotency.

## 2. Đồng thời và replay

Postman Collection Runner chạy tuần tự không chứng minh race condition. Codex cần tạo integration test hoặc client local có barrier/Promise.all/ThreadPool với ít nhất các nhóm sau; chạy trên fixture riêng, không trên Trip/Payment của happy path đã kết thúc.

| Case | Kích thích đồng thời | Bằng chứng bắt buộc |
| --- | --- | --- |
| TC37-01 | Hai ACCEPT cùng invitation/Booking | Unique bookingId, chỉ một Trip, replay không tạo thêm |
| TC37-02 | Hai Booking có offer cho cùng Driver, ACCEPT cùng lúc | Chỉ một reservation/activeTrip và một Trip active/Driver |
| TC41 | Customer cancel đối đầu Driver accept | Sau recovery chỉ đúng một kết quả; không Booking CANCELED nhưng Trip active |
| TC46 | Start và cancel đối đầu cùng Trip ARRIVED | Chỉ một CAS thắng; nếu start thắng cancel409, nếu cancel thắng start409 |
| TC105-01 | N request tạo Payment cùng key/body | Một attempt, ID/snapshot như nhau, không thu thêm |
| TC105-02 | N key mới tạo Payment cùng Trip | Tối đa một PENDING/COMPLETED, còn lại conflict; không lỗi500 do unique chưa xử lý |
| TC105-03 | N retry key mới cùng attempt FAILED | Một attempt tiếp theo, attemptNumber không vượt3 |
| TC105-04 | Callback duplicate hoặc COMPLETED đối đầu FAILED | Chỉ một kết quả cuối theo CAS, event/outbox không gây double charge |

Sau timeout/503 phải đợi hoặc kích hoạt recovery rồi đọc lại operation/reservation/Trip/Payment và đếm DB. Không chỉ đếm số HTTP200/409 để kết luận PASS. Không bỏ index, xóa Trip hoặc tự tạo khóa mới để né trạng thái chưa rõ.

## 3. Khả năng phục hồi và broker

Kiểm local theo từng điểm dừng: Auth commit nhưng chưa publish account.registered; Booking đã reserve; CreateTrip đã ghi nhưng caller timeout; Booking đã COMMIT; Trip completed/outbox chưa publish; consumer đã ghi DB nhưng ACK bị mất. Stop/start đúng container hoặc dùng test hook nội bộ, không mở endpoint public sửa state.

Sau phục hồi: cùng eventId/operation, không profile/Trip/Payment trùng; event cũ không đổi trạng thái cuối hoặc release activeTripId của chuyến mới; đủ Notification đúng người. Kiểm exchange cab.events, bốn queue nghiệp vụ, binding, persistent/confirm, ACK sau transaction/inbox; retry 1/5/15 giây rồi DLQ. Replay DLQ giữ eventId và ghi log.

Tên Compose service chưa được khảo sát/xác nhận, nên lấy tên thật từ docker compose config --services trước khi dùng stop/start/logs. Không dùng docker compose down -v trong bài persistence. Không suy ra nhiều DB được ghi atomically chỉ vì chúng cùng một instance.

## 4. Bảo mật dữ liệu và transport

TC93 cần đọc MongoDB trên dữ liệu giả: passwordHash/codeHash không plaintext; licenseNumberEncrypted có ciphertext/iv/authTag/keyVersion; không có key trong DB/source; đọc/giải mã đúng quyền và đúng key, thiếu/sai key không ready/decrypt. Chụp trạng thái đã che giá trị, không đưa key/JWT/password vào evidence. Kiểm key còn sau restart, không tự sinh key mới đè dữ liệu cũ.

TC81/98 cần kiểm host port gRPC không publish, rồi từ client trong Docker network gọi RPC thiếu/sai internal secret, JWT/role/ownership. Host port đóng chỉ chứng minh network isolation, chưa chứng minh service tự kiểm quyền. Auth verify signature/HS256/iss/aud/exp; không dùng token sửa payload rồi chỉ decode.

TC96: 400 và DB không ghi chứng minh input filter; muốn chứng minh không execute trên HTML cần harness hiển thị bằng textContent/escape theo ngữ cảnh. Chưa có harness/UI thì phần browser vẫn BLOCKED; không tạo claim PASS vì Postman không có alert.

## 5. Hiệu năng và tải cao

TC87: môi trường ghi CPU/RAM, commit, cỡ dữ liệu; ít nhất 100 mẫu mỗi API đọc và tối đa 10 đồng thời, báo p95<=2 giây. Đo bằng công cụ tải local đã chọn khi triển khai; một responseTime hoặc trung bình không thay p95.

TC97: collection có bài 11 request ở cửa sổ sạch để kiểm 429; Redis TTL còn khi restart Gateway và Redis lỗi write 503 phải kiểm riêng. Muốn chứng minh mức >1000 request/giây của phiếu, dùng công cụ tải có thể đo throughput thực, số 429/5xx, latency và CPU/RAM; ghi tải mục tiêu lẫn tải đạt được. Không chạy bài tải trong giai đoạn thiết kế và không claim đã đạt. Nếu máy không phát đủ tải, ghi BLOCKED phần tải cao thay vì hạ yêu cầu hoặc ghi PASS.

## 6. Bằng chứng và secret

Mỗi biến thể có testcaseId, runId, fixtureIds, expected, actual, status, timestamp, codeVersion và evidencePaths. Có thể export kết quả Runner/Newman rồi che thông tin nhạy cảm. Kiểm API trả đúng dữ liệu và kiểm DB/log/event nhất quán; một ảnh response200 không bao phủ cả mục chấm. Nhãn PASS trong validation của gói chỉ là kiểm tra bộ test tĩnh, không phải backend.
