# RabbitMQ: topology trước Consumer

Kiểm chứng local ngày 27/10/2026. Phạm vi: sửa lỗi thiếu topology và kiểm tra một luồng event; chưa nghiệm thu toàn bộ mục 7 hoặc 30 mục chấm.

## Nguyên nhân và bằng chứng trước sửa

- `infra_init` đã exit 0 lúc `2026-10-27T01:25:57Z`, log xác nhận đã provision topology. Container RabbitMQ hiện tại được tạo sau đó lúc `01:36:16Z`.
- Compose không cố định hostname/node name RabbitMQ. Node hiện tại là `rabbit@6ea42163da6d`; cùng volume `cab-system_rabbitmq-data` còn thư mục `rabbit@7f01dad5d9c8`. Broker sử dụng thư mục theo node name nên volume còn tồn tại không bảo đảm node mới đọc lại dữ liệu của node cũ. Chưa kiểm tra nội dung/backlog của thư mục node cũ.
- Tại vhost `cab`, trước sửa chỉ có exchange mặc định, không có `cab.events`, `cab.dead`, queue hoặc binding ứng dụng. `cab_local` có quyền configure/write/read đều `.*`; log xác nhận authenticate và grant access thành công. Đây không phải lỗi password/vhost permission.
- Mọi service phụ thuộc `infra_init: service_completed_successfully`. Điều kiện này kiểm tra job đã hoàn tất khi Compose khởi động, không bảo đảm topology còn tồn tại sau khi broker bị tạo lại. Healthcheck `rabbitmq-diagnostics ping` cũng không kiểm tra topology hoặc quyền của user ứng dụng.
- `createBus.open()` trước sửa tạo channel rồi gọi thẳng `basic.consume`, không `assertExchange/assertQueue/bindQueue`. Sau mất kết nối, `tick()` lặp kết nối mỗi 500 ms và tiếp tục consume queue không tồn tại, nhận 404 rồi đóng channel. Readiness phụ thuộc trạng thái bus nên bốn consumer service và Gateway unhealthy. Publisher không consume cũng không tự phục hồi exchange/binding.

## Topology và đường đi trong mã nguồn

Nguồn hiện hành: `docs/events/topology.json`; validation envelope: `docs/events/events.schema.json` và `scripts/event-bus.cjs`. REST qua Gateway, gRPC đồng bộ và hợp đồng event giữ nguyên.

Exchange `cab.events`: topic, durable. Publisher lưu envelope trong outbox cùng transaction nghiệp vụ; event-bus phát persistent message với publisher confirms, routing key = `event.eventType`, rồi đánh dấu `publishedAt`.

| Publisher       | Routing key thực sự phát                                                                           | Queue nhận / Consumer                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| auth_service    | account.registered                                                                                 | customer.events / customer_service; driver.events / driver_service                                           |
| driver_service  | driver.approval_changed                                                                            | notification.events / notification_service                                                                   |
| booking_service | booking.created, booking.invitation_created, booking.assigned, booking.canceled, booking.no_driver | notification.events / notification_service                                                                   |
| trip_service    | trip.arrived                                                                                       | notification.events / notification_service                                                                   |
| trip_service    | trip.completed, trip.canceled                                                                      | driver.events / driver_service; booking.events / booking_service; notification.events / notification_service |
| payment_service | payment.completed, payment.failed                                                                  | notification.events / notification_service                                                                   |

Đủ 12 event type, 17 binding từ `cab.events`. Không có event `trip.started` trong implementation. `customer_service`, `notification_service` chỉ consume; `rating_service` không tạo bus. `scripts/seed.cjs` cũng ghi `account.registered` vào outbox của auth cho fixture CUSTOMER/DRIVER; không có publisher nghiệp vụ riêng ngoài event-bus.

