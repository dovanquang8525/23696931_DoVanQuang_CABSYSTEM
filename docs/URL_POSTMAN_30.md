# URL Postman theo 30 câu — CAB System

**Bộ mẫu hiện tại sau làm sạch 28/10:** Customer c01–c05, Driver d01–d05, Booking b01–b05 thuộc c01; tài khoản cũ như c29 đã xóa theo yêu cầu. Danh sách đăng nhập nằm trong `.local/demo-reset-20261028/ACCOUNTS.local.md` (chỉ local). d01/d02 online gần A, d03 offline, d04 PENDING, d05 REJECTED. Trước nearby hãy cập nhật location d01/d02 trong 120 giây. Đăng ký mới sẽ nhận c06/d06, Booking mới b06 nếu chưa tạo thêm dữ liệu. Các mã trong ví dụ bên dưới cần thay bằng mã đang tồn tại.

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

| Token tự ghi trong Postman | Email đăng nhập | ID / vai trò sử dụng |
| --- | --- | --- |
| C1_TOKEN | customer1@cab.local | c01 — chủ 5 Booking mẫu; dùng cho câu 11, 13–20, 30 |
| C2_TOKEN | customer2@cab.local | c02 — thử truy cập dữ liệu của c01 phải bị 403 |
| D1_TOKEN | driver1@cab.local | d01 — APPROVED, online, có xe BIKE |
| D2_TOKEN | driver2@cab.local | d02 — APPROVED, online, có xe BIKE |
| A_TOKEN | admin@cab.local | ADMIN hiện có; không đăng ký lại ADMIN |
| D4_TOKEN (khi cần) | driver4@cab.local | d04 — PENDING, có thể dùng thử duyệt câu 22 |
| D5_TOKEN (khi cần) | driver5@cab.local | d05 — REJECTED, có thể bổ sung hồ sơ rồi Submit lại |

c03–c05 đăng nhập bằng customer3@cab.local đến customer5@cab.local. d03 là driver3@cab.local, APPROVED nhưng offline. Cả 10 hồ sơ có tên IN HOA không dấu; đọc lại bằng API để xác nhận dữ liệu hiện tại.

Đăng nhập từng tài khoản bằng `POST http://localhost:3000/api/v1/auth/login`, **No Auth**, Body → raw → JSON:

```json
{"email":"customer1@cab.local","password":"MAT_KHAU_DEMO_TRONG_FILE_LOCAL"}
```

Thay giá trị password bằng mật khẩu local trước khi Send. Đổi email để lấy các token còn lại. Kết quả đúng **200**, sao chép `accessToken`; trong Authorization chọn **Bearer Token**, chỉ dán token, không thêm chữ `Bearer` vào ô Token. Nếu 401: kiểm password/email; nếu 429: chờ số giây trong `Retry-After`. Không gửi liên tục để vượt giới hạn. Không đưa token/mật khẩu vào file hướng dẫn hoặc commit environment chứa session.

### 1.2. Thứ tự làm bài với bộ mẫu này

1. Kiểm health câu 6, Login lấy C1_TOKEN, C2_TOKEN, D1_TOKEN, D2_TOKEN và A_TOKEN.
2. Câu 11 dùng **c01**, câu 12 dùng **d01** có sẵn; không cần đăng ký Driver mới trước. Câu 13 cập nhật vị trí d01/d02 rồi tìm nearby. Câu 14 dùng C1_TOKEN để thấy 5 Booking mẫu.
3. Câu 15–17 → 19–20: dùng c01 và d01 tạo **Booking mới**, nhận chuyến, hoàn thành, thanh toán, đánh giá. Không dùng b01–b05 để bắt đầu chuyến vì đây là lịch sử NO_DRIVER/CANCELED.
4. Câu 18 tạo Booking mới riêng, Driver nhận rồi Customer hủy trước khi bắt đầu Trip. Xem thông báo bằng cả hai token.
5. Câu 9 và 21 dùng email/phone mới để chứng minh đăng ký. Customer/Driver mới dự kiến c06/d06 nếu chưa tạo thêm; luôn lấy ID thực trong response. Token của các tài khoản này để riêng, không thay C1_TOKEN đang dùng kiểm phân trang.
6. Câu 22 duyệt hồ sơ PENDING của Driver mới ở câu 21 hoặc d04. Câu 23 thử online/offline rồi bật lại nếu tiếp tục đặt xe. Cuối cùng kiểm bảo mật câu 24–30.

Ghi riêng `bid`, `iid`, `tid`, `pid`, `nid`, Driver thực sự nhận chuyến và các Idempotency-Key. Ví dụ `bid=b06` chỉ đúng khi đó là response hiện tại; không đoán `tid`/`pid` từ số Booking. Hết hạn token thì Login lại, không Register lại tài khoản.

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

## 3. Câu 9–14: tài khoản và tra cứu

