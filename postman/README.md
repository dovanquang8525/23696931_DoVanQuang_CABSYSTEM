# Kiểm thử Postman qua Gateway

**ID công khai hiện hành:** cid=c29, did=d01, aid=a01, bid=b01, tid=t01, pid=p01, nid=n01, rid=r01; thêm vid cho Vehicle, iid cho Invitation và oid cho OTP challenge. API/URL dùng các mã ngắn do server cấp; cid/did chính là ID Customer/Driver, không còn customerId/driverId hay accountId ObjectId trong JSON công khai. MongoDB _id và JWT sub là định danh kỹ thuật nội bộ, không nhập vào URL. ADMIN cũng có aid; không tự nhập ID khi Register.

Dùng khi kiểm API hoặc chuẩn bị mục 11–30. Cần hệ thống healthy theo [runbook](../docs/BACKEND_RUNBOOK.md), tài khoản CUSTOMER/DRIVER/ADMIN đúng password, Driver đã duyệt và fixture riêng cho từng nhánh.

## File hiện hành

Import `collections/CAB Current - Gateway REST/` (collection YAML native) và `environments/CAB Current - local template.environment.yaml`. Có 61 request: catalog đủ 47 operation, Driver Register hai bước, login các role/Customer khác và security/replay. baseUrl mặc định http://localhost:3000; customerToken/driverToken/adminToken riêng.

Điền email/password/phone vào environment local trong Postman. Export phiên vào .local/, không ghi credential/token thật vào template. Scripts tự lưu cid/did/bid/tid/pid/iid khi response có dữ liệu. GET invitations chỉ chọn offer PENDING của bid đang dùng. Không nhập cid/did/role lúc Register; URL theo ID dùng mã ngắn của đối tượng.

Các collection v3 YAML, environment copy, Test-Cases/coverage/checklist và .postman/ cũ giữ làm lịch sử. Chúng có body/biến v1 và không còn là bộ nghiệm thu hiện hành. Checker v3 tiếp tục báo OUTDATED; không đổi hash để hợp thức hóa. .postman/ là metadata cloud, không tự upload hoặc gộp với postman/.

## Thứ tự chạy

Không Run toàn bộ collection. Chọn từng request đúng trạng thái fixture; xem [thao tác tay](../docs/MANUAL_POSTMAN_30.md).

1. 10-health: 3 request HTTP 200, inventory đủ 12 thành phần.
2. 01-auth/registerAccount tạo Customer; loginAccount lấy customerToken. Folder 11 tạo Customer khác/login customer2 khi kiểm ownership; login ADMIN bằng password thực.
3. Folder 11 Driver Register bước 1 →202/otpCode; bước 2 gửi lại cùng dữ liệu + code →201; Login driver →driverToken. Register không yêu cầu oid.
4. 03-drivers: getMyDriver, updateMyDriver với licenseNumber, submitDriverProfile →PENDING. ADMIN list/detail/decideDriverApproval →APPROVED. Driver location A, availability ONLINE.
5. Mục 11/12: GET theo cid/did bằng token đúng và thử token khác. Mục 13/14 cần ít nhất 5 Driver khác trạng thái/5 Booking; kiểm page/limit và trang kế tiếp.
6. 04-bookings/createBooking: A→B, bookingKey mới →201 SEARCHING. 05-invitations/listMyInvitations lấy offer đúng booking; respondInvitation ACCEPT →tid. GET Booking để thấy Driver.
7. 06-trips: arrival →start →location B →completion. GET COMPLETED và fareAmount; chưa tạo Payment trước bước này.
8. 07-payments/createPayment: paymentKey mới →201 PENDING. Ký và gửi callback →200, GET Payment COMPLETED; getBooking có paymentSummary.hasCompleted=true. 09-ratings/createReview →201, gắn tid.
9. Hủy dùng Booking/Trip ASSIGNED riêng: preview →cancel →GET CANCELED, kiểm notifications của cả hai bên. Không hủy Trip đã hoàn thành.
10. Retry dùng Trip COMPLETED riêng: callback FAILED, chép pid sang failedPid; retryPayment với retryKey mới →201; ký callback COMPLETED bằng ID/reference/amount mới. Tối đa 3 attempt.
11. Folder 12 kiểm SQL/NoSQL/XSS/JWT/role/ownership/replay. Replay giữ nguyên body/key/snapshot tạo gốc, mong đợi 200 và snapshot giống hệt. Bắt đầu nghiệp vụ mới phải xóa key/snapshot cũ khỏi environment local để tạo key mới.