| Queue chính durable | Binding trên cab.events                                                                                                                                                                                     | Consumer                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| customer.events     | account.registered                                                                                                                                                                                          | customer_service; chỉ tạo profile khi role CUSTOMER                          |
| driver.events       | account.registered, trip.completed, trip.canceled                                                                                                                                                           | driver_service; đăng ký role DRIVER hoặc giải phóng tài xế theo kết quả Trip |
| booking.events      | trip.completed, trip.canceled                                                                                                                                                                               | booking_service; đồng bộ trạng thái Booking                                  |
| notification.events | driver.approval_changed, booking.created, booking.invitation_created, booking.assigned, booking.canceled, booking.no_driver, trip.arrived, trip.completed, trip.canceled, payment.completed, payment.failed | notification_service; lưu thông báo theo người nhận trong payload            |

Mỗi queue chính `Q` còn có:

- `Q.dlq`: durable, binding từ exchange `cab.dead` (direct, durable), routing key `Q.dlq`. Queue chính có DLX `cab.dead` và dead-letter routing key `Q.dlq`.
- `Q.retry.1s`, `Q.retry.5s`, `Q.retry.15s`: durable, TTL lần lượt 1000/5000/15000 ms, DLX là default exchange `""`, dead-letter routing key `Q`. Không có Consumer riêng trên retry/DLQ.
- Default exchange tự có binding theo tên cho cả 20 queue. Publisher retry dùng `sendToQueue`; không bind retry queue vào `cab.events`.
- Consumer prefetch 10, `noAck: false`; ACK sau transaction xử lý và inbox commit. Event đã có inbox được kiểm tra hash. Lỗi tạm thời gửi retry bằng confirm trước ACK; poison/vượt retry dùng NACK không requeue để vào DLQ. Đây là hành vi đọc từ mã nguồn, không phải bằng chứng đã chạy toàn bộ nhánh lỗi.

`scripts/reset-business-queues.cjs` chỉ check/purge theo chế độ explicit, không provision hoặc xóa queue; không chạy script reset trong lượt này.

## Sửa tối thiểu

| File                        | Thay đổi                                                                                                                                                                    |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| scripts/rabbit-topology.cjs | Tách nguyên khai báo topology của bootstrap thành `ensureTopology(channel)`, dùng đúng JSON và giữ nguyên durable/TTL/DLX/binding; từ chối exchange cấu hình khác hợp đồng. |
| scripts/bootstrap-infra.cjs | Gọi helper chung thay cho block khai báo trùng; bỏ log cũ nói ứng dụng outbox/inbox chưa triển khai.                                                                        |
| scripts/event-bus.cjs       | Mỗi lần connect/reconnect phải await toàn bộ topology trên confirm channel trước khi tạo Consumer hoặc đọc/phát outbox.                                                     |
| scripts/event-bus.test.cjs  | Ba kiểm thử: Consumer đợi topology; Publisher đợi queue đích; lỗi declaration chặn cả consume lẫn đọc outbox.                                                               |
| docs/RABBITMQ_FIX_REPORT.md | Báo cáo này.                                                                                                                                                                |

Các lệnh declare là idempotent khi thuộc tính khớp. Khi quyền không đủ hoặc topology không tương thích, bus không ready và không đi tiếp tới consume/publish; không xóa/recreate queue để che lỗi. Khai báo toàn bộ binding trước Publisher cũng tránh trường hợp publish được confirm nhưng chưa có queue đích.

Giữ nguyên Compose, `.env`, hợp đồng, database và volume. Không đổi node name ngay trên volume đang hoạt động: cần quy trình di chuyển riêng nếu muốn cố định hostname/node name lâu dài. Bản sửa tự phục hồi topology trên node hiện tại, **không khôi phục message/backlog thuộc node cũ**. Việc tạo lại broker với hostname khác vẫn có rủi ro broker đọc thư mục dữ liệu khác; topology tự khai báo không thay thế việc bảo toàn dữ liệu broker.

## Kết quả đã chạy

