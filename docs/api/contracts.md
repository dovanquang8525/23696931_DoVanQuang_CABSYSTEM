# Quy ước hợp đồng CAB MVP

**ID công khai hiện hành:** cid=c29, did=d01, aid=a01, bid=b01, tid=t01, pid=p01, nid=n01, rid=r01; thêm vid cho Vehicle, iid cho Invitation và oid cho OTP challenge. API/URL dùng các mã ngắn do server cấp; cid/did chính là ID Customer/Driver, không còn customerId/driverId hay accountId ObjectId trong JSON công khai. MongoDB _id và JWT sub là định danh kỹ thuật nội bộ, không nhập vào URL. ADMIN cũng có aid; không tự nhập ID khi Register.

**Validation demo cập nhật 28/10/2026:** Password là String không rỗng (ít nhất 1 ký tự, ví dụ "123" hoặc "a"), không trim và không yêu cầu độ phức tạp; Phone là String không rỗng sau trim (ví dụ "0123", "123", "abc123"), giữ số 0 đầu và vẫn unique. Email giữ định dạng cơ bản. Chỉ áp dụng cho học tập/demo local; không phải chính sách production. Argon2id, JWT, role/ownership và OTP Driver giữ nguyên.

## Hiện hành — đăng ký hai bước và vị trí từ DB (Identity v3)

- Register Customer chỉ nhận email/password/phone, trả 201 gồm aid/role/cid, không token hoặc profileStatus. Login riêng trả accessToken và account tối giản, không status/tokenType/expiresAt. Auth cấp cid bằng counter MongoDB trong cùng transaction; không nhận cid/did/role/name từ client. ID ObjectId/JWT sub/ownership không đổi.
- Register Driver nhận cùng ba trường + plateNumber. Lần đầu trả 202 `{status:OTP_REQUIRED,oid,expiresAt,mockCode?}`, chưa có Account. Lần hai giữ nguyên thông tin, thêm code 6 số; server tra challenge theo phone, kiểm HMAC gắn email/phone/password/plate và xác minh OTP, rồi transaction consume OTP + cấp did + insert Account/outbox. Không cần client nhập oid. Không lưu password rõ trong pending registration; chỉ Argon2id hash và HMAC request binding. Giữ cooldown 60 giây, expiry 5 phút, sai tối đa 5 lần, rate limit OTP ở cả hai bước.
- Account Driver hoàn tất OTP vẫn là profile DRAFT. Driver bổ sung licenseNumber (giấy phép demo), rồi Submit để tạo xe BIKE từ plate đã nhập và chuyển PENDING. Plate được kiểm unique ở Driver aggregate lúc tạo/upsert Vehicle; plate trùng khi Submit trả 409. Model BIKE/color Khong ro là giá trị demo có thể sửa bằng API Vehicle hiện có. Không thêm sự kiện hoặc service mới.
- A=(10.8,106.7), B=(10.81,106.71) là fixture trong demo_locations của booking_db, driver_db và trip_db, được upsert chỉ khi chưa tồn tại lúc service startup. Mỗi service chỉ đọc DB của mình. Không overwrite điểm mẫu đã chỉnh và không giả đây là GPS/bản đồ thật.
- Booking nhận `{pickupCode:A,destinationCode:B}` (giá trị JSON là string), hoặc cặp coordinates; không trộn hai dạng. Hash idempotency dùng mã đã nhập, snapshot giữ tọa độ/cước cũ ngay cả khi preset sau này thay đổi. Driver/Trip location nhận `{locationCode:A}` thay coordinates; Nearby nhận query locationCode=A hoặc latitude/longitude. Vẫn kiểm tuổi vị trí 120 giây, trạng thái Trip, khoảng cách 1 km và fare snapshot.
- REST dùng name, login dùng email; password vẫn ít nhất 1 ký tự. Không xóa DB trong lần chỉnh này. Collection cũ vẫn OUTDATED; hướng dẫn nhập tay 30 mục hiện hành ở docs/MANUAL_POSTMAN_30.md.

Các quyết định Identity v1/v2 cũ được lưu trong checkpoint và IDENTITY_V2_DECISION.md; không dùng body đăng ký hoặc ObjectId URL của các bản đó cho API hiện hành.

