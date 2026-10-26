# Đối chiếu 30 mục chấm

Tên và số mục từ PHIEU_CHAM_PROJECT.pdf đã đối chiếu trong SRS; lược tiền tố POSTMAN để dễ đọc. Số thứ tự mục chấm không phải thứ tự triển khai. Không có mục 31.

Toàn bộ phần nghiệm thu backend hiện BLOCKED do chưa có môi trường/bằng chứng chạy. Cột case là các case hỗ trợ, không thay việc đọc đầy đủ nội dung smoke/result của phiếu.

| Mục | Nội dung | Test case chính | Bằng chứng cần thu | Hiện trạng |
| --- | --- | --- | --- | --- |
| 1 | Mô tả kiến trúc tổ chức source code | TC89, TC101 | Cây source, giải thích trách nhiệm; TC101 | BLOCKED |
| 2 | Kiểm tra .gitignore và .env trên github | TC93, TC101 | Git tracked files/lịch sử, .env.example; không in secret | BLOCKED |
| 3 | Mô tả nhiệm vụ gateway trong hệ thống | TC98 | REST→gRPC, JWT, Redis, error/health; source và trace | BLOCKED |
| 4 | Mô tả IPC của các microservice | TC98, TC99, TC100 | Proto, RPC, event routing; không REST nội bộ | BLOCKED |
| 5 | Compose hệ thống và liệt kê các container | TC90, TC102 | Compose config/ps, network, volumes, DB init | BLOCKED |
| 6 | API health check | TC84, TC85, TC86 | /health, /ready, /health/services; healthy/dependency down | BLOCKED |
| 7 | Kiểm tra hệ thống Kafka / Rabbit MQ | TC99, TC100 | Exchange/queue/binding, publish/consume/redelivery/DLQ | BLOCKED |
| 8 | Kiểm tra mọi request đều phải đi qua Gateway | TC98 | Client qua Gateway; port gRPC không publish; internal RPC vẫn trực tiếp | BLOCKED |
| 9 | Đăng ký tài khoản khách hàng | TC01, TC03, TC04 | Postman đăng ký→profile→login; DB account/profile | BLOCKED |
| 10 | Đăng nhập khách hàng | TC05, TC06 | Postman đúng/sai; JWT hợp lệ, không lộ secret | BLOCKED |
| 11 | Lấy thông tin khách hàng với mã số | TC07, TC08, TC75, TC80 | GET theo customerId với token và kiểm tra ownership | BLOCKED |
| 12 | Lấy thông tin tài xế với mã số | TC13, TC14, TC42, TC80 | GET theo driverId đúng phạm vi; không lộ licenseNumber trong nearby | BLOCKED |
| 13 | Liệt kê danh sách tài xế tại khu vực | TC28, TC29, TC30, TC103 | Ít nhất 5 Driver khác trạng thái; 1 km, limit/paging, vị trí mới | BLOCKED |
| 14 | Liệt kê danh sách các booking của Customer | TC30, TC72, TC103 | Ít nhất 5 Booking, đúng Customer, thứ tự, limit/paging | BLOCKED |
| 15 | Đặt xe | TC31, TC32, TC33, TC34, TC39, TC40, TC41 | Booking SEARCHING→offer, BIKE server, chưa tạo Trip sớm | BLOCKED |
| 16 | Tài xế nhận chuyến | TC35, TC36, TC37, TC38 | Nhận lời mời→Trip ASSIGNED; khách thấy Driver; cạnh tranh không trùng | BLOCKED |
| 17 | Cập nhật trạng thái chuyến | TC45, TC46, TC47, TC48, TC52, TC53, TC54, TC55 | ARRIVED→IN_PROGRESS→location→COMPLETED, cước đúng | BLOCKED |
| 18 | Hủy chuyến | TC49, TC50, TC51, TC52 | Trip đã phân công→CANCELED; lý do, notification và release; thêm hủy SEARCHING | BLOCKED |
| 19 | Thanh toán online | TC56, TC59, TC60, TC61, TC62, TC63, TC64, TC65, TC66, TC105 | Sau COMPLETED; callback→Payment COMPLETED; view chuyến ghi đã thanh toán | BLOCKED |
| 20 | Đánh giá chuyến đi | TC73, TC74 | Review đúng Trip, sao 1–5, một review/trip | BLOCKED |
| 21 | Đăng ký tài xế | TC02, TC09, TC10, TC11, TC12, TC13, TC14, TC15, TC16, TC17, TC18, TC19 | Phone→OTP mock→hồ sơ/BIKE→gửi PENDING, không dừng ở DRAFT | BLOCKED |
| 22 | Duyệt hồ sơ tài xế | TC20, TC21, TC22, TC70, TC71 | ADMIN list/detail/approve/reject; Driver đọc kết quả | BLOCKED |
| 23 | Bật/tắt trạng thái nhận chuyến | TC23, TC24, TC25 | Online đủ điều kiện, offline lưu, không tự hủy Trip | BLOCKED |
| 24 | Data encryption at rest | TC93 | Postman + MongoDB + key config; phân biệt hash và encryption | BLOCKED |
| 25 | SQL injection attempt | TC94 | SQL string và NoSQL object không bypass, 400/401 | BLOCKED |
| 26 | XSS input test | TC96 | Payload script→400, JSON/escape; harness kiểm tra không execute | BLOCKED |
| 27 | JWT tampering | TC79, TC95 | Token sửa sub/role, sai chữ ký →401; không nhầm decode với verify | BLOCKED |
| 28 | Unauthorized API access | TC80, TC81 | Customer gọi thao tác Driver→403; thêm ownership theo ID | BLOCKED |
| 29 | Rate limit attack | TC92, TC97 | Redis TTL/429/Retry-After; công cụ tải riêng >1000 req/s có actual | BLOCKED |
| 30 | Replay attack (idempotency) | TC60, TC63, TC64, TC65, TC105 | Request/callback lặp và đồng thời; trả cũ; không double charge | BLOCKED |

Dùng grading-checklist.json làm mẫu ghi kết quả từng mục. Chỉ chuyển PASS khi các case/biến thể và evidence cần thiết đã đạt. API chạy đúng không tự chứng minh kiến trúc, secret trong Git, encryption DB hoặc tải cao.
