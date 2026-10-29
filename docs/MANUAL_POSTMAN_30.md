# CAB System — nhập tay, đủ 30 mục và câu trả lời bảo vệ

**Offer demo không hết hạn — 29/10/2026:** đã bỏ hạn30 giây. Customer có thể đặt trước rồi mới Login Driver, đọc notifications/invitations và ACCEPT khi offer còn PENDING và Booking còn SEARCHING. Không cần nhập nhanh. Driver REJECT để xét người tiếp theo, Customer hủy để dừng tìm. Không tự hồi sinh NO_DRIVER/EXPIRED cũ. JWT/OTP/callback/deadline gRPC vẫn có hạn như cũ; không bỏ bảo vệ đồng thời Driver.

**Chính sách demo mới 29/10/2026:** dùng tọa độ cuối cùng Driver đã gửi, bỏ điều kiện tuổi vị trí 120 giây khi bật online, CUSTOMER nearby, phân công và tính ETA. Không cần cập nhật lại tọa độ chỉ để làm mới thời gian. Giữ timestamp thật; locationIsFresh chỉ là chỉ báo độ mới, không chặn nhận chuyến. Vẫn phải ACTIVE/APPROVED/online/BIKE/không bận, không giữ chỗ và trong1 km; offer PENDING không tự hết hạn trong demo. Đây là giả lập vị trí tĩnh để demo, không phải GPS thời gian thực.

**Cập nhật bộ mẫu 29/10:** d01–d05 đều APPROVED, giữ nguyên tọa độ/xe/online. d01/d02 online; d03/d04/d05 offline. Câu21–22 dùng hồ sơ đăng ký mới để thử PENDING/REJECTED; hệ thống không tự duyệt tài xế mới.

**Danh sách Booking đã bổ sung tài xế:** Booking được nhận có did và driver.name/vehicle ngay trong items, áp dụng cho ADMIN lọc cid và Customer xem chính mình. b18/b19/b20 hiển thị d01/NGUYEN VAN HUNG. NO_DRIVER/chưa có Trip không có driver. Không trả email/license của Driver trong danh sách này.

**Booking COMPLETED mới:** b18/t01 thuộc c02, b19/t02 thuộc c03, b20/t03 thuộc c04, Driver d01 nhận/hoàn thành tuần tự, chưa thanh toán. ADMIN hoặc Customer chủ Booking GET `/api/v1/bookings/b18` (hoặc b19/b20 tương ứng) để xem trip.driver. c02/c03/c04 hiện mỗi khách4 Booking, c05 có3; tổng20 Booking. Vị trí/online ban đầu của Driver đã khôi phục.

**Thêm lịch sử cho các Customer khác:** c02 có b06–b08, c03 b09–b11, c04 b12–b14, c05 b15–b17; mỗi khách3 Booking NO_DRIVER/CANCELED, chưa gán Driver/Trip. c01 giữ5 Booking b01–b05; tổng17. A_TOKEN dùng `/admin/bookings?cid=c02&page=1&limit=2` để chọn khách; token c02 dùng `/bookings?page=1&limit=2` để xem chính mình. Chỉ là Booking lịch sử mẫu; không tạo chuyến thực hiện giả.

**Vị trí mẫu mới:** d01=(10.8,106.7), d02=(10.802,106.702), d03=(10.805,106.7) nằm trong 1 km quanh (10.8,106.7). d04=(10.82,106.7), d05=(10.78,106.68) ở ngoài bán kính nên không xuất hiện tại điểm tìm này. ADMIN nearby trả hồ sơ Driver đầy đủ; CUSTOMER chỉ nhận snapshot công khai. Dùng limit=3 để thấy cả 3 người trong một trang; xem bảng tọa độ tại URL_POSTMAN_30.md. Không cập nhật cả 5 về A khi muốn giữ bộ mẫu kiểm bán kính.

**Cập nhật yêu cầu ADMIN câu 11–14 (28/10/2026):** ADMIN tra Customer qua `/admin/customers` và `/customers/{cid}`, Driver qua `/admin/drivers` và `/drivers/{did}`, Booking của Customer được chọn qua `/admin/bookings?cid=c01&page=1&limit=2` và `/bookings/{bid}`. `GET /admin/drivers/nearby` (ADMIN-only) và `/drivers/nearby` với ADMIN tìm trong 1 km theo tọa độ cuối cùng đã lưu, gồm offline/chờ duyệt/vị trí cũ; có approvalStatus/isOnline/locationIsFresh. CUSTOMER tại `/drivers/nearby` và dispatch giữ điều kiện ACTIVE/APPROVED/online/BIKE/không bận/vị trí đã lưu hợp lệ (không giới hạn tuổi trong demo). ADMIN nearby không chứng minh khả năng nhận chuyến. Phân trang giữ đúng limit; muốn thấy 2 người mỗi trang dùng limit=2. Hướng dẫn thao tác hiện hành: [URL_POSTMAN_30.md](URL_POSTMAN_30.md).

