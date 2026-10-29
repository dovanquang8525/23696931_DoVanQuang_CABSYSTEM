# Ma trận 30 tiêu chí CAB System

**Offer không hạn nhận (29/10):** theo yêu cầu mới, PENDING không tự hết hạn30 giây. Kịch bản thực b23 chờ35 giây rồi Login Driver, đọc noti/invitation và ACCEPT200; Trip t04 đã hủy sau test, Driver rảnh. Evidence `.local/evidence/no-offer-expiry-2026-10-29T03-22-57-636Z.json`. Kiểm thử timeout offer trong các kết quả cũ là lịch sử, không còn là yêu cầu demo hiện tại; RPC/OTP/JWT timeout vẫn giữ nguyên.

**Demo vị trí tĩnh 29/10:** bỏ chặn tuổi vị trí120 giây theo yêu cầu mới; kiểm thử dùng tọa độ d01 từ tối28/10 vẫn online/nearby/tạo offer và thông báo được. Bán kính1 km, quyền, APPROVED/online/không bận và hạn offer30 giây giữ nguyên. Booking kiểm thử b22 đã hủy trước ACCEPT, không tạo Trip. Evidence `.local/evidence/last-known-location-2026-10-29T03-09-36-147Z.json`. Những kết quả freshness trước đây là lịch sử, không còn là yêu cầu demo hiện tại.

**Dữ liệu demo mới 28/10:** sau sao lưu và xác nhận của người dùng, đã thay dữ liệu cũ bằng 5 Customer c01–c05, 5 Driver d01–d05, 5 Booking b01–b05 của c01; giữ ADMIN. Nearby d01/d02 và phân trang 2–2–1 đã kiểm thực qua Gateway. Evidence `.local/evidence/demo-reset-2026-10-28T06-50-57-940Z.json`. Các bằng chứng trước đây vẫn là lịch sử kiểm thử, không còn dùng account/ID cũ để thao tác. Không tự tăng trạng thái PASS của tiêu chí chỉ từ dữ liệu seed; xem hướng dẫn mới trong MANUAL_POSTMAN_30.md.

Cập nhật **28/10/2026**. Đã trích lại trực tiếp [PHIEU_CHAM_PROJECT.pdf](../PHIEU_CHAM_PROJECT.pdf), trang 2–6, đủ 30 mục. Mỗi mục tối đa 1 điểm; chưa có điểm do giảng viên chấm.

**Trạng thái dưới đây là kết quả kiểm tra kỹ thuật trong lượt audit**, không phải xác nhận đã thao tác Postman UI hoặc trình bày trước giảng viên. Mục 1–10 được kiểm regression, không kế thừa PASS từ lời báo đã làm trước đây. PASS chỉ trong phạm vi bằng chứng ghi ở từng hàng. Phần trình bày và browser cần người dùng thực hiện vẫn NOT TESTED.

Kết quả: **25 PASS kỹ thuật, 1 FAIL (mức tải mục 29), 4 NOT TESTED**. Không tuyên bố 30/30. Gốc SRS/AC và toàn bộ thay đổi trước audit được giữ trong điểm khôi phục; phần văn bản phiếu gốc ở cuối file.

## Regression Password/Phone demo mới

Ngày 28/10/2026: 35/35 unit tests và 35 HTTP checks validation đạt; hash DB thực vẫn Argon2id. Mục9/10/21/24/25/27/28 có thêm evidence trong [PROJECT_STATUS.md](PROJECT_STATUS.md). Tài khoản mẫu quang123@gmail.com/password 123/phone String 0123 đã Register201/Login200. Các trạng thái tổng thể giữ nguyên 25 PASS kỹ thuật, 1 FAIL tải cao, 4 NOT TESTED phần trình bày/browser; không cộng thêm điểm hoặc đổi PASS chỉ do sửa policy.

## Regression ID công khai mới