## 1. Cổng vào và phạm vi

ADMIN tra cứu Customer qua GET `/api/v1/admin/customers`, dùng JWT ADMIN và phân trang. Hồ sơ cũ đã được backfill cid/did/aid trong migration có sao lưu; giữ các mã đã cấp. Các read API dùng mã ngắn thật, không trả ObjectId công khai. Bootstrap sửa Admin cũ là công cụ local `seed.cjs --admin-only --repair-admin --password ...`, chỉ tác động đúng Admin seed ACTIVE sau kiểm tra ID/seedTag/phone/role/email.

REST nghiệp vụ dùng `http://localhost:3000/api/v1`; health Gateway dùng root `http://localhost:3000`. Địa chỉ là cấu hình local mục tiêu, chưa có hệ thống chạy. Không công khai REST/gRPC nghiệp vụ tại các service. Gateway gọi đúng RPC trong rest-grpc-mapping.md; RPC nội bộ không tự động trở thành route public.

Profile Customer/Driver thuộc service riêng; Account ACTIVE có thể đăng nhập khi profile đang chờ event. Register hoàn tất trả 201 chỉ gồm aid/role/cid hoặc did, không token hoặc profileStatus. Customer không cần OTP; Driver chỉ chờ xác thực ở bước 202 OTP_REQUIRED. Login riêng trả accessToken và account tối giản (aid, role, cid/did nếu có), không tokenType/expiresAt/status. JWT vẫn có thời hạn nội bộ. Consumer upsert profile, mục tiêu 5 giây khi khỏe. API phụ thuộc profile chưa có trả 503 PROFILE_NOT_READY.

Đây là hợp đồng triển khai, không có dữ liệu DB/secret thật. Nguồn hiện hành là [SRS](../SRS.md), [Bounded Context](../Bounded-Context.md) và [Architecture](../ARCHITECTURE.md), không phải đường dẫn reference/ hoặc tài liệu legacy; bộ hợp đồng cụ thể hóa đường dẫn, tên field/RPC và mã phản hồi, không tự nhận đã sửa tài liệu nguồn hoặc code.

## 2. Metadata gRPC và quyền

Metadata chung: authorization Bearer JWT khi có người dùng; x-service-name; x-internal-secret; x-correlation-id. Gateway loại bỏ header internal identity từ client rồi tự đặt peer identity. Provider kiểm secret riêng theo caller và allowlist trong rpc-access.json. Internal secret là giới hạn demo local trên network riêng, không thay cho mTLS trong môi trường Internet.

Auth public Register/Login/RequestOtp/VerifyOtp chỉ chấp nhận peer Gateway, không yêu cầu JWT người dùng. Health Check và worker dùng peer kỹ thuật; callback dùng peer Gateway và chữ ký mock, không dùng token CUSTOMER. Các service nghiệp vụ verify JWT/signature/HS256/iss=cab-auth/aud=cab-api/exp/sub, kiểm role và ownership; Account ACTIVE qua Auth.GetAccountAccess. Auth không gọi lại chính RPC đó để tự xác thực trạng thái.

GetAccountAccess là RPC kỹ thuật theo allowlist: caller có thể hỏi trạng thái ứng viên Driver khác JWT sub để lọc nearby. RPC này không cấp quyền đọc dữ liệu nghiệp vụ ngoài caller role/ownership. Service gọi đi phải giữ JWT người dùng khi cần delegation; worker dùng quyền kỹ thuật hẹp, không giả Customer bằng cách tự đặt x-user-id/x-role.

Mỗi RPC tối đa 5 giây, child dùng budget còn lại của parent. Timeout write chưa chứng minh không ghi: đọc lại theo key/operation/bid và tiếp tục cùng operation. Không retry mù create/write bằng ID mới. Client không đổi key chỉ vì nhận 504.

## 3. Message presence và chuyển đổi REST/protobuf

