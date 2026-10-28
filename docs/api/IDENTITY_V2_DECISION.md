# Quyết định Identity v2 — email và mã hồ sơ ngắn

**Validation demo cập nhật 28/10/2026:** Password là String không rỗng (ít nhất 1 ký tự, ví dụ "123" hoặc "a"), không trim và không yêu cầu độ phức tạp; Phone là String không rỗng sau trim (ví dụ "0123", "123", "abc123"), giữ số 0 đầu và vẫn unique. Email giữ định dạng cơ bản. Chỉ áp dụng cho học tập/demo local; không phải chính sách production. Argon2id, JWT, role/ownership và OTP Driver giữ nguyên.

**Response hiện hành:** Register hoàn tất chỉ trả accountId/role/cid hoặc did, không token hoặc profileStatus. Login riêng trả accessToken và account tối giản (accountId, role, cid/did nếu có), không status/tokenType/expiresAt. Driver vẫn phải hoàn tất OTP trước khi tạo Account; Customer không cần OTP.

**ĐÃ ĐƯỢC THAY THẾ ở phần nhập liệu bởi yêu cầu tiếp theo:** Customer chỉ nhập email/password/phone; Driver thêm plateNumber, gửi Register lần đầu lấy OTP (202), thêm code và gửi lần hai để tạo account (201). cid/did do Auth tự cấp, không nhận từ client; không yêu cầu otpId trong Register. Hồ sơ Driver DRAFT cần licenseNumber rồi Submit để PENDING theo SRS. Vị trí dùng mã A/B đọc từ DB mỗi owner service. Login email, password ít nhất 1, JWT/ownership/OTP expiry vẫn giữ. Hợp đồng hiện hành xem contracts.md và 10 YAML version 3.0.0; phần v2 dưới đây là lịch sử quyết định trước, không áp dụng body cid/did cũ.

Nguồn quyết định: người dùng chọn email để login, cid/did là mã hồ sơ ngắn và ID nội bộ do server tạo; chọn xóa toàn bộ dữ liệu nghiệp vụ trong 8 DB. Sau khi được hỏi về mật khẩu, người dùng làm rõ 123 chỉ là ví dụ nhập nhanh và đưa quang123 làm ví dụ khác. Triển khai dùng quang123 trong quyết định cũ; chính sách validation đã được người dùng thay bằng quy tắc demo ngày 28/10/2026. Xóa dữ liệu vẫn chỉ là lệnh chuẩn bị để người dùng tự chạy.

## Hợp đồng đề nghị

- Login chỉ nhận email + password; email trim/lowercase và duy nhất ở Auth.
- cid/did là mã hồ sơ ngắn, không phải định danh đăng nhập. Customer dùng c01, c02...; Driver dùng d01, d02...; mã là chuỗi lowercase 2–16 ký tự, bắt đầu bằng c hoặc d tương ứng và duy nhất theo loại.
- Account/customerId/driverId/tripId... nội bộ vẫn do server tạo theo ObjectId 24 hex; JWT sub và liên kết DB/gRPC/event vẫn dùng ID nội bộ.
- POST /api/v1/auth/register Customer chỉ nhận cid, password, phone, email. Driver chỉ nhận did, password, phone, email, otpId đã verify. Không nhận role; đúng một trong cid/did suy ra role. Không có đăng ký ADMIN công khai.
- REST fullName đổi thành name trong hồ sơ/public Driver snapshot. Tên lúc tạo profile dùng cid/did làm nhãn ban đầu, sửa bằng PATCH name sau; không thêm trường nhập bắt buộc khi đăng ký.
- Protobuf/event có thể giữ tên full_name/fullName nội bộ và dùng mapper REST rõ ràng; bổ sung cid/did/email vào hợp đồng cần thiết. Không đổi mã field protobuf cũ sang nghĩa khác, tránh sai wire khi chưa rebuild hết.
- OTP mock vẫn dành cho Driver, gắn với phone, có thời hạn/cooldown/số lần sai/tiêu thụ một lần. Request OTP public chỉ nhập phone; purpose DRIVER_REGISTRATION suy ra ở server.

Customer đăng ký:

```json
{"cid":"c01","password":"quang123","phone":"0909212109","email":"cus01@gmail.com"}
```

Đăng nhập:

```json
{"email":"cus01@gmail.com","password":"quang123"}
```

Driver ví dụ (phone/email là dữ liệu demo đề nghị, có thể chọn giá trị khác):

```json
{"did":"d01","password":"quang123","phone":"0909212110","email":"dri01@gmail.com","otpId":"ID_THAT_DA_VERIFY"}
```

## Mật khẩu

- Quy tắc demo mới: password String ít nhất 1 ký tự; "123", "a" và "2321423" hợp lệ. Không trim password; không dùng quy tắc này cho production.
- Không thêm DEMO_SHORT_PASSWORDS hoặc cơ chế bỏ qua validation.
- Password vẫn băm Argon2id có salt; JWT verification, kiểm quyền/ownership và Redis rate limit giữ nguyên.
- Mật khẩu ví dụ phục vụ bài thực hành local; không thay secret .env hiện có.

## Dữ liệu và tương thích

- Người dùng đã chọn xóa toàn bộ dữ liệu nghiệp vụ trong 8 DB. Công cụ reset chỉ chuẩn bị lệnh để người dùng tự chạy, không tự thực thi Docker hoặc xóa dữ liệu.
- Reset dừng Gateway/8 service, purge main/retry/DLQ của đúng CAB topology, xóa documents nghiệp vụ của đúng owner DB và counter cab:rate:*; giữ metadata ownership, DB users, indexes, volumes, .env và secret.
- Không tự seed lại Customer/Driver sau reset. ADMIN cần bootstrap riêng vì API không cho public ADMIN. Các fixture 5 Driver/5 Booking cho tiêu chí 13/14 phải chuẩn bị lại sau đó.
- Đây là thay đổi không tương thích với login bằng phone/body role/fullName cũ. Cần đồng bộ SRS/contracts/YAML/proto/code/tests/hướng dẫn nhập tay; bảo toàn Postman cũ và đánh dấu OUTDATED, không sửa assertions để chấp nhận endpoint sai.
- Chưa có kết quả kiểm thử cho thiết kế mới. Không đánh dấu PASS hoặc VERIFIED trước khi có bằng chứng chạy.
