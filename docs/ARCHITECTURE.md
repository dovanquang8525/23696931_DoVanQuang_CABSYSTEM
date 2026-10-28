# Kiến trúc CAB System MVP

**ID công khai hiện hành:** cid=c29, did=d01, aid=a01, bid=b01, tid=t01, pid=p01, nid=n01, rid=r01; thêm vid cho Vehicle, iid cho Invitation và oid cho OTP challenge. API/URL dùng các mã ngắn do server cấp; cid/did chính là ID Customer/Driver, không còn customerId/driverId hay accountId ObjectId trong JSON công khai. MongoDB _id và JWT sub là định danh kỹ thuật nội bộ, không nhập vào URL. ADMIN cũng có aid; không tự nhập ID khi Register.

Dùng để giải thích các mục 1, 3, 4, 7, 8. Chuẩn bị source, compose.yaml, proto/ và hệ thống đang chạy theo [runbook](BACKEND_RUNBOOK.md).

## Request và dữ liệu

Postman → Gateway REST/JSON → service gRPC → database do service sở hữu. Gateway đọc 48 operation từ 10 OpenAPI YAML, kiểm JWT, role, input, rate limit, ánh xạ lỗi và schema response. Health nằm ở root; nghiệp vụ dùng /api/v1.

Đúng 8 service: Auth, Customer, Driver, Booking, Trip, Payment, Notification, Rating. Driver sở hữu Vehicle; không thêm Vehicle/OTP/Report Service. Mỗi service dùng user chỉ có readWrite trên một DB: auth_db, customer_db, driver_db, booking_db, trip_db, payment_db, notification_db, rating_db. Gateway không có MongoDB credentials. gRPC không publish ra host; peer nội bộ cần internal credential và quyền theo docs/api/rpc-access.json. Service vẫn kiểm JWT/ownership của người dùng.

## Luồng chính

1. Auth tạo Account và account.registered cùng transaction/outbox. Customer/Driver consumer tạo profile; client có thể gặp PROFILE_NOT_READY ngắn hạn.
2. Driver xác thực OTP mock khi đăng ký, bổ sung license, submit PENDING; ADMIN duyệt. Driver cập nhật vị trí rồi ONLINE.
3. Customer tạo Booking BIKE. Booking gọi Driver qua gRPC tìm tối đa 5 ứng viên trong 1 km và gửi invitation tuần tự.
4. ACCEPT: Booking giữ reservation ở Driver, tạo Trip, xác nhận assignment. Operation lưu DB để tiếp tục khi lỗi giữa RPC; phần này ngăn gán trùng chuyến, không phải framework/service mới.
5. Trip ASSIGNED → ARRIVED → IN_PROGRESS → COMPLETED. Cước dùng distance/pricing snapshot. Event giúp Booking đổi trạng thái, Driver được giải phóng và Notification ghi thông báo.
6. Payment mock chỉ sau COMPLETED. Callback HMAC xác nhận kết quả; FAILED có tối đa 3 attempt tổng cộng. Idempotency-Key và snapshot ngăn xử lý lại. Booking view tổng hợp payment bằng gRPC.
7. Customer lưu một Review/trip COMPLETED, rating 1–5.

## RabbitMQ thực sự dùng ở đâu?

| Service | Publish | Consume |
| --- | --- | --- |
| Auth | account.registered | Không |
| Customer | Không | account.registered |
| Driver | driver.approval_changed | account.registered, trip.completed, trip.canceled |
| Booking | booking.created/invitation_created/assigned/canceled/no_driver | trip.completed, trip.canceled |
| Trip | trip.arrived/completed/canceled | Không |
| Payment | payment.completed/failed | Không |
| Notification | Không | 11 binding trong docs/events/topology.json |
| Rating | Không | Không |

cab.events là topic exchange: 4 queue chính, 12 retry, 4 DLQ; delay 1/5/15 giây. Publisher dùng outbox/confirm; consumer commit inbox cùng dữ liệu rồi ACK, chống event trùng. Khai báo topology ở mỗi connect/reconnect. Rating không kết nối RabbitMQ vì không có luồng event cần thiết. Customer/Notification không tạo outbox index vì không publish.

Redis giữ counters rate limit tại Gateway, cửa sổ 60 giây, phục vụ mục 29. Không dùng Redis thay DB hoặc kho JWT.

## Kiểm chứng

```powershell
docker compose ps -a
Invoke-RestMethod http://localhost:3000/health/services
docker compose logs --tail 30 infra_init
docker compose exec -T rabbitmq rabbitmqctl list_queues -p cab name consumers messages
```

Kỳ vọng 12 thành phần healthy, 8 log xác nhận DB isolation, 4 queue chính có consumer. Health/topology chưa chứng minh retry/DLQ hoặc toàn bộ nghiệp vụ. Xem [bảng chấm](GRADING_MATRIX.md), [SRS](SRS.md), [Bounded Context](Bounded-Context.md), [contracts](api/contracts.md).

## Sai khác còn giữ ở mô hình gốc

Ảnh Microservice-Architecture-Design.png ghi Notification consume account.registered, nhưng topology/code hiện tại không có binding đó. ERD chưa vẽ email đăng nhập/cid/did; Vehicle là object nhúng trong Driver. REST dùng camelCase/name, một số document nội bộ dùng snake_case/full_name; mapper chuyển đổi có chủ đích. Giữ nguyên ảnh gốc để đối chiếu, không xem ảnh là schema triển khai chi tiết. Checkout hiện tại không có các DOCX nguồn mà SRS dẫn chiếu.

Read model chấp nhận hồ sơ/snapshot legacy chưa có cid/did; khi có mã vẫn phải đúng pattern. Register mới vẫn bắt buộc cid hoặc did trong response. Không tự sinh lại mã hoặc sửa dữ liệu cũ. Các hash hợp đồng chỉ cập nhật cho 4 YAML sau khi đã kiểm diff và regression.