**Câu 13:** CUSTOMER hoặc ADMIN đều được gọi nearby. `locationCode=A` là mã điểm demo, server đọc thành latitude=10.8/longitude=106.7; response lưu tọa độ số là đúng. Có thể dùng `?latitude=10.8&longitude=106.7&page=1&limit=2` thay cho `locationCode=A`, không trộn hai dạng. Driver chỉ xuất hiện khi APPROVED, account ACTIVE, online, xe BIKE active, không bận/giữ chỗ và vị trí mới trong 120 giây, cách điểm tìm không quá 1 km. Dùng token chính DRIVER gọi PUT `/api/v1/drivers/me/location` với `{"locationCode":"A"}`, rồi PUT `/api/v1/drivers/me/availability` với `{"isOnline":true}` trước khi tìm. ADMIN xem cả Driver offline qua GET `/api/v1/admin/drivers?page=1&limit=10`.

**Cùng URL Register, phân biệt bằng body:** không có `plateNumber` → CUSTOMER (câu 9); có `plateNumber` → DRIVER, đăng ký hai bước OTP (câu 21). Không gửi `role`. Câu 12 chỉ tra cứu Driver đã có bằng `did`: dùng **d01** của bộ mẫu; câu 21 dành riêng cho minh họa đăng ký tài xế mới.

| Câu             | Ai / token                       | Thao tác                                 | Method | URL đầy đủ                                                                  | Body / ghi chú                                                                                      |
| --------------- | -------------------------------- | ---------------------------------------- | ------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 9               | Khách chưa đăng ký — No Auth     | Đăng ký CUSTOMER                         | POST   | `http://localhost:3000/api/v1/auth/register`                                | Email/password/phone; không có plateNumber. Thành công 201; chưa có token                           |
| 10              | CUSTOMER — No Auth               | Đăng nhập để lấy token CUSTOMER          | POST   | `http://localhost:3000/api/v1/auth/login`                                   | Email/password của Customer đã đăng ký; 200 và accessToken                                          |
| 10, 11          | CUSTOMER                         | Xem Account đang đăng nhập               | GET    | `http://localhost:3000/api/v1/auth/me`                                      | Có aid, role, phone; aid không phải cid                                          |
| 11              | CUSTOMER                         | Xem hồ sơ của chính mình, lấy cid | GET    | `http://localhost:3000/api/v1/customers/me`                                 | Lưu cid để dùng URL theo ID                                                                  |
| 11              | CUSTOMER sở hữu hồ sơ hoặc ADMIN | Lấy Customer theo mã số nội bộ           | GET    | `http://localhost:3000/api/v1/customers/{cid}`                       | CUSTOMER khác gọi cùng ID phải bị từ chối 403                                                       |
| 11 — bổ trợ     | CUSTOMER                         | Cập nhật tên/contact email của mình      | PATCH  | `http://localhost:3000/api/v1/customers/me`                                 | Ví dụ `{"name":"Khach demo"}`; không đổi email đăng nhập Auth                                       |
| 11 — bổ trợ     | ADMIN                            | Liệt kê hồ sơ Customer                   | GET    | `http://localhost:3000/api/v1/admin/customers?page=1&limit=2`               | Không dùng token CUSTOMER cho danh sách quản trị                                                    |
| 12              | DRIVER                           | Xem hồ sơ của mình, lấy did         | GET    | `http://localhost:3000/api/v1/drivers/me`                                   | Lưu did                                                                                        |
| 12              | DRIVER sở hữu hồ sơ hoặc ADMIN   | Lấy Driver theo mã số nội bộ             | GET    | `http://localhost:3000/api/v1/drivers/{did}`                           | CUSTOMER không được gọi endpoint này                                                                |
| 12, 21 — bổ trợ | DRIVER                           | Xem xe BIKE của mình                     | GET    | `http://localhost:3000/api/v1/drivers/me/vehicle`                           | Xe cần đã được tạo; thường có sau Submit hồ sơ                                                      |
| 13              | C1_TOKEN hoặc A_TOKEN              | Xem nearby, trang 1         | GET    | `http://localhost:3000/api/v1/drivers/nearby?latitude=10.8&longitude=106.7&page=1&limit=1` | 200; một Driver, totalItems=2 nếu d01/d02 vừa cập nhật và đều rảnh |
| 13              | C1_TOKEN hoặc A_TOKEN              | Xem nearby, trang 2         | GET    | `http://localhost:3000/api/v1/drivers/nearby?latitude=10.8&longitude=106.7&page=2&limit=1` | 200; Driver còn lại, khác did trang 1; không trộn locationCode vào URL này |
| 14              | CUSTOMER                         | Xem Booking của chính mình               | GET    | `http://localhost:3000/api/v1/bookings?page=1&limit=2`                      | Chuẩn bị ít nhất 5 Booking của Customer này                                                         |
| 14              | CUSTOMER                         | Xem trang Booking tiếp theo              | GET    | `http://localhost:3000/api/v1/bookings?page=2&limit=2`                      | Dùng cùng token với trang 1                                                                         |
| 14              | C1_TOKEN                         | Xem trang Booking cuối của bộ mẫu        | GET    | `http://localhost:3000/api/v1/bookings?page=3&limit=2`                      | 200; một Booking nếu c01 vẫn chỉ có 5 Booking mẫu; hai trang trước mỗi trang 2 Booking |

