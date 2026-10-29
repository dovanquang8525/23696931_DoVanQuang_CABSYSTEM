# URL Postman theo 30 câu — CAB System

**Offer demo không hết hạn — 29/10/2026:** đã bỏ hạn30 giây. Customer có thể đặt trước rồi mới Login Driver, đọc notifications/invitations và ACCEPT khi offer còn PENDING và Booking còn SEARCHING. Không cần nhập nhanh. Driver REJECT để xét người tiếp theo, Customer hủy để dừng tìm. Không tự hồi sinh NO_DRIVER/EXPIRED cũ. JWT/OTP/callback/deadline gRPC vẫn có hạn như cũ; không bỏ bảo vệ đồng thời Driver.

**Chính sách demo mới 29/10/2026:** dùng tọa độ cuối cùng Driver đã gửi, bỏ điều kiện tuổi vị trí 120 giây khi bật online, CUSTOMER nearby, phân công và tính ETA. Không cần cập nhật lại tọa độ chỉ để làm mới thời gian. Giữ timestamp thật; locationIsFresh chỉ là chỉ báo độ mới, không chặn nhận chuyến. Vẫn phải ACTIVE/APPROVED/online/BIKE/không bận, không giữ chỗ và trong1 km; offer PENDING không tự hết hạn trong demo. Đây là giả lập vị trí tĩnh để demo, không phải GPS thời gian thực.

**Cập nhật 29/10/2026:** đã duyệt cả5 hồ sơ mẫu d01–d05 thành APPROVED. Không tự đổi online/vị trí: d01/d02 online, d03/d04/d05 offline; vẫn cần vị trí mới và trong1 km để nhận chuyến. Đăng ký Driver mới vẫn DRAFT → Submit PENDING → ADMIN duyệt APPROVED hoặc REJECTED; không tự động phê duyệt. Thử câu22 bằng hồ sơ mới, danh sách PENDING có thể rỗng trước khi có người gửi duyệt.

**Tên tài xế trong danh sách Booking:** với b18/b19/b20 đã COMPLETED, cả ADMIN `GET /api/v1/admin/bookings?cid=c02&page=1&limit=3` và Customer chủ Booking `GET /api/v1/bookings?page=1&limit=3` đều thấy `did:d01`, `driver.name:NGUYEN VAN HUNG`, `driver.vehicle`. Đổi cid/token đúng khách để xem b19 hoặc b20. NO_DRIVER hoặc Booking chưa có Trip không có driver; không gán tên tài xế giả cho các lịch sử mẫu chưa nhận chuyến. Snapshot công khai này không có email/license/aid của Driver.

**Đã có 3 Booking hoàn thành để xem tài xế:** c02: b18/t01, c03: b19/t02, c04: b20/t03; cả3 do d01 (NGUYEN VAN HUNG) nhận và hoàn thành tuần tự qua API, không chồng thời gian. Chưa thanh toán. Tổng hiện có20 Booking: c01=5, c02/c03/c04 mỗi khách4, c05=3; thay đổi nếu bạn tạo thêm. ADMIN hoặc Customer chủ Booking GET `http://localhost:3000/api/v1/bookings/b18` (thay b19/b20 theo người sở hữu) để xem booking.status=COMPLETED, trip.did=d01 và trip.driver gồm tên/xe. Token c01 không đọc được Booking b18 của c02. Danh sách Booking hiện trả thêm did và driver (did/name/vehicle) khi đã được phân công; chi tiết vẫn có trip.driver.