- `node --test scripts/event-bus.test.cjs`: 3/3 kiểm thử đạt (mock/unit, không tính là runtime).
- `node scripts/check-foundation.cjs`: JS syntax và foundation static checks thành công.
- `node --test scripts/identity.test.cjs scripts/business.test.cjs scripts/postman-format.test.cjs`: 24/24 kiểm thử đạt (unit/static).
- Build `cab-backend:local` thành công; cập nhật Gateway và 8 service bằng `up -d --no-deps`. Không chạy lại Mongo bootstrap, không tạo lại hạ tầng hoặc xóa volume. Container `infra_init` hiện vẫn là job cũ đã exit 0; lần bootstrap tương lai dùng helper mới trong image mới.
- Trên broker ban đầu đang thiếu topology, các bus tự provision: `cab.events` topic durable; `cab.dead` direct durable; 20 queue durable; 17 event binding và 4 DLQ binding đúng; mỗi queue chính có 1 active Consumer, manual ACK, prefetch 10.
- `/health`, `/ready`, `/health/services`: đều HTTP 200. Gateway, 8 service và hạ tầng healthy.
- Luồng thực qua Gateway: đăng ký Customer HTTP 201 → auth outbox `account.registered` published → customer inbox processed → GET `/api/v1/customers/me` HTTP 200, accountId khớp.
    - accountId: `6ae00e2126c6d422e7d51133`
    - customerId: `6ae00e22bb49bc19c6fde705`
    - eventId đối chiếu cả hai database theo đúng credential sở hữu: `129e0ada-4ce0-4ab1-b30d-4306ca25db23`
    - outbox publishedAt: `2026-10-27T02:36:18.096Z`; inbox processedAt: `2026-10-27T02:36:18.101Z`.
- Restart riêng container RabbitMQ, giữ nguyên container/node name/volume; các ứng dụng không restart. Sau reconnect, kiểm tra lại toàn bộ topology/Consumer/health và đăng ký Customer thứ hai đều thành công: accountId `6ae00e6026c6d422e7d51134`, customerId `6ae00e61bb49bc19c6fde706`.
- Không tìm thấy `no queue`, `not_found`, `PRECONDITION_FAILED`, `ACCESS_REFUSED` trong cửa sổ log RabbitMQ 2 phút sau triển khai/kiểm tra reconnect.

Bằng chứng local không chứa token/password: `.local/rabbitmq-fix/before-restart.json`, `runtime.json`, `outbox.json`, `inbox.json`; probe tái chạy: `node --env-file=.env .local/rabbitmq-fix/runtime.cjs`. Hai tài khoản/profile Customer được tạo để kiểm thử và được giữ lại; không xóa dữ liệu test tự động.

Các lệnh kiểm tra broker đã chạy:

```powershell
docker compose exec -T rabbitmq rabbitmqctl list_permissions -p cab
docker compose exec -T rabbitmq rabbitmqctl list_exchanges -p cab name type durable
docker compose exec -T rabbitmq rabbitmqctl list_queues -p cab name durable consumers messages arguments
docker compose exec -T rabbitmq rabbitmqctl list_bindings -p cab source_name destination_name routing_key
docker compose exec -T rabbitmq rabbitmqctl list_consumers -p cab
```

## Chưa kiểm thử runtime

- Toàn bộ luồng Booking → Trip → Payment → Rating, Driver onboarding và các đường Notification.
- Retry theo TTL, poison event/DLQ, replay/idempotency và crash đúng thời điểm giữa confirm/ACK/commit.
- Runtime với quyền bị thu hẹp hoặc queue có thuộc tính xung đột; chỉ nhánh lỗi declaration đã được unit test.
- Chạy lại toàn bộ `infra_init` mới; cold start trên môi trường trống; recreate broker sang node name khác; khôi phục backlog của node cũ.
- Không đánh dấu PASS toàn bộ mục 7 hoặc các mục chấm khác từ các kết quả giới hạn trên.