Body ví dụ câu 9; thay email/phone bằng giá trị chưa tồn tại khi tạo tài khoản mới:

```json
{ "email": "quang123@gmail.com", "password": "123", "phone": "0123" }
```

Body câu 10 dùng lại email/password đó, không gửi phone:

```json
{ "email": "quang123@gmail.com", "password": "123" }
```

Password demo được dùng từ 1 ký tự. Phone luôn là **String** không rỗng, có thể ngắn/chứa chữ; email vẫn cần đúng định dạng. Đăng ký trùng email/phone trả 409; không tạo lại tài khoản đã có chỉ để lấy token.

Đây là dữ liệu **đăng ký mới câu 9**, không phải c01 có 5 Booking. Nếu email/phone đã dùng, thay cả hai bằng dữ liệu mới hoặc Login tài khoản đó; không yêu cầu Register luôn trả 201 khi chạy lại. Sau 201, Login lấy token của Customer mới và GET `/customers/me` bằng token đó; kiểm `cid` trùng response Register. Profile tạo qua event nên có thể cần đợi vài giây rồi đọc lại.

### Câu 11–14: thao tác trực tiếp với ID mẫu

| Câu | Token | Method | URL đầy đủ | Kết quả cần kiểm |
| --- | --- | --- | --- | --- |
| 11 | C1_TOKEN hoặc A_TOKEN | GET | `http://localhost:3000/api/v1/customers/c01` | 200, cid=c01, tên NGUYEN VAN AN |
| 11, 28 | C2_TOKEN | GET | `http://localhost:3000/api/v1/customers/c01` | 403 |
| 12 | D1_TOKEN hoặc A_TOKEN | GET | `http://localhost:3000/api/v1/drivers/d01` | 200, did=d01, tên NGUYEN VAN HUNG |
| 12, 28 | C1_TOKEN | GET | `http://localhost:3000/api/v1/drivers/d01` | 403; Customer xem dữ liệu Driver công khai qua nearby/Trip |
| 13 — đối chiếu | A_TOKEN | GET | `http://localhost:3000/api/v1/admin/drivers?page=1&limit=10` | 200, đủ d01–d05 nếu chưa thêm Driver; gồm cả offline/PENDING/REJECTED |

**Chuẩn bị câu 13:** làm hai request dưới đây bằng D1_TOKEN, rồi lặp lại bằng D2_TOKEN:

```http
PUT http://localhost:3000/api/v1/drivers/me/location
```

```json
{"locationCode":"A"}
```

```http
PUT http://localhost:3000/api/v1/drivers/me/availability
```

```json
{"isOnline":true}
```

Cả hai trả 200. Sau đó gọi ngay hai trang nearby trong vòng 120 giây. A chính là `(10.8, 106.7)`, lưu tọa độ số trong hồ sơ là đúng. Khi đủ hai Driver và dùng `limit=2`, trang 1 có 2 người, trang 2 rỗng là đúng; hướng dẫn dùng `limit=1` để nhìn rõ phân trang. d03–d05 không xuất hiện ở trạng thái mẫu ban đầu. Nếu totalItems=0: kiểm token, APPROVED/online, location.updatedAt, xe active và có đang bận/giữ chỗ không; không reset dữ liệu.

**Câu 14:** dùng **C1_TOKEN** gọi lần lượt page=1, 2, 3 với limit=2: ban đầu totalItems=5, số lượng 2–2–1, không trùng bid. Nếu đã tạo thêm Booking của c01, totalItems tăng và trang 3 có thể nhiều hơn 1; đó không phải lỗi. Customer mới ở câu 9 có thể trả danh sách rỗng vì chưa đặt xe.

## 4. Câu 15–18: Booking, nhận chuyến, Trip và hủy