**Bộ mẫu hiện tại 28/10/2026:** đã làm sạch dữ liệu demo theo yêu cầu; dùng Customer c01–c05, Driver d01–d05, Booking b01–b05 thuộc c01. Thông tin đăng nhập ở `.local/demo-reset-20261028/ACCOUNTS.local.md`. d01/d02 APPROVED/online gần A, d03 APPROVED/offline, d04/d05 APPROVED (offline), như d03; cả5 đã được duyệt. Tọa độ đã lưu tiếp tục có hiệu lực trong demo; không cần refresh theo thời gian. Đã có dữ liệu, bỏ qua bước seed bên dưới; không chạy lại `--fixtures` cũ nếu muốn giữ đúng bộ mẫu 5 Customer/5 Driver/17 Booking. Ví dụ c29/d09 và session export cũ không còn trỏ tới tài khoản hiện có.

**ID công khai hiện hành:** cid=c29, did=d01, aid=a01, bid=b01, tid=t01, pid=p01, nid=n01, rid=r01; thêm vid cho Vehicle, iid cho Invitation và oid cho OTP challenge. API/URL dùng các mã ngắn do server cấp; cid/did chính là ID Customer/Driver, không còn customerId/driverId hay accountId ObjectId trong JSON công khai. MongoDB _id và JWT sub là định danh kỹ thuật nội bộ, không nhập vào URL. ADMIN cũng có aid; không tự nhập ID khi Register.

**Validation demo cập nhật 28/10/2026:** Password là String không rỗng (ít nhất 1 ký tự, ví dụ "123" hoặc "a"), không trim và không yêu cầu độ phức tạp; Phone là String không rỗng sau trim (ví dụ "0123", "123", "abc123"), giữ số 0 đầu và vẫn unique. Email giữ định dạng cơ bản. Chỉ áp dụng cho học tập/demo local; không phải chính sách production. Argon2id, JWT, role/ownership và OTP Driver giữ nguyên.

Hợp đồng hiện hành: email login; Customer chỉ nhập email/password/phone; Driver thêm plateNumber, gửi đăng ký rồi mới nhập OTP; cid/did và các mã nghiệp vụ do server sinh. Mã điểm A/B đọc tọa độ trong DB. Password vẫn ít nhất 1 ký tự, ví dụ quang123.

Kết quả audit ngày 28/10/2026 ở [PROJECT_STATUS.md](PROJECT_STATUS.md), tiến độ ở [GRADING_MATRIX.md](GRADING_MATRIX.md). Hướng dẫn này phục vụ nhập tay; collection developer hiện hành ở [postman/README.md](../postman/README.md). Khi buổi chấm yêu cầu nhập tay, không dùng Runner/scripts tự điền.

## 1. Chuẩn bị và quy tắc gõ tay

Git Bash tại root:

```bash
npm test
npm run check
docker compose up -d --build
docker compose ps -a
```

Chỉ tiếp tục khi kiểm tra không lỗi và các container healthy. Không bắt buộc reset: counter sẽ bỏ qua mã cũ đã tồn tại; tọa độ mẫu chỉ upsert khi thiếu, không overwrite dữ liệu hiện có. Nếu cần DB trống, reset là nhóm riêng đã chuẩn bị theo yêu cầu trước; không chạy lại reset trong mỗi bài.

ADMIN chỉ bootstrap khi chưa tồn tại, chạy PowerShell từ root:

```powershell
docker compose exec -T auth_service node scripts/seed.cjs auth_service --admin-only
```

Email seed admin@cab.local; password từ SEED_PASSWORD lúc tạo lần đầu. Tài khoản cũ giữ nguyên; nếu 401, dùng password thực, không repair/reset để chữa. Suite developer dùng CAB_ADMIN_PASSWORD trong .env khi ADMIN khác password seed. Dữ liệu 5 Driver/5 Booking chỉ tạo ngoài buổi nhập tay bằng `bash scripts/seed-local.sh --fixtures`; xem [runbook](BACKEND_RUNBOOK.md).

Trong Postman: New HTTP Request, Authorization No Auth; tự nhập header `Authorization: Bearer TOKEN_THAT` khi cần. Body raw JSON và tự đặt Content-Type application/json. GET dùng Body none. Không dùng environment hoặc biến Postman. Mọi URL bắt đầu http://localhost:3000; các đường dẫn dưới đây phải gõ thành URL đầy đủ.

Tự ghi C_TOKEN/D_TOKEN/A_TOKEN, cid/did/bid/iid/tid/pid và response tạo mới. Những nhãn này là chỗ thay giá trị thật, không gõ nguyên nhãn. cid/did là ID công khai tự sinh dùng trực tiếp trong URL.

## 2. Customer: chỉ 3 trường

