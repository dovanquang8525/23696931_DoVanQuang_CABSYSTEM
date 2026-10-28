# CAB System MVP

**ID công khai hiện hành:** cid=c29, did=d01, aid=a01, bid=b01, tid=t01, pid=p01, nid=n01, rid=r01; thêm vid cho Vehicle, iid cho Invitation và oid cho OTP challenge. API/URL dùng các mã ngắn do server cấp; cid/did chính là ID Customer/Driver, không còn customerId/driverId hay accountId ObjectId trong JSON công khai. MongoDB _id và JWT sub là định danh kỹ thuật nội bộ, không nhập vào URL. ADMIN cũng có aid; không tự nhập ID khi Register.

Dự án Microservices cơ bản phục vụ học và bảo vệ môn MSA. Luồng chính: Customer đặt BIKE → Driver nhận chuyến → Trip hoàn thành → Payment mock thành công → Customer đánh giá.

## Chạy nhanh

Chuẩn bị Node.js >=22, Docker Desktop đang chạy và PowerShell tại root repository, nơi có `compose.yaml`:

```powershell
npm.cmd ci
npm.cmd run setup:local
npm.cmd test
npm.cmd run check
docker compose config --quiet
docker compose up -d --build
Invoke-RestMethod http://localhost:3000/ready
```

`setup:local` chỉ điền cấu hình thiếu. Giữ `.env` và các key đang dùng với volumes cũ. Kết quả đúng: `infra_init` exit 0; Gateway, 8 service, MongoDB, Redis và RabbitMQ healthy; `/ready` trả HTTP 200. Khi lỗi, xem [hướng dẫn local](docs/BACKEND_RUNBOOK.md).

## Kiến trúc

Client/Postman → Gateway bằng REST; Gateway và các service gọi đồng bộ bằng gRPC. RabbitMQ truyền event bất đồng bộ. Mỗi service có database logic và tài khoản MongoDB riêng; chỉ dùng một MongoDB instance. Redis thực hiện rate limiting tại Gateway.

| Service | Trách nhiệm |
| --- | --- |
| auth_service | Account, đăng nhập/JWT, OTP mock Driver |
| customer_service | Hồ sơ Customer |
| driver_service | Driver, Vehicle BIKE, vị trí và online/offline |
| booking_service | Booking, tìm Driver và invitation |
| trip_service | Trạng thái chuyến và tính cước |
| payment_service | Payment mock sau COMPLETED, callback/retry/idempotency |
| notification_service | Thông báo từ event |
| rating_service | Review chuyến đã hoàn thành |

Customer Register dùng email/password/phone và trả aid/role/cid; Login riêng lấy token. Driver thêm plateNumber, lần đầu nhận OTP 202, gửi lại cùng dữ liệu và code để tạo account. cid/did do server sinh; URL theo ID dùng mã ngắn của đối tượng. Vị trí demo dùng A/B từ database của từng owner.

## Tài liệu cần đọc

1. [BACKEND_RUNBOOK.md](docs/BACKEND_RUNBOOK.md): cài đặt, khởi động, kiểm tra và xử lý lỗi.
2. [postman/README.md](postman/README.md): collection hiện hành, biến và thứ tự chạy.
3. [MANUAL_POSTMAN_30.md](docs/MANUAL_POSTMAN_30.md): thao tác tay và câu trả lời bảo vệ từng mục.
4. [ARCHITECTURE.md](docs/ARCHITECTURE.md): giải thích gRPC, RabbitMQ, Redis và quyền sở hữu dữ liệu.
5. [GRADING_MATRIX.md](docs/GRADING_MATRIX.md): nội dung phiếu gốc và tiến độ.
6. [PROJECT_STATUS.md](docs/PROJECT_STATUS.md): phát hiện audit, thay đổi, bằng chứng và giới hạn ngày 28/10/2026.

Yêu cầu nghiệp vụ ở [SRS](docs/SRS.md), [Bounded Context](docs/Bounded-Context.md); API hiện hành ở [docs/api](docs/api/). Phiếu gốc: [PHIEU_CHAM_PROJECT.pdf](PHIEU_CHAM_PROJECT.pdf). Tài liệu nguồn/mô hình và collection cũ được giữ để đối chiếu.