Theo yêu cầu mới, API/URL dùng cid/did/aid/bid/tid/pid/nid/rid/vid/iid/oid. Migration có backup, giữ c29 và account _id/password/money/status. GET /customers/c29→200, Customer khác→403; toàn luồng Booking/Trip/Payment/Review và replay/OTP/dispatch đã kiểm lại bằng mã ngắn. 37 unit tests và7 Python callback tests đạt. Bằng chứng chi tiết tại [PROJECT_STATUS.md](PROJECT_STATUS.md). Trạng thái tổng thể30 câu không tự nâng điểm; browser/trình bày/load còn thiếu vẫn giữ nguyên.

## Tiến độ và thao tác tiếp theo

| STT | Nội dung phiếu gốc | Thành phần | Trạng thái | Bằng chứng/kết quả thực | Cần thao tác thêm |
| --- | --- | --- | --- | --- | --- |
| 01 | Mô tả kiến trúc tổ chức source code | Source/8 service | NOT TESTED | Đã kiểm cấu trúc/source; chưa quan sát phần trình bày | Giải thích source theo ARCHITECTURE.md |
| 02 | Kiểm tra .gitignore và .env trên github | Git/GitHub | PASS | main: .gitignore có .env/.local; .env 404; .env.example không có secret; local không track .env | Mở GitHub main; chưa audit toàn bộ lịch sử remote |
| 03 | Mô tả nhiệm vụ gateway trong hệ thống | Gateway | NOT TESTED | REST→gRPC/JWT/Redis có code và HTTP evidence; chưa quan sát trình bày | Mô tả gateway/index.cjs và health |
| 04 | Mô tả IPC của các microservice | Proto/RabbitMQ | NOT TESTED | 62 RPC có handler/policy; 48 REST operation map đúng target | Giải thích một RPC và một event |
| 05 | Compose hệ thống và liệt kê các container | Compose/12 container | PASS | Build exit 0; infra_init exit 0; 12 container healthy; Mongo restart thành công | docker compose ps -a |
| 06 | POSTMAN: API health check | Gateway/health | PASS | 3 health endpoint 200; /ready 503 khi broker dừng rồi 200 sau phục hồi | Send 3 health request trong Postman |
| 07 | Kiểm tra hệ thống Kafka / Rabbit MQ | RabbitMQ/outbox/inbox | PASS | 20 queue/4 consumer; register→profile; outage/recovery đạt | Mở management; retry/DLQ chưa fault-inject runtime |
| 08 | Kiểm tra mọi request đều phải đi qua Gateway | Gateway/gRPC | PASS | Toàn bộ HTTP test qua Gateway; Compose không publish port gRPC | Xem ports trong Compose và request URL |
| 09 | POSTMAN: Đăng ký tài khoản khách hàng | Auth/Customer | PASS | HTTP register 201; profile đồng bộ; duplicate 409; không public ADMIN | Register Customer mới trong Postman |
| 10 | POSTMAN: Đăng nhập khách hàng | Auth/JWT | PASS | Login 200/token; password sai 401; chữ ký JWT được kiểm | Login đúng/sai trong Postman |
| 11 | POSTMAN: Lấy thông tin khách hàng với mã số | Customer | PASS | GET theo customerId 200; Customer khác 403 | Send getCustomerById với 2 token |
| 12 | POSTMAN: Lấy thông tin tài xế với mã số | Driver | PASS | GET Driver test theo driverId 200; chi tiết legacy ADMIN 200 | Send getDriverById bằng DRIVER/ADMIN |
| 13 | POSTMAN: Liệt kê danh sách tài xế tại khu vực | Driver/nearby | PASS | ADMIN: 3 Driver trong 1 km, 2 Driver ngoài bán kính bị loại; 5 vị trí khác nhau, hồ sơ đầy đủ; CUSTOMER vẫn lọc vị trí mới | A_TOKEN GET /admin/drivers/nearby bằng latitude/longitude; limit2 |
| 14 | POSTMAN: Liệt kê danh sách các booking của Customer | Booking/paging | PASS | ADMIN lọc c01 có5, c02–c05 mỗi khách3; khớp lịch sử Customer, phân trang không trùng, khác chủ403; gồm NO_DRIVER/CANCELED | A_TOKEN GET /admin/bookings?cid=c01&page=1&limit=2 rồi page=2; chọn cid, không lọc status/ngày |
| 15 | POSTMAN: Đặt xe | Booking/Driver/events | PASS | 201 SEARCHING/BIKE; invitation đúng booking; chưa tạo Trip sớm | Create Booking mới rồi GET invitations |
| 16 | POSTMAN: Tài xế nhận chuyến | Booking/Driver/Trip | PASS | ACCEPT→ASSIGNED; Customer thấy Driver; test cạnh tranh đạt | Accept invitation và GET Booking |
| 17 | POSTMAN: Cập nhật trạng thái chuyến | Trip/Driver | PASS | ARRIVED→IN_PROGRESS→location B→COMPLETED; cước đúng; chặn bỏ bước | Send lần lượt arrival/start/location/completion |
| 18 | POSTMAN: Hủy chuyến | Booking/Trip/Notification | PASS | Cancel ASSIGNED→CANCELED; replay không lặp; cả 2 bên có trip.canceled | Fixture riêng: preview/cancel; xem notifications |
| 19 | POSTMAN: Thanh toán online | Payment/Trip/Booking | PASS | Chặn trước COMPLETED; callback FAILED/retry/COMPLETED; view hasCompleted | Ký callback đúng Payment và GET kết quả |
| 20 | POSTMAN: Đánh giá chuyến đi | Rating/Trip | PASS | Review 201, gắn Trip; rating6 400; khác chủ403; review trùng409 | Review một Trip COMPLETED riêng |
| 21 | POSTMAN: Đăng ký tài xế | Auth/Driver/Vehicle | PASS | OTP202→Register201→license→Submit PENDING; wrong OTP/cooldown đạt | Không dừng ở DRAFT; cần submit |
| 22 | POSTMAN: Duyệt hồ sơ tài xế | ADMIN/Driver/Notification | PASS | List/detail200; reject/resubmit/approve; Driver nhận approval_changed | List/detail và duyệt/từ chối hồ sơ mới |
| 23 | POSTMAN: Bật/tắt trạng thái nhận chuyến | Driver | PASS | DRAFT không online; APPROVED online; offline được lưu và GET xác nhận | PUT availability false rồi GET lại |
| 24 | POSTMAN: Data encryption at rest | Auth/Driver/key config | PASS | Mẫu DB thực: Argon2id, không password rõ; license AES-GCM giải mã đúng; key ngoài source | Minh họa DB/key config không lộ key; không phải full-disk encryption |
| 25 | POSTMAN: SQL injection attempt | Gateway/Auth | PASS | SQL payload từ PDF và NoSQL object trả400, không bypass login | Folder12: SQL/NoSQL request |
| 26 | POSTMAN: XSS input test | Gateway/browser harness | NOT TESTED | XSS input400 đã kiểm; chưa có browser evidence script không thực thi | Chạy xss-harness và thao tác trình duyệt |
| 27 | POSTMAN: JWT tampering | JWT/Gateway | PASS | Sửa chữ ký401; sửa sub/role giữ signature cũ cũng401 | Folder12 JWT tampering |
| 28 | POSTMAN: Unauthorized API access | Role/ownership | PASS | CUSTOMER gọi DRIVER403; khác chủ Booking/Trip/Payment403 | Folder12 role/ownership |
| 29 | POSTMAN: Rate limit attack | Gateway/Redis/load | FAIL | 1200 req:336.7/s,1192x429; Docker5000 req:670.4/s,5000x429; health200 | Limiter đạt; chưa chứng minh >1000 request/s như PDF |
| 30 | POSTMAN: Replay attack (idempotency) | Booking/Payment/callback | PASS | Concurrent create 200/201 cùng snapshot; replay200; invalid/conflict bị chặn; không double charge | Giữ nguyên key/body/snapshot; gửi callback lặp |

