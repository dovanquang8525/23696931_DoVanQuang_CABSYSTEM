# Hướng dẫn làm việc với CAB System

## Kiến trúc và phạm vi đã chốt

- Giữ đúng 8 microservices: `auth_service`, `customer_service`, `driver_service`, `booking_service`, `trip_service`, `payment_service`, `notification_service`, `rating_service`.
- Client → Gateway sử dụng REST.
- Gateway → Service sử dụng gRPC; giao tiếp đồng bộ nội bộ sử dụng gRPC.
- RabbitMQ dành cho event bất đồng bộ.
- Redis phục vụ rate limiting tại Gateway.
- MongoDB gồm 8 database logic; mỗi service sở hữu một database, không truy cập trực tiếp database của service khác.
- Chỉ hỗ trợ BIKE.
- Payment mock chỉ thực hiện sau khi Trip ở trạng thái COMPLETED.
- OTP mock dành cho đăng ký tài xế theo phiếu chấm. Cần đối chiếu phiếu chấm gốc khi có, không tự suy diễn tiêu chí chưa đọc được.
- Mọi request từ Postman phải đi qua Gateway.
- Không thêm service không cần thiết, không tự thay đổi quy tắc nghiệp vụ.

## Bảo toàn và kiểm chứng

- Bảo toàn thay đổi chưa commit; không ghi đè file đích khi di chuyển.
- Giữ `.postman/` là metadata công cụ, không tự gộp vào `postman/`.
- SRS hiện hành ở `docs/SRS.md`; không còn dùng đường dẫn `docs/srs2.md`. Không tự hợp nhất, thay thế hoặc sửa nghiệp vụ. YAML và thiết kế cũ cần được đối chiếu ở giai đoạn riêng.
- Không tự tạo API hoặc event khi chưa có quyết định được xác nhận.
- Không tự push GitHub. Không commit, push hoặc merge trong nhiệm vụ tổ chức repository này.
- Không đánh dấu PASS nếu chưa kiểm thử; phân biệt kế hoạch kiểm thử với bằng chứng đã chạy.
- Trong nhiệm vụ tổ chức này: không triển khai backend, service code, MongoDB database, Docker Compose; không chạy Docker build/up hoặc npm install; chưa viết P01–P30.

Các biến trong .env hiện tại là cấu hình local ban đầu, được phép điều chỉnh trong quá trình triển khai. Mọi thay đổi phải đồng bộ với .env.example, Docker Compose và source code liên quan. Không ghi đè secret, xóa dữ liệu hoặc thay đổi cấu hình đang hoạt động khi chưa kiểm tra phụ thuộc.

## Postman và API Specification Synchronization

### 1. Nguồn đặc tả API chính thức

- Thư mục `docs/api/` chứa 10 file OpenAPI YAML hiện hành của CAB System; hợp đồng chung ở `docs/api/contracts.md`. Không dùng `api-specifications/` hoặc `postman/documents/legacy/` làm nguồn hiện hành.
- Các YAML phải được đồng bộ với SRS, Bounded Context và Microservice Architecture Design mới nhất.
- Các file trong `postman/` và `.postman/` có thể vẫn tham chiếu đến API Specification cũ.
- Không mặc định các Postman Collection hiện tại đã đúng với kiến trúc mới.
- OpenAPI YAML mô tả REST API công khai tại Gateway, không mô tả trực tiếp các gRPC method nội bộ.

### 2. Quy tắc xử lý Postman

Khi triển khai hoặc kiểm thử API, Codex phải:

1. Kiểm tra toàn bộ nội dung hiện có của `postman/` và `.postman/`.
2. Xác định các collection, environment và file cấu hình đang tham chiếu API cũ.
3. Đối chiếu các tham chiếu với 10 YAML chính thức.
4. Cập nhật hoặc tạo lại Postman Collection theo API mới khi các YAML đã được chuẩn hóa.
5. Bảo toàn file cũ trước khi thay đổi lớn; không xóa dữ liệu hoặc ghi đè cấu hình chưa kiểm tra.
6. Không duy trì endpoint cũ chỉ để tương thích với Postman Collection lỗi thời.
7. Không tự chỉnh sửa API YAML chỉ vì Postman đang sử dụng endpoint cũ.
8. Nếu SRS, YAML và Postman mâu thuẫn, phải báo cáo và làm rõ trước khi triển khai.
9. Giữ lại các request và test script cũ còn phù hợp.
10. Loại khỏi collection chính thức những request không còn thuộc phạm vi MVP, nhưng bảo toàn bản cũ để tham khảo.

### 3. Postman Collection mới

Collection chính thức phải:

- Chỉ gọi API thông qua API Gateway bằng REST/HTTP JSON.
- Sử dụng biến `baseUrl`, mặc định local.
- Có token riêng cho CUSTOMER, DRIVER và ADMIN.
- Tự lưu các ID cần thiết như customerId, driverId, bookingId, tripId, paymentId.
- Có các request cho đầy đủ 8 Bounded Context.
- Có request kiểm tra `/health`, `/ready`, `/health/services`.
- Có các kịch bản nghiệp vụ và bảo mật tương ứng 30 mục chấm.
- Hỗ trợ Payment Mock sau khi Trip COMPLETED.
- Có kịch bản kiểm tra callback mock, retry và idempotency.
- Có các Postman assertions kiểm tra HTTP status và dữ liệu trả về.

Không yêu cầu Postman gọi trực tiếp gRPC service. Postman chỉ kiểm thử các REST endpoint tại Gateway trong kịch bản nghiệm thu chính.

### 4. Thời điểm đồng bộ

Chỉ thực hiện việc tái cấu trúc Postman Collection chính thức sau khi:

- SRS đã được chuẩn hóa.
- 8 Bounded Context đã thống nhất.
- 10 OpenAPI YAML đã được kiểm tra.
- Danh sách REST endpoint tại Gateway đã chốt.

Trong quá trình thực hiện P01–P30, Codex phải cập nhật Postman Collection khi có endpoint mới được triển khai và xác minh.

Không đánh dấu PASS cho bất kỳ mục chấm nào chỉ vì đã tạo request hoặc test script trong Postman.

### 5. Kiểm tra cuối cùng

Trước khi hoàn thành dự án, Codex phải rà soát:

SRS ↔ Bounded Context ↔ API YAML ↔ Gateway ↔ Microservices ↔ Postman Tests ↔ 30 mục chấm.

Báo cáo các endpoint chưa triển khai, request lỗi thời, test chưa chạy và những sai khác giữa tài liệu với hành vi thực tế.

## Nguyên tắc tối giản — CAB System MVP

CAB System là dự án Microservice cơ bản phục vụ học tập và bảo vệ môn MSA.

Ưu tiên triển khai cách đơn giản nhất đáp ứng đúng 30 mục của PHIEU_CHAM_PROJECT.pdf và 8 Bounded Context đã thống nhất.

Không tự bổ sung chức năng, service, công nghệ, tài liệu quản lý hoặc cơ chế phân tán phức tạp nếu không trực tiếp cần thiết.

Chỉ triển khai một luồng nghiệp vụ chính:
Customer đặt xe BIKE → Driver nhận chuyến → Trip hoàn thành → Payment mock thành công → Customer đánh giá.

Các luồng phụ chỉ bổ sung khi phục vụ trực tiếp tiêu chí chấm, gồm đăng ký và duyệt Driver, online/offline, hủy chuyến, phân trang, thông báo và bảo mật.

Giữ hệ thống chạy local bằng một Docker Compose, một MongoDB instance, một Redis và một RabbitMQ.

Codex không được tự mở rộng phạm vi chỉ vì đó là cách triển khai phổ biến trong hệ thống doanh nghiệp.

Nếu có nhiều giải pháp hợp lệ, ưu tiên giải pháp ít code, ít cấu hình, ít phụ thuộc và dễ giải thích nhất nhưng vẫn kiểm thử được.