| Câu            | Ai / token                            | Thao tác                                           | Method | URL đầy đủ                                                                           | Body / ghi chú                                                                        |
| -------------- | ------------------------------------- | -------------------------------------------------- | ------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| 15             | CUSTOMER                              | Tạo Booking BIKE mới                               | POST   | `http://localhost:3000/api/v1/bookings`                                              | `{"pickupCode":"A","destinationCode":"B"}`; header Idempotency-Key mới; 201 SEARCHING |
| 15, 16         | DRIVER                                | Xem offer PENDING thuộc tài xế                     | GET    | `http://localhost:3000/api/v1/drivers/me/invitations?status=PENDING&page=1&limit=10` | Chọn invitation có bid đúng Booking vừa tạo; lấy iid                   |
| 16             | DRIVER nhận offer đó                  | Chấp nhận chuyến                                   | POST   | `http://localhost:3000/api/v1/invitations/{iid}/response`                   | `{"decision":"ACCEPT"}`; nhận tid                                                  |
| 16 — nhánh phụ | DRIVER nhận offer đó                  | Từ chối offer                                      | POST   | `http://localhost:3000/api/v1/invitations/{iid}/response`                   | `{"decision":"REJECT"}`; không chạy tiếp ACCEPT trên offer đã từ chối                 |
| 15, 16, 17, 19 | CUSTOMER chủ Booking hoặc ADMIN       | Xem Booking, Driver/Trip và payment summary khi có | GET    | `http://localhost:3000/api/v1/bookings/{bid}`                                  | Sau ACCEPT, Customer xem Driver trong `trip.driver`                                   |
| 17             | DRIVER của chuyến                     | Báo đã đến điểm đón                                | POST   | `http://localhost:3000/api/v1/trips/{tid}/arrival`                                | `{}`; ASSIGNED → ARRIVED                                                              |
| 17             | DRIVER của chuyến                     | Bắt đầu chuyến                                     | POST   | `http://localhost:3000/api/v1/trips/{tid}/start`                                  | `{}`; ARRIVED → IN_PROGRESS                                                           |
| 17             | DRIVER của chuyến                     | Cập nhật vị trí đến B                              | PUT    | `http://localhost:3000/api/v1/trips/{tid}/location`                               | `{"locationCode":"B"}`; chỉ khi IN_PROGRESS                                           |
| 17             | DRIVER của chuyến                     | Hoàn thành và tính cước                            | POST   | `http://localhost:3000/api/v1/trips/{tid}/completion`                             | `{}`; IN_PROGRESS → COMPLETED                                                         |
| 17, 19, 20     | CUSTOMER/DRIVER của chuyến hoặc ADMIN | Xem trạng thái/cước Trip                           | GET    | `http://localhost:3000/api/v1/trips/{tid}`                                        | Dùng tid, không dùng bid thay thế                                            |
| 18             | CUSTOMER chủ Booking                  | Xem có được hủy và phí hủy                         | POST   | `http://localhost:3000/api/v1/bookings/{bid}/cancellation-preview`             | `{"reason":"Doi ke hoach"}`                                                           |
| 18             | CUSTOMER chủ Booking                  | Xác nhận hủy                                       | POST   | `http://localhost:3000/api/v1/bookings/{bid}/cancellation`                     | `{"reason":"Doi ke hoach","confirmed":true}`                                          |
| 18             | CUSTOMER chủ Booking hoặc ADMIN       | Kiểm Booking đã hủy                                | GET    | `http://localhost:3000/api/v1/bookings/{bid}`                                  | CANCELED; Trip đã tạo cũng phải CANCELED                                              |

Trước câu 15, DRIVER phải APPROVED, có xe active, ONLINE và vị trí mới trong 120 giây. Offer có thời hạn; cần đọc đúng bid trước khi nhận. Câu 18 dùng Booking SEARCHING hoặc Trip ASSIGNED/ARRIVED; không dùng Trip đã IN_PROGRESS/COMPLETED.

### Cách chạy câu 15 → 17 với c01 và d01

1. Dùng **D2_TOKEN** gọi `PUT http://localhost:3000/api/v1/drivers/me/availability`, body `{"isOnline":false}` →200. Làm vậy để d01 là người nhận offer trong buổi demo. Nếu vẫn để d02 online, phải kiểm cả hai hộp invitations và dùng token của người thực sự nhận offer.
2. Dùng **D1_TOKEN** cập nhật location A rồi availability true như câu 13. Hoàn tất chuẩn bị token/request trước khi đặt để vị trí và offer không hết hạn.
3. **C1_TOKEN** gọi POST Booking trong bảng trên. Header thêm `Idempotency-Key: demo-booking-main-01`; body `{"pickupCode":"A","destinationCode":"B"}` →**201 SEARCHING**. Ghi `bid` trả về (dự kiến b06 nếu chưa có Booking mới). Muốn tạo chuyến khác phải dùng key khác; không bật tự sinh key nếu đang kiểm replay.
4. **D1_TOKEN** đọc invitations PENDING ngay, có thể chờ vài giây rồi Send lại. Chọn invitation có `bid` đúng Booking ở bước 3; ghi `iid`, dùng POST response với `{"decision":"ACCEPT"}` →200. Ghi `tid` từ kết quả; nếu chưa thấy, dùng C1_TOKEN đọc Booking theo `bid`. Không lấy nhầm `iid` cũ hoặc dùng bid thay iid.
5. **C1_TOKEN** GET Booking vừa tạo →ASSIGNED, có `tid` và `trip.driver.did=d01`. Ghi chính xác Driver được giao; mọi cập nhật Trip tiếp theo dùng token người đó.
6. **D1_TOKEN** gọi lần lượt arrival `{}` →ARRIVED; start `{}` →IN_PROGRESS; location `{"locationCode":"B"}` →200; completion `{}` →COMPLETED. Mỗi URL thay `{tid}` bằng ID vừa lấy. Không bỏ qua bước ARRIVED/start.
7. **C1_TOKEN** GET Trip →200, COMPLETED và có `fareAmount`. Sau đó mới thực hiện câu 19. Không dùng b01–b05 để gọi arrival/start vì chúng không có Trip.