## Tệp bằng chứng local

Không đưa token/password vào báo cáo. Các tệp JSON dưới đây chỉ ghi status/case/ID kiểm thử; môi trường có credentials giữ riêng trong .local và bị Git ignore.

- Auth/Customer regression: `.local/identity-run.f402bda7-f9c0-4086-8848-e64538254c2e.json`.
- Backend bản cuối: `.local/evidence/backend-smoke-2026-10-28T03-26-15-332Z.json`.
- Driver onboarding: `.local/evidence/onboarding-2026-10-28T03-14-52-277Z.json`.
- Dispatch reject/timeout/concurrency: `.local/evidence/dispatch-2026-10-28T03-16-12-737Z.json`.
- Nearby paging, legacy detail, cancel notification, JWT payload: `.local/evidence/audit-criteria-supplement-2026-10-28T03-26-17-716Z.json`.
- RabbitMQ outage: `.local/evidence/rabbit-outage-2026-10-28T03-19-35-444Z.json`.
- RabbitMQ recovery: `.local/evidence/rabbit-recovery-2026-10-28T03-19-50-068Z.json`.
- Unit tests: `.local/evidence/unit-tests-final.txt`.
- Static checks: `.local/evidence/static-check-final.txt`.
- Docker state: `.local/evidence/docker-state-final.json`.