| Kiểu dữ liệu | Quy ước |
| --- | --- |
| ID nghiệp vụ | String mã ngắn: cid/did/aid/bid/tid/pid/nid/rid/vid/iid/oid. Mongo _id và JWT sub giữ ObjectId nội bộ; eventId/correlationId/requestId là mã kỹ thuật, không phải ID tài nguyên nhập vào URL. |
| Thời gian | RFC3339 UTC string; callback timestamp là Unix seconds integer |
| Tên field | Protobuf snake_case → REST camelCase; ngoại lệ full_name → name theo Identity v2; không trả object protobuf nguyên trạng |
| Tiền | int64 protobuf → JSON integer trong miền an toàn <=10^12; không trả long string cho REST |
| fare_amount | optional int64 absent → fareAmount:null; không bật defaults làm thành 0 |
| Resource lồng chưa có/lỗi | Omit trip/paymentSummary và dùng tripAvailability/paymentAvailability; không dùng null để trộn NOT_CREATED và UNAVAILABLE |
| Enum unspecified | Giá trị zero phục vụ wire compatibility; service reject khi field nghiệp vụ bắt buộc, không trả ra REST |
| PATCH | optional scalar/message presence phân biệt không gửi với giá trị rỗng; không bật tùy chọn loader làm mất presence |
| Dữ liệu nhạy cảm | Không trả passwordHash/codeHash/key. licenseNumber chỉ route owner/ADMIN; public Driver snapshot không có giấy phép |

Enum BookingDetails.TripAvailability: TRIP_AVAILABLE→AVAILABLE, TRIP_UNAVAILABLE→UNAVAILABLE, NOT_CREATED→NOT_CREATED. PaymentAvailability: PAYMENT_AVAILABLE→AVAILABLE, PAYMENT_UNAVAILABLE→UNAVAILABLE, NOT_APPLICABLE→NOT_APPLICABLE. Các enum trạng thái còn lại dùng tên như REST; UNSPECIFIED không hợp lệ cho dữ liệu yêu cầu bắt buộc.

Query page mặc định 1, limit 10, limit 1–50; số nguyên, không âm hoặc thập phân. Gateway áp dụng default trước gọi gRPC; service kiểm lại, không coi page=0 là tự do truy vấn tất cả. Sort Booking createdAt giảm rồi bid giảm; nearby distanceKm tăng rồi did tăng.

## 4. Validation và lỗi

Unknown input field bị từ chối 400, không silently drop. Phải kiểm min/max/enum/presence ở service vì protobuf không thực hiện các ràng buộc JSON Schema. Text được trim trừ password; whitespace-only sau trim bị từ chối dù cấu trúc JSON Schema có thể chấp nhận. Demo dùng quy tắc bảo thủ từ chối dấu < và > trong các field plain text để không nhận markup; khi hiển thị vẫn dùng textContent/escape đúng ngữ cảnh, không coi schema là bằng chứng browser không chạy script.

Coordinates giới hạn latitude [-90,90], longitude [-180,180]; pickup khác destination là điều kiện cross-field do server kiểm. Không nhận cid/did tự chọn owner, amount hoặc vehicleType trong body tạo Booking/Payment. Argon2id/OTP hash/mã hóa licenseNumber và quản lý khóa nằm trong triển khai theo SRS, không phải định dạng plaintext lưu DB vì API nhận plaintext hợp lệ.

| gRPC / lỗi miền | HTTP | Domain code tiêu biểu |
| --- | --- | --- |
| INVALID_ARGUMENT | 400 | INVALID_INPUT, INVALID_CALLBACK_DATA |
| UNAUTHENTICATED | 401 | INVALID_TOKEN, INVALID_CALLBACK_SIGNATURE |
| PERMISSION_DENIED | 403 | FORBIDDEN, ACCOUNT_DISABLED |
| NOT_FOUND | 404 | NOT_FOUND |
| ALREADY_EXISTS / ABORTED / xung đột trạng thái | 409 | DUPLICATE_RESOURCE, INVALID_STATE, IDEMPOTENCY_CONFLICT, ASSIGNMENT_IN_PROGRESS |
| RESOURCE_EXHAUSTED do rate limit | 429 | RATE_LIMITED |
| UNAVAILABLE | 503 | DEPENDENCY_UNAVAILABLE, PROFILE_NOT_READY, ASSIGNMENT_IN_PROGRESS |
| DEADLINE_EXCEEDED | 504 | DEADLINE_EXCEEDED |
| Lỗi không dự kiến | 500 | INTERNAL_ERROR |