## Callback mock

Không đưa MOCK_CALLBACK_SECRET vào Postman. Dùng eventId mới, Unix timestamp hiện tại và dữ liệu Payment thật. PowerShell tại root:

```powershell
$callbackTime = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$callbackBody = '{"eventId":"UUID_MOI","pid":"PID","referenceCode":"REFERENCE","amount":18000,"currency":"VND","result":"COMPLETED","timestamp":' + $callbackTime + '}'
node --env-file=.env scripts/sign-manual-callback.cjs $callbackTime $callbackBody
```

Thay UUID/ID/reference/amount bằng dữ liệu thật trước khi ký. Chép body vào callbackPayload, timestamp vào callbackTimestamp, giá trị sha256=... vào callbackSignature; gửi trong 300 giây. Không format/sửa body sau ký. Replay callback giữ nguyên body/header cũ. Chữ ký sai →401; signed wrong amount →400. FAILED dùng fixture riêng, không đổi terminal status của Payment đã COMPLETED.

## Kiểm tra và bằng chứng

```powershell
node scripts/check_postman.cjs
```

Kỳ vọng STATIC_OK: đủ 47 operation, body catalog đúng schema, không thiếu biến, scripts hợp lệ. Đây không phải HTTP hoặc Postman UI. Mỗi request có status/data assertions; chỉ ghi PASS khi thực sự gửi và assertions đạt. 429 chờ Retry-After; 503 kiểm dependency theo runbook.

Mục 24 cần DB/key evidence; mục 26 cần browser harness; mục 29 cần terminal load và tốc độ thực >1000 request/s. Không đánh PASS chỉ vì status đúng. Kết quả/bước thủ công ở [GRADING_MATRIX.md](../docs/GRADING_MATRIX.md), [PROJECT_STATUS.md](../docs/PROJECT_STATUS.md).

## Validation demo Password/Phone — 28/10/2026

Dùng cho học tập local. Password String ít nhất 1 ký tự, không trim/không yêu cầu độ phức tạp; Phone String không rỗng sau trim, chấp nhận ngắn/chứa chữ và giữ số 0 đầu. Không còn giới hạn 8–64 của password hoặc 10 chữ số của phone. Email vẫn đúng định dạng. Không gửi Phone dạng Number. Duplicate email/phone vẫn409; password/phone thiếu, null, sai kiểu hoặc rỗng vẫn400. Chính sách này không dành cho production.

Environment template để trống email/phone/password/token của người dùng trước khi đưa lên GitHub. Khi dùng local, tự điền customerEmail=quang123@gmail.com, customerPassword=123, customerPhone=0123; đây là ví dụ String cho demo. Đăng ký qua POST /api/v1/auth/register:

```json
{"email":"quang123@gmail.com","password":"123","phone":"0123"}
```

Kỳ vọng201 nếu chưa có; nếu409, không đăng ký lại hoặc reset tài khoản. Login riêng qua POST /api/v1/auth/login:

```json
{"email":"quang123@gmail.com","password":"123"}
```

Kỳ vọng200 và accessToken; password sai trả401. Đổi email/phone thành giá trị mới khi thử password một ký tự "a" hoặc phone "123"/"abc123". Driver vẫn thêm plateNumber, lần đầu202/OTP, gửi lại cùng dữ liệu+code để201, bổ sung license và submitPENDING. Không nhập role/cid/did/oid trong Register.

Chạy regression từ PowerShell ở root:

```powershell
npm.cmd test
npm.cmd run check
node scripts/check_postman.cjs
npm.cmd run test:validation
```

Suite tạo dữ liệu test mới, giữ tài khoản cũ; evidence ở .local/evidence/validation-*.json. Kiểm hash thực dùng owner auth_service, không suy ra từ HTTP hoặc hiển thị hash/secret trong Postman. Các kết quả thực tại [PROJECT_STATUS.md](../docs/PROJECT_STATUS.md).