[Báo cáo chi tiết và giới hạn](PROJECT_STATUS.md), [hướng dẫn nhập tay](MANUAL_POSTMAN_30.md), [Postman hiện hành](../postman/README.md).

## Smoke và kết quả mong đợi nguyên bản

Các phần dưới đây trích trực tiếp văn bản trang 2–6 của PDF theo bố cục cột gốc, giữ cả smoke, kết quả mong đợi và payload minh họa. Các hàng mô tả dài có thể xuống dòng lệch cột như trong bản PDF; đối chiếu theo số mục và trang nguồn. Không coi các ví dụ payload là cấu hình, mật khẩu thật hoặc chỉ dẫn triển khai.

### Trang PDF 2

```text
BẢNG CHẤM ĐIỂM PROJECT
STT                                               Nội dung                                                                          Kết quả                             Max                                                  Giảng
                                                                                                                                                                                                                         viên chấm
   1    Mô tả kiến trúc tổ chức source code                                                                                                                                                                      1
   2    Kiểm tra .gitignore và .env trên github                                                                                                                                                                  1
   3    Mô tả nhiệm vụ gateway trong hệ thống                                                                                                                                                                    1
   4    Mô tả IPC của các microservice                                                                                                                                                                           1
   5    Compose hệ thống và liệt kê các container                                                                                                                                                                1
   6      POSTMAN: API health check                                                                                              Endpoint trả trạng thái healthy/ready và                                        1
          Smoke: Gọi endpoint /health , Gọi /ready , Gọi /health/services.                                                       danh sách service.
   7    Kiểm tra hệ thống Kafka / Rabbit MQ                                                                                                                                                                      1
   8    Kiểm tra mọi request đều phải đi qua Gateway                                                                                                                                                             1
   9      POSTMAN: Đăng ký tài khoản khách hàng                                                                                  Tài khoản được tạo; khách hàng đăng                                             1
          Smoke: Khách hàng chưa có tài khoản                                                                                    nhập được vào hệ thống.
  10      POSTMAN: Đăng nhập khách hàng                                                                                          Hệ thống cấp token                                                              1
          Smoke: Khách hàng đã có tài khoản đang hoạt động.
BẢNG CHẤM THỰC HÀNH 1
  11   POSTMAN: Lấy thông tin khách hàng với mã số                                                                               Sử dụng token để xem thông tin khách                                            1
                                                                                                                                 hàng
  12   POSTMAN: Lấy thông tin tài xế với mã số                                        Sử dụng token để xem thông tin tài xế                                                                                      1
          POSTMAN: Liệt kê danh sách tài xế tại khu vực                                                                          Danh sách Driver xung quanh tọa độ có
  13      Smoke: Cần giả lập có sẵn ít nhất 5 tài xế có các trạng thái khác                                                      bán kính 1km, danh sách có giới hạn                                             1
          nhau                                                                                                                   (limit) và phân trang (paging)
          POSTMAN: Liệt kê danh sách các booking của Customer                                                                    Danh sách Booking liên quan đến khách
  14      Smoke: Cần giả lập có sẵn ít nhất 5 booking                                                                            hàng, danh sách có giới hạn (limit) và                                          1
                                                                                                                                 phân trang (paging)
          POSTMAN: Đặt xe                                                                                                        Booking được tạo; khách hàng thấy trạng
  15      Smoke: Khách hàng đặt xe -> Hệ thống tạo booking -> Hệ thống                                                           thái đang tìm tài xế.                                                           1
          tìm tài xế gần điểm đón -> Gửi offer cho tài xế
```

