# Ma trận 30 tiêu chí chấm CAB System

Cập nhật ngày **27/10/2026**. Nguồn trực tiếp: [PHIEU_CHAM_PROJECT.pdf](../PHIEU_CHAM_PROJECT.pdf), trang PDF 2–6; trang 1 là thông tin sinh viên. Đã đối chiếu đủ **30 tiêu chí**, mỗi mục tối đa **1 điểm**, tổng **30 điểm**.

Tên tiêu chí giữ theo phiếu, kể cả tiền tố POSTMAN. Cột yêu cầu và bằng chứng cần thu lấy từ [SRS hiện tại](SRS.md), mục **14.16**; đây là ánh xạ và kế hoạch kiểm chứng của dự án, không phải nội dung bổ sung vào phiếu chấm. Chưa có điểm thực đạt hoặc bằng chứng nghiệm thu.

`NOT_RUN` nghĩa là chưa kiểm thử đầy đủ theo tiêu chí. Việc có tài liệu hoặc cấu hình không đồng nghĩa tiêu chí đã PASS. Các mục cần backend/hạ tầng chưa thể kiểm thử khi thành phần đó chưa triển khai.

## Ma trận tiêu chí và truy xuất yêu cầu

| STT | Tiêu chí theo phiếu | Điểm tối đa | Trang PDF | Yêu cầu / AC trong SRS | Bằng chứng cần thu theo SRS | Bằng chứng thực tế | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | Mô tả kiến trúc tổ chức source code | 1 | 2 | NFR15, NFR28; AC89, AC101 | Cây source, giải thích trách nhiệm; TC101 | — | NOT_RUN |
| 02 | Kiểm tra .gitignore và .env trên github | 1 | 2 | NFR02, NFR28; AC93, AC101 | Git tracked files/lịch sử, .env.example; không in secret | — | NOT_RUN |
| 03 | Mô tả nhiệm vụ gateway trong hệ thống | 1 | 2 | NFR26; mục 4.6; AC98 | REST→gRPC, JWT, Redis, error/health; source và trace | — | NOT_RUN |
| 04 | Mô tả IPC của các microservice | 1 | 2 | NFR08, NFR26–NFR27; AC98–AC100 | Proto, RPC, event routing; không REST nội bộ | — | NOT_RUN |
| 05 | Compose hệ thống và liệt kê các container | 1 | 2 | NFR14, NFR16, NFR29; AC90, AC102 | Compose config/ps, network, volumes, DB init | — | NOT_RUN |
| 06 | POSTMAN: API health check | 1 | 2 | FR49, NFR17; AC84–AC86 | /health, /ready, /health/services; healthy/dependency down | — | NOT_RUN |
| 07 | Kiểm tra hệ thống Kafka / Rabbit MQ | 1 | 2 | NFR27; chỉ RabbitMQ; AC99–AC100 | Exchange/queue/binding, publish/consume/redelivery/DLQ | — | NOT_RUN |
| 08 | Kiểm tra mọi request đều phải đi qua Gateway | 1 | 2 | NFR26; AC98 | Client qua Gateway; port gRPC không publish; internal RPC vẫn trực tiếp | — | NOT_RUN |
| 09 | POSTMAN: Đăng ký tài khoản khách hàng | 1 | 2 | FR01; UC01; AC01, AC03–AC04 | Postman đăng ký→profile→login; DB account/profile | — | NOT_RUN |
| 10 | POSTMAN: Đăng nhập khách hàng | 1 | 2 | FR02; UC02; AC05–AC06 | Postman đúng/sai; JWT hợp lệ, không lộ secret | — | NOT_RUN |
| 11 | POSTMAN: Lấy thông tin khách hàng với mã số | 1 | 2 | FR03, FR35; UC03, UC23; AC07–AC08, AC75, AC80 | GET theo customerId với token và kiểm tra ownership | — | NOT_RUN |
| 12 | POSTMAN: Lấy thông tin tài xế với mã số | 1 | 2 | FR05, FR18, FR45; UC13, UC22; AC13–AC14, AC42, AC80 | GET theo driverId đúng phạm vi; không lộ licenseNumber trong nearby | — | NOT_RUN |
| 13 | POSTMAN: Liệt kê danh sách tài xế tại khu vực | 1 | 2 | FR46; UC05; NFR29; AC28–AC30, AC103 | Ít nhất 5 Driver khác trạng thái; 1 km, limit/paging, vị trí mới | — | NOT_RUN |
| 14 | POSTMAN: Liệt kê danh sách các booking của Customer | 1 | 2 | FR33; UC10; NFR29; AC30, AC72, AC103 | Ít nhất 5 Booking, đúng Customer, thứ tự, limit/paging | — | NOT_RUN |
| 15 | POSTMAN: Đặt xe | 1 | 2 | FR09–FR12, FR15–FR16; UC06; AC31–AC34, AC39–AC41 | Booking SEARCHING→offer, BIKE server, chưa tạo Trip sớm | — | NOT_RUN |
| 16 | POSTMAN: Tài xế nhận chuyến | 1 | 3 | FR13–FR14; UC18; AC35–AC38 | Nhận lời mời→Trip ASSIGNED; khách thấy Driver; cạnh tranh không trùng | — | NOT_RUN |
| 17 | POSTMAN: Cập nhật trạng thái chuyến | 1 | 3 | FR17, FR22, FR47; UC19–UC20; AC45–AC48, AC52–AC55 | ARRIVED→IN_PROGRESS→location→COMPLETED, cước đúng | — | NOT_RUN |
| 18 | POSTMAN: Hủy chuyến | 1 | 3 | FR20–FR21; UC08; AC49–AC52 | Trip đã phân công→CANCELED; lý do, notification và release; thêm hủy SEARCHING | — | NOT_RUN |
| 19 | POSTMAN: Thanh toán online | 1 | 3 | FR23, FR25–FR28; UC09, UC27; AC56, AC59–AC66, AC105 | Sau COMPLETED; callback→Payment COMPLETED; view chuyến ghi đã thanh toán | — | NOT_RUN |
| 20 | POSTMAN: Đánh giá chuyến đi | 1 | 3 | FR34; UC11; AC73–AC74 | Review đúng Trip, sao 1–5, một review/trip | — | NOT_RUN |
| 21 | POSTMAN: Đăng ký tài xế | 1 | 3 | FR01, FR43–FR44; UC01, UC12–UC15; AC02, AC09–AC19 | Phone→OTP mock→hồ sơ/BIKE→gửi PENDING, không dừng ở DRAFT | — | NOT_RUN |
| 22 | POSTMAN: Duyệt hồ sơ tài xế | 1 | 3 | FR45, FR48; UC22, UC04; AC20–AC22, AC70–AC71 | ADMIN list/detail/approve/reject; Driver đọc kết quả | — | NOT_RUN |
| 23 | POSTMAN: Bật/tắt trạng thái nhận chuyến | 1 | 3 | FR07; UC16; AC23–AC25 | Online đủ điều kiện, offline lưu, không tự hủy Trip | — | NOT_RUN |
| 24 | POSTMAN: Data encryption at rest | 1 | 4 | NFR02, NFR21; AC93 | Postman + MongoDB + key config; phân biệt hash và encryption | — | NOT_RUN |
| 25 | POSTMAN: SQL injection attempt | 1 | 4 | NFR22; FR02; AC94 | SQL string và NoSQL object không bypass, 400/401 | — | NOT_RUN |
| 26 | POSTMAN: XSS input test | 1 | 4 | NFR23; AC96 | Payload script→400, JSON/escape; harness kiểm tra không execute | — | NOT_RUN |
| 27 | POSTMAN: JWT tampering | 1 | 5 | NFR24; FR40; AC79, AC95 | Token sửa sub/role, sai chữ ký →401; không nhầm decode với verify | — | NOT_RUN |
| 28 | POSTMAN: Unauthorized API access | 1 | 5 | NFR01, NFR24; FR40; AC80–AC81 | Customer gọi thao tác Driver→403; thêm ownership theo ID | — | NOT_RUN |
| 29 | POSTMAN: Rate limit attack | 1 | 5 | NFR04, NFR25; AC92, AC97 | Redis TTL/429/Retry-After; công cụ tải riêng >1000 req/s có actual | — | NOT_RUN |
| 30 | POSTMAN: Replay attack (idempotency) | 1 | 6 | FR25–FR27; NFR10–NFR11; AC60, AC63–AC65, AC105 | Request/callback lặp và đồng thời; trả cũ; không double charge | — | NOT_RUN |

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