Service dùng status chuẩn và trailing metadata cab-error-code; Gateway ánh xạ thành {code,message,requestId}. Không trả stack trace, secret hoặc query DB. 401 khi token sai/hết hạn hoặc credential login sai; 403 khi token hợp lệ nhưng sai role/ownership. Chữ ký callback sai dùng 401 riêng, không yêu cầu token người dùng. Health 503 trả body readiness/service health theo schema riêng, không Error.

## 5. Idempotency và cạnh tranh

Idempotency-Key là ASCII hiển thị không khoảng trắng 1–128 ký tự, bắt buộc tạo Booking/Payment và retry Payment. Gateway chuyển key thành field idempotency_key, không lấy từ body JSON. Scope lưu tại DB: (cid,key) cho Booking; (tid,key) cho Payment, đồng thời kiểm caller ownership. Hash payload chuẩn hóa sau validation; với Payment bao gồm trip và failedPid nếu retry. Giữ record suốt vòng đời dữ liệu demo.

Create mới trả 201; replay cùng key và payload trả 200 với body kết quả gốc đã lưu, cùng resource ID, không tạo thao tác mới. Lưu response snapshot cùng idempotency record cục bộ để đáp ứng mục chấm trả kết quả cũ; endpoint GET cung cấp trạng thái hiện tại nếu resource đã từ SEARCHING/PENDING chuyển tiếp. HTTP status của replay là 200 thay vì 201. Cùng key khác payload trả 409. Replay key của retry phải được tra cứu trước kiểm điều kiện attempt còn FAILED/còn lượt, tránh từ chối thao tác đã thành công trước đó.

Chỉ endpoint CreatePayment tạo attempt 1. Khi attempt FAILED, RetryPayment tham chiếu attempt FAILED mới nhất và tạo attempt 2/3 bằng key mới. Unique (tid,attemptNumber), (tid,idempotencyKey), referenceCode và partial unique tid khi PENDING/COMPLETED bảo vệ concurrency; không chỉ kiểm tra bằng if/count trong ứng dụng. Key mới sau COMPLETED vẫn 409. FAILED/PENDING không đổi Trip COMPLETED và không giữ Driver bận.

State actions arrival/start/completion/cancel và invitation response có tính lặp theo đối tượng/kết quả đã ghi, không tạo timestamps/event trùng. Trái quyết định cuối hoặc sai thứ tự 409. CANCEL reason mới sau đã hủy không sửa kết quả cũ. PUT location là cập nhật vị trí; không phải cơ chế tạo Trip hoặc đổi giá.

## 6. Callback mock

Callback body đúng MockCallback trong 07-payments.yaml. Ký trên bytes gốc UTF-8, không ký object đã parse rồi serialize lại:

```text
signedBytes = ASCII(decimalUnixTimestamp) + byte(0x0A) + rawBodyBytes
X-Mock-Signature = "sha256=" + lowercaseHex(HMAC_SHA256(mockSecret, signedBytes))
X-Mock-Timestamp = decimalUnixTimestamp
```

Header timestamp phải bằng body.timestamp. Secret chỉ có ở mock adapter/công cụ demo và payment_service, không ở Gateway, client Customer, file YAML/proto/event hoặc Postman được commit. Gateway giữ raw body, signature và timestamp rồi gọi HandleMockCallback(raw_body,signature,timestamp); Payment so chữ ký theo cách constant-time trước xử lý payload/duplicate.

Event mới lệch giờ server quá ±300 giây bị từ chối 400; payload amount/referenceCode/pid/VND phải khớp attempt đã lưu. Status chỉ COMPLETED/FAILED. Callback duplicate đã xử lý chỉ được trả 200/duplicate=true sau xác minh signature hợp lệ và payload cùng giao dịch/kết quả; có thể trả kết quả cũ dù timestamp cũ để bảo đảm replay an toàn. Cùng eventId khác payload, hoặc kết quả cuối trái ngược, trả 409; không đổi state. Sai signature luôn 401, kể cả eventId đã biết.