### Trang PDF 3

```text
POSTMAN: Tài xế nhận chuyến                                                                                         Ride/Trip được gán tài xế; khách hàng
  16     Smoke: Tài xế nhận thông báo có chuyến -> Xem thông tin chuyến                                                      nhận thông tin tài xế.                                                       1
         -> chấp nhận
         POSTMAN: Cập nhật trạng thái chuyến
  17     Smoke: Tài xế chuyển trạng thái đến điểm đón -> Bắt đầu chuyến -                                                    Trạng thái chuyến cập nhật đúng trình tự.                                    1
         > Ride/Trip cập nhật vị trí di chuyển -> Đến điểm kết thúc và hoàn
         thành chuyến
         POSTMAN: Hủy chuyến                                                                                                 Ride/Trip chuyển sang CANCELED; các
  18     Smoke: Khách hàng chọn hủy chuyến -> Cung cấp lý do -> Xác                                                          bên nhận thông báo.                                                          1
         nhận hủy
         POSTMAN: Thanh toán online                                                                                          Payment chuyển COMPLETED; chuyến
  19     Smoke: Chọn thanh toán online -> Thực hiện thanh toán -> Hệ                                                         được ghi nhận đã thanh toán.                                                 1
         thống nhận callback -> Kiểm tra kết quả
         POSTMAN: Đánh giá chuyến đi                                                                                         Review được lưu và liên kết với chuyến
  20     Smoke: Khách hàng đánh giá chuyến đi (Ride/Trip) -> Chọn số sao                                                     đi.                                                                          1
         -> Nhập nhận xét -> Gửi đánh giá
BẢNG CHẤM THỰC HÀNH 2
         POSTMAN: Đăng ký tài xế                                                                                             Hồ sơ tài xế được tạo ở trạng thái chờ
  21     Smoke: Nhập số điện thoại -> Xác thực OTP -> Nhập thông tin cá                                                      duyệt.                                                                       1
         nhân/xe -> Gửi hồ sơ
         POSTMAN: Duyệt hồ sơ tài xế                                                                                         Trạng thái hồ sơ được cập nhật; tài xế
  22     Smoke: Quản trị viên (Admin) mở danh sách hồ sơ -> Xem chi tiết                                                     nhận kết quả.                                                                1
         -> Duyệt hoặc từ chối
         POSTMAN: Bật/tắt trạng thái nhận chuyến                                                                             Trạng thái nhận chuyến thay đổi và được
  23     Smoke; Tài xế chuyển trạng thái Online / Offline -> hệ thống cập                                                    hệ thống ghi nhận.                                                           1
         nhật
```

### Trang PDF 4