**Câu 18 chạy riêng:** tạo Booking mới với key `demo-booking-cancel-01`, Driver ACCEPT như trên để có Trip ASSIGNED. Customer gọi cancellation-preview rồi cancellation, giữ nguyên reason và `confirmed:true`. Kết quả cần CANCELED; đọc Booking/Trip và notifications của C1_TOKEN/D1_TOKEN để kiểm cả hai bên. Không start/completion Trip này. Sau đó Driver rảnh trở lại qua event; nếu còn bận, đợi xử lý và đọc `/drivers/me` trước khi đặt tiếp. Cập nhật lại vị trí A trước chuyến mới.

## 5. Câu 19–20: thanh toán mock và đánh giá

| Câu        | Ai / token                               | Thao tác                        | Method | URL đầy đủ                                                    | Body / ghi chú                                                                                         |
| ---------- | ---------------------------------------- | ------------------------------- | ------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 19         | CUSTOMER chủ chuyến                      | Tạo Payment mock                | POST   | `http://localhost:3000/api/v1/trips/{tid}/payments`        | `{}` và header Idempotency-Key mới; Trip phải COMPLETED và có cước; lấy pid/referenceCode/amount |
| 19         | Công cụ/người giả lập callback — No Auth | Gửi kết quả thanh toán          | POST   | `http://localhost:3000/api/v1/payments/mock/callback`         | Raw JSON đã ký; X-Mock-Timestamp và X-Mock-Signature; không dùng token CUSTOMER/ADMIN thay chữ ký      |
| 19         | CUSTOMER chủ Payment hoặc ADMIN          | Đọc Payment sau callback        | GET    | `http://localhost:3000/api/v1/payments/{pid}`           | Kết quả thành công phải COMPLETED                                                                      |
| 19         | CUSTOMER chủ chuyến hoặc ADMIN           | Xem cước và các payment attempt | GET    | `http://localhost:3000/api/v1/trips/{tid}/payment-summary` | Kiểm hasCompleted=true sau callback thành công                                                         |
| 19 — retry | CUSTOMER chủ Payment                     | Thử lại Payment FAILED          | POST   | `http://localhost:3000/api/v1/payments/{pid}/retries`   | pid của attempt FAILED mới nhất; `{}` và Idempotency-Key mới; ký callback cho Payment mới trả về |
| 20         | CUSTOMER của chuyến                      | Gửi đánh giá                    | POST   | `http://localhost:3000/api/v1/trips/{tid}/reviews`         | `{"rating":5,"comment":"Chuyen di tot"}`; Trip COMPLETED, một review/chuyến                            |
| 20         | CUSTOMER/DRIVER của chuyến hoặc ADMIN    | Đọc đánh giá đã lưu             | GET    | `http://localhost:3000/api/v1/trips/{tid}/reviews`         | Review liên kết đúng tid                                                                            |

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

