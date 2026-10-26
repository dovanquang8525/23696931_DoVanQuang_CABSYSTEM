# CAB System MVP — Architecture

Trạng thái: tài liệu khung các quyết định đã chốt; chưa xác nhận triển khai. Phạm vi chỉ BIKE. Thiết kế chi tiết hiện có tại [Bounded Context](Bounded-Context.md), cần đối chiếu [SRS 2.0](SRS.md) trước khi triển khai; tài liệu cũ được bảo toàn.

## System Overview

Đúng 8 service: auth_service, customer_service, driver_service, booking_service, trip_service, payment_service, notification_service, rating_service. Không tách thêm service theo số nhóm YAML. Payment mock chỉ sau Trip COMPLETED; OTP mock phục vụ đăng ký tài xế theo phiếu chấm.

## API Gateway

Client → Gateway sử dụng REST. Mọi request từ Postman đi qua Gateway. Gateway → Service sử dụng gRPC. Chưa định nghĩa thêm endpoint trong bước này.

## gRPC Communication

Giao tiếp đồng bộ nội bộ sử dụng gRPC. Hợp đồng protobuf hiện có tại `proto/`; xem [REST–gRPC mapping](api/rest-grpc-mapping.md). Chưa có mã backend hoặc bằng chứng giao tiếp runtime.

## RabbitMQ Events

RabbitMQ dùng cho event bất đồng bộ. Chưa bổ sung hoặc thay đổi danh mục event, payload, exchange, queue hay cơ chế retry trong nhiệm vụ này.

## Redis

Redis phục vụ rate limiting tại Gateway. Chính sách và cấu hình triển khai chưa được bổ sung ở bước này.

## MongoDB Ownership

8 database logic; mỗi service sở hữu một database. Không truy cập trực tiếp database của service khác. Chưa tạo database hoặc cấu hình kết nối.

| Service              | Database logic trong thiết kế hiện có |
| -------------------- | ------------------------------------- |
| auth_service         | auth_db                               |
| customer_service     | customer_db                           |
| driver_service       | driver_db                             |
| booking_service      | booking_db                            |
| trip_service         | trip_db                               |
| payment_service      | payment_db                            |
| notification_service | notification_db                       |
| rating_service       | rating_db                             |

## Docker Deployment

Chưa triển khai. `infra/` được chuẩn bị cho giai đoạn tiếp theo; chưa có Docker Compose, chưa build hoặc chạy container. Topology, image, port và cấu hình vận hành sẽ được xác định trong nhiệm vụ triển khai riêng.