**Cần test câu 14:** xem [Câu 14 — ADMIN và Customer xem Booking](#cau-14), có hai URL riêng và token cần dùng.

**12 Booking lịch sử chưa có Driver (vẫn được giữ):** c01 giữ b01–b05 (5 Booking); c02 có b06–b08, c03 có b09–b11, c04 có b12–b14, c05 có b15–b17 (mỗi khách 3). Riêng nhóm lịch sử này có17 Booking. Mẫu mới gồm NO_DRIVER/CANCELED, chưa gán Driver/Trip; không phải lịch sử chuyến đã thực hiện. ADMIN chọn cid bất kỳ trong query, Customer dùng token của mình với GET `/api/v1/bookings` để xem đúng lịch sử của mình, gồm cả Booking mới/đang đặt khi phát sinh. Không thêm status/ngày nếu muốn toàn bộ lịch sử. Booking tạo tiếp dự kiến b21 nếu chưa tạo thêm dữ liệu.

**Bộ mẫu hiện tại sau làm sạch 28/10:** Customer c01–c05, Driver d01–d05, Booking b01–b05 thuộc c01; tài khoản cũ như c29 đã xóa theo yêu cầu. Danh sách đăng nhập nằm trong `.local/demo-reset-20261028/ACCOUNTS.local.md` (chỉ local). d01–d05 đều APPROVED; d01/d02 online, d03/d04/d05 offline; tọa độ riêng giữ nguyên. Cả CUSTOMER và ADMIN dùng tọa độ cuối cùng; chỉ cập nhật khi muốn đổi vị trí. Đăng ký mới sẽ nhận c06/d06, Booking mới b21 nếu chưa tạo thêm dữ liệu. Các mã trong ví dụ bên dưới cần thay bằng mã đang tồn tại.

**ID công khai hiện hành:** `cid`, `did`, `aid`, `bid`, `tid`, `pid`, `nid`, `rid`; thêm `vid` cho Vehicle, `iid` cho Invitation và `oid` cho OTP challenge. Dùng `c01`, `d01`, `b01` để tra bộ mẫu hiện có. Trip/Payment/Review ban đầu rỗng; phải tạo qua luồng nghiệp vụ rồi lấy ID từ response. MongoDB `_id` và JWT `sub` là định danh nội bộ, không nhập vào URL. Không tự nhập ID khi Register.

Đối chiếu ngày 28/10/2026 với `docs/api/` và [phiếu chấm](../PHIEU_CHAM_PROJECT.pdf). File này dùng để tra nhanh: câu nào, ai gọi, thao tác gì, method và URL đầy đủ. Đây là danh sách thao tác, không phải bằng chứng các câu đã PASS.

## 1. Cách dùng

**Gateway local là `http://localhost:3000`**, có port `:3000`. Ví dụ đúng: `http://localhost:3000/api/v1/auth/login`; không gõ `http:.//` hoặc bỏ port.

- CUSTOMER: dùng token của khách hàng đang làm bài. CUSTOMER khác: dùng token của khách hàng thứ hai để thử ownership.
- DRIVER: dùng token tài xế đang làm bài. ADMIN: dùng token quản trị viên.
- **No Auth**: không gửi Bearer token. Callback mock dùng chữ ký HMAC riêng.
- Với request cần token, đặt header `Authorization: Bearer TOKEN_THAT`. POST/PUT/PATCH có JSON thì đặt `Content-Type: application/json`, Body → raw → JSON. GET chọn Body → none.
- Thay `{cid}`, `{did}`, `{bid}`, `{iid}`, `{tid}`, `{pid}`, `{nid}`, `{oid}` bằng ID thật từ response. Không giữ dấu `{}` khi gửi.
- `cid/did` là mã ngắn của Customer/Driver, ví dụ `c01/d01`; dùng trực tiếp các mã này trong URL.
- `A/B` là mã vị trí demo trong DB; không phải mã khách hoặc tài xế. `page=1&limit=2` là ví dụ phân trang; đổi `page=2` để xem trang tiếp.

### 1.1. Tài khoản và token dùng trong buổi test

Đã có bộ mẫu, **không chạy lại seed hoặc reset**. Mật khẩu demo xem trong [ACCOUNTS.local.md](../.local/demo-reset-20261028/ACCOUNTS.local.md); ADMIN dùng mật khẩu hiện tại. File local này không có trên GitHub. Nếu chỉ clone source mới, đọc [BACKEND_RUNBOOK.md](BACKEND_RUNBOOK.md) để chuẩn bị môi trường, không mặc định database đã có bộ mẫu này.

| Token tự ghi trong Postman | Email đăng nhập     | ID / vai trò sử dụng                                |
| -------------------------- | ------------------- | --------------------------------------------------- |
| C1_TOKEN                   | customer1@cab.local | c01 — chủ 5 Booking mẫu; dùng cho câu 11, 13–20, 30 |
| C2_TOKEN                   | customer2@cab.local | c02 — thử truy cập dữ liệu của c01 phải bị 403      |
| D1_TOKEN                   | driver1@cab.local   | d01 — APPROVED, online, có xe BIKE                  |
| D2_TOKEN                   | driver2@cab.local   | d02 — APPROVED, online, có xe BIKE                  |
| A_TOKEN                    | admin@cab.local     | ADMIN hiện có; không đăng ký lại ADMIN              |
| D4_TOKEN (khi cần)         | driver4@cab.local   | d04 — APPROVED, hiện offline         |
| D5_TOKEN (khi cần)         | driver5@cab.local   | d05 — APPROVED, hiện offline |

c03–c05 đăng nhập bằng customer3@cab.local đến customer5@cab.local. d03 là driver3@cab.local, APPROVED nhưng offline. Cả 10 hồ sơ có tên IN HOA không dấu; đọc lại bằng API để xác nhận dữ liệu hiện tại.

Đăng nhập từng tài khoản bằng `POST http://localhost:3000/api/v1/auth/login`, **No Auth**, Body → raw → JSON:

```json
{ "email": "customer1@cab.local", "password": "MAT_KHAU_DEMO_TRONG_FILE_LOCAL" }
```

Thay giá trị password bằng mật khẩu local trước khi Send. Đổi email để lấy các token còn lại. Kết quả đúng **200**, sao chép `accessToken`; trong Authorization chọn **Bearer Token**, chỉ dán token, không thêm chữ `Bearer` vào ô Token. Nếu 401: kiểm password/email; nếu 429: chờ số giây trong `Retry-After`. Không gửi liên tục để vượt giới hạn. Không đưa token/mật khẩu vào file hướng dẫn hoặc commit environment chứa session.

### 1.2. Thứ tự làm bài với bộ mẫu này

1. Kiểm health câu 6, Login lấy C1_TOKEN, C2_TOKEN, D1_TOKEN, D2_TOKEN và A_TOKEN.
2. Câu 11–14 dùng **A_TOKEN**: tra c01, d01, tìm nearby theo tọa độ và liệt kê Booking qua /admin/bookings. Không cần cập nhật vị trí Driver để ADMIN tra vị trí cuối cùng.
3. Câu 15–17 → 19–20: dùng c01 và d01 tạo **Booking mới**, nhận chuyến, hoàn thành, thanh toán, đánh giá. Không dùng b01–b17 để bắt đầu chuyến vì đây là lịch sử NO_DRIVER/CANCELED.
4. Câu 18 tạo Booking mới riêng, Driver nhận rồi Customer hủy trước khi bắt đầu Trip. Xem thông báo bằng cả hai token.
5. Câu 9 và 21 dùng email/phone mới để chứng minh đăng ký. Customer/Driver mới dự kiến c06/d06 nếu chưa tạo thêm; luôn lấy ID thực trong response. Token của các tài khoản này để riêng, không thay C1_TOKEN đang dùng kiểm phân trang.
6. Câu 22 duyệt hồ sơ PENDING của Driver mới ở câu 21. Câu 23 thử online/offline rồi bật lại nếu tiếp tục đặt xe. Cuối cùng kiểm bảo mật câu 24–30.

Ghi riêng `bid`, `iid`, `tid`, `pid`, `nid`, Driver thực sự nhận chuyến và các Idempotency-Key. Ví dụ `bid=b21` chỉ đúng khi đó là response hiện tại; không đoán `tid`/`pid` từ số Booking. Hết hạn token thì Login lại, không Register lại tài khoản.

## 2. Câu 1–8: kiến trúc, Git, Docker và health

| Câu | Ai thực hiện        | Thao tác                                  | Method | URL đầy đủ / nơi thực hiện                                                                        |
| --- | ------------------- | ----------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| 1   | Người trình bày     | Giải thích cấu trúc 8 service             | —      | Không có API riêng; xem `services/`, `gateway/`, `proto/` và [ARCHITECTURE.md](ARCHITECTURE.md)   |
| 2   | Người trình bày     | Kiểm `.gitignore`, `.env` trên Git/GitHub | —      | Không có API riêng; dùng Git/GitHub, không mở hoặc chụp secret trong `.env`                       |
| 3   | Người trình bày     | Giải thích nhiệm vụ Gateway               | —      | Không có API riêng; các URL nghiệp vụ bên dưới đều đi qua Gateway                                 |
| 4   | Người trình bày     | Giải thích gRPC và RabbitMQ               | —      | Không có REST API riêng; xem `proto/`, `docs/events/topology.json`                                |
| 5   | Người trình bày     | Liệt kê container                         | —      | Terminal tại root: `docker compose ps -a`                                                         |
| 6   | Bất kỳ ai — No Auth | Gateway còn hoạt động                     | GET    | `http://localhost:3000/health`                                                                    |
| 6   | Bất kỳ ai — No Auth | Kiểm hệ thống sẵn sàng                    | GET    | `http://localhost:3000/ready`                                                                     |
| 6   | Bất kỳ ai — No Auth | Xem trạng thái 12 thành phần              | GET    | `http://localhost:3000/health/services`                                                           |
| 7   | Người trình bày     | Xem exchange, queues, consumers           | —      | Mở **trình duyệt**: `http://localhost:15672`; dùng tài khoản RabbitMQ trong cấu hình local        |
| 8   | Người trình bày     | Chứng minh client qua Gateway             | —      | Dùng các URL `http://localhost:3000/...` trong file này và kiểm port gRPC không publish ở Compose |

URL `:15672` là giao diện quản trị RabbitMQ để minh họa câu 7, không phải API nghiệp vụ để Postman gọi trực tiếp service.

## 3. Câu 9–14: đăng ký, đăng nhập và ADMIN tra cứu

**Đối chiếu câu 14 (phiếu chấm trang 2):** yêu cầu liệt kê Booking của Customer, có ít nhất 5 Booking mẫu, giới hạn và phân trang; phiếu không quy định phải dùng ADMIN. Trong buổi test này dùng **A_TOKEN + cid của khách cần xem**. Ví dụ `GET http://localhost:3000/api/v1/admin/bookings?cid=c01&page=1&limit=2` trả cả lịch sử cũ và Booking mới đã tạo của **riêng c01**, mọi trạng thái, không lọc ngày. Đổi cid để chọn khách khác; mã đúng là `c01`, không phải `01`. Khi tạo Booking mới của c01 rồi Send lại, totalItems tăng và dữ liệu mới xuất hiện theo thứ tự mới nhất trước; Booking đang tìm, đã nhận, đã hoàn thành, đã hủy hoặc NO_DRIVER đều được liệt kê nếu thuộc c01. Không thêm query status nếu muốn toàn bộ lịch sử.

Postman request **listBookings** đã đặt `cid={{cid}}`; trong environment local đặt `cid=c01` (hoặc ID khách bạn chọn), dùng adminToken. Không có cid thì endpoint quản trị vẫn có chức năng liệt kê toàn hệ thống, nhưng đó **không phải phép thử chính câu 14**. Không dùng token ADMIN ở `/bookings` vì endpoint đó dành cho Customer đọc Booking của chính mình.

**Câu 11–14 dùng A_TOKEN.** ADMIN xem danh sách và tìm theo ID Customer/Driver/Booking; nearby tìm theo latitude/longitude số. Không cần đổi sang locationCode=A và không cần đăng nhập Driver để làm mới vị trí khi ADMIN chỉ tra cứu vị trí cuối cùng.

| Câu | Ai / token | Thao tác                         | Method | URL đầy đủ                                                                                       | Body / kết quả cần kiểm                                                  |
| --- | ---------- | -------------------------------- | ------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| 9   | No Auth    | Đăng ký Customer mới             | POST   | `http://localhost:3000/api/v1/auth/register`                                                     | Email/password/phone mới, không plateNumber; 201, lưu cid; chưa có token |
| 10  | No Auth    | Login Customer hoặc ADMIN        | POST   | `http://localhost:3000/api/v1/auth/login`                                                        | Email/password; 200 và accessToken                                       |
| 10  | A_TOKEN    | Kiểm tài khoản đang dùng         | GET    | `http://localhost:3000/api/v1/auth/me`                                                           | 200, role=ADMIN                                                          |
| 11  | A_TOKEN    | Liệt kê Customer                 | GET    | `http://localhost:3000/api/v1/admin/customers?page=1&limit=2`                                    | 200; xem totalItems và cid từng hồ sơ                                    |
| 11  | A_TOKEN    | Tra Customer c01                 | GET    | `http://localhost:3000/api/v1/customers/c01`                                                     | 200, cid=c01, tên NGUYEN VAN AN                                          |
| 12  | A_TOKEN    | Liệt kê Driver                   | GET    | `http://localhost:3000/api/v1/admin/drivers?page=1&limit=10`                                     | 200; bộ mẫu d01–d05 nếu chưa thêm tài khoản                              |
| 12  | A_TOKEN    | Tra Driver d01                   | GET    | `http://localhost:3000/api/v1/drivers/d01`                                                       | 200, did=d01, tên NGUYEN VAN HUNG                                        |
| 12  | A_TOKEN    | Tìm hồ sơ chờ duyệt              | GET    | `http://localhost:3000/api/v1/admin/drivers?approvalStatus=PENDING&page=1&limit=10`              | 200; chỉ PENDING                                                         |
| 13  | A_TOKEN    | Nearby trang 1, tối đa 2 người   | GET    | `http://localhost:3000/api/v1/admin/drivers/nearby?latitude=10.8&longitude=106.7&page=1&limit=2` | 200; theo vị trí cuối cùng trong 1 km, gồm offline/chờ duyệt/vị trí cũ   |
| 13  | A_TOKEN    | Nearby trang 2                   | GET    | `http://localhost:3000/api/v1/admin/drivers/nearby?latitude=10.8&longitude=106.7&page=2&limit=2` | 200; did không trùng trang 1                                             |
| 13  | A_TOKEN    | URL chung cũng hỗ trợ ADMIN      | GET    | `http://localhost:3000/api/v1/drivers/nearby?latitude=10.8&longitude=106.7&page=1&limit=2`       | Cùng dữ liệu và quy tắc tra cứu ADMIN                                    |
| 14  | A_TOKEN    | Liệt kê Booking của c01, trang 1 | GET    | `http://localhost:3000/api/v1/admin/bookings?cid=c01&page=1&limit=2`                             | Ban đầu 5 Booking, trang 1 có 2                                          |
| 14  | A_TOKEN    | Booking của c01, trang 2         | GET    | `http://localhost:3000/api/v1/admin/bookings?cid=c01&page=2&limit=2`                             | Ban đầu 2 Booking, không trùng trang 1                                   |
| 14  | A_TOKEN    | Booking của c01, trang 3         | GET    | `http://localhost:3000/api/v1/admin/bookings?cid=c01&page=3&limit=2`                             | Ban đầu 1 Booking                                                        |
| 14  | A_TOKEN    | Tìm Booking của c01              | GET    | `http://localhost:3000/api/v1/admin/bookings?cid=c01&page=1&limit=2`                             | 200; đúng Customer                                                       |
| 14  | A_TOKEN    | Tra Booking theo ID              | GET    | `http://localhost:3000/api/v1/bookings/b01`                                                      | 200, bid=b01; lịch sử mẫu NO_DRIVER                                      |

### Vị trí mẫu để kiểm bán kính 1 km

| Driver | Latitude | Longitude | Khoảng cách từ 10.8,106.7 | ADMIN nearby tại điểm tìm |
| ------ | -------- | --------- | ------------------------- | ------------------------- |
| d01    | 10.800   | 106.700   | 0 m                       | Có                        |
| d02    | 10.802   | 106.702   | khoảng 312 m              | Có                        |
| d03    | 10.805   | 106.700   | khoảng 556 m              | Có, dù offline            |
| d04    | 10.820   | 106.700   | khoảng 2.224 m            | Không                     |
| d05    | 10.780   | 106.680   | khoảng 3.117 m            | Không                     |

Muốn thấy cả 3 trong cùng response dùng `GET http://localhost:3000/api/v1/admin/drivers/nearby?latitude=10.8&longitude=106.7&page=1&limit=3`. Trong mỗi item, `driver` là hồ sơ đầy đủ cho ADMIN: did, aid, name, email, licenseNumber khi có, approvalStatus, isOnline, location, vehicle và các trường hồ sơ khác nếu có. Bên ngoài driver có distanceKm và locationIsFresh. CUSTOMER không nhận email/license/aid của Driver qua nearby. Danh sách `/admin/drivers` vẫn có cả 5 người; chỉ nearby lọc theo 1 km. Dữ liệu có thể thay đổi nếu bạn cập nhật vị trí/nhận chuyến.

**Phân trang:** `limit=1` trả tối đa 1 người mỗi trang, `limit=2` trả tối đa 2; `totalItems` là tổng kết quả. Bộ mẫu có 3 Driver trong 1 km (d01/d02/d03), 2 Driver ở xa (d04/d05). ADMIN thấy totalItems=3; limit=2 cho trang 1 có 2 người, trang 2 có 1 người. d04/d05 không xuất hiện ở khu vực này. ADMIN thấy thêm `approvalStatus`, `isOnline`, `locationIsFresh`; false nghĩa vị trí cũ, không khẳng định Driver sẵn sàng nhận chuyến. Không tự đổi online hay làm mới timestamp khi tra cứu.

URL ban đầu với limit=1 vẫn hợp lệ:

```http
GET http://localhost:3000/api/v1/drivers/nearby?latitude=10.8&longitude=106.7&page=1&limit=1
```

Dùng A_TOKEN: một item, totalItems là tổng Driver gần điểm tìm. Muốn thấy 2 người trong cùng response thì đổi limit=2. Không dùng `/customers/me`, `/drivers/me`, `/bookings` với A_TOKEN để thay các URL ADMIN trong bảng: các endpoint đó phục vụ hồ sơ/dữ liệu của chính CUSTOMER/DRIVER.

**Body câu 9:** dùng email/phone chưa tồn tại; thành công 201. Nếu đã đăng ký thì Login hoặc thay dữ liệu, không reset tài khoản để ép 201:

```json
{ "email": "quang123@gmail.com", "password": "123", "phone": "0123" }
```

**Body câu 10:**

```json
{ "email": "quang123@gmail.com", "password": "123" }
```

Để lấy A_TOKEN, thay email bằng admin@cab.local và nhập mật khẩu ADMIN hiện tại. Register không plateNumber tạo CUSTOMER; có plateNumber đăng ký DRIVER theo hai bước OTP câu 21. Không gửi role/cid/did. Customer/Driver mới dự kiến c06/d06 nếu chưa tạo thêm; luôn lưu ID thực từ response.

### Các API của chủ tài khoản dùng bổ trợ và kiểm quyền

| Câu                | Ai / token | Thao tác                           | Method | URL đầy đủ                                                                                       | Kết quả cần kiểm                                                                       |
| ------------------ | ---------- | ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| 11                 | C1_TOKEN   | Hồ sơ Customer của mình            | GET    | `http://localhost:3000/api/v1/customers/me`                                                      | 200, cid=c01                                                                           |
| 11                 | C1_TOKEN   | Sửa tên hồ sơ của mình             | PATCH  | `http://localhost:3000/api/v1/customers/me`                                                      | Body ví dụ {"name":"NGUYEN VAN AN"}; không đổi email Login Auth                        |
| 12                 | D1_TOKEN   | Hồ sơ Driver của mình              | GET    | `http://localhost:3000/api/v1/drivers/me`                                                        | 200, did=d01                                                                           |
| 12                 | D1_TOKEN   | Xe của mình                        | GET    | `http://localhost:3000/api/v1/drivers/me/vehicle`                                                | 200, vid và did                                                                        |
| 14                 | C1_TOKEN   | Customer xem Booking của mình      | GET    | `http://localhost:3000/api/v1/bookings?page=1&limit=2`                                           | 200; chỉ của c01                                                                       |
| 11, 28             | C2_TOKEN   | Customer khác đọc c01              | GET    | `http://localhost:3000/api/v1/customers/c01`                                                     | 403                                                                                    |
| 12, 28             | C1_TOKEN   | Customer đọc chi tiết Driver riêng | GET    | `http://localhost:3000/api/v1/drivers/d01`                                                       | 403; xem snapshot công khai qua nearby/Trip                                            |
| 13, 28             | C1_TOKEN   | Customer gọi nearby ADMIN          | GET    | `http://localhost:3000/api/v1/admin/drivers/nearby?latitude=10.8&longitude=106.7&page=1&limit=2` | 403                                                                                    |
| 13 — phía Customer | C1_TOKEN   | Tìm người nhận chuyến              | GET    | `http://localhost:3000/api/v1/drivers/nearby?latitude=10.8&longitude=106.7&page=1&limit=2`       | Chỉ ACTIVE/APPROVED/online/xe BIKE active/không bận/vị trí đã lưu hợp lệ (không giới hạn tuổi trong demo); có thể rỗng |

Customer nearby và Booking dispatch vẫn yêu cầu vị trí mới. Trước khi đặt xe câu 15, dùng token chính Driver PUT `/drivers/me/location` với {"latitude":10.8,"longitude":106.7}, rồi PUT `/drivers/me/availability` với {"isOnline":true}. ADMIN chỉ tra vị trí đã lưu; không dùng kết quả đó để khẳng định mọi người trong danh sách đều có thể nhận chuyến.

<a id="cau-14"></a>

### Câu 14 — ADMIN và Customer xem Booking

Mục tiêu: ADMIN chọn một Customer để xem Booking; Customer đăng nhập chỉ xem được Booking của chính mình. Cả hai danh sách gồm lịch sử đã đặt và Booking đang đặt khi phát sinh, có limit/paging, không mặc định lọc ngày hoặc trạng thái.

| Người xem                 | Token trong Authorization | Method | URL đầy đủ                                                           | Cách xác định Customer                    |
| ------------------------- | ------------------------- | ------ | -------------------------------------------------------------------- | ----------------------------------------- |
| ADMIN xem c01             | A_TOKEN                   | GET    | `http://localhost:3000/api/v1/admin/bookings?cid=c01&page=1&limit=2` | ADMIN chọn c01 bằng query cid             |
| Customer c01 xem của mình | C1_TOKEN                  | GET    | `http://localhost:3000/api/v1/bookings?page=1&limit=2`               | Server xác định c01 từ token đã đăng nhập |

**Phần A — ADMIN:**

1. Login admin@cab.local bằng mật khẩu ADMIN hiện tại, lấy A_TOKEN.
2. Tạo GET theo dòng ADMIN trong bảng. Authorization → Bearer Token → dán A_TOKEN; Body → none.
3. Send →200. Kiểm totalItems=5 với bộ mẫu c01, mỗi item có cid=c01; trang1 có2 Booking.
4. Đổi page=2 →2 Booking khác; page=3 →1 Booking. Nếu đã tạo thêm Booking cho c01 thì tổng và số trang tăng theo dữ liệu thực.
5. Muốn xem khách khác, đổi `cid=c02`/c03/c04/c05 và giữ A_TOKEN. Hiện c02/c03/c04 mỗi khách4 Booking (hai trang2–2), c05 có3 Booking (hai trang2–1).

**Phần B — Customer c01:**

1. Login **customer1@cab.local** bằng mật khẩu demo trong file local, lấy C1_TOKEN. Đừng dùng token Customer mới đăng ký ở câu9 nếu muốn xem5 Booking của c01.
2. Tạo GET theo dòng Customer trong bảng. Authorization → Bearer Token → dán C1_TOKEN; Body → none. **URL không có admin và không thêm cid.**
3. Send →200. Kết quả page1 phải khớp danh sách ADMIN xem c01 cùng page/limit: totalItems=5 và chỉ cid=c01.
4. Đổi page=2/page=3 để kiểm phân trang. Nếu đổi sang token customer2@cab.local mà giữ nguyên URL này, server tự trả Booking của c02 (hiện4 Booking); không cần sửa URL theo ID.

Endpoint Customer không có chữ `me` trong đường dẫn, nhưng **GET /bookings có nghĩa xem danh sách của chính người đang đăng nhập**. Server lấy account từ JWT rồi tìm Customer tương ứng; người gọi không được tự chọn Customer khác bằng query cid ở endpoint này. POST cùng đường dẫn là thao tác tạo Booking, khác với GET xem danh sách.

**Các lỗi cần phân biệt:** A_TOKEN gọi GET `/bookings` →403; C1_TOKEN gọi `/admin/bookings?cid=c01` →403; Customer c02 đọc chi tiết `/bookings/b01` của c01 →403. ADMIN bỏ cid ở `/admin/bookings` sẽ xem toàn hệ thống, không phải phép thử chính câu14. Đăng nhập đúng nhưng danh sách rỗng có thể do tài khoản đó chưa có Booking; kiểm GET `/customers/me` bằng token Customer để xác định cid.

Postman collection hiện hành: **listBookings** dùng adminToken và biến cid; **listMyBookings** dùng customerToken. Khi kiểm phía c01, đặt customerToken bằng C1_TOKEN; khi kiểm ADMIN, đặt adminToken bằng A_TOKEN và cid=c01. Những biến này độc lập, không ghi đè token ADMIN bằng token Customer. Chỉ nhập token vào môi trường local, không commit session.

Đây là hướng dẫn cho các endpoint đang có; không cần sửa code, thêm endpoint hoặc rebuild Docker.

## 4. Câu 15–18: Booking, nhận chuyến, Trip và hủy

| Câu            | Ai / token                            | Thao tác                                           | Method | URL đầy đủ                                                                           | Body / ghi chú                                                                        |
| -------------- | ------------------------------------- | -------------------------------------------------- | ------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| 15             | CUSTOMER                              | Tạo Booking BIKE mới                               | POST   | `http://localhost:3000/api/v1/bookings`                                              | `{"pickup":{"latitude":10.8,"longitude":106.7},"destination":{"latitude":10.81,"longitude":106.71}}`; header Idempotency-Key mới; 201 SEARCHING |
| 15, 16         | DRIVER                                | Xem offer PENDING thuộc tài xế                     | GET    | `http://localhost:3000/api/v1/drivers/me/invitations?status=PENDING&page=1&limit=10` | Chọn invitation có bid đúng Booking vừa tạo; lấy iid                                  |
| 16             | DRIVER nhận offer đó                  | Chấp nhận chuyến                                   | POST   | `http://localhost:3000/api/v1/invitations/{iid}/response`                            | `{"decision":"ACCEPT"}`; nhận tid                                                     |
| 16 — nhánh phụ | DRIVER nhận offer đó                  | Từ chối offer                                      | POST   | `http://localhost:3000/api/v1/invitations/{iid}/response`                            | `{"decision":"REJECT"}`; không chạy tiếp ACCEPT trên offer đã từ chối                 |
| 15, 16, 17, 19 | CUSTOMER chủ Booking hoặc ADMIN       | Xem Booking, Driver/Trip và payment summary khi có | GET    | `http://localhost:3000/api/v1/bookings/{bid}`                                        | Sau ACCEPT, Customer xem Driver trong `trip.driver`                                   |
| 17             | DRIVER của chuyến                     | Báo đã đến điểm đón                                | POST   | `http://localhost:3000/api/v1/trips/{tid}/arrival`                                   | `{}`; ASSIGNED → ARRIVED                                                              |
| 17             | DRIVER của chuyến                     | Bắt đầu chuyến                                     | POST   | `http://localhost:3000/api/v1/trips/{tid}/start`                                     | `{}`; ARRIVED → IN_PROGRESS                                                           |
| 17             | DRIVER của chuyến                     | Cập nhật vị trí đến B                              | PUT    | `http://localhost:3000/api/v1/trips/{tid}/location`                                  | `{"latitude":10.81,"longitude":106.71}`; chỉ khi IN_PROGRESS                                           |
| 17             | DRIVER của chuyến                     | Hoàn thành và tính cước                            | POST   | `http://localhost:3000/api/v1/trips/{tid}/completion`                                | `{}`; IN_PROGRESS → COMPLETED                                                         |
| 17, 19, 20     | CUSTOMER/DRIVER của chuyến hoặc ADMIN | Xem trạng thái/cước Trip                           | GET    | `http://localhost:3000/api/v1/trips/{tid}`                                           | Dùng tid, không dùng bid thay thế                                                     |
| 18             | CUSTOMER chủ Booking                  | Xem có được hủy và phí hủy                         | POST   | `http://localhost:3000/api/v1/bookings/{bid}/cancellation-preview`                   | `{"reason":"Doi ke hoach"}`                                                           |
| 18             | CUSTOMER chủ Booking                  | Xác nhận hủy                                       | POST   | `http://localhost:3000/api/v1/bookings/{bid}/cancellation`                           | `{"reason":"Doi ke hoach","confirmed":true}`                                          |
| 18             | CUSTOMER chủ Booking hoặc ADMIN       | Kiểm Booking đã hủy                                | GET    | `http://localhost:3000/api/v1/bookings/{bid}`                                        | CANCELED; Trip đã tạo cũng phải CANCELED                                              |

Trước câu 15, DRIVER phải APPROVED, có xe active, ONLINE và vị trí đã lưu hợp lệ. Offer không tự hết hạn; cần đọc đúng bid trước khi nhận. Câu 18 dùng Booking SEARCHING hoặc Trip ASSIGNED/ARRIVED; không dùng Trip đã IN_PROGRESS/COMPLETED.

### Chuẩn bị Driver trước khi Customer đặt (không phải bước Customer tự làm)

**Chuẩn bị demo:** nếu Driver đã có tọa độ đúng thì không cần PUT location lại chỉ vì đã để lâu. Login và APPROVED không đồng nghĩa online/rảnh; bật online khi cần. Hệ thống không gán cứng c01 cho d01 mà chọn người đủ điều kiện gần nhất. Muốn d01 nhận trong demo, giữ d01 online/rảnh tại pickup và đọc invitations đúng bid.

Đăng nhập Customer và Driver ở hai request/tab riêng, giữ C1_TOKEN/D1_TOKEN; có thể đọc offer sau khi Login Driver. Driver d01 cần APPROVED, xe active, online, không bận và vị trí đã lưu hợp lệ (không giới hạn tuổi trong demo). D1_TOKEN gọi PUT `http://localhost:3000/api/v1/drivers/me/location` với `{"latitude":10.8,"longitude":106.7}`, rồi PUT `http://localhost:3000/api/v1/drivers/me/availability` với `{"isOnline":true}` →200. Đây là giả lập Driver gửi vị trí hiện tại, không phải đổi tọa độ Customer và không dùng locationCode. Không đưa mọi Driver về cùng điểm: d02/d03 giữ tọa độ riêng đã có. Nếu d01 bận, hệ thống có thể gửi offer cho người đủ điều kiện khác; phải dùng token đúng người nhận.

### Câu 15 — Customer Login → đặt → thấy SEARCHING → hệ thống gửi offer

**Đặt chuyến thứ hai sau khi d01 hoàn thành chuyến đầu:** hệ thống hỗ trợ dùng lại c01/d01. Kiểm d01 đã rảnh, online và đúng tọa độ pickup; sau đó phải đổi header **Idempotency-Key** để tạo chuyến mới. Chỉ bấm Send lại cùng body/key không phải đặt chuyến mới.

| Mục đích | Idempotency-Key ví dụ | Kết quả |
| --- | --- | --- |
| Tạo chuyến thứ nhất | c01-trip-001 | 201, tạo bid mới và tìm Driver |
| Gửi lại cùng yêu cầu cũ | c01-trip-001 | 200, trả cùng bid/snapshot cũ, không gửi offer mới |
| Tạo chuyến thứ hai | c01-trip-002 | 201, tạo bid khác và tìm Driver lại |

Snapshot replay có thể vẫn ghi SEARCHING dù chuyến thực tế đã COMPLETED. Xem trạng thái hiện tại bằng **GET /api/v1/bookings/{bid}**, không dùng response POST replay để kết luận đang tìm tài xế. Kiểm chứng29/10: key cũ trả b21/200/SEARCHING, trong khi GET b21 là COMPLETED; key mới tạo b22/201 và d01 có offer i05. Các dữ liệu thử này đã reset về bộ mẫu, không dùng lại các ID đó làm dữ liệu hiện có.

Nếu dùng request Postman collection: header là `{{bookingKey}}`, hãy đổi giá trị **bookingKey** trong environment local cho mỗi chuyến mới. Khi kiểm câu30 replay mới giữ nguyên bookingKey/body. Không thay JWT, bỏ chống replay hoặc đăng ký lại Customer để tạo chuyến thứ hai.

Customer chỉ cần Login và gửi **một request tạo Booking**, hệ thống tự tìm Driver; Customer không tự gọi endpoint invitations/notification để phát offer.

```http
POST http://localhost:3000/api/v1/bookings
```

Authorization: **C1_TOKEN**. Headers: Content-Type=application/json, `Idempotency-Key: demo-booking-main-01` (thay key mới cho chuyến khác). Body raw JSON:

```json
{
  "pickup":{"latitude":10.8,"longitude":106.7},
  "destination":{"latitude":10.81,"longitude":106.71}
}
```

1. Lần tạo mới trả **201 Created**, body có bid, status=SEARCHING, BIKE; ghi bid thực. 201 ở đây là đúng, không chờ POST tự đổi thành200 sau khi tìm tài xế. Nếu gửi lại đúng key/body của Booking đã tạo thì200 là replay, không phải Booking mới.
2. Booking Service chạy tìm Driver đủ điều kiện trong1 km quanh pickup, ưu tiên khoảng cách; tạo invitation PENDING không tự hết hạn và phát event `booking.invitation_created` qua RabbitMQ. Notification Service ghi thông báo cho Driver được mời. Các bước này diễn ra ở backend sau response tạo Booking.
3. Customer xem tiến trình bằng GET `http://localhost:3000/api/v1/bookings/{bid}`, C1_TOKEN →**200**. Trước nhận chuyến, `booking.status` còn SEARCHING; Customer không nhận offer thay Driver. Postman không tự cập nhật response cũ: bấm Send lại GET để đọc trạng thái hiện tại, không bấm POST key mới để "refresh".
4. Nếu không có ứng viên hoặc các ứng viên đều từ chối, Booking có thể NO_DRIVER. Đọc updated status và chuẩn bị vị trí/online trước khi tạo Booking mới; không ép NO_DRIVER về SEARCHING bằng sửa DB. Chưa Driver ACCEPT thì chưa có Trip/tên tài xế được giao.

### Câu 16 — Driver đăng nhập → đọc thông báo/offer → nhận chuyến

Demo không giới hạn thời gian nhận offer. Có thể hoàn tất câu15 trước, sau đó Login driver1@cab.local để lấy D1_TOKEN. Login không tự nhận chuyến; chỉ offer gửi đúng người còn PENDING và Booking SEARCHING mới được nhận.

| Câu | Token | Thao tác | Method | URL đầy đủ | Kết quả |
| --- | --- | --- | --- | --- | --- |
| 16 | D1_TOKEN | Đọc thông báo | GET | `http://localhost:3000/api/v1/notifications?page=1&limit=10` | 200; tìm booking.invitation_created và bid đúng Booking |
| 16 | D1_TOKEN | Đọc offer đang chờ | GET | `http://localhost:3000/api/v1/drivers/me/invitations?status=PENDING&page=1&limit=10` | 200; lấy iid đúng bid, không cần xem expiresAt |
| 16 | Driver được mời | Nhận chuyến | POST | `http://localhost:3000/api/v1/invitations/{iid}/response` | Body {"decision":"ACCEPT"}; 200, Booking ASSIGNED, có tid |
| 16 | C1_TOKEN | Xem kết quả nhận | GET | `http://localhost:3000/api/v1/bookings/{bid}` | 200; did/driver.name/tid, trip.driver |

Postman không push tự cập nhật: Send GET để lấy thông báo/offer. Notification nid không phải invitation iid. Nếu d01 không có offer, kiểm người được chọn, online/APPROVED/không bận/khoảng cách1 km; vị trí cũ đã được phép dùng. Offer mới không có expiresAt, không tự chuyển EXPIRED. Muốn chuyển sang tài xế tiếp theo thì Driver REJECT, hoặc Customer hủy và tạo Booking khác bằng key mới. Offer/Booking đã kết thúc từ trước (ví dụ b21 NO_DRIVER) không được khôi phục tự động.

Nếu JWT hết hạn trong lúc chờ, Login lại để lấy token mới rồi đọc cùng offer PENDING; không Register lại tài khoản và không cần tạo Booking mới chỉ vì token hết hạn. Sau ACCEPT, giới hạn không nhận hai chuyến đồng thời vẫn được kiểm tra.

**Lấy tid ngay sau ACCEPT:** response POST `/api/v1/invitations/{iid}/response` với {"decision":"ACCEPT"} hiện đặt `tid` ở dòng đầu. Ví dụ i04 của buổi thử hiện tại trả t04. Postman request respondInvitation tự lưu `data.tid` vào biến tid; dùng `{{tid}}` trong URL câu17. iid là mã lời mời, không dùng thay tid. Nếu REJECT hoặc chưa nhận thành công thì chưa có Trip để lấy tid; không tự suy ra tid từ iid.

### Câu 17 — Driver cập nhật chuyến đã nhận

Dùng token Driver thực sự nhận chuyến và tid thực từ câu16. Theo bảng URL phía trên: arrival `{}` →ARRIVED, start `{}` →IN_PROGRESS, PUT location `{"latitude":10.81,"longitude":106.71}` →200, completion `{}` →COMPLETED và fareAmount. Mọi tọa độ nhập trực tiếp; không cần locationCode A/B. Customer GET Trip/Booking để xem thay đổi, sau đó mới thanh toán câu19.

### Câu 18 — tạo chuyến mới sau khi vừa hoàn thành câu 17

Driver hoàn thành ở destination có thể đang ở (10.81,106.71), cách pickup (10.8,106.7) hơn1 km. Bỏ giới hạn tuổi vị trí không có nghĩa bỏ khoảng cách, không tự đưa Driver về điểm đón. Nếu muốn d01 nhận Booking tiếp theo, thứ tự phải là:

1. D1_TOKEN GET `/api/v1/drivers/me`: không còn tid (chuyến trước đã release), APPROVED và online. Nếu còn tid, đọc Trip trước và chờ event hoàn thành; không xóa reservation/activeTrip trong DB.
2. **Trước khi tạo Booking mới**, D1_TOKEN PUT `http://localhost:3000/api/v1/drivers/me/location`, body `{"latitude":10.8,"longitude":106.7}` →200. Nếu đang offline, PUT availability true. Không cần cập nhật vì tuổi vị trí; bước này để thay tọa độ từ điểm đến về đúng điểm đón.
3. C1_TOKEN POST `/api/v1/bookings` với pickup/destination số trong câu15 và **Idempotency-Key mới** (ví dụ demo-booking-cancel-02 nếu chưa dùng). Lưu bid thực; dùng lại key cũ chỉ replay Booking cũ.
4. D1_TOKEN GET invitations PENDING, chọn đúng bid vừa tạo rồi ACCEPT. Nếu không thấy, kiểm các Driver khác vì hệ thống không gán cứng mọi Booking c01 cho d01.
5. C1_TOKEN cancellation-preview rồi cancellation với reason và confirmed=true trước khi Trip IN_PROGRESS. Đọc Booking/Trip CANCELED và notifications của đúng Driver đã nhận.

**Không sửa vị trí sau khi đã đặt rồi chờ offer tự chuyển:** hệ thống chọn ứng viên khi bắt đầu tìm và giữ offer PENDING cho người đã mời. Ví dụ b25 ngày29/10 được tạo11:23 (giờ Việt Nam), ứng viên chỉ d02, offer i07; cập nhật d01 về pickup lúc11:28 không chuyển offer đó sang d01. Muốn giữ b25 thì Login d02 đọc/nhận i07. Muốn d01 nhận thì Customer hủy b25, kiểm d01 rảnh/đúng tọa độ trước, rồi tạo Booking khác bằng key mới. Không xóa dữ liệu hoặc đổi driver_id của invitation đã gửi.


## 5. Câu 19–20: thanh toán mock và đánh giá

| Câu        | Ai / token                               | Thao tác                        | Method | URL đầy đủ                                                 | Body / ghi chú                                                                                    |
| ---------- | ---------------------------------------- | ------------------------------- | ------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 19         | CUSTOMER chủ chuyến                      | Tạo Payment mock                | POST   | `http://localhost:3000/api/v1/trips/{tid}/payments`        | `{}` và header Idempotency-Key mới; Trip phải COMPLETED và có cước; lấy pid/referenceCode/amount  |
| 19         | Công cụ/người giả lập callback — No Auth | Gửi kết quả thanh toán          | POST   | `http://localhost:3000/api/v1/payments/mock/callback`      | Raw JSON đã ký; X-Mock-Timestamp và X-Mock-Signature; không dùng token CUSTOMER/ADMIN thay chữ ký |
| 19         | CUSTOMER chủ Payment hoặc ADMIN          | Đọc Payment sau callback        | GET    | `http://localhost:3000/api/v1/payments/{pid}`              | Kết quả thành công phải COMPLETED                                                                 |
| 19         | CUSTOMER chủ chuyến hoặc ADMIN           | Xem cước và các payment attempt | GET    | `http://localhost:3000/api/v1/trips/{tid}/payment-summary` | Kiểm hasCompleted=true sau callback thành công                                                    |
| 19 — retry | CUSTOMER chủ Payment                     | Thử lại Payment FAILED          | POST   | `http://localhost:3000/api/v1/payments/{pid}/retries`      | pid của attempt FAILED mới nhất; `{}` và Idempotency-Key mới; ký callback cho Payment mới trả về  |
| 20         | CUSTOMER của chuyến                      | Gửi đánh giá                    | POST   | `http://localhost:3000/api/v1/trips/{tid}/reviews`         | `{"rating":5,"comment":"Chuyen di tot"}`; Trip COMPLETED, một review/chuyến                       |
| 20         | CUSTOMER/DRIVER của chuyến hoặc ADMIN    | Đọc đánh giá đã lưu             | GET    | `http://localhost:3000/api/v1/trips/{tid}/reviews`         | Review liên kết đúng tid                                                                          |

Để thấy chuyến đã thanh toán từ phía Customer, đọc lại `GET http://localhost:3000/api/v1/bookings/{bid}` và kiểm paymentSummary. Callback phải khớp pid/referenceCode/amount thật; không tự nhập cước khác. Cách ký raw JSON tại [postman/README.md](../postman/README.md#callback-mock). Retry tối đa 3 attempt tổng cộng, không retry một Payment đã COMPLETED.

### Câu 19: Payment và callback ký đúng dữ liệu

1. **C1_TOKEN** POST `http://localhost:3000/api/v1/trips/{tid}/payments`, body `{}`, header `Idempotency-Key: demo-payment-main-01`. Trip ở đây là Trip **COMPLETED** của luồng chính, không phải Trip hủy câu 18. Lần tạo đầu →201; lưu `pid`, `referenceCode`, `amount` và body response. Payment mới chưa tự thành công chỉ vì tạo được.
2. Gửi callback COMPLETED đã ký theo một trong hai cách dưới. Không gửi `{}` hoặc chỉ `{"pid":"p01"}` vào callback.
3. **C1_TOKEN** GET `/payments/{pid}` →COMPLETED; GET `/trips/{tid}/payment-summary` →`hasCompleted:true`. Đọc lại Booking để kiểm `paymentSummary`.
4. Câu 20 dùng **C1_TOKEN**, POST `/trips/{tid}/reviews` với body trong bảng →201. GET cùng URL →200, có `rid` và đúng `tid`. Gửi thêm review cùng chuyến →409; dùng Trip khác nếu cần đánh giá mới.

**Cách nhanh bằng terminal:** chạy PowerShell hoặc Git Bash tại **root repository**, đã có Node.js và `.env` local. Thay các giá trị dưới bằng response Payment thật:

```text
node --env-file=.env scripts/mock-payment.cjs PID_THAT REFERENCE_CODE_THAT AMOUNT_THAT COMPLETED
```

Ví dụ cú pháp nếu Payment thực trả pid=p01, referenceCode=CAB-p01, amount=18000:

```text
node --env-file=.env scripts/mock-payment.cjs p01 CAB-p01 18000 COMPLETED
```

Lệnh này **ký và gửi HTTP callback qua Gateway**, mong đợi HTTP200; đồng thời lưu packet trong `.local/callbacks/`. Chỉ dùng số tiền ví dụ khi đúng với response thật. Không đọc/copy secret vào Postman.

**Muốn tự Send callback lần đầu bằng Postman:** dùng PowerShell tại root, thay 3 giá trị Payment thật rồi chạy đoạn sau. Đoạn này chỉ ký offline, **chưa gửi HTTP**; dùng secret từ `.env` mà không in secret:

```powershell
$callbackPid = "PID_THAT"
$callbackReference = "REFERENCE_CODE_THAT"
$callbackAmount = "AMOUNT_THAT"
$callbackFile = @'
const fs=require('node:fs'),crypto=require('node:crypto');
const {sign}=require('./scripts/mock-signature.cjs');
const [pid,referenceCode,amount]=process.argv.slice(2);
if(!/^p[0-9]{2,15}$/.test(pid)||!referenceCode||!Number.isSafeInteger(Number(amount))||Number(amount)<0)
  throw new Error('Thay bang du lieu Payment that');
const timestamp=Math.floor(Date.now()/1000);
const raw=JSON.stringify({eventId:crypto.randomUUID(),pid,referenceCode,amount:Number(amount),currency:'VND',result:'COMPLETED',timestamp});
const packet={raw,timestamp,signature:sign(Buffer.from(raw),timestamp,process.env.MOCK_CALLBACK_SECRET)};
fs.mkdirSync('.local/callbacks',{recursive:true});
const file='.local/callbacks/postman-'+pid+'-'+Date.now()+'.private.json';
fs.writeFileSync(file,JSON.stringify(packet,null,2),{flag:'wx'});
console.log(file);
'@ | node --env-file=.env - $callbackPid $callbackReference $callbackAmount
if ($LASTEXITCODE -ne 0) { throw "Ky callback that bai; kiem tra du lieu Payment va .env local" }
$callbackPacket = Get-Content -LiteralPath $callbackFile -Raw | ConvertFrom-Json
$callbackPacket.raw
$callbackPacket.timestamp
$callbackPacket.signature
```

Postman chọn **No Auth**, POST `http://localhost:3000/api/v1/payments/mock/callback`. Body raw JSON dán **nguyên một dòng giá trị raw**; header `Content-Type: application/json`, `X-Mock-Timestamp` lấy timestamp, `X-Mock-Signature` lấy signature. Không dán cả object packet; không format/sửa raw sau khi ký. Send ngay →200. Nếu đã callback COMPLETED bằng terminal thì gửi lại packet đó là bài **replay**, không phải callback lần đầu. Mỗi Payment khác cần packet mới. Chi tiết hỗ trợ công cụ ký offline tại [postman/README.md](../postman/README.md).

**Nhánh retry:** dùng một Trip COMPLETED chưa thanh toán khác; tạo Payment, ký callback với result FAILED (terminal đổi chữ COMPLETED thành FAILED). Sau đó CUSTOMER POST `/payments/{pid}/retries`, body `{}`, key mới →201 và **pid mới**. Ký callback COMPLETED bằng thông tin Payment mới đó; không dùng lại pid/reference/amount từ attempt FAILED.

## 6. Câu 21–23: đăng ký, duyệt và online/offline Driver

### Phân biệt tài khoản đăng ký và tài xế được phép nhận chuyến

`role=DRIVER` nghĩa là tài khoản đăng ký phía tài xế; `DriverProfile` lưu **hồ sơ đăng ký**, gồm cả hồ sơ chưa được duyệt. Không phải mọi bản ghi trong DB Driver đều là tài xế đã đủ điều kiện hoạt động. `approvalStatus` là kết quả duyệt hồ sơ, không phải vai trò tài khoản.

| approvalStatus | Ý nghĩa | Được làm gì? |
| --- | --- | --- |
| DRAFT | Hồ sơ đang khai báo, chưa gửi duyệt | Login, sửa hồ sơ, Submit; chưa nhận chuyến |
| PENDING | Đã gửi, đang chờ ADMIN duyệt | Login, xem hồ sơ/kết quả; chưa nhận chuyến |
| APPROVED | Hồ sơ đã được ADMIN chấp thuận | Có thể bật online khi xe/vị trí hợp lệ; nhận chuyến khi còn rảnh |
| REJECTED | Hồ sơ đăng ký bị ADMIN từ chối | Login xem lý do, sửa và Submit lại; không bật online/nhận chuyến |

Giá trị đúng là **REJECTED**, không dùng REJECT cho approvalStatus. Không xóa hoặc đổi thành Customer chỉ vì hồ sơ bị từ chối: cần giữ danh tính và lý do để sửa, gửi lại. Luồng gửi lại là REJECTED → sửa hồ sơ → Submit PENDING → ADMIN APPROVED/REJECTED. Người đăng ký không được tự đặt approvalStatus. Tất cả d01–d05 hiện đã APPROVED; khi cần thử REJECTED, đăng ký hồ sơ mới rồi để ADMIN quyết định, không sửa trạng thái bộ mẫu trực tiếp.

ADMIN xem `/admin/drivers` hoặc ADMIN nearby có thể thấy các **hồ sơ đăng ký** chưa duyệt/từ chối trong phạm vi tra cứu. CUSTOMER nearby và hệ thống phân công chỉ chọn APPROVED cùng các điều kiện ACTIVE/online/xe BIKE active/vị trí mới/không bận. Đừng hiểu việc ADMIN nhìn thấy một hồ sơ là hồ sơ đó được nhận chuyến.

| Câu            | Ai / token                       | Thao tác                         | Method | URL đầy đủ                                                                          | Body / ghi chú                                                                             |
| -------------- | -------------------------------- | -------------------------------- | ------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 21 — bước 1    | Tài xế chưa có account — No Auth | Gửi đăng ký để nhận OTP mock     | POST   | `http://localhost:3000/api/v1/auth/register`                                        | Email/password/phone/plateNumber; trả 202 OTP_REQUIRED, chưa có account                    |
| 21 — bước 2    | Cùng tài xế — No Auth            | Hoàn tất đăng ký bằng OTP        | POST   | `http://localhost:3000/api/v1/auth/register`                                        | Giữ nguyên email/password/phone/plateNumber, thêm code thật 6 chữ số; trả 201/did          |
| 21             | DRIVER — No Auth                 | Login lấy token DRIVER           | POST   | `http://localhost:3000/api/v1/auth/login`                                           | Email/password của Driver vừa hoàn tất OTP                                                 |
| 21             | DRIVER                           | Đọc hồ sơ, lấy did               | GET    | `http://localhost:3000/api/v1/drivers/me`                                           | Hồ sơ ban đầu DRAFT                                                                        |
| 21             | DRIVER                           | Bổ sung licenseNumber            | PATCH  | `http://localhost:3000/api/v1/drivers/me`                                           | `{"licenseNumber":"DEMO-123"}`                                                             |
| 21 — tùy chọn  | DRIVER                           | Tạo/cập nhật xe BIKE và mô tả xe | PUT    | `http://localhost:3000/api/v1/drivers/me/vehicle`                                   | `{"plateNumber":"59A12345","model":"BIKE","color":"Black"}`; không làm khi tài xế đang bận |
| 21             | DRIVER                           | Gửi hồ sơ chờ duyệt              | POST   | `http://localhost:3000/api/v1/drivers/me/submissions`                               | `{}`; DRAFT/REJECTED → PENDING; Submit có thể tạo xe từ plateNumber đã đăng ký             |
| 22 — chuẩn bị  | ADMIN — No Auth                  | Login lấy token ADMIN            | POST   | `http://localhost:3000/api/v1/auth/login`                                           | Email/password ADMIN hiện có; không có API đăng ký ADMIN công khai                         |
| 22             | ADMIN                            | Liệt kê hồ sơ chờ duyệt          | GET    | `http://localhost:3000/api/v1/admin/drivers?approvalStatus=PENDING&page=1&limit=10` | Lấy did đúng hồ sơ cần duyệt                                                               |
| 22             | ADMIN                            | Xem chi tiết hồ sơ               | GET    | `http://localhost:3000/api/v1/drivers/{did}`                                        | Đọc trước khi quyết định                                                                   |
| 22             | ADMIN                            | Duyệt hồ sơ                      | POST   | `http://localhost:3000/api/v1/admin/drivers/{did}/approval-decisions`               | `{"decision":"APPROVED"}`                                                                  |
| 22 — nhánh phụ | ADMIN                            | Từ chối hồ sơ                    | POST   | `http://localhost:3000/api/v1/admin/drivers/{did}/approval-decisions`               | `{"decision":"REJECTED","reason":"Can bo sung ho so"}`; có lý do                           |
| 22             | DRIVER                           | Xem kết quả duyệt/từ chối        | GET    | `http://localhost:3000/api/v1/drivers/me`                                           | Xem approvalStatus; kiểm thông báo của Driver ở mục 7 bên dưới                             |
| 23 — chuẩn bị  | DRIVER                           | Cập nhật vị trí mới ở A          | PUT    | `http://localhost:3000/api/v1/drivers/me/location`                                  | `{"latitude":10.8,"longitude":106.7}`                                                                     |
| 23             | DRIVER                           | Bật nhận chuyến                  | PUT    | `http://localhost:3000/api/v1/drivers/me/availability`                              | `{"isOnline":true}`; cần APPROVED/xe active/vị trí mới                                     |
| 23             | DRIVER                           | Tắt nhận chuyến                  | PUT    | `http://localhost:3000/api/v1/drivers/me/availability`                              | `{"isOnline":false}`; không tự hủy Trip đang chạy                                          |
| 23             | DRIVER                           | Đọc lại trạng thái đã lưu        | GET    | `http://localhost:3000/api/v1/drivers/me`                                           | Kiểm isOnline đúng giá trị vừa gửi                                                         |

Ví dụ body Driver bước 1; dùng email/phone/biển số mới, không dùng lại dữ liệu đã tồn tại:

```json
{ "email": "taixe.moi@example.test", "password": "123", "phone": "driver-new-06", "plateNumber": "59A-00006" }
```

Bước 2 thêm thuộc tính `code` với **OTP thật từ bước 1**; không nhập role/did/cid/oid. Register và Verify OTP có cooldown/rate limit, không bấm gửi liên tục.

### Chạy câu 21–23 không lẫn tài khoản mẫu

1. **Câu 21:** POST Register bằng body Driver trên, No Auth →202 `OTP_REQUIRED`. Khi OTP mock bật, lấy `mockCode` từ response. Không coi 202 là đã có tài khoản; không dùng phone/email của driver1–driver5 vì đã tồn tại.
2. Send lại Register với **đúng email/password/phone/plateNumber ở bước 1**, thêm `"code":"OTP_VUA_NHAN"` (thay bằng 6 chữ số thật) →201, lưu `did` thực (dự kiến d06). Không tự điền oid, không chạy thêm endpoint OTP riêng ở giữa hai bước vì có thể thay challenge hiện tại. Nếu OTP hết hạn, quay lại bước 1 theo cooldown.
3. POST Login bằng email/password Driver mới →200. Ghi **D_NEW_TOKEN**, không ghi đè D1_TOKEN. GET `/drivers/me` →DRAFT; PATCH cùng URL với `{"name":"NGUYEN VAN KHOA","licenseNumber":"DEMO-NEW-06"}` →200. POST `/drivers/me/submissions`, body `{}` →PENDING. Đến đây mới hoàn tất phần gửi hồ sơ đăng ký câu 21.
4. **Câu 22:** A_TOKEN GET danh sách PENDING, đọc `/drivers/{did}` rồi POST `/admin/drivers/{did}/approval-decisions` với `{"decision":"APPROVED"}` →200. D_NEW_TOKEN GET `/drivers/me` kiểm APPROVED và GET notifications của mình. d01–d05 đã APPROVED nên không dùng lại các hồ sơ này để kiểm duyệt PENDING; chọn Driver mới đăng ký.
5. Muốn thử **từ chối**, chọn một hồ sơ PENDING khác; ví dụ một Driver mới khác vừa Submit. Gửi `{"decision":"REJECTED","reason":"CAN BO SUNG GIAY PHEP"}` →200. Không gọi REJECTED ngay sau APPROVED trên cùng hồ sơ, vì hồ sơ lúc đó không còn PENDING. Driver REJECTED có thể PATCH bổ sung, Submit lại rồi ADMIN mới duyệt lại.
6. **Câu 23:** dùng D_NEW_TOKEN sau APPROVED (hoặc D1_TOKEN), PUT location {"latitude":10.8,"longitude":106.7} →200, PUT availability true →200, GET `/drivers/me` xác nhận isOnline=true. PUT availability false rồi GET xác nhận false. Nếu cần tiếp tục đặt xe, bật true và làm mới location lại. DRAFT/PENDING/REJECTED bật online phải bị từ chối, không sửa approvalStatus trong PATCH để vượt duyệt.

Body hoàn chỉnh của Register bước 2:

```json
{
    "email": "taixe.moi@example.test",
    "password": "123",
    "phone": "driver-new-06",
    "plateNumber": "59A-00006",
    "code": "OTP_VUA_NHAN"
}
```

`OTP_VUA_NHAN` là chỗ cần thay, không phải mã gửi nguyên văn. Hồ sơ tạo bất đồng bộ; nếu vừa Register xong chưa thấy profile, đợi vài giây rồi GET lại. Nếu nhận 409, kiểm trùng email/phone/plateNumber và dùng dữ liệu mới cho lần đăng ký khác.

Hai URL OTP độc lập dưới đây đã có trong API, dùng khi cần minh họa riêng thao tác OTP. Luồng Register hai bước phía trên đã tự tạo/kiểm challenge, không bắt buộc gọi thêm hai URL này:

| Câu            | Ai / token                     | Thao tác              | Method | URL đầy đủ                                                      | Body / ghi chú                                                                   |
| -------------- | ------------------------------ | --------------------- | ------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 21 — OTP riêng | Người đăng ký Driver — No Auth | Yêu cầu challenge OTP | POST   | `http://localhost:3000/api/v1/auth/otp-challenges`              | `{"phone":"abc123"}`; lấy oid; có thể thay thế challenge trước đó của cùng phone |
| 21 — OTP riêng | Cùng người đăng ký — No Auth   | Kiểm mã OTP           | POST   | `http://localhost:3000/api/v1/auth/otp-challenges/{oid}/verify` | Phone của challenge và code thật 6 chữ số; không đồng nghĩa đã tạo Account       |

## 7. Thông báo và các URL ADMIN bổ trợ

| Câu liên quan                                | Ai / token                                                            | Thao tác                                   | Method | URL đầy đủ                                                    | Ghi chú                                                                                   |
| -------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------ | ------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 15, 16, 17, 18, 19, 22                       | CUSTOMER hoặc DRIVER nhận thông báo; ADMIN chỉ xem thông báo của mình | Liệt kê thông báo của người đang đăng nhập | GET    | `http://localhost:3000/api/v1/notifications?page=1&limit=10`  | Câu 18 gửi lần lượt bằng token Customer và Driver để chứng minh cả hai nhận thông báo hủy |
| 15, 16, 17, 18, 19, 22                       | Người nhận thông báo                                                  | Đọc một thông báo                          | GET    | `http://localhost:3000/api/v1/notifications/{nid}`            | Không được đọc thông báo của người khác, kể cả có ID                                      |
| 15, 18 — bổ trợ, ngoài phép thử chính câu 14 | ADMIN                                                                 | Tra cứu tất cả Booking theo quyền quản trị | GET    | `http://localhost:3000/api/v1/admin/bookings?page=1&limit=10` | Không giới hạn Customer; câu 14 bắt buộc chọn cid trong hướng dẫn này                     |
| 17 — bổ trợ                                  | ADMIN                                                                 | Tra cứu Trip                               | GET    | `http://localhost:3000/api/v1/admin/trips?page=1&limit=10`    | Không dùng URL quản trị để Driver cập nhật trạng thái                                     |
| 19, 30 — bổ trợ                              | ADMIN                                                                 | Tra cứu Payment attempt                    | GET    | `http://localhost:3000/api/v1/admin/payments?page=1&limit=10` | Đối chiếu các lần thanh toán/retry                                                        |

## 8. Câu 24–30: bảo mật và replay

| Câu           | Ai / token                               | Thao tác cần chứng minh                | Method | URL đầy đủ                                             | Cách thử / kết quả cần kiểm                                                                                                                       |
| ------------- | ---------------------------------------- | -------------------------------------- | ------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 24            | Người dùng demo — No Auth khi Register   | Tạo dữ liệu rồi kiểm cách lưu password | POST   | `http://localhost:3000/api/v1/auth/register`           | Không có API trả passwordHash. Sau khi tạo account mới, dùng storage checker ở terminal để chứng minh Argon2id; license Driver kiểm AES-GCM riêng |
| 25            | Người thử lỗi — No Auth                  | SQL injection                          | POST   | `http://localhost:3000/api/v1/auth/login`              | Body `{"email":"' OR 1=1 --","password":"anything"}`; mong đợi 400 hoặc 401, không có JWT                                                         |
| 25            | Người thử lỗi — No Auth                  | NoSQL injection                        | POST   | `http://localhost:3000/api/v1/auth/login`              | Body `{"email":{"$ne":null},"password":"a"}`; mong đợi 400                                                                                        |
| 26            | CUSTOMER                                 | Gửi XSS vào tên hồ sơ                  | PATCH  | `http://localhost:3000/api/v1/customers/me`            | Body `{"name":"<script>alert('hack')</script>"}`; mong đợi 400. Cần thêm browser evidence script không chạy                                       |
| 27            | Người giữ token CUSTOMER rồi sửa JWT     | JWT tampering                          | GET    | `http://localhost:3000/api/v1/customers/me`            | Authorization dùng JWT đã sửa payload/chữ ký; mong đợi 401                                                                                        |
| 28            | CUSTOMER, cố gọi thao tác DRIVER         | Unauthorized role                      | PUT    | `http://localhost:3000/api/v1/drivers/me/availability` | Token CUSTOMER còn hợp lệ, body `{"isOnline":true}`; mong đợi 403, không đổi trạng thái Driver                                                    |
| 28 — bổ sung  | C2_TOKEN                                 | Thử đọc hồ sơ Customer khác            | GET    | `http://localhost:3000/api/v1/customers/c01`           | c01 của customer1, dùng token customer2; mong đợi 403                                                                                             |
| 29            | CUSTOMER dùng để đo tải                  | Gửi nhiều request tạo Booking          | POST   | `http://localhost:3000/api/v1/bookings`                | Giữ token/key/body hợp lệ; kiểm 429/Retry-After và hệ thống còn hoạt động. Cần công cụ tải để đo yêu cầu >1000 req/s                              |
| 30            | CUSTOMER chủ chuyến                      | Gửi lại request tạo Payment y hệt      | POST   | `http://localhost:3000/api/v1/trips/{tid}/payments`    | Giữ nguyên Idempotency-Key của lần tạo và body; mong đợi 200, cùng pid/snapshot, không thêm giao dịch                                             |
| 30 — bổ sung  | CUSTOMER chủ Booking                     | Gửi lại request tạo Booking y hệt      | POST   | `http://localhost:3000/api/v1/bookings`                | Giữ nguyên Idempotency-Key và body A→B; mong đợi 200/cùng snapshot                                                                                |
| 30 — callback | Công cụ/người giả lập callback — No Auth | Gửi lại callback thành công y hệt      | POST   | `http://localhost:3000/api/v1/payments/mock/callback`  | Giữ nguyên raw body/eventId/timestamp/signature; kiểm duplicate=true, không xử lý thanh toán lần nữa                                              |

Các bước cần terminal/trình duyệt, chạy tại root repository bằng PowerShell:

```powershell
# Câu 24: chỉ kiểm dữ liệu bằng tài khoản DB của service sở hữu.
docker compose exec -T auth_service node scripts/verify-storage.cjs auth_service
docker compose exec -T driver_service node scripts/verify-storage.cjs driver_service

# Câu 26: mở trình duyệt http://127.0.0.1:3100 sau khi chạy harness.
node scripts/xss-harness.cjs

```

URL browser harness `:3100` là công cụ kiểm XSS, không phải Gateway/service nghiệp vụ; request nghiệp vụ của harness vẫn qua Gateway. Nhập C1_TOKEN vào harness, bấm kiểm tra; mong đợi HTTP400, executed=0. Chụp bằng chứng browser trước khi kết luận câu 26, không chỉ dựa vào HTTP trong Postman.

**Câu 27:** giữ bản token đúng; trong bản sao JWT thay một ký tự đầu phần chữ ký (phần thứ ba sau dấu chấm) bằng ký tự khác, giữ nguyên hai phần trước. Gọi GET `/customers/me` bằng token bị sửa →401; đổi về C1_TOKEN đúng →200. Không gửi token lên website bên ngoài để sửa.

**Câu 29 với bộ mẫu mới:** `scripts/rate-load.cjs` còn dùng fixture developer cũ đã xóa; không chạy trực tiếp lệnh đó hoặc seed lại dữ liệu chỉ để làm câu 29. Để thử limiter bằng Postman, tạo request POST `http://localhost:3000/api/v1/bookings` với C1_TOKEN, body A→B, **một key cố định riêng** `demo-rate-limit-01`. Dùng Collection Runner chạy lặp request này đủ nhiều lần trong cửa sổ giới hạn; giữ nguyên token/key/body để không tạo nhiều Booking. Request đầu 201, replay 200, khi vượt quota nhận429 và header Retry-After. Sau đó GET `/health` kiểm200 và chờ đúng Retry-After. Request Booking đầu vẫn có thể tạo offer nên để Driver offline trước phép thử này. Kết quả phụ thuộc quota và tốc độ máy; không hạ quota hoặc xóa Redis để ép PASS.

Runner chỉ giúp minh họa 429; **chưa chứng minh tải >1000 request/giây** trong phiếu chấm. Phần đo tải đó cần công cụ chạy với credentials bộ mẫu hiện tại và báo cáo số liệu thực, vẫn chưa được hướng dẫn này xác nhận PASS.

**Câu 30:** sau câu 19, C1_TOKEN POST lại cùng `/trips/{tid}/payments`, `{}` và **key demo-payment-main-01 ban đầu** →200, cùng pid/snapshot tạo ban đầu, không thêm Payment. Snapshot replay có thể vẫn là trạng thái lúc tạo; GET Payment để xem trạng thái hiện tại. Booking replay dùng lại key demo-booking-main-01 và body A→B →200, cùng bid/snapshot ban đầu. Callback replay gửi lại **đúng packet cũ** (raw, eventId, timestamp, signature); mong đợi200, duplicate=true. Không tạo packet/eventId mới để gọi là replay. Giữ cùng key nhưng đổi payload hợp lệ phải bị409, không tạo nghiệp vụ mới.

## 9. URL thuộc service nào?

"Ai / token" trong các bảng là **người gọi**. Service dưới đây là **thành phần xử lý sau Gateway**; Postman vẫn chỉ gọi URL Gateway đã ghi, không gọi trực tiếp service.

| Thành phần xử lý     | Nhóm đường dẫn sau host Gateway                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| auth_service         | `/api/v1/auth/...`                                                                                                       |
| customer_service     | `/api/v1/customers/...`, `/api/v1/admin/customers`                                                                       |
| driver_service       | `/api/v1/drivers/...` trừ invitations; `/api/v1/admin/drivers/...`                                                       |
| booking_service      | `/api/v1/bookings/...`, `/api/v1/admin/bookings`, `/api/v1/drivers/me/invitations`, `/api/v1/invitations/{iid}/response` |
| trip_service         | `/api/v1/trips/...` trừ payments/payment-summary/reviews; `/api/v1/admin/trips`                                          |
| payment_service      | `/api/v1/payments/...`, `/api/v1/admin/payments`, `/api/v1/trips/{tid}/payments`, `/api/v1/trips/{tid}/payment-summary`  |
| notification_service | `/api/v1/notifications/...`                                                                                              |
| rating_service       | `/api/v1/trips/{tid}/reviews`                                                                                            |
| Gateway health       | `/health`, `/ready`, `/health/services`; không phải service thứ 9                                                        |

## 10. Header phải nhớ

| Nhóm thao tác                           | Header                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| Request có token                        | `Authorization: Bearer TOKEN_THAT` của đúng vai trò/chủ dữ liệu                       |
| POST/PUT/PATCH có JSON                  | `Content-Type: application/json`                                                      |
| Tạo Booking, tạo Payment, retry Payment | `Idempotency-Key: KEY_MOI_CHO_NGHIEP_VU_MOI`                                          |
| Replay cùng nghiệp vụ                   | Giữ nguyên Idempotency-Key và body gốc                                                |
| Callback mock                           | `X-Mock-Timestamp` và `X-Mock-Signature` đúng raw JSON, không dùng Bearer thay chữ ký |

Không lưu token, signing secret hoặc password thật vào file này. Hướng dẫn nhập tay chi tiết: [MANUAL_POSTMAN_30.md](MANUAL_POSTMAN_30.md). Body/schema đầy đủ: [10 OpenAPI YAML](api/). Danh sách trên bao phủ 48 operation REST hiện hành; một URL có thể phục vụ nhiều câu hoặc nhiều thao tác, phân biệt bằng method, body và token.

## 11. URL có thể dùng ngay và xử lý lỗi thường gặp

Customer mẫu hiện có cid=c01:

```text
GET http://localhost:3000/api/v1/customers/c01
```

Dùng token chính Customer đó hoặc ADMIN. Customer khác vẫn403. Với Driver/Booking/Trip/Payment, thay đúng mã thật trả về, ví dụ:

```text
GET http://localhost:3000/api/v1/drivers/d01
GET http://localhost:3000/api/v1/bookings/b01
GET http://localhost:3000/api/v1/trips/t01
GET http://localhost:3000/api/v1/payments/p01
```

**d01/b01 có trong bộ mẫu; t01/p01 chỉ là ví dụ sau khi tạo Trip/Payment.** b01 là NO_DRIVER nên không có Trip và không dùng để thanh toán. Đọc response để lấy tid/pid thật. aid xác định Account của cả CUSTOMER/DRIVER/ADMIN; hiện tra Account của mình qua GET /auth/me, không có endpoint /accounts/{aid} mới. Field Mongo \_id/JWT sub và eventId/requestId/correlationId là dữ liệu kỹ thuật nội bộ, không dùng thay mã tài nguyên trên URL.

| Hiện tượng                         | Cách xử lý                                                                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 400                                | Kiểm JSON, field đúng tên, không gửi role/cid/did khi Register; không trộn locationCode với tọa độ; thay hết chỗ giữ ID/OTP bằng giá trị thật |
| 401                                | Đăng nhập lại, dán accessToken mới, không dùng token tài khoản cũ trước reset; callback kiểm chữ ký/raw thay vì Bearer                        |
| 403                                | Đổi đúng token theo cột Ai/token; ADMIN được nearby nhưng không thao tác `/drivers/me` thay Driver                                            |
| 404                                | Kiểm ID có thật; c29/d09 cũ đã xóa; chưa có Trip/Payment thì tạo đúng luồng trước                                                             |
| 409                                | Kiểm trùng dữ liệu, trạng thái chưa đủ hoặc key dùng lại với payload khác; đọc lại resource thay vì reset dữ liệu                             |
| 429                                | Chờ Retry-After; không bỏ rate limit                                                                                                          |
| 503 PROFILE_NOT_READY              | Đợi event đồng bộ profile vài giây rồi GET lại; nếu kéo dài, kiểm `/ready`, `/health/services` và log container                               |
| nearby trống / không có invitation | Refresh vị trí, bật online, kiểm APPROVED/xe active/không bận; offer có hạn, chọn đúng bid và token người nhận                                |

Không tự đánh dấu PASS chỉ vì đã có URL/body trong file. Ghi HTTP status, ID và ảnh/response thực tế vào buổi test; đối chiếu trạng thái và phần còn thiếu tại [GRADING_MATRIX.md](GRADING_MATRIX.md).