POST `http://localhost:3000/api/v1/auth/register`, No Auth:

```json
{ "email": "quang123@gmail.com", "password": "123", "phone": "0123" }
```

201: chỉ có aid/role/cid tự sinh (ví dụ c01), không token hoặc profileStatus. Đăng nhập riêng để nhận accessToken và account tối giản; JSON đăng nhập không có status/tokenType/expiresAt. Không nhập cid, role hoặc name.

POST `/api/v1/auth/login`:

```json
{ "email": "quang123@gmail.com", "password": "123" }
```

Ghi accessToken là C_TOKEN. ADMIN login cùng URL, email admin@cab.local và password đã bootstrap → A_TOKEN. Chuẩn bị Customer thứ hai bằng email/phone khác để kiểm ownership, ghi C2_TOKEN.

C_TOKEN GET `/api/v1/customers/me` → cid. PROFILE_NOT_READY 503 thì chờ rồi Send lại. GET `/api/v1/customers/CID` →200. Đổi sang C2_TOKEN →403.

Muốn sửa tên, PATCH `/api/v1/customers/me`, C_TOKEN:

```json
{ "name": "Quang" }
```

Tên ban đầu bằng mã tự sinh, nên không bắt buộc thêm bước này để đăng ký. Profile email là contact email; PATCH profile không đổi login email ở Auth.

## 3. Mục 21: bấm đăng ký trước, sau đó mới nhập OTP

Postman không có giao diện form Đăng ký riêng; **Send chính là gửi một lần đăng ký**. Cùng một URL POST dùng cho cả hai lần.

### Lần 1 — Send thông tin Driver, chưa có code

POST `http://localhost:3000/api/v1/auth/register`, No Auth:

```json
{ "email": "dri01@gmail.com", "password": "quang123", "phone": "0909212110", "plateNumber": "59A12345" }
```

Mong đợi **202**:

```json
{ "status": "OTP_REQUIRED", "oid": "ID_SERVER_TAO", "expiresAt": "THOI_GIAN", "mockCode": "MA_6_SO" }
```

Chưa có Account/Driver profile, chưa đăng nhập được. mockCode là OTP giả lập local theo phạm vi đồ án, không phải đã gửi SMS thật. Server chỉ lưu Argon2id password hash và HMAC gắn yêu cầu, không lưu password rõ. Không cần nhập lại oid vào lần 2.

### Lần 2 — thêm code thật vào chính body rồi Send lại

```json
{ "email": "dri01@gmail.com", "password": "quang123", "phone": "0909212110", "plateNumber": "59A12345", "code": "MA_6_SO_THAT" }
```

Giữ nguyên 4 trường đầu; code thay bằng mockCode thật của response, không gõ chữ minh họa. **201** mới là tạo Account thành công; did và các ID được server cấp. Sai code →400; hết 5 phút/đã dùng/sai 5 lần bị từ chối; gửi xin mã lại quá sớm →429. Đổi email/phone/password/plate giữa hai lần không dùng được OTP cũ.

Login email Driver/password như Customer, ghi D_TOKEN. GET `/api/v1/drivers/me`, D_TOKEN → DRAFT, did, did và plateNumber. Hồ sơ vẫn cần gửi duyệt; 201 Account không đồng nghĩa ADMIN đã duyệt.

### Hoàn tất phần “gửi hồ sơ chờ duyệt” của mục 21

`licenseNumber` là số giấy phép lái xe trong SRS, **không phải OTP hay biển số**. Đồ án dùng dữ liệu giả để minh họa; không kiểm giấy phép thật. PATCH `/api/v1/drivers/me`, D_TOKEN:

```json
{ "licenseNumber": "DEMO01" }
```

POST `/api/v1/drivers/me/submissions`, D_TOKEN, tự nhập body:

```json
{}
```

200, **approvalStatus=PENDING**. Đây là điểm kết thúc mục 21 theo phiếu: “hồ sơ chờ duyệt”. Server tạo Vehicle BIKE từ biển số đã nhập; model BIKE/color Khong ro là dữ liệu demo có thể chỉnh bằng API Vehicle. Biển số đã thuộc Vehicle khác sẽ bị 409 tại bước Submit, không được gán trùng.

Không phải gõ lại biển số, model và color trong luồng cơ bản. Endpoint PUT Vehicle cũ vẫn có khi muốn sửa thông tin xe của mình theo quyền/trạng thái.

## 4. Mục 22–23: ADMIN duyệt, Driver online