| Câu            | Ai / token                       | Thao tác                         | Method | URL đầy đủ                                                                          | Body / ghi chú                                                                             |
| -------------- | -------------------------------- | -------------------------------- | ------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 21 — bước 1    | Tài xế chưa có account — No Auth | Gửi đăng ký để nhận OTP mock     | POST   | `http://localhost:3000/api/v1/auth/register`                                        | Email/password/phone/plateNumber; trả 202 OTP_REQUIRED, chưa có account                    |
| 21 — bước 2    | Cùng tài xế — No Auth            | Hoàn tất đăng ký bằng OTP        | POST   | `http://localhost:3000/api/v1/auth/register`                                        | Giữ nguyên email/password/phone/plateNumber, thêm code thật 6 chữ số; trả 201/did          |
| 21             | DRIVER — No Auth                 | Login lấy token DRIVER           | POST   | `http://localhost:3000/api/v1/auth/login`                                           | Email/password của Driver vừa hoàn tất OTP                                                 |
| 21             | DRIVER                           | Đọc hồ sơ, lấy did          | GET    | `http://localhost:3000/api/v1/drivers/me`                                           | Hồ sơ ban đầu DRAFT                                                                        |
| 21             | DRIVER                           | Bổ sung licenseNumber            | PATCH  | `http://localhost:3000/api/v1/drivers/me`                                           | `{"licenseNumber":"DEMO-123"}`                                                             |
| 21 — tùy chọn  | DRIVER                           | Tạo/cập nhật xe BIKE và mô tả xe | PUT    | `http://localhost:3000/api/v1/drivers/me/vehicle`                                   | `{"plateNumber":"59A12345","model":"BIKE","color":"Black"}`; không làm khi tài xế đang bận |
| 21             | DRIVER                           | Gửi hồ sơ chờ duyệt              | POST   | `http://localhost:3000/api/v1/drivers/me/submissions`                               | `{}`; DRAFT/REJECTED → PENDING; Submit có thể tạo xe từ plateNumber đã đăng ký             |
| 22 — chuẩn bị  | ADMIN — No Auth                  | Login lấy token ADMIN            | POST   | `http://localhost:3000/api/v1/auth/login`                                           | Email/password ADMIN hiện có; không có API đăng ký ADMIN công khai                         |
| 22             | ADMIN                            | Liệt kê hồ sơ chờ duyệt          | GET    | `http://localhost:3000/api/v1/admin/drivers?approvalStatus=PENDING&page=1&limit=10` | Lấy did đúng hồ sơ cần duyệt                                                          |
| 22             | ADMIN                            | Xem chi tiết hồ sơ               | GET    | `http://localhost:3000/api/v1/drivers/{did}`                                   | Đọc trước khi quyết định                                                                   |
| 22             | ADMIN                            | Duyệt hồ sơ                      | POST   | `http://localhost:3000/api/v1/admin/drivers/{did}/approval-decisions`          | `{"decision":"APPROVED"}`                                                                  |
| 22 — nhánh phụ | ADMIN                            | Từ chối hồ sơ                    | POST   | `http://localhost:3000/api/v1/admin/drivers/{did}/approval-decisions`          | `{"decision":"REJECTED","reason":"Can bo sung ho so"}`; có lý do                           |
| 22             | DRIVER                           | Xem kết quả duyệt/từ chối        | GET    | `http://localhost:3000/api/v1/drivers/me`                                           | Xem approvalStatus; kiểm thông báo của Driver ở mục 7 bên dưới                             |
| 23 — chuẩn bị  | DRIVER                           | Cập nhật vị trí mới ở A          | PUT    | `http://localhost:3000/api/v1/drivers/me/location`                                  | `{"locationCode":"A"}`                                                                     |
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
4. **Câu 22:** A_TOKEN GET danh sách PENDING, đọc `/drivers/{did}` rồi POST `/admin/drivers/{did}/approval-decisions` với `{"decision":"APPROVED"}` →200. D_NEW_TOKEN GET `/drivers/me` kiểm APPROVED và GET notifications của mình. Có thể thay Driver mới bằng **d04** có sẵn nếu chỉ minh họa duyệt; token Driver khi đọc lại phải là D4_TOKEN.
5. Muốn thử **từ chối**, chọn một hồ sơ PENDING khác; ví dụ d04 nếu chưa duyệt. Gửi `{"decision":"REJECTED","reason":"CAN BO SUNG GIAY PHEP"}` →200. Không gọi REJECTED ngay sau APPROVED trên cùng hồ sơ, vì hồ sơ lúc đó không còn PENDING. Driver REJECTED có thể PATCH bổ sung, Submit lại rồi ADMIN mới duyệt lại.
6. **Câu 23:** dùng D_NEW_TOKEN sau APPROVED (hoặc D1_TOKEN), PUT location A →200, PUT availability true →200, GET `/drivers/me` xác nhận isOnline=true. PUT availability false rồi GET xác nhận false. Nếu cần tiếp tục đặt xe, bật true và làm mới location lại. DRAFT/PENDING/REJECTED bật online phải bị từ chối, không sửa approvalStatus trong PATCH để vượt duyệt.

Body hoàn chỉnh của Register bước 2:

```json
{
  "email":"taixe.moi@example.test",
  "password":"123",
  "phone":"driver-new-06",
  "plateNumber":"59A-00006",
  "code":"OTP_VUA_NHAN"
}
```

`OTP_VUA_NHAN` là chỗ cần thay, không phải mã gửi nguyên văn. Hồ sơ tạo bất đồng bộ; nếu vừa Register xong chưa thấy profile, đợi vài giây rồi GET lại. Nếu nhận 409, kiểm trùng email/phone/plateNumber và dùng dữ liệu mới cho lần đăng ký khác.

Hai URL OTP độc lập dưới đây đã có trong API, dùng khi cần minh họa riêng thao tác OTP. Luồng Register hai bước phía trên đã tự tạo/kiểm challenge, không bắt buộc gọi thêm hai URL này:

| Câu            | Ai / token                     | Thao tác              | Method | URL đầy đủ                                                        | Body / ghi chú                                                                     |
| -------------- | ------------------------------ | --------------------- | ------ | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 21 — OTP riêng | Người đăng ký Driver — No Auth | Yêu cầu challenge OTP | POST   | `http://localhost:3000/api/v1/auth/otp-challenges`                | `{"phone":"abc123"}`; lấy oid; có thể thay thế challenge trước đó của cùng phone |
| 21 — OTP riêng | Cùng người đăng ký — No Auth   | Kiểm mã OTP           | POST   | `http://localhost:3000/api/v1/auth/otp-challenges/{oid}/verify` | Phone của challenge và code thật 6 chữ số; không đồng nghĩa đã tạo Account         |

## 7. Thông báo và các URL ADMIN bổ trợ

| Câu liên quan          | Ai / token                                                            | Thao tác                                   | Method | URL đầy đủ                                                    | Ghi chú                                                                                   |
| ---------------------- | --------------------------------------------------------------------- | ------------------------------------------ | ------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 15, 16, 17, 18, 19, 22 | CUSTOMER hoặc DRIVER nhận thông báo; ADMIN chỉ xem thông báo của mình | Liệt kê thông báo của người đang đăng nhập | GET    | `http://localhost:3000/api/v1/notifications?page=1&limit=10`  | Câu 18 gửi lần lượt bằng token Customer và Driver để chứng minh cả hai nhận thông báo hủy |
| 15, 16, 17, 18, 19, 22 | Người nhận thông báo                                                  | Đọc một thông báo                          | GET    | `http://localhost:3000/api/v1/notifications/{nid}` | Không được đọc thông báo của người khác, kể cả có ID                                      |
| 14, 15, 18 — bổ trợ    | ADMIN                                                                 | Tra cứu tất cả Booking theo quyền quản trị | GET    | `http://localhost:3000/api/v1/admin/bookings?page=1&limit=10` | Câu 14 chính vẫn dùng GET /bookings bằng CUSTOMER                                         |
| 17 — bổ trợ            | ADMIN                                                                 | Tra cứu Trip                               | GET    | `http://localhost:3000/api/v1/admin/trips?page=1&limit=10`    | Không dùng URL quản trị để Driver cập nhật trạng thái                                     |
| 19, 30 — bổ trợ        | ADMIN                                                                 | Tra cứu Payment attempt                    | GET    | `http://localhost:3000/api/v1/admin/payments?page=1&limit=10` | Đối chiếu các lần thanh toán/retry                                                        |

## 8. Câu 24–30: bảo mật và replay

| Câu           | Ai / token                               | Thao tác cần chứng minh                | Method | URL đầy đủ                                             | Cách thử / kết quả cần kiểm                                                                                                                       |
| ------------- | ---------------------------------------- | -------------------------------------- | ------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 24            | Người dùng demo — No Auth khi Register   | Tạo dữ liệu rồi kiểm cách lưu password | POST   | `http://localhost:3000/api/v1/auth/register`           | Không có API trả passwordHash. Sau khi tạo account mới, dùng storage checker ở terminal để chứng minh Argon2id; license Driver kiểm AES-GCM riêng |
| 25            | Người thử lỗi — No Auth                  | SQL injection                          | POST   | `http://localhost:3000/api/v1/auth/login`              | Body `{"email":"' OR 1=1 --","password":"anything"}`; mong đợi 400 hoặc 401, không có JWT                                                         |
| 25            | Người thử lỗi — No Auth                  | NoSQL injection                        | POST   | `http://localhost:3000/api/v1/auth/login`              | Body `{"email":{"$ne":null},"password":"a"}`; mong đợi 400                                                                                        |
| 26            | CUSTOMER                                 | Gửi XSS vào tên hồ sơ                  | PATCH  | `http://localhost:3000/api/v1/customers/me`            | Body `{"name":"<script>alert('hack')</script>"}`; mong đợi 400. Cần thêm browser evidence script không chạy                                       |
| 27            | Người giữ token CUSTOMER rồi sửa JWT     | JWT tampering                          | GET    | `http://localhost:3000/api/v1/customers/me`            | Authorization dùng JWT đã sửa payload/chữ ký; mong đợi 401                                                                                        |
| 28            | CUSTOMER, cố gọi thao tác DRIVER         | Unauthorized role                      | PUT    | `http://localhost:3000/api/v1/drivers/me/availability` | Token CUSTOMER còn hợp lệ, body `{"isOnline":true}`; mong đợi 403, không đổi trạng thái Driver                                                    |
| 28 — bổ sung  | C2_TOKEN                         | Thử đọc hồ sơ Customer khác            | GET    | `http://localhost:3000/api/v1/customers/c01`  | c01 của customer1, dùng token customer2; mong đợi 403                                                                                  |
| 29            | CUSTOMER dùng để đo tải                  | Gửi nhiều request tạo Booking          | POST   | `http://localhost:3000/api/v1/bookings`                | Giữ token/key/body hợp lệ; kiểm 429/Retry-After và hệ thống còn hoạt động. Cần công cụ tải để đo yêu cầu >1000 req/s                              |
| 30            | CUSTOMER chủ chuyến                      | Gửi lại request tạo Payment y hệt      | POST   | `http://localhost:3000/api/v1/trips/{tid}/payments` | Giữ nguyên Idempotency-Key của lần tạo và body; mong đợi 200, cùng pid/snapshot, không thêm giao dịch                                       |
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