```text
POSTMAN: Data encryption at rest
        Smoke: Dữ liệu lưu trong DB
        Attacker truy cập trực tiếp DB, xem dữ liệu nhạy cảm
                                                                                                                                    Data nhạy cảm được mã hóa
24      password = 123400                                                                                                           Không đọc được plaintext                                                           1
                                                                                                                                    Có key management
        Cần được mã hóa

        password = "X9f3k2s9...encrypted..."
        POSTMAN: SQL injection attempt
        Smoke: API nhận input từ user                                                                                               Query không bị bypass
25      {                                                                                                                           Không login thành công                                                             1
          "email": "' OR 1=1 --",                                                                                                   Không lộ dữ liệu DB
          "password": "anything"                                                                                                    HTTP 400 hoặc 401
        }
        POSTMAN: XSS input test                                                                                                     Script không được execute
26      Smoke: API nhận input từ user                                                                                               Output được escape                                                                 1
        <script>alert('hack')</script>
```

### Trang PDF 5

```text
POSTMAN: JWT tampering
       Smoke: Attacker sửa payload token

       {
         "sub": "user_123",                                                                                                       Nếu hệ thống không kiểm tra signature
         "role": "USER"                                                                                                           → attacker thành admin
27     }                                                                                                                                                                                                           1
                                                                                                                                  Token decode fail
       JWT bị thay đổi sub, role                                                                                                  HTTP 401
                                                                                                                                  Không truy cập được API
       {
         "sub": "admin_001",
         "role": "ADMIN"
       }
28     POSTMAN: Unauthorized API access                                                                                           HTTP 403 Forbidden                                                               1
       Smoke: Customer không có quyền gọi API Driver                                                                              Không trả dữ liệu
       POSTMAN: Rate limit attack                                                                                                 HTTP 429 Too Many Requests
29     Smoke: Client gửi nhiều request liên tục                                                                                   Rate limit hoạt động                                                             1
       Attacker spam API: POST /booking                                                                                           Không làm sập hệ thống
       >1000 requests/sec
```

### Trang PDF 6

```text
POSTMAN: Replay attack (idempotency)
         Smoke: Attacker gửi lại request cũ

         request payment cũ

         Request gốc:
         {                                                                                                                   Không xử lý lại transaction
  30       "user_id": "USR123",                                                                                              Không bị double charge                                                       1
           "amount": 50000                                                                                                   Trả response cũ
         }
         Attacker gửi lại request y hệt:
         {
           "user_id": "USR123",
           "amount": 50000
         }
BẢNG CHẤM THỰC HÀNH 3
```

## Lưu ý áp dụng cho CAB MVP

- Mục 7 ghi “Kafka / Rabbit MQ”; kiến trúc đã chốt dùng **RabbitMQ**, không bổ sung Kafka.
- Mục 19 dùng payment mock sau khi Trip COMPLETED theo SRS; không tự tích hợp cổng thanh toán thật.
- Mục 21 giữ OTP mock cho đăng ký tài xế.
- Mục 24 minh họa “password ... encrypted”. Khi triển khai, đối chiếu NFR02/NFR21 và AC93 để phân biệt password hashing với mã hóa dữ liệu nhạy cảm; không suy ra phải lưu mật khẩu có thể giải mã.
- Mục 25 có payload email; cần kiểm thử payload nguồn và input đăng nhập thực tế theo SRS, không tự thêm API/trường đăng nhập chỉ vì ví dụ này.
- Mục 26 cần bằng chứng script không thực thi; chỉ kiểm tra phản hồi Postman chưa chứng minh được hành vi trình duyệt.
- Mục 27 dùng cụm “Token decode fail” trong phiếu. Bằng chứng kỹ thuật phải cho thấy chữ ký/token bị từ chối với HTTP 401; decode payload không thay thế xác minh chữ ký.
- Mục 29 cần công cụ tải và số liệu thực đạt cho yêu cầu >1000 requests/sec. `POST /booking` là đường dẫn minh họa trong phiếu, không tự đổi endpoint contracts trong nhiệm vụ cập nhật tài liệu này.
- Mục 2 yêu cầu kiểm tra GitHub: kiểm tra local chưa đủ kết luận về remote hoặc lịch sử Git; không đẩy `.env` để làm bằng chứng.