`DriverProfile` là hồ sơ đăng ký làm tài xế, chưa đồng nghĩa đã đủ điều kiện chạy xe. `role=DRIVER` cho phép người đăng ký Login và quản lý hồ sơ; chỉ APPROVED mới được bật online khi đủ các điều kiện khác. REJECTED nghĩa hồ sơ bị từ chối, vẫn giữ tài khoản để đọc lý do, sửa và Submit lại PENDING. Không dùng enum REJECT, không xóa/đổi vai trò tài khoản để xử lý hồ sơ từ chối. ADMIN có thể xem hồ sơ này; CUSTOMER nearby/dispatch không được chọn người bị từ chối. Mẫu d05 đã được gửi lại và duyệt APPROVED ngày29/10, hiện vẫn offline. Muốn thử REJECTED, đăng ký hồ sơ mới để ADMIN xét duyệt.

A_TOKEN GET `/api/v1/admin/drivers?approvalStatus=PENDING&page=1&limit=10`; GET `/api/v1/drivers/DID` xem chi tiết.

A_TOKEN POST `/api/v1/admin/drivers/DID/approval-decisions`:

```json
{ "decision": "APPROVED" }
```

200/APPROVED. Không thêm reason cho APPROVED. Muốn minh họa từ chối, dùng hồ sơ PENDING khác với `{"decision":"REJECTED","reason":"Thieu ho so"}`. Không đổi một hồ sơ APPROVED thành REJECTED bằng API duyệt PENDING.

D_TOKEN GET profile và `/api/v1/notifications?page=1&limit=10` để xem kết quả.

## 5. Vị trí: nhập trực tiếp latitude/longitude

Bộ mẫu mỗi Driver có vị trí riêng: d01=(10.8,106.7), d02=(10.802,106.702), d03=(10.805,106.7); d04/d05 ở xa hơn1 km. Không đưa tất cả về cùng một điểm. Để chuẩn bị d01 nhận chuyến, dùng D_TOKEN của d01:

```http
PUT http://localhost:3000/api/v1/drivers/me/location
```

```json
{"latitude":10.8,"longitude":106.7}
```

Sau đó PUT `/api/v1/drivers/me/availability` với `{"isOnline":true}`. Cả hai200, Driver phải APPROVED/có xe active/không bận. Đây là giả lập Driver gửi vị trí, không phải Customer cập nhật thay tài xế. CUSTOMER/dispatch chỉ dùng vị trí đã lưu hợp lệ (không giới hạn tuổi trong demo); không cần refresh chỉ vì để lâu.

Câu13 dùng A_TOKEN GET `/api/v1/admin/drivers/nearby?latitude=10.8&longitude=106.7&page=1&limit=3`: ADMIN tra vị trí cuối cùng, không cần refresh để đọc. Hướng dẫn đặt xe bên dưới chỉ dùng tọa độ số; API vẫn có mã điểm demo để tương thích nhưng không bắt buộc dùng.

### Câu 14 — phân biệt ADMIN và Customer xem danh sách

| Người thao tác | Method | URL đầy đủ | Token |
| --- | --- | --- | --- |
| ADMIN xem Booking của c01 | GET | `http://localhost:3000/api/v1/admin/bookings?cid=c01&page=1&limit=2` | A_TOKEN |
| Customer c01 xem Booking của mình | GET | `http://localhost:3000/api/v1/bookings?page=1&limit=2` | Token đăng nhập customer1@cab.local |

GET chọn Body none. Phía ADMIN chọn khách qua cid; phía Customer được xác định tự động từ JWT, không gửi cid. Để thử bộ mẫu5 Booking c01, cần Login customer1@cab.local; Customer mới đăng ký ở phần2 có thể chưa có Booking. Hai phía cùng c01/page/limit phải trả cùng danh sách. Đổi page=2 rồi3 để thấy2–2–1 item nếu c01 vẫn có5 Booking. Đổi token sang customer2@cab.local ở URL Customer thì tự thấy4 Booking của c02.