| Thành phần xử lý     | Nhóm đường dẫn sau host Gateway                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| auth_service         | `/api/v1/auth/...`                                                                                                                |
| customer_service     | `/api/v1/customers/...`, `/api/v1/admin/customers`                                                                                |
| driver_service       | `/api/v1/drivers/...` trừ invitations; `/api/v1/admin/drivers/...`                                                                |
| booking_service      | `/api/v1/bookings/...`, `/api/v1/admin/bookings`, `/api/v1/drivers/me/invitations`, `/api/v1/invitations/{iid}/response` |
| trip_service         | `/api/v1/trips/...` trừ payments/payment-summary/reviews; `/api/v1/admin/trips`                                                   |
| payment_service      | `/api/v1/payments/...`, `/api/v1/admin/payments`, `/api/v1/trips/{tid}/payments`, `/api/v1/trips/{tid}/payment-summary`     |
| notification_service | `/api/v1/notifications/...`                                                                                                       |
| rating_service       | `/api/v1/trips/{tid}/reviews`                                                                                                  |
| Gateway health       | `/health`, `/ready`, `/health/services`; không phải service thứ 9                                                                 |

## 10. Header phải nhớ

| Nhóm thao tác                           | Header                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| Request có token                        | `Authorization: Bearer TOKEN_THAT` của đúng vai trò/chủ dữ liệu                       |
| POST/PUT/PATCH có JSON                  | `Content-Type: application/json`                                                      |
| Tạo Booking, tạo Payment, retry Payment | `Idempotency-Key: KEY_MOI_CHO_NGHIEP_VU_MOI`                                          |
| Replay cùng nghiệp vụ                   | Giữ nguyên Idempotency-Key và body gốc                                                |
| Callback mock                           | `X-Mock-Timestamp` và `X-Mock-Signature` đúng raw JSON, không dùng Bearer thay chữ ký |

Không lưu token, signing secret hoặc password thật vào file này. Hướng dẫn nhập tay chi tiết: [MANUAL_POSTMAN_30.md](MANUAL_POSTMAN_30.md). Body/schema đầy đủ: [10 OpenAPI YAML](api/). Danh sách trên bao phủ 47 operation REST hiện hành; một URL có thể phục vụ nhiều câu hoặc nhiều thao tác, phân biệt bằng method, body và token.

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

**d01/b01 có trong bộ mẫu; t01/p01 chỉ là ví dụ sau khi tạo Trip/Payment.** b01 là NO_DRIVER nên không có Trip và không dùng để thanh toán. Đọc response để lấy tid/pid thật. aid xác định Account của cả CUSTOMER/DRIVER/ADMIN; hiện tra Account của mình qua GET /auth/me, không có endpoint /accounts/{aid} mới. Field Mongo _id/JWT sub và eventId/requestId/correlationId là dữ liệu kỹ thuật nội bộ, không dùng thay mã tài nguyên trên URL.

| Hiện tượng | Cách xử lý |
| --- | --- |
| 400 | Kiểm JSON, field đúng tên, không gửi role/cid/did khi Register; không trộn locationCode với tọa độ; thay hết chỗ giữ ID/OTP bằng giá trị thật |
| 401 | Đăng nhập lại, dán accessToken mới, không dùng token tài khoản cũ trước reset; callback kiểm chữ ký/raw thay vì Bearer |
| 403 | Đổi đúng token theo cột Ai/token; ADMIN được nearby nhưng không thao tác `/drivers/me` thay Driver |
| 404 | Kiểm ID có thật; c29/d09 cũ đã xóa; chưa có Trip/Payment thì tạo đúng luồng trước |
| 409 | Kiểm trùng dữ liệu, trạng thái chưa đủ hoặc key dùng lại với payload khác; đọc lại resource thay vì reset dữ liệu |
| 429 | Chờ Retry-After; không bỏ rate limit |
| 503 PROFILE_NOT_READY | Đợi event đồng bộ profile vài giây rồi GET lại; nếu kéo dài, kiểm `/ready`, `/health/services` và log container |
| nearby trống / không có invitation | Refresh vị trí, bật online, kiểm APPROVED/xe active/không bận; offer có hạn, chọn đúng bid và token người nhận |

Không tự đánh dấu PASS chỉ vì đã có URL/body trong file. Ghi HTTP status, ID và ảnh/response thực tế vào buổi test; đối chiếu trạng thái và phần còn thiếu tại [GRADING_MATRIX.md](GRADING_MATRIX.md).