Một callback bị chậm chưa từng xử lý có thể được script mock ký mới với timestamp/eventId mới, cùng payment/reference/amount; không tạo Payment khác. Lưu eventId/payload hash hoặc dữ liệu tương đương để phát hiện duplicate/conflict. Mock SUCCESS→COMPLETED, FAILURE→FAILED; DELAYED/không giao callback giữ PENDING. Không mở API Customer tự gửi result thành công hoặc secret. Việc chạy mock/công cụ ký là bước triển khai/kiểm thử sau này, gói này chưa có provider đang chạy.

## 7. Phối hợp phân công và event

Booking coordinator dùng operation bền vững: khóa ACCEPT hợp lệ→ReserveDriver→CreateTrip chưa activated→ConfirmReservation→lưu COMMIT/Booking ASSIGNED→Trip ActivateAssignment xác minh GetAssignmentDecision→đánh dấu DONE/phát booking.assigned. Trip chưa assignmentConfirmed không cho API công khai thao tác. GetAssignmentDecision chỉ đọc Booking, không gọi lại Trip/Payment gây đệ quy.

Sau timeout CreateTrip, một lần GetTripByBooking NOT_FOUND chưa chứng minh request cũ đã dừng. Gọi lại cùng operationId/bid để lấy kết quả idempotent; không release/mời người khác khi chưa rõ. Chỉ bù reservation khi chắc chưa có Trip/COMMIT và không còn write đang chạy. Đã có Trip thì ưu tiên hoàn tất cùng phân công; không xóa Trip hoặc bỏ unique bid để thử Driver khác. Không thêm nghiệp vụ hệ thống tự hủy trong gói hợp đồng này.

Envelope event và payload đều strict theo events.schema.json. Ngoài JSON Schema, consumer/producer kiểm aggregateId bằng ID entity trong payload; aggregateVersion ở payload Trip phải khớp envelope; eventType/routing key phải trùng. Schema không thể tự so hai field với nhau, các kiểm tra này có trong validate_contracts.py cho mẫu và cần kiểm runtime.

Ghi outbox cùng transaction cục bộ; publisher persistent/confirm; inbox unique (consumer,eventId) cùng update rồi ACK. Redelivery dùng eventId cũ; retry 1/5/15 giây, tối đa 3 lần sau lần đầu rồi DLQ; replay DLQ cần giữ ID và log. trip.completed/trip.canceled chỉ release đúng tid, không xóa phân công mới; Booking không chuyển ngược trạng thái cuối. Không ép Rating publish/consume, không dùng event để tự thu tiền.

## 8. Trạng thái view và giới hạn kiểm chứng

Payment.status chỉ PENDING/COMPLETED/FAILED. PaymentSummary.latestStatus=NOT_STARTED là trạng thái view khi chưa có attempt, không phải trạng thái Payment lưu DB. BookingDetails availability là trạng thái tổng hợp, không phải Booking.status mới. Nếu Payment dependency lỗi, paymentAvailability=UNAVAILABLE và omit paymentSummary; không giả FAILED/NOT_STARTED hoặc amount=0. ETA không áp dụng sau bắt đầu/kết thúc Trip; ARRIVED có minutes=0 khi áp dụng.

Rate limit tại Gateway/Redis theo SRS; service không dùng Redis thay MongoDB để chống double charge. /ready kiểm 8 service và phụ thuộc; /health/services có 12 tên thành phần không trùng, mỗi tên đúng một lần. Đây là điều kiện runtime ngoài giới hạn array schema.

Trước khi triển khai, Codex phải khảo sát repository, bảo toàn code, dựng .env.example/.gitignore/secrets, Compose/network/volumes/healthcheck, 8 DB user/kết nối/index/seed và gRPC/RabbitMQ theo dependency. Gói này chưa tạo Docker Compose hoặc backend và không yêu cầu người dùng tự tạo MongoDB database. P01–P30 sẽ phân bổ các việc đó sau khi thiết kế/contracts được duyệt, không thêm mục chấm 31.