Chi tiết từng bước, kết quả và lỗi quyền: [Câu 14 trong URL_POSTMAN_30.md](URL_POSTMAN_30.md#cau-14). Dùng token ADMIN ở URL Customer hoặc token Customer ở URL ADMIN sẽ403.

## 6. Câu 15–17: Customer đặt → Driver nhận → hoàn thành

**Chuyến thứ hai:** c01/d01 được dùng lại sau khi d01 hoàn thành và đã rảnh, nhưng POST Booking phải có **Idempotency-Key mới**. Ví dụ lần1 c01-trip-001, lần2 c01-trip-002. Nếu dùng biến bookingKey trong Postman, đổi giá trị biến cho chuyến mới. Cùng key/body chỉ trả200 và snapshot Booking cũ (có thể SEARCHING), không sinh offer mới. GET /bookings/BID mới là trạng thái hiện tại; tạo mới đúng phải201 và bid khác. Trước chuyến tiếp theo kiểm d01 đúng tọa độ pickup, online và không activeTrip.

**Chuẩn bị:** Login Customer và Driver, giữ C_TOKEN/D_TOKEN riêng; d01 online và đã gửi tọa độ mới như mục5. Có thể Login Driver sau khi đặt vì offer không tự hết hạn. Nếu muốn xem5 Booking của c01, Login customer1@cab.local; Customer tự đăng ký mới dùng token của chính tài khoản đó.

**Câu15 — Customer đặt:** C_TOKEN POST `http://localhost:3000/api/v1/bookings`, header Idempotency-Key mới, Body raw JSON:

```json
{
  "pickup":{"latitude":10.8,"longitude":106.7},
  "destination":{"latitude":10.81,"longitude":106.71}
}
```

Tạo mới trả **201 SEARCHING**, lưu bid. Backend tự tìm Driver trong1 km, tạo invitation PENDING và phát RabbitMQ event `booking.invitation_created` cho Notification Service ghi thông báo. Customer không gọi API riêng để gửi offer. GET `/api/v1/bookings/BID` bằng C_TOKEN →200 để đọc trạng thái; bấm Send lại GET khi cần. Response POST cũ không tự chuyển từ201 sang200; HTTP200 của GET chỉ nghĩa đọc thành công, không nghĩa Driver đã nhận. Không ai nhận/hết ứng viên thì có thể NO_DRIVER.

**Câu16 — Driver nhận:** D_TOKEN GET `http://localhost:3000/api/v1/notifications?page=1&limit=10`, tìm thông báo đúng bid. D_TOKEN GET `http://localhost:3000/api/v1/drivers/me/invitations?status=PENDING&page=1&limit=10`, lấy iid đúng Booking còn PENDING. D_TOKEN POST `http://localhost:3000/api/v1/invitations/IID/response`, body:

```json
{"decision":"ACCEPT"}
```

→200, Booking ASSIGNED, lưu tid. Customer GET `/api/v1/bookings/BID` thấy did/driver.name và trip.driver/xe. Notifications nid không thay thế iid; thông báo là lịch sử; kiểm offer còn PENDING và Booking còn SEARCHING. Nếu d01 không có offer, kiểm Driver khác có được chọn và offer còn PENDING. Postman không có push tự hiện thông báo; cần Send GET. Có thể Login Driver ở câu16, không cần thao tác gấp vì offer không hết hạn.

**Câu17 — Driver thực sự nhận chuyến:**

| Token | Method | Đường dẫn sau http://localhost:3000 | Body | Kết quả |
| --- | --- | --- | --- | --- |
| D_TOKEN | POST | /api/v1/trips/TID/arrival | `{}` | ARRIVED |
| D_TOKEN | POST | /api/v1/trips/TID/start | `{}` | IN_PROGRESS |
| D_TOKEN | PUT | /api/v1/trips/TID/location | `{"latitude":10.81,"longitude":106.71}` | Cập nhật vị trí cuối |
| D_TOKEN | POST | /api/v1/trips/TID/completion | `{}` | COMPLETED, fareAmount |

Cước theo pricingSnapshot và khoảng cách Haversine pickup→destination; không phải tổng GPS. Driver được release sau hoàn thành, độc lập thanh toán. Trước chuyến mới, cập nhật về vị trí xuất phát thực của Driver (d01 là10.8/106.7) nếu cần; không đổi mọi Driver về cùng điểm.

## 7. Payment, callback thủ công, Review

C_TOKEN POST `/api/v1/trips/TID/payments`, header `Idempotency-Key: p01`, body `{}` →201/PENDING/MOCK_ONLINE. Ghi pid/referenceCode/amount/response gốc. Số tiền do server lấy từ Trip COMPLETED.

Git Bash lấy Unix timestamp:

```bash
date +%s
```

Tự chuẩn bị JSON một dòng, thay nhãn bằng giá trị thật, amount/timestamp là số:

```text
{"eventId":"cb01","pid":"PID","referenceCode":"REFERENCE_CODE","amount":AMOUNT,"currency":"VND","result":"COMPLETED","timestamp":TIMESTAMP}
```

Tính HMAC offline (không tự gửi HTTP):

```bash
node --env-file=.env scripts/sign-manual-callback.cjs TIMESTAMP 'RAW_JSON_DA_NHAP_DU'
```

Postman POST `/api/v1/payments/mock/callback`, No Auth; tự nhập Content-Type application/json, X-Mock-Timestamp và X-Mock-Signature từ kết quả. Body phải giống từng byte đã ký; không format/thêm newline; Send trong 5 phút. Không đặt secret ký vào Postman.

C_TOKEN GET `/api/v1/payments/PID`, `/api/v1/trips/TID/payment-summary` → COMPLETED/hasCompleted=true.

C_TOKEN POST `/api/v1/trips/TID/reviews`:

```json
{ "rating": 5, "comment": "Tot" }
```

201; GET cùng URL đọc Review. Duplicate →409, rating 6 →400. Review cần Trip COMPLETED, không bắt buộc đã trả tiền.

Replay b01/p01 giữ key/body →200, cùng ID/snapshot ban đầu. Callback giữ nguyên eventId/body/timestamp/signature →duplicate=true; không ký mới để gọi là replay. ADMIN GET `/api/v1/admin/payments?tid=TID&page=1&limit=10` để đối chiếu số attempts và số lần COMPLETED.

## 8. Hủy và các fixture riêng

Sau câu17, Driver có thể đang ở điểm đến (10.81,106.71). Trước khi tạo Booking câu18 để cùng d01 nhận: GET drivers/me kiểm đã rảnh, PUT location {"latitude":10.8,"longitude":106.7}, bật online nếu cần, **rồi mới** Customer POST Booking với key mới. Cập nhật tọa độ sau khi đã tạo không đổi người nhận offer PENDING. Nếu offer đã gửi d02, dùng token d02 để nhận hoặc Customer hủy Booking và tạo lại sau khi chuẩn bị d01. Bỏ hạn vị trí/offer không bỏ bán kính1 km hay bảo đảm d01 nhận mọi Booking. Xem chi tiết ở URL_POSTMAN_30.md phần câu18.


Tạo Booking b02 và nhận chuyến riêng, giữ Trip ASSIGNED/ARRIVED. C_TOKEN POST `/api/v1/bookings/BID/cancellation-preview`:

```json
{ "reason": "Doi ke hoach" }
```

allowed=true/feeAmount=0/VND. POST `/api/v1/bookings/BID/cancellation`:

```json
{ "reason": "Doi ke hoach", "confirmed": true }
```

200/CANCELED. GET Trip, notification của từng người; Driver release. Send lại cancel giữ kết quả cũ. Không hủy IN_PROGRESS/COMPLETED thông thường.

Sau DB reset, cần chuẩn bị đủ 5 Driver và 5 Booking trước mục 13/14. Nếu yêu cầu thuần tay, đăng ký 5 Driver với phone/email/plate khác nhau bằng luồng mục 21; giữ các trạng thái DRAFT/PENDING/APPROVED/OFFLINE/vị trí cũ khác nhau. Chỉ một Driver gần A online để luồng chính dễ dự đoán.

Có thể cho tất cả Driver offline rồi tạo 5 Booking A→B với key b11..b15, cùng C_TOKEN; chúng kết thúc NO_DRIVER và có trong history. GET `/api/v1/bookings?page=1&limit=2`, đổi page=2; totalItems>=5. Không cần xóa các fixture này sau mỗi lần bảo vệ. Chờ cửa sổ 60 giây mới nếu đã create nhiều Booking.

## 9. Đúng 30 mục: thao tác, kết quả và câu trả lời nên nhớ

| #   | Thao tác / bằng chứng cần hiện                                                                                                 | Câu trả lời bảo vệ                                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `ls gateway services proto infra scripts`; mở cây source                                                                       | “Gateway là cổng REST; có đúng 8 service theo bounded context. Mỗi service sở hữu dữ liệu của mình.”                                                                                                   |
| 2   | `git check-ignore .env`; `git ls-files -- .env .env.example`; `git log --all --oneline -- .env`; mở đúng branch/history GitHub | “.env giữ secret local; Git theo dõi template. Ignore không tự xóa file đã tracked hoặc lịch sử; kiểm local chưa thay cho kiểm GitHub.”                                                                |
| 3   | Mở gateway/index.cjs và router                                                                                                 | “Gateway kiểm schema/JWT/role, áp dụng rate limit Redis, gọi gRPC và chuẩn hóa lỗi. Ownership vẫn được kiểm ở service.”                                                                                |
| 4   | Mở proto, rpc-security, event-bus và topology                                                                                  | “Đồng bộ dùng gRPC khi cần kết quả ngay; bất đồng bộ dùng RabbitMQ cho profile/notification/release. Không dùng REST nội bộ hay thêm Kafka.”                                                           |
| 5   | `docker compose ps -a`; `docker compose config --quiet`; logs infra_init                                                       | “Compose chạy Gateway, 8 service, MongoDB/Redis/RabbitMQ. infra_init là job bootstrap exit 0, không phải service nghiệp vụ thứ 9.”                                                                     |
| 6   | GET /health, /ready, /health/services                                                                                          | “Health là tiến trình; ready kiểm dependencies. Inventory có 12 thành phần vận hành, không tính bootstrap job; dependency lỗi phải trả 503 ở readiness.”                                               |
| 7   | RabbitMQ CLI bên dưới; register → profile, notification                                                                        | “Ghi DB và outbox cùng transaction; publish confirm; consumer inbox chống trùng và ACK sau commit. Có retry 1/5/15 giây rồi DLQ. Queue rỗng có thể vì đã ACK; recovery/redelivery cần evidence riêng.” |
| 8   | URL mọi request là Gateway, xem cột PORTS; `docker compose port auth_service 50051`                                            | “gRPC không publish ra host. Gateway tự đặt internal metadata, service kiểm secret/peer allowlist; không tin role/ID tự khai từ client.”                                                               |
| 9   | Customer Register ba trường rồi login                                                                                          | “Server tạo Account ACTIVE và cấp cid/ID. Profile tạo qua account.registered, có thể tạm PROFILE_NOT_READY; không đăng ký lại khi consumer đang chờ.”                                                  |
| 10  | Login email/password →200/token; sai password →401                                                                             | “Mật khẩu kiểm bằng Argon2id, tài khoản phải ACTIVE; JWT có sub/role/issuer/audience/expiry. Không trả hash/key.”                                                                                      |
| 11  | C_TOKEN GET /customers/CID; C2_TOKEN thử cùng ID                                                                       | “Token hợp lệ chưa đủ: service kiểm đúng chủ hồ sơ; khác chủ bị 403.”                                                                                                                                  |
| 12  | D_TOKEN hoặc ADMIN GET /drivers/DID; khách xem snapshot qua Booking                                                      | “Hồ sơ riêng và license chỉ owner/ADMIN. Nearby/Trip chỉ trả public snapshot, không lộ giấy phép.”                                                                                                     |
| 13 | A_TOKEN GET /admin/drivers/nearby?latitude=10.8&longitude=106.7&page=1&limit=2 | “ADMIN tra vị trí cuối cùng trong1 km; bộ mẫu3 gần và2 xa. CUSTOMER/dispatch mới yêu cầu online và vị trí đã lưu hợp lệ (không giới hạn tuổi trong demo).” |
| 14 | A_TOKEN GET /admin/bookings?cid=c01&page=1&limit=2, rồi page=2; không lọc ngày/status | “Liệt kê cả lịch sử cũ và Booking mới của riêng c01, mới nhất trước. totalItems là tổng của khách được chọn; không phải toàn hệ thống. Phiếu không bắt buộc ADMIN, đây là vai trò chọn cho buổi demo.” |
| 15  | Create b01 body A→B →201/SEARCHING, chưa Trip                                                                                  | “Server đọc tọa độ DB, tự gán BIKE và chụp snapshot khoảng cách/giá. Không nhận amount/cid/vehicleType tự chọn.”                                                                                |
| 16  | Poll invitation đúng Booking rồi ACCEPT khi còn PENDING                                                                              | “Mỗi Booking mời tuần tự, offer không hết hạn trong demo, tối đa 5 ứng viên ban đầu. Reserve Driver và tạo/activate Trip trước khi hoàn tất phân công; DB unique chống nhận hai chuyến.”                                |
| 17  | ARRIVED→IN_PROGRESS→location B→COMPLETED                                                                                       | “Không bỏ qua hoặc lùi trạng thái. Driver phải là người được phân công. Cước dựa snapshot Booking, không lấy số tiền khách nhập.”                                                                      |
| 18  | Chuyến riêng: preview 0 VND, confirm có reason →CANCELED                                                                       | “Customer chỉ hủy SEARCHING hoặc Trip ASSIGNED/ARRIVED. Server kiểm lại lúc xác nhận, ghi người/lý do/thời gian, đóng offer hoặc release; không tạo Payment hủy.”                                      |
| 19  | Create Payment sau COMPLETED; callback HMAC đúng →COMPLETED; summary đã trả                                                    | “PENDING chưa phải thành công. Payment chỉ COMPLETED khi callback chữ ký/data khớp; Trip và Payment có state riêng, không giữ Driver bận để chờ trả tiền.”                                             |
| 20  | Review rating 1–5, duplicate409, rating6=400                                                                                   | “Chỉ Customer của Trip COMPLETED được đánh giá, một review mỗi Trip. Không cần Payment thành công mới cho review.”                                                                                     |
| 21  | Register Driver lần1→202 OTP, lần2 thêm code→201, license PATCH và Submit→PENDING                                              | “Lần đầu chỉ tạo challenge, chưa có Account. Lần hai kiểm OTP gắn dữ liệu đăng ký rồi mới tạo Account/did. Sau đó gửi hồ sơ PENDING mới đủ tiêu chí; OTP không phải GPLX hay biển số.”                 |
| 22  | ADMIN list PENDING/detail/APPROVED hoặc REJECTED có reason; Driver đọc notice                                                  | “Chỉ ADMIN quyết định trên hồ sơ PENDING; Driver không tự gửi approvalStatus qua PATCH. Event thông báo kết quả, không tự online.”                                                                     |
| 23  | Location A rồi availability true/false, GET xác nhận                                                                           | “Online cần account ACTIVE, hồ sơ APPROVED, xe và vị trí mới; offline ngừng nhận mới, không tự hủy Trip đang chạy.”                                                                                    |
| 24  | Mongo shell chỉ đọc passwordHash và licenseNumberEncrypted; mở crypto source                                                   | “Password dùng hash Argon2id, không giải mã. License dùng AES-256-GCM có IV/tag; key ngoài DB và không trả qua API. Pending OTP cũng không giữ password rõ.”                                           |
| 25  | Login JSON SQL string và NoSQL object bên dưới →400/401 theo bài                                                               | “Dùng schema/whitelist/scalar validation và query có cấu trúc; không ghép chuỗi query. MongoDB vẫn phải chống NoSQL injection.”                                                                        |
| 26  | PATCH name có script→400; browser harness riêng nếu được phép                                                                  | “Backend từ chối markup và trả JSON; khi hiển thị dùng textContent. Postman không thực thi browser nên chỉ response 400 chưa chứng minh toàn bộ browser evidence.”                                     |
| 27  | Tự sửa chữ ký hoặc payload role/sub rồi gửi JWT cũ →401                                                                        | “Decode payload không thay verify. Service kiểm HS256/signature/issuer/audience/expiry/sub; đổi role thành ADMIN không có quyền nếu chữ ký sai.”                                                       |
| 28  | C_TOKEN PATCH Driver; C2_TOKEN đọc Booking/Payment của khách khác →403                                                         | “401 là thiếu/sai token; 403 là token hợp lệ nhưng sai role/ownership. Không lấy ID trong body để cấp quyền.”                                                                                          |
| 29  | Cửa sổ sạch, 11 lần Send create cùng key/body, lần11=429/Retry-After; đo tải riêng nếu được phép                               | “Redis giữ counter/TTL; cả replay cũng tính request. 11 lần Send chứng minh rate limit, còn >1000 req/s phải có số đo thật từ tool tải; chưa đo thì không tự nói PASS phần tải.”                       |
| 30  | Replay b01/p01/callback; ADMIN list attempts                                                                                   | “Cùng key/payload trả cùng ID và snapshot, khác payload409. Callback xác minh signature trước kiểm duplicate; event cũ đúng trả duplicate=true, kết quả trái ngược bị từ chối; không double charge.”   |

Không học thuộc chữ PASS: chỉ nói kết quả thực tế đã hiện. Các phép đo tải, broker recovery/DLQ hoặc browser test chưa chạy phải ghi NOT_RUN/BLOCKED đúng phạm vi.

## 10. Những lệnh và payload phụ để hiện bằng chứng

RabbitMQ (vhost mặc định cab, thay nếu local đã cấu hình khác):

```bash
docker compose exec -T rabbitmq rabbitmqctl list_exchanges -p cab name type durable
docker compose exec -T rabbitmq rabbitmqctl list_bindings -p cab source_name destination_name routing_key
docker compose exec -T rabbitmq rabbitmqctl list_queues -p cab name messages_ready messages_unacknowledged consumers
```

SQL/NoSQL test tại POST login, No Auth:

```json
{ "email": "' OR 1=1 --", "password": "quang123" }
```

```json
{ "email": { "$ne": null }, "password": "quang123" }
```

XSS PATCH Customer me, C_TOKEN:

```json
{ "name": "<script>alert(1)</script>" }
```

Mục 24: dùng owner auth, tự nhập password được prompt từ cấu hình local, không chiếu .env:

```bash
docker compose exec mongo mongosh --host 127.0.0.1 --username cab_auth --authenticationDatabase admin --password
```

```javascript
use auth_db
db.accounts.findOne({email:"cus01@gmail.com"},{_id:0,email:1,passwordHash:1})
exit
```

Owner Driver:

```bash
docker compose exec mongo mongosh --host 127.0.0.1 --username cab_driver --authenticationDatabase admin --password
```

```javascript
use driver_db
db.driver_profiles.findOne({did:"DID_THAT_TU_RESPONSE"},{_id:0,did:1,licenseNumberEncrypted:1})
db.demo_locations.find()
exit
```

Username/DB theo .env.example; nếu đã đổi thì dùng giá trị local tương ứng. Có thể đọc demo_locations trong booking_db với cab_booking để chứng minh A/B thuộc Booking owner. Chỉ đọc, không sửa timestamp hay state để làm bài PASS.

Mục 29: trước khi thử, chờ ít nhất 60 giây không create Booking bằng account đó; dùng key rate01 và body A→B, tự Send 11 lần trong 60 giây. Không xóa Redis counter để làm sạch bài. Sau bài, hủy Booking nếu còn SEARCHING. Nếu được phép đo tải riêng: `node --env-file=.env scripts/rate-load.cjs`, quan sát completedRequestsPerSecond thực và tài nguyên bằng `docker stats`; không dùng tool này thay phần Postman nhập tay.

Nếu lỗi: `docker compose logs --tail=80 gateway auth_service driver_service booking_service trip_service payment_service`. Không down -v, reset Git, sửa assertions hoặc sửa dữ liệu để che lỗi. Token/ID/key/response giữ trong sổ local; không chia sẻ secret.
