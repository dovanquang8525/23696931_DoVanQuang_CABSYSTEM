# CAB System — Test case Giai đoạn 6

Ngày 27/10/2026. Căn cứ SRS 2.0, Bounded Context 3.0 và 10 YAML Giai đoạn 5.

Có 103 test case chính, tương ứng AC01–AC105 trừ AC57–AC58 ngoài phạm vi tiền mặt. Mỗi case có thể chứa nhiều biến thể; khi chạy phải ghi từng biến thể TCxx-01/02… độc lập, chỉ kết luận case chính PASS khi tất cả biến thể áp dụng đã đạt. Đây là kế hoạch kiểm thử, không phải 103 kết quả đã chạy.

Backend/hạ tầng chưa thiết lập: tất cả case thực thi hiện BLOCKED, actual/evidence để trống. Với kiểm tra repository chưa được cung cấp, cũng BLOCKED. Không dùng kết quả kiểm định contract hoặc giả lập script để ghi PASS nghiệp vụ.

103 case không có nghĩa Collection tự động thực hiện toàn bộ. Xem [coverage.md](coverage.md) để biết request Postman hỗ trợ AC nào; concurrency, DB/log/network/load/harness và fault injection có bước riêng. Polling collection chỉ quan sát dữ liệu đến hạn hữu hạn, không tự chứng minh thời gian đồng bộ server chính xác 5 giây.

## Quy ước ghi kết quả

PASS: chạy đúng fixture, actual khớp expected và có evidence. FAIL: đủ dependency nhưng actual sai expected. BLOCKED: thiếu môi trường/fixture/dependency hoặc chưa thể chứng minh phần bắt buộc. NOT_RUN: đủ điều kiện nhưng chưa chạy. Không gộp các HTTP lỗi khác nhau thành một nhóm thành công.

Mỗi lần thử lưu runId, commit/version, môi trường, thời điểm, fixture IDs, request/command, status và response đã che token/secret, actual, evidence. Tạo bản sao test-cases.json để ghi kết quả; không sửa baseline thành báo cáo PASS hàng loạt.

## TC01 — AC01

- **Liên kết:** FR01 / UC01.
- **Loại / công cụ:** positive / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Số mới, password 8–64 ký tự; profile consumer khỏe.
- **Bước thực hiện:** POST /auth/register role CUSTOMER; login; poll GET /customers/me; đối chiếu một Account và một CustomerProfile, không DriverProfile..
- **Kết quả mong đợi:** Tạo Account ACTIVE role CUSTOMER; profileStatus=PENDING khi chưa đồng bộ; trong 5 giây khi khỏe có một CustomerProfile liên kết và không có DriverProfile.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC02 — AC02

- **Liên kết:** FR01, FR43 / UC01.
- **Loại / công cụ:** positive / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** Phone Driver mới, OTP mock verified/chưa dùng.
- **Bước thực hiện:** Register DRIVER kèm otpId; login; poll profile DRAFT/offline; kiểm consumedAt tại Auth và một DriverProfile..
- **Kết quả mong đợi:** Tạo Account ACTIVE role DRIVER, tiêu thụ OTP cục bộ; trong 5 giây khi khỏe có một DriverProfile DRAFT/offline. Trả trạng thái profile chờ nếu consumer chưa hoàn tất.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC03 — AC03

- **Liên kết:** FR01 / UC01.
- **Loại / công cụ:** negative/boundary / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Tách dữ liệu từng lần; không dùng phone đã tồn tại cho mọi biến thể.
- **Bước thực hiện:** Thử thiếu phone; phone 9/11 số hoặc không bắt đầu 0; password 7/65 ký tự; phone trùng. Mỗi biến thể 400 hoặc 409 đúng lỗi, không có Account mới..
- **Kết quả mong đợi:** Từ chối đăng ký; không báo thành công hoặc tạo thêm tài khoản.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC04 — AC04

- **Liên kết:** FR01 / UC01.
- **Loại / công cụ:** security / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Phone mới hợp lệ để không bị lỗi duplicate che mất kiểm role.
- **Bước thực hiện:** Register ADMIN và role lạ; kỳ vọng 400, không tạo Account quyền cao..
- **Kết quả mong đợi:** Từ chối; không tạo tài khoản với vai trò yêu cầu.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC05 — AC05

- **Liên kết:** FR02 / UC02.
- **Loại / công cụ:** positive / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Seed CUSTOMER ACTIVE, credential local đúng.
- **Bước thực hiện:** POST /auth/login; kiểm 200, accessToken, tokenType Bearer, exp, Account role; dùng token GET /auth/me..
- **Kết quả mong đợi:** Trả JWT có thời hạn hiệu lực và thông tin tài khoản được phép hiển thị.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC06 — AC06

- **Liên kết:** FR02 / UC02.
- **Loại / công cụ:** negative / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Tài khoản ACTIVE, DISABLED và số chưa tồn tại được chuẩn bị riêng.
- **Bước thực hiện:** Login sai password; số chưa có; tài khoản DISABLED. Không có JWT, lỗi không tiết lộ sự tồn tại; ghi mã theo hợp đồng..
- **Kết quả mong đợi:** Không cấp JWT; lỗi đăng nhập không tiết lộ tài khoản có tồn tại hay không.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC07 — AC07

- **Liên kết:** FR03 / UC03.
- **Loại / công cụ:** positive / POSTMAN.
- **Tiền điều kiện và dữ liệu:** CUSTOMER đã có profile, token owner hợp lệ.
- **Bước thực hiện:** PATCH fullName/email hợp lệ rồi GET /customers/me; chỉ hai field thay đổi, ID/role/phone không đổi..
- **Kết quả mong đợi:** Lưu thay đổi và trả thông tin mới; vai trò, số điện thoại đăng nhập và trạng thái duyệt không đổi.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC08 — AC08

- **Liên kết:** FR03 / UC03.
- **Loại / công cụ:** security / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Token owner hợp lệ.
- **Bước thực hiện:** PATCH role, permissions, approvalStatus, phone/accountId từng biến thể; 400 unknown field, GET lại không đổi..
- **Kết quả mong đợi:** Từ chối cập nhật các trường này; không áp dụng thay đổi trái quyền.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC09 — AC09

- **Liên kết:** FR43 / UC12.
- **Loại / công cụ:** positive/boundary / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** OTP_MOCK_MODE=true, phone mới, ngoài cooldown.
- **Bước thực hiện:** Request OTP; kiểm 6 số và expiresAt 5 phút; sau cooldown xin mã mới; thử mã cũ thất bại, kiểm invalidatedAt/codeHash..
- **Kết quả mong đợi:** Tạo OTP 6 chữ số, hiệu lực 5 phút; mã mới vô hiệu mã cũ.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC10 — AC10

- **Liên kết:** FR43 / UC12.
- **Loại / công cụ:** negative/boundary / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Vừa RequestOtp cho phone mới.
- **Bước thực hiện:** Gửi RequestOtp lần nữa trước 60 giây; kỳ vọng 429/Retry-After, không tạo challenge mới. Sau 60 giây thử lại; không để IP counter che test per-phone..
- **Kết quả mong đợi:** Từ chối tạo mã mới; trả thông tin thời gian cần chờ.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC11 — AC11

- **Liên kết:** FR43 / UC12.
- **Loại / công cụ:** positive / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** OTP còn hạn, chưa sai 5 lần.
- **Bước thực hiện:** Verify đúng phone/code/otpId; Register đúng phone với otpId đó; kiểm verifiedAt và consumedAt; không dùng lần hai..
- **Kết quả mong đợi:** Ghi nhận xác minh thành công; bằng chứng đăng ký gắn đúng số điện thoại và mục đích, chỉ sử dụng một lần.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC12 — AC12

- **Liên kết:** FR43 / UC12.
- **Loại / công cụ:** negative/boundary / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** Challenge độc lập cho từng biến thể, không làm chung OTP đã bị khóa.
- **Bước thực hiện:** Chạy riêng sai mã; hết 5 phút; bị vô hiệu bởi mã mới; đã dùng đăng ký; 5 lần sai rồi thử mã đúng. Không verified; counter tăng đúng..
- **Kết quả mong đợi:** Không xác minh thành công. Mã sai tăng bộ đếm; sau 5 lần sai, mã đó không được tiếp tục xác minh.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC13 — AC13

- **Liên kết:** FR05 / UC13.
- **Loại / công cụ:** positive / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Driver DRAFT và Driver REJECTED độc lập.
- **Bước thực hiện:** PATCH fullName/licenseNumber hợp lệ; GET đúng owner; dữ liệu lưu, trạng thái vẫn DRAFT/REJECTED..
- **Kết quả mong đợi:** Lưu các trường hợp lệ; không tự chuyển hồ sơ sang `PENDING` hoặc `APPROVED`.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC14 — AC14

- **Liên kết:** FR05 / UC13.
- **Loại / công cụ:** negative / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Driver PENDING và APPROVED độc lập.
- **Bước thực hiện:** PATCH field xét duyệt; kỳ vọng 409 INVALID_STATE; GET không đổi, không nâng quyền..
- **Kết quả mong đợi:** Từ chối; tài xế vẫn được xem hồ sơ và kết quả duyệt.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC15 — AC15

- **Liên kết:** FR06 / UC14.
- **Loại / công cụ:** positive/negative / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** Driver chưa có xe, profile có quyền, plate demo chưa trùng.
- **Bước thực hiện:** PUT /drivers/me/vehicle plate/model/color; server BIKE/owner. Thử plate trùng hoặc thêm vehicleType CAR; không ghi sai..
- **Kết quả mong đợi:** Lưu xe thuộc tài xế; chỉ chấp nhận `BIKE`.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC16 — AC16

- **Liên kết:** FR06 / UC14.
- **Loại / công cụ:** boundary / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** Driver một Vehicle hiện tại, không bận.
- **Bước thực hiện:** PUT lại xe hợp lệ; kiểm một vehicleId/driverId duy nhất. Gửi hai PUT cạnh tranh và đếm Vehicle tại driver_db..
- **Kết quả mong đợi:** Sau khi thành công, tài xế có một xe BIKE isActive=true; không tạo thêm Vehicle cho cùng Driver trong MVP.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC17 — AC17

- **Liên kết:** FR06 / UC14.
- **Loại / công cụ:** negative / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** Driver đang giữ reservation hoặc Trip chưa kết thúc.
- **Bước thực hiện:** PUT đổi plate/model; kỳ vọng 409; snapshot Trip và Vehicle không đổi. Kiểm thêm race cập nhật xe/nhận chuyến bằng integration test..
- **Kết quả mong đợi:** Từ chối thay đổi; xe đã phân công cho trip giữ nguyên.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC18 — AC18

- **Liên kết:** FR44 / UC15.
- **Loại / công cụ:** positive / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Driver DRAFT/REJECTED đủ fullName/licenseNumber/BIKE.
- **Bước thực hiện:** POST submissions {}; kiểm PENDING, submittedAt; không coi DRAFT lúc Register là đã đạt mục 21..
- **Kết quả mong đợi:** Chuyển hồ sơ sang `PENDING` và lưu thời điểm gửi.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC19 — AC19

- **Liên kết:** FR44 / UC15.
- **Loại / công cụ:** negative / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Driver DRAFT thiếu license hoặc Vehicle; fixture độc lập cho từng thiếu sót.
- **Bước thực hiện:** POST submissions body {}; hồ sơ/xe chưa đủ là 409 INVALID_STATE và không chuyển PENDING. Trường input lạ là test validation riêng trả 400, không dùng 500/503 để thay lỗi nghiệp vụ..
- **Kết quả mong đợi:** Từ chối; trả các thông tin cần bổ sung; không chuyển `PENDING`.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC20 — AC20

- **Liên kết:** FR45 / UC22.
- **Loại / công cụ:** positive / POSTMAN+EVENT.
- **Tiền điều kiện và dữ liệu:** ADMIN token hợp lệ, Driver PENDING.
- **Bước thực hiện:** ADMIN GET /admin/drivers và GET /drivers/{id}; POST APPROVED; kiểm reviewedAt, không online; Driver poll thông báo approval_changed..
- **Kết quả mong đợi:** Chuyển `APPROVED`, lưu người xử lý và thời điểm; tạo thông báo kết quả; không tự bật online.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC21 — AC21

- **Liên kết:** FR45 / UC22.
- **Loại / công cụ:** positive/boundary / POSTMAN+EVENT.
- **Tiền điều kiện và dữ liệu:** Driver PENDING, ADMIN.
- **Bước thực hiện:** POST REJECTED với reason 1 và 300 ký tự sau trim trên fixture riêng; kiểm REJECTED, lý do, reviewer và Notification..
- **Kết quả mong đợi:** Chuyển `REJECTED`; lưu lý do 1–300 ký tự sau trim, người xử lý và thời điểm; tạo thông báo.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC22 — AC22

- **Liên kết:** FR45 / UC22.
- **Loại / công cụ:** negative / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Hồ sơ đã APPROVED/REJECTED hoặc reason rỗng.
- **Bước thực hiện:** Thử quyết định khi không PENDING (409); thử REJECTED thiếu/whitespace reason (400); giữ nguyên kết quả..
- **Kết quả mong đợi:** Không ghi quyết định duyệt mới; giữ kết quả đang có.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC23 — AC23

- **Liên kết:** FR07 / UC16.
- **Loại / công cụ:** positive / POSTMAN.
- **Tiền điều kiện và dữ liệu:** ACTIVE/APPROVED/BIKE/không thiếu vị trí; vị trí vừa refresh.
- **Bước thực hiện:** PUT location rồi availability isOnline=true; GET Driver xác nhận true, không tự tạo Trip..
- **Kết quả mong đợi:** Lưu `isOnline = true`.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC24 — AC24

- **Liên kết:** FR07 / UC16.
- **Loại / công cụ:** negative / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Fixture riêng: DRAFT/PENDING/REJECTED, không xe, vị trí stale, Account DISABLED.
- **Bước thực hiện:** Thử online với từng thiếu điều kiện; 409 cho điều kiện nghiệp vụ, 403 Account DISABLED; không online..
- **Kết quả mong đợi:** Từ chối và trả lý do; không bật online.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC25 — AC25

- **Liên kết:** FR07 / UC16.
- **Loại / công cụ:** positive / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Driver có Trip ASSIGNED/ARRIVED/IN_PROGRESS.
- **Bước thực hiện:** PUT isOnline=false; Trip vẫn trạng thái trước đó, không nhận thêm booking mới; vẫn thực hiện được Trip đã phân công..
- **Kết quả mong đợi:** Lưu `isOnline = false`; không nhận chuyến mới, nhưng trip đã nhận không bị tự hủy.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC26 — AC26

- **Liên kết:** FR08 / UC17.
- **Loại / công cụ:** boundary / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Driver token hợp lệ.
- **Bước thực hiện:** PUT location ở [-90,90]/[-180,180] gồm biên; kiểm timestamp server và online không tự đổi. Dùng fixture khác cho tọa độ cực để không phá Happy path..
- **Kết quả mong đợi:** Lưu vị trí mới và thời điểm server nhận; không tự thay đổi trạng thái online.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC27 — AC27

- **Liên kết:** FR08 / UC17.
- **Loại / công cụ:** negative/boundary / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Đã lưu một vị trí hợp lệ.
- **Bước thực hiện:** Gửi thiếu latitude; latitude 90.0001; longitude -180.0001; string thay number. 400, GET giữ vị trí và timestamp cũ..
- **Kết quả mong đợi:** Từ chối; vị trí hợp lệ trước đó và thời điểm của nó không bị ghi đè.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC28 — AC28

- **Liên kết:** FR46 / UC05.
- **Loại / công cụ:** positive/boundary / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** >=5 Driver khác điều kiện, vị trí mới; tính fixture Haversine 0.999/1.001 km.
- **Bước thực hiện:** GET nearby; chỉ đủ điều kiện và <=1 km, không license/hash. Kiểm Driver stale/busy/offline/rejected ngoài danh sách..
- **Kết quả mong đợi:** Chỉ trả tài xế đủ điều kiện, không bận, vị trí không quá 120 giây và khoảng cách không quá 1 km; không trả dữ liệu nhạy cảm.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC29 — AC29

- **Liên kết:** FR46 / UC05.
- **Loại / công cụ:** boundary / POSTMAN.
- **Tiền điều kiện và dữ liệu:** >=3 Driver eligible; hai vị trí trùng để tie distance; ID biết trước.
- **Bước thực hiện:** GET nearby page 1/2 limit 1/2; ghép danh sách và so distance tăng, tie driverId tăng; không đảo thứ tự trên cùng snapshot..
- **Kết quả mong đợi:** Sắp xếp khoảng cách tăng dần, sau đó `driverId` tăng dần; phân trang theo thứ tự này.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC30 — AC30

- **Liên kết:** FR33, FR46 / UC05, UC10.
- **Loại / công cụ:** negative/boundary/empty / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Seed >=5 Booking của Customer; eligible Driver đủ phân trang.
- **Bước thực hiện:** Thử mặc định; page=1, limit=1/50; page=0/1.5, limit=0/51/string; trang xa không có dữ liệu. Đúng 400 hoặc items=[] theo từng input..
- **Kết quả mong đợi:** Mặc định `page = 1`, `limit = 10`; chỉ nhận page nguyên ≥ 1 và limit nguyên từ 1–50. Input sai bị từ chối; trang không có dữ liệu trả danh sách trống.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC31 — AC31

- **Liên kết:** FR09 / UC06.
- **Loại / công cụ:** positive/negative / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Customer profile ready, coords khác nhau, key mới.
- **Bước thực hiện:** POST Booking tọa độ HCM demo; 201 SEARCHING/BIKE, snapshot giá. Thử tọa độ trùng, vehicleType/amount/client owner hoặc tọa độ sai; 400, không ghi..
- **Kết quả mong đợi:** Tạo một Booking `SEARCHING`; server lưu khoảng cách Haversine và thông số giá áp dụng.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC32 — AC32

- **Liên kết:** FR09 / UC06.
- **Loại / công cụ:** replay / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** Booking đã tạo, giữ nguyên key/body/snapshot phản hồi gốc.
- **Bước thực hiện:** Replay key/body ->200 cùng snapshot/ID; cùng key đổi destination hợp lệ ->409 IDEMPOTENCY_CONFLICT; đếm Booking, không mở tìm lại..
- **Kết quả mong đợi:** Trả booking đã tạo; không tạo booking hoặc vòng tìm kiếm mới. Cùng khóa nhưng khác dữ liệu bị từ chối xung đột.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC33 — AC33

- **Liên kết:** FR10–FR11 / UC06.
- **Loại / công cụ:** positive/boundary / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** >=6 Driver eligible ở khoảng cách biết trước, thêm Driver bị loại.
- **Bước thực hiện:** Tạo Booking, kiểm candidateDriverIds tối đa 5 theo distance/driverId; mọi candidate đều qua điều kiện, không bỏ sót lọc ACTIVE..
- **Kết quả mong đợi:** Chỉ chọn tài xế đủ điều kiện trong bán kính 1 km; sắp xếp khoảng cách tăng dần, sau đó `driverId` tăng dần; lưu tối đa 5 ứng viên ban đầu.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC34 — AC34

- **Liên kết:** FR12 / UC06.
- **Loại / công cụ:** positive / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** Booking SEARCHING, ứng viên còn.
- **Bước thực hiện:** Poll lời mời; kiểm expiresAt 30 giây, chỉ một invitation PENDING. Đếm DB khi worker chuyển ứng viên..
- **Kết quả mong đợi:** Tạo một lời mời `PENDING`, hiệu lực 30 giây theo thời gian server; booking không có hai lời mời còn hiệu lực.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC35 — AC35

- **Liên kết:** FR13 / UC18.
- **Loại / công cụ:** boundary / POSTMAN+INTEGRATION.
- **Tiền điều kiện và dữ liệu:** Driver đúng, invitation trước expiry; fixture clock cho biên chính xác.
- **Bước thực hiện:** ACCEPT trước expiresAt thành công; sai Driver 403; tại/sau expiresAt 409. Postman chờ >30 giây kiểm muộn, integration clock kiểm đúng thời điểm biên..
- **Kết quả mong đợi:** Tiếp nhận chấp nhận hoặc từ chối. Phản hồi tại hoặc sau `expiresAt` không được dùng để phân công.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC36 — AC36

- **Liên kết:** FR14 / UC06, UC18.
- **Loại / công cụ:** positive / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** Invitation hợp lệ, Driver không bận.
- **Bước thực hiện:** ACCEPT; kiểm Booking ASSIGNED, Trip ASSIGNED có snapshots/IDs đúng, Driver activeTripId đúng; chỉ một Trip/Booking..
- **Kết quả mong đợi:** Tạo đúng một Trip `ASSIGNED`; lưu tài xế, xe và snapshot cần thiết; booking `ASSIGNED`, lời mời `ACCEPTED`, tài xế được ghi nhận bận.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC37 — AC37

- **Liên kết:** FR14 / UC18.
- **Loại / công cụ:** concurrency / CONCURRENCY+DB.
- **Tiền điều kiện và dữ liệu:** Hai request cùng Booking; sau đó hai Booking mời cùng Driver, fixture độc lập.
- **Bước thực hiện:** Gửi đồng thời bằng integration/ThreadPool. Tra cứu sau khi hết uncertainty; không hai Trip/Booking hoặc hai active Trip/Driver. Không chỉ nhìn HTTP 200..
- **Kết quả mong đợi:** Không tạo hai trip cho một booking; không cho tài xế nhận hai trip chưa kết thúc. Yêu cầu không thành công không được trả kết quả phân công thành công.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC38 — AC38

- **Liên kết:** FR13 / UC18.
- **Loại / công cụ:** replay / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** ACCEPT đã thành công, invitation ID cũ.
- **Bước thực hiện:** Gửi ACCEPT lần nữa ->200 kết quả đã lưu; đổi REJECT ->409; đếm Trip/notification không tăng sai..
- **Kết quả mong đợi:** Trả kết quả đã lưu; không tạo thêm trip. Phản hồi trái kết quả cuối bị từ chối.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC39 — AC39

- **Liên kết:** FR15 / UC06, UC18.
- **Loại / công cụ:** exception / POSTMAN+WORKER.
- **Tiền điều kiện và dữ liệu:** Hai ứng viên đủ điều kiện; Fixture reject, timeout, mất điều kiện riêng.
- **Bước thực hiện:** REJECT hoặc không trả lời 30 giây hoặc cho Driver offline trước ACCEPT; worker đóng lời mời và mời ứng viên tiếp theo; không mời lại người đã xử lý..
- **Kết quả mong đợi:** Đóng lời mời và xét ứng viên tiếp theo trong danh sách ban đầu; không mời lại ứng viên đã xử lý.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC40 — AC40

- **Liên kết:** FR16 / UC06.
- **Loại / công cụ:** empty/exception / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** Không ứng viên hoặc tất cả 5 người từ chối/timeout.
- **Bước thực hiện:** Tạo Booking; poll đến NO_DRIVER, không có Trip; Customer nhận thông báo; không dùng lỗi Auth/Driver down thay no_driver..
- **Kết quả mong đợi:** Booking chuyển `NO_DRIVER`; không tạo trip; tạo thông báo cho khách hàng.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC41 — AC41

- **Liên kết:** FR12–FR15, FR21 / UC06, UC08.
- **Loại / công cụ:** concurrency/cancel / POSTMAN+CONCURRENCY.
- **Tiền điều kiện và dữ liệu:** Booking SEARCHING, invitation PENDING.
- **Bước thực hiện:** Customer xác nhận hủy; Driver ACCEPT muộn ->409, không Trip. Chạy race cancel/accept và kiểm đúng một kết quả cuối sau recovery..
- **Kết quả mong đợi:** Dừng tìm kiếm và đóng lời mời; phản hồi đến sau không tạo trip hoặc chuyển booking thành `ASSIGNED`.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC42 — AC42

- **Liên kết:** FR18 / UC07.
- **Loại / công cụ:** positive / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Booking trước và sau phân công thuộc Customer.
- **Bước thực hiện:** GET Booking trước có tripAvailability=NOT_CREATED; sau ASSIGNED có Trip/Driver public data; Customer khác 403, không có Trip giả..
- **Kết quả mong đợi:** Trả trạng thái booking, trip nếu có và thông tin tài xế, xe được phép xem; booking chưa phân công không có trip giả.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC43 — AC43

- **Liên kết:** FR19 / UC07.
- **Loại / công cụ:** boundary / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Trip ASSIGNED, Driver location mới, sau đó ARRIVED.
- **Bước thực hiện:** GET Booking; so ETA=ceil(distanceDriverPickup*60/20); ARRIVED có minutes=0, không hứa tuyến đường thật..
- **Kết quả mong đợi:** ETA bằng `ceil(distanceKm × 60 / 20)`, tính khoảng cách tài xế đến điểm đón; trip `ARRIVED` có ETA bằng 0.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC44 — AC44

- **Liên kết:** FR19 / UC07.
- **Loại / công cụ:** empty/exception / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Fixture chưa phân công, location stale, Trip IN_PROGRESS/COMPLETED/CANCELED.
- **Bước thực hiện:** GET Booking; ETA UNAVAILABLE/NOT_APPLICABLE và không bịa minutes=0. So trạng thái phù hợp từng fixture..
- **Kết quả mong đợi:** Thể hiện ETA chưa có hoặc không còn áp dụng; không trả số ước tính thiếu căn cứ.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC45 — AC45

- **Liên kết:** FR17 / UC19.
- **Loại / công cụ:** positive / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Trip ASSIGNED confirmed, Driver đúng.
- **Bước thực hiện:** arrival ->ARRIVED; start ->IN_PROGRESS; location; completion ->COMPLETED; thời điểm server tuần tự, notification theo mốc bắt buộc..
- **Kết quả mong đợi:** Chỉ chuyển `ASSIGNED → ARRIVED → IN_PROGRESS → COMPLETED`, lưu thời điểm mốc và tạo thông báo tương ứng.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC46 — AC46

- **Liên kết:** FR17 / UC19.
- **Loại / công cụ:** negative/replay / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** Trip ASSIGNED chưa từng start; Trip CANCELED; Trip COMPLETED có lịch sử action.
- **Bước thực hiện:** Thử start khi chưa ARRIVED; start Trip đã CANCELED ->409; replay action đã thành công ->200 kết quả cũ, không timestamp/event mới. Không nhầm replay start sau COMPLETED với hành động chưa từng thành công..
- **Kết quả mong đợi:** Từ chối; trạng thái và thời điểm đã lưu giữ nguyên. Gửi lại mốc đã thành công không tạo thêm lần chuyển trạng thái.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC47 — AC47

- **Liên kết:** FR47 / UC20.
- **Loại / công cụ:** positive / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** Trip IN_PROGRESS, Driver được phân công.
- **Bước thực hiện:** PUT Trip location; GET Trip thấy latestLocation/time; Driver location đồng bộ; nếu RPC sync lỗi có pending để retry..
- **Kết quả mong đợi:** Lưu vị trí trip mới nhất và thời điểm nhận; bản cập nhật hợp lệ được dùng để đồng bộ vị trí tài xế.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC48 — AC48

- **Liên kết:** FR47 / UC20.
- **Loại / công cụ:** negative / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Trip chưa bắt đầu/đã kết thúc, Driver khác, hoặc tọa độ sai.
- **Bước thực hiện:** Gửi location theo từng biến thể; 409/403/400 tương ứng; snapshot vị trí trước không bị ghi đè..
- **Kết quả mong đợi:** Từ chối; không ghi đè vị trí trip.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC49 — AC49

- **Liên kết:** FR20 / UC08.
- **Loại / công cụ:** positive / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Booking SEARCHING hoặc Trip ASSIGNED/ARRIVED thuộc Customer.
- **Bước thực hiện:** Preview reason hợp lệ ->allowed=true fee=0; GET vẫn chưa hủy. Lý do whitespace bị 400; ngoài quyền 403..
- **Kết quả mong đợi:** Kiểm tra lý do 1–300 ký tự sau trim và hiển thị phí hủy 0 VND; chưa hủy khi khách hàng chưa xác nhận.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC50 — AC50

- **Liên kết:** FR21 / UC08.
- **Loại / công cụ:** positive / POSTMAN+EVENT.
- **Tiền điều kiện và dữ liệu:** Trip ASSIGNED hoặc ARRIVED riêng, owner Customer.
- **Bước thực hiện:** Preview rồi cancel confirmed=true; Trip CANCELED, Booking đồng bộ CANCELED, Driver release, Notification; không có Payment, fee=0..
- **Kết quả mong đợi:** Lưu người hủy, lý do, thời điểm và phí; booking `CANCELED`, trip liên quan `CANCELED`; đóng lời mời hoặc giải phóng tài xế; tạo thông báo.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC51 — AC51

- **Liên kết:** FR20–FR21 / UC08.
- **Loại / công cụ:** negative/replay / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** IN_PROGRESS/COMPLETED/NO_DRIVER và CANCELED fixture riêng.
- **Bước thực hiện:** Thử hủy trạng thái không được phép ->409; replay hủy thành công cùng reason ->200 và canceledAt không đổi; đổi reason ->409..
- **Kết quả mong đợi:** Từ chối hủy thông thường. Gửi lại thao tác hủy đã thành công trả kết quả cũ, không đổi thời điểm hoặc tạo phí mới.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC52 — AC52

- **Liên kết:** FR17, FR21 / UC08, UC19.
- **Loại / công cụ:** positive/exception / POSTMAN+EVENT.
- **Tiền điều kiện và dữ liệu:** Trip kết thúc khi Payment chưa khởi tạo, PENDING hoặc FAILED.
- **Bước thực hiện:** Complete/cancel; poll Booking trạng thái cuối, Driver release; không giữ bận chỉ vì payment. Event cũ không release Trip mới..
- **Kết quả mong đợi:** Booking chuyển trạng thái cuối tương ứng; tài xế không còn bận vì trip đó. Không giữ tài xế bận do payment chưa thành công.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC53 — AC53

- **Liên kết:** FR22 / UC19.
- **Loại / công cụ:** positive / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** Trip IN_PROGRESS với pricingSnapshot hợp lệ.
- **Bước thực hiện:** Complete; tính Haversine độc lập từ pickup/destination, fare=1000*ceil((10000+5000*d)/1000); so fareAmount, không nhận client amount..
- **Kết quả mong đợi:** Server tính cước từ khoảng cách, thông số giá đã lưu và làm tròn lên bội số 1.000 VND; không dùng số tiền client gửi.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC54 — AC54

- **Liên kết:** FR22 / UC19.
- **Loại / công cụ:** boundary / INTEGRATION+POSTMAN.
- **Tiền điều kiện và dữ liệu:** Fixture snapshot distanceKm chính xác 2 và 2.01 theo test factory.
- **Bước thực hiện:** Complete từng Trip: 20.000 và 21.000 VND; không làm tròn distance trước. Không sửa DB production để ép giá..
- **Kết quả mong đợi:** Cước BIKE là 20.000 VND. Không làm tròn khoảng cách trước khi tính.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC55 — AC55

- **Liên kết:** FR22 / UC19.
- **Loại / công cụ:** exception / INTEGRATION+DB.
- **Tiền điều kiện và dữ liệu:** Fixture kỹ thuật snapshot thiếu dữ liệu; không dùng API public để phá data.
- **Bước thực hiện:** Complete vẫn COMPLETED/fareAmount null, Payment 409; sửa fixture nguồn hợp lệ và worker RecalculateFare, không thêm event completed trùng..
- **Kết quả mong đợi:** Giữ `COMPLETED`, cước chưa xác định; không cho thanh toán; ghi log và có khả năng xử lý lại khi đủ dữ liệu.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC56 — AC56

- **Liên kết:** FR23 / UC09.
- **Loại / công cụ:** positive/negative / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Trip của Customer, trước hoàn thành và COMPLETED có/không cước.
- **Bước thực hiện:** GET summary đúng dữ liệu Trip, null khi chưa xác định; CreatePayment chỉ sau COMPLETED/cước hợp lệ; người khác 403..
- **Kết quả mong đợi:** Hiển thị cước do server lưu và các payment liên quan; chỉ cho thanh toán trip `COMPLETED` có cước hợp lệ.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC59 — AC59

- **Liên kết:** FR25 / UC09.
- **Loại / công cụ:** positive / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Trip COMPLETED chưa có attempt, mock DELAYED để quan sát PENDING.
- **Bước thực hiện:** CreatePayment key mới body {}; 201 PENDING, MOCK_ONLINE/VND/amount từ Trip, attempt=1; client amount bị 400..
- **Kết quả mong đợi:** Tạo Payment `PENDING`, phương thức `MOCK_ONLINE`, tiền tệ `VND`, mã tham chiếu và số tiền do server xác định.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC60 — AC60

- **Liên kết:** FR25 / UC09.
- **Loại / công cụ:** replay/concurrency / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** Payment PENDING, key/body gốc; retry fixture cho payload key conflict.
- **Bước thực hiện:** Replay ->200 snapshot gốc, key mới khi PENDING ->409; reuse key trên retry request payload khác cùng Trip ->409; đếm không attempt mới trái phép..
- **Kết quả mong đợi:** Yêu cầu lặp trả payment cũ; không tạo thêm payment khi đang chờ. Cùng khóa nhưng khác dữ liệu bị từ chối.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC61 — AC61

- **Liên kết:** FR26 / UC27.
- **Loại / công cụ:** positive / POSTMAN+MOCK.
- **Tiền điều kiện và dữ liệu:** PENDING fixture, tool ký callback đọc secret local ngoài Postman.
- **Bước thực hiện:** Callback hợp lệ COMPLETED và FAILED trên hai Payment riêng; kiểm đúng status, timestamp và Notification, Trip vẫn COMPLETED..
- **Kết quả mong đợi:** Cập nhật payment `PENDING` thành `COMPLETED` hoặc `FAILED` theo kết quả; lưu thời điểm và tạo thông báo.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC62 — AC62

- **Liên kết:** FR26 / UC27.
- **Loại / công cụ:** security / POSTMAN+MOCK.
- **Tiền điều kiện và dữ liệu:** PENDING fixture cho từng biến thể; tool ký bằng đúng key khi thử mismatch data.
- **Bước thực hiện:** Thử sai signature (401); đúng signature nhưng sai amount/reference/VND hoặc stale timestamp (400), payment không tồn tại (404); không đổi trạng thái..
- **Kết quả mong đợi:** Từ chối; không thay đổi payment hoặc ghi nhận đã thanh toán.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC63 — AC63

- **Liên kết:** FR26 / UC27.
- **Loại / công cụ:** replay / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** Đã có callback hợp lệ và giữ nguyên raw body/headers.
- **Bước thực hiện:** Gửi lại exact callback ->200 duplicate=true; event mới cùng Payment nhưng trái kết quả cuối ->409; callback signature sai luôn401; không outbox/charge thứ hai..
- **Kết quả mong đợi:** Callback trùng không xử lý thêm; callback trái kết quả cuối bị từ chối và ghi log; không có hai thanh toán thành công cho trip.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC64 — AC64

- **Liên kết:** FR27 / UC09.
- **Loại / công cụ:** positive/boundary / POSTMAN+MOCK.
- **Tiền điều kiện và dữ liệu:** Attempt1 FAILED, không PENDING/COMPLETED, còn lượt.
- **Bước thực hiện:** Retry key mới ->201 paymentId mới/attempt2; mock FAILED rồi repeat ->attempt3; replay key cũ không tăng attempt..
- **Kết quả mong đợi:** Cho tạo payment mới bằng khóa mới; tổng tối đa 3 lần online, gồm lần đầu và 2 retry.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC65 — AC65

- **Liên kết:** FR27–FR28 / UC09.
- **Loại / công cụ:** negative/boundary / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** Fixture PENDING; COMPLETED; đủ 3 FAILED riêng.
- **Bước thực hiện:** Retry từng fixture ->409; hết lượt không tạo CASH. Đếm tổng attempt<=3, không chỉ xem lỗi HTTP..
- **Kết quả mong đợi:** Không cho retry online; giữ kết quả để tra cứu, không có phương thức thay thế trong MVP.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC66 — AC66

- **Liên kết:** FR28 / UC09.
- **Loại / công cụ:** positive/empty / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Mock DELAYED không callback, PENDING đã lưu.
- **Bước thực hiện:** GET Payment nhiều lần vẫn PENDING; chờ không tự retry/FAILED. Sau callback hợp lệ GET kết quả cuối..
- **Kết quả mong đợi:** Trả trạng thái đã lưu; không tự chuyển `PENDING` thành `FAILED` chỉ vì chờ lâu hoặc client mất kết nối.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC67 — AC67

- **Liên kết:** FR30 / UC06–UC08, UC19.
- **Loại / công cụ:** positive / POSTMAN+EVENT.
- **Tiền điều kiện và dữ liệu:** Customer tạo/được phân công/arrived/completed/cancel fixtures.
- **Bước thực hiện:** Poll notifications đúng customerAccountId và relatedEntityId/type cho từng mốc; đối chiếu event gốc/DB, mục tiêu đồng bộ 5 giây khi khỏe..
- **Kết quả mong đợi:** Tạo thông báo đúng khách hàng liên quan, nội dung phù hợp kết quả nghiệp vụ đã lưu.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC68 — AC68

- **Liên kết:** FR31 / UC08, UC18–UC19.
- **Loại / công cụ:** positive / POSTMAN+EVENT.
- **Tiền điều kiện và dữ liệu:** Driver được mời/nhận chuyến, Customer hủy fixture.
- **Bước thực hiện:** Driver đọc invitation và notification đúng account; lời mời nguồn ở Booking; sự kiện thay đổi/hủy đến đúng Driver..
- **Kết quả mong đợi:** Tạo thông báo đúng tài xế; lời mời nhận chuyến vẫn được quản lý bằng TripInvitation.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC69 — AC69

- **Liên kết:** FR32 / UC09, UC27.
- **Loại / công cụ:** positive / POSTMAN+EVENT.
- **Tiền điều kiện và dữ liệu:** Payment COMPLETED và FAILED trên fixture riêng.
- **Bước thực hiện:** GET notifications Customer; có payment.completed/payment.failed đúng Payment ID và amount/status tương ứng..
- **Kết quả mong đợi:** Tạo thông báo đúng khách hàng, nhất quán trạng thái payment đã lưu.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC70 — AC70

- **Liên kết:** FR30–FR32, FR45 / Các UC liên quan.
- **Loại / công cụ:** replay/exception / EVENT+DB.
- **Tiền điều kiện và dữ liệu:** Outbox/inbox chạy, replay cùng eventId; consumer lỗi trước ACK.
- **Bước thực hiện:** Deliver lại event và restart consumer; unique notification/event/recipient/type; lỗi notification không rollback nghiệp vụ; xử lý DLQ theo hướng dẫn..
- **Kết quả mong đợi:** Không tạo thông báo trùng cho cùng người nhận và loại; lỗi thông báo được ghi log, không đảo ngược nghiệp vụ.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC71 — AC71

- **Liên kết:** FR48 / UC04.
- **Loại / công cụ:** security / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Hai Customer token hợp lệ và notification_id thuộc Customer1.
- **Bước thực hiện:** Customer1 list/detail được; Customer2 GET cùng ID403; list Customer2 không có thông báo Customer1; ADMIN không tự đọc notification người khác..
- **Kết quả mong đợi:** Chỉ trả thông báo gửi cho tài khoản hiện tại; không trả thông báo của người khác.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC72 — AC72

- **Liên kết:** FR33 / UC10.
- **Loại / công cụ:** positive/boundary / POSTMAN.
- **Tiền điều kiện và dữ liệu:** >=5 Booking Customer1 gồm NO_DRIVER/CANCELED, có Customer2.
- **Bước thực hiện:** GET page1/2 limit2, mặc định và page xa; so sort createdAt/id giảm, tổng và owner; gồm Booking chưa có Trip..
- **Kết quả mong đợi:** Chỉ trả booking thuộc mình, gồm cả kết quả hủy và `NO_DRIVER`; sắp xếp `createdAt` giảm dần, sau đó `bookingId` giảm dần; có phân trang.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC73 — AC73

- **Liên kết:** FR34 / UC11.
- **Loại / công cụ:** positive / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Trip COMPLETED chưa Review, thử chưa trả tiền và đã trả tiền trên fixture riêng.
- **Bước thực hiện:** CreateReview rating1/5, comment tùy chọn; 201 một Review đúng customer/driver/Trip. Không bắt Payment COMPLETED..
- **Kết quả mong đợi:** Tạo một Review cho đúng tài xế của trip; rating nguyên 1–5, comment tùy chọn tối đa 500 ký tự; không bắt buộc đã thanh toán.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC74 — AC74

- **Liên kết:** FR34 / UC11.
- **Loại / công cụ:** negative/boundary / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** Trip phù hợp cho mỗi lỗi; Review chưa tồn tại khi thử validation.
- **Bước thực hiện:** Thử rating0/6/1.5, comment501, XSS; sai chủ, Trip chưa COMPLETED, duplicate. 400/403/409 đúng loại, không sửa Review cũ..
- **Kết quả mong đợi:** Từ chối; không tạo hoặc sửa review đã lưu.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC75 — AC75

- **Liên kết:** FR35 / UC23.
- **Loại / công cụ:** positive/security / POSTMAN.
- **Tiền điều kiện và dữ liệu:** ADMIN token; Customer hồ sơ có ID.
- **Bước thực hiện:** GET /admin/customers và /customers/{id}; trả trường được phép; không có chức năng ADMIN sửa hồ sơ ngoài MVP..
- **Kết quả mong đợi:** Trả thông tin khách hàng được phép xem; không cung cấp quyền sửa hồ sơ khách hàng qua UC này.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC76 — AC76

- **Liên kết:** FR36 / UC24.
- **Loại / công cụ:** positive/exception / POSTMAN+FAILURE.
- **Tiền điều kiện và dữ liệu:** Booking/Trip đang hoạt động; thử dependency Payment/Driver down riêng.
- **Bước thực hiện:** ADMIN list Bookings/Trips/Drivers; trạng thái/thời điểm đúng; GetBooking availability UNAVAILABLE nếu thành phần lỗi, không giả chưa có dữ liệu..
- **Kết quả mong đợi:** Trả booking, trip đang hoạt động và trạng thái tài xế cùng thời điểm cập nhật; phần dữ liệu không lấy được phải được thể hiện rõ.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC77 — AC77

- **Liên kết:** FR37 / UC25.
- **Loại / công cụ:** positive/boundary / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Seed nhiều customer/driver/status, ADMIN.
- **Bước thực hiện:** List admin Bookings/Trips với filter customerId/driverId/status và paging; mọi dòng khớp bộ lọc, không ghi dữ liệu..
- **Kết quả mong đợi:** Trả booking và trip phù hợp khách hàng, tài xế hoặc trạng thái; không thay đổi dữ liệu lịch sử.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC78 — AC78

- **Liên kết:** FR29 / UC26.
- **Loại / công cụ:** positive / POSTMAN.
- **Tiền điều kiện và dữ liệu:** ADMIN, Trip có attemptFAILED và retryCOMPLETED.
- **Bước thực hiện:** GET /admin/payments filtertrip/status; thấy đúng amount/method/reference/timestamps; không endpoint sửa kết quả..
- **Kết quả mong đợi:** Trả các lần thanh toán phù hợp, gồm số tiền, phương thức, trạng thái, mã tham chiếu và thời điểm; không cho tự sửa kết quả.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC79 — AC79

- **Liên kết:** FR40.
- **Loại / công cụ:** security / POSTMAN.
- **Tiền điều kiện và dữ liệu:** API bảo vệ, token thiếu/sai/hết hạn từ fixture kỹ thuật.
- **Bước thực hiện:** Gọi GET auth/me và Booking; 401, không đọc/ghi. Dùng expired signed test token tạo nội bộ khi triển khai, không đợi 60 phút trong collection..
- **Kết quả mong đợi:** Trả `401`; không thực hiện thao tác nghiệp vụ.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC80 — AC80

- **Liên kết:** FR40.
- **Loại / công cụ:** security / POSTMAN.
- **Tiền điều kiện và dữ liệu:** CUSTOMER/DRIVER/ADMIN/Customer2 hợp lệ, Account DISABLED riêng.
- **Bước thực hiện:** Customer gọi Driver write403; Customer2 truy cập Booking/Trip/Payment/Review/Notification của người khác403; disabled403; không có dữ liệu ngoài quyền..
- **Kết quả mong đợi:** Từ chối truy cập theo hợp đồng API; không trả dữ liệu ngoài quyền và không thay đổi dữ liệu.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC81 — AC81

- **Liên kết:** FR40.
- **Loại / công cụ:** security / GRPC+NETWORK.
- **Tiền điều kiện và dữ liệu:** Compose đã có, service gRPC không publish host; client nội bộ kiểm soát.
- **Bước thực hiện:** Kiểm host port đóng; từ trong network gọi RPC thiếu/sai internal secret và token/quyền. Bị từ chối tại service, không chỉ dựa Gateway..
- **Kết quả mong đợi:** Service vẫn từ chối; không phụ thuộc duy nhất vào kiểm tra tại Gateway.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC82 — AC82

- **Liên kết:** FR41.
- **Loại / công cụ:** positive / LOG.
- **Tiền điều kiện và dữ liệu:** Thực hiện một luồng có correlationId và một lỗi có kiểm soát.
- **Bước thực hiện:** Theo requestId qua Gateway/Booking/Trip; log có thời điểm,service,action,result/error, không làm lộ secret..
- **Kết quả mong đợi:** Log có thời điểm, service, mã liên kết yêu cầu, hành động và kết quả hoặc lỗi.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC83 — AC83

- **Liên kết:** FR41.
- **Loại / công cụ:** security / LOG+DB+POSTMAN.
- **Tiền điều kiện và dữ liệu:** Có API auth/profile/payment và log; OTP mock local.
- **Bước thực hiện:** Quét log và response không password/OTP/JWT/secret rõ trong log hoặc hash/key/stack trong response; chỉ RequestOtp được trả mockCode khi bật mock. Không xuất token/password vào evidence công khai..
- **Kết quả mong đợi:** Không có mật khẩu, OTP, JWT hoặc secret dạng rõ trong log; API không trả giá trị băm, secret hoặc stack trace.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC84 — AC84

- **Liên kết:** FR49.
- **Loại / công cụ:** positive / POSTMAN.
- **Tiền điều kiện và dữ liệu:** Gateway process chạy.
- **Bước thực hiện:** GET /health200 healthy; dừng một dependency, /health vẫn chỉ phản ánh process, không tự suy ra ready..
- **Kết quả mong đợi:** Trả trạng thái tiến trình; không khẳng định sẵn sàng chỉ từ kết quả này.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC85 — AC85

- **Liên kết:** FR49.
- **Loại / công cụ:** exception / POSTMAN+DOCKER.
- **Tiền điều kiện và dữ liệu:** Compose khỏe; có thể stop/start dependency local.
- **Bước thực hiện:** GET ready200; stop một dependency bắt buộc ->503/not_ready; phục hồi ->200. Không chấp nhận static ready luôntrue..
- **Kết quả mong đợi:** Trả `200` khi sẵn sàng, `503` khi chưa sẵn sàng.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC86 — AC86

- **Liên kết:** FR49.
- **Loại / công cụ:** exception / POSTMAN+DOCKER.
- **Tiền điều kiện và dữ liệu:** Gateway và 12 thành phần có trạng thái quan sát được.
- **Bước thực hiện:** GET /health/services đủ12 tên duy nhất; stop service ->503/degraded, mục tương ứng unhealthy/unknown; không lộ URI/secret..
- **Kết quả mong đợi:** Cung cấp trạng thái các service; service lỗi không được hiển thị như đang khỏe; không lộ secret hoặc chuỗi kết nối.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC87 — AC87

- **Liên kết:** NFR06.
- **Loại / công cụ:** performance / LOAD.
- **Tiền điều kiện và dữ liệu:** Ghi cấu hình máy và dữ liệu seed; tránh để rate limit che phép đo đọc.
- **Bước thực hiện:** Đo ít nhất 100 request đọc profile/nearby/history/Trip, tối đa 10 request đồng thời; tính p95 <=2 giây, ghi số mẫu và tài nguyên. Không dùng một responseTime Postman làm p95..
- **Kết quả mong đợi:** API đọc thuộc NFR06 đạt p95 ≤ 2 giây với ít nhất 100 yêu cầu, tối đa 10 yêu cầu đồng thời, trên môi trường thử đã quy định; lưu kết quả đo.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC88 — AC88

- **Liên kết:** NFR10–NFR12.
- **Loại / công cụ:** recovery / FAILURE+DB.
- **Tiền điều kiện và dữ liệu:** Có thể dừng ở các phase phân công, MongoDB dùng volume bền vững.
- **Bước thực hiện:** Ngắt và restart sau reserve/createTrip/COMMIT; phục hồi cùng operation; không hai Trip/Driver; event kết thúc cũ không làm lùi trạng thái hoặc giải phóng chuyến mới..
- **Kết quả mong đợi:** Sau khi các thành phần phục hồi, xử lý lại đưa booking, trip và tình trạng bận về kết quả đúng, không tạo dữ liệu trùng hoặc chuyển ngược trạng thái cuối.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC89 — AC89

- **Liên kết:** NFR15.
- **Loại / công cụ:** architecture / CODE+DB.
- **Tiền điều kiện và dữ liệu:** Repository và Compose đã triển khai.
- **Bước thực hiện:** Đếm 8 service, DB user riêng; đọc cấu hình URI và các điểm truy cập; thử user service A đọc DB B phải bị từ chối; không dùng chung collection trái ownership..
- **Kết quả mong đợi:** Có đúng 8 service nghiệp vụ, mỗi service sở hữu database MongoDB riêng về mặt logic; không truy cập trực tiếp collection của service khác.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC90 — AC90

- **Liên kết:** NFR14, NFR16.
- **Loại / công cụ:** persistence / DOCKER+DB.
- **Tiền điều kiện và dữ liệu:** Compose, environment và seed đã sẵn sàng.
- **Bước thực hiện:** Khởi động và tạo dữ liệu; docker compose down không -v rồi up; dữ liệu còn; seed ADMIN chạy lại không nhân bản. Không xóa volume trong bài kiểm tra..
- **Kết quả mong đợi:** Với biến môi trường đã cấu hình, chạy được bằng Docker Compose; có seed ADMIN; dữ liệu còn sau khi dừng và khởi động lại mà không xóa volume.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC91 — AC91

- **Liên kết:** NFR19.
- **Loại / công cụ:** contract / CONTRACT+POSTMAN.
- **Tiền điều kiện và dữ liệu:** Backend đúng commit đang thử, có 10 YAML Giai đoạn 5.
- **Bước thực hiện:** Đối chiếu đủ 47 operation với response/query/body/error/quyền; chạy validator hợp đồng rồi gọi API thực tế. Kết quả validator không thay cho runtime compatibility..
- **Kết quả mong đợi:** Đúng 10 file API YAML khớp endpoint, dữ liệu, quyền và mã phản hồi của bản triển khai.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC92 — AC92

- **Liên kết:** NFR04.
- **Loại / công cụ:** rate-limit / POSTMAN+REDIS.
- **Tiền điều kiện và dữ liệu:** Cửa sổ login sạch, credential sai có định dạng hợp lệ.
- **Bước thực hiện:** Gửi 10 login/phút/IP để được xử lý credential; lần 11 phải 429/Retry-After, không chạy xác thực thêm; không dùng token/password thật làm bằng chứng công khai..
- **Kết quả mong đợi:** Vượt 10 yêu cầu đăng nhập/phút/IP bị giới hạn theo NFR04; yêu cầu bị chặn không tiếp tục xác thực.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC93 — AC93

- **Liên kết:** NFR02, NFR21.
- **Loại / công cụ:** security / DB+CONFIG.
- **Tiền điều kiện và dữ liệu:** Auth và Driver có dữ liệu giả, key mã hóa ngoài source/DB.
- **Bước thực hiện:** Kiểm passwordHash/codeHash/licenseNumberEncrypted không chứa plaintext; sai hoặc thiếu key không decrypt hoặc không ready; key còn sau restart; không in key vào báo cáo..
- **Kết quả mong đợi:** Kiểm tra DB thấy passwordHash, codeHash và licenseNumberEncrypted; không có password/OTP/license plaintext. Decrypt licenseNumber thành công chỉ khi có đúng key; sai/thiếu key bị từ chối hoặc service không ready. Key ngoài DB/Git, không lộ API/log. Postman kết hợp MongoDB và kiểm tra cấu hình.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC94 — AC94

- **Liên kết:** NFR22.
- **Loại / công cụ:** injection / POSTMAN+DB.
- **Tiền điều kiện và dữ liệu:** Login dùng phone; lưu trạng thái dữ liệu trước thử.
- **Bước thực hiện:** Gửi phone chứa chuỗi SQL và phone/password object $ne/$gt; bị 400/401 đúng hợp đồng, không token, không lộ query DB, không bypass..
- **Kết quả mong đợi:** Payload SQL trong phone và payload NoSQL dạng object/toán tử trong phone/password trả 400/401, không cấp token, không lộ query/DB; dữ liệu trước và sau không bị thay đổi trái phép.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC95 — AC95

- **Liên kết:** NFR24, FR40.
- **Loại / công cụ:** jwt / POSTMAN+INTEGRATION.
- **Tiền điều kiện và dữ liệu:** Có token Customer thật; token kiểm thử ký sai issuer/audience/expired khi cần.
- **Bước thực hiện:** Sửa sub/role nhưng giữ signature; thử alg none, hết hạn, sai key/issuer/audience: 401. Đúng token nhưng sai role: 403. Không chỉ decode payload..
- **Kết quả mong đợi:** Token sửa sub/role, sai signature, alg=none, hết hạn, sai issuer/audience trả 401; token đúng role không đủ quyền trả 403. Service kiểm tra caller và ownership, không nhận role tự khai từ client.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC96 — AC96

- **Liên kết:** NFR23.
- **Loại / công cụ:** xss / POSTMAN+HARNESS.
- **Tiền điều kiện và dữ liệu:** Text không hỗ trợ HTML; harness hiển thị qua textContent/escape.
- **Bước thực hiện:** Gửi script/event-handler vào fullName/comment/reason; 400 và DB không lưu. Harness không chạy script; chỉ có Postman thì phần browser vẫn BLOCKED..
- **Kết quả mong đợi:** Gửi `<script>alert(1)</script>` hoặc markup event handler vào các trường text không hỗ trợ HTML → 400, không lưu. Phản hồi JSON đúng Content-Type; harness hiển thị dùng escape/textContent và không execute script. Chỉ có Postman thì chưa PASS phần browser execution.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC97 — AC97

- **Liên kết:** NFR25.
- **Loại / công cụ:** rate-limit/failure / POSTMAN+REDIS+LOAD.
- **Tiền điều kiện và dữ liệu:** Cửa sổ Booking sạch 60 giây, Customer profile ready, Redis khỏe.
- **Bước thực hiện:** Gửi 10 POST cùng key/body: một create và chín replay; lần 11 phải 429, không Booking mới. Restart Gateway counter còn TTL; Redis down write 503. Đo tải >1000 request/giây riêng, không suy ra từ 11 request..
- **Kết quả mong đợi:** Với Redis đang chạy và cửa sổ sạch, vượt 10 request tạo Booking/60 giây/account hoặc 120/IP trả 429/Retry-After và không tạo dữ liệu; restart Gateway không reset counter. Redis lỗi thì write được bảo vệ trả 503. Lưu kết quả kiểm thử tải riêng cho mục 29, không suy đoán đạt >1000 request/giây.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC98 — AC98

- **Liên kết:** NFR26.
- **Loại / công cụ:** architecture/security / CODE+GRPC+NETWORK.
- **Tiền điều kiện và dữ liệu:** Gateway, 8 gRPC server và network đã triển khai.
- **Bước thực hiện:** Trace REST Gateway tới đúng RPC; host không public gRPC; peer sai bị từ chối; child deadline không vượt budget; Gateway không truy cập DB nghiệp vụ..
- **Kết quả mong đợi:** Trace/log cho thấy REST client vào Gateway và gRPC đến đúng 8 service; gRPC service không publish ra host; client không truy cập trực tiếp. Deadline/metadata/error mapping theo NFR08/NFR26, service từ chối internal credential sai.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC99 — AC99

- **Liên kết:** NFR27.
- **Loại / công cụ:** event/replay / RABBITMQ+DB.
- **Tiền điều kiện và dữ liệu:** Exchange, queue, retry/DLQ và outbox/inbox đã chạy.
- **Bước thực hiện:** Kiểm binding 12 event; replay eventId; lỗi trước ACK retry 1/5/15 giây rồi DLQ; chỉ ACK sau commit; Notification đúng người nhận và không trùng..
- **Kết quả mong đợi:** RabbitMQ có exchange/queue/binding đúng; sự kiện nghiệp vụ lưu thông báo đúng người nhận. Giao lại cùng eventId không tạo trùng; lỗi xử lý không ACK sớm; vượt retry vào DLQ, có log và đường phục hồi.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC100 — AC100

- **Liên kết:** NFR12, NFR27.
- **Loại / công cụ:** event/recovery / FAILURE+DB.
- **Tiền điều kiện và dữ liệu:** Ngắt broker/consumer giữa DB commit và publish, fixture hợp lệ.
- **Bước thực hiện:** Register hoặc complete Trip khi delivery gián đoạn, rồi phục hồi; profile tạo một lần, trạng thái không lùi, Driver release đúng Trip; đo mục tiêu đồng bộ 5 giây khi khỏe bằng log server..
- **Kết quả mong đợi:** Gián đoạn publish/consumer rồi phục hồi không mất kết quả nghiệp vụ/event; profile được tạo lại đúng một lần, Booking/Driver đồng bộ kết thúc Trip; event cũ không giải phóng phân công mới. Khi khỏe, đồng bộ mục tiêu 5 giây.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC101 — AC101

- **Liên kết:** NFR28.
- **Loại / công cụ:** repository/secrets / GIT+CODE.
- **Tiền điều kiện và dữ liệu:** Repository thực tế chưa được khảo sát ở các giai đoạn thiết kế.
- **Bước thực hiện:** Xem git status, cây thư mục, tracked files và lịch sử liên quan; .gitignore/.env.example không secret; ghi nhận trước sửa, không reset/delete/push..
- **Kết quả mong đợi:** Repository có cây thư mục tách Gateway/8 service/contracts/infra/tests; .gitignore và .env.example hợp lệ, không commit secret. Có biên bản kiểm tra source cũ trước chỉnh sửa, không xóa/reset/push ngoài phạm vi.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC102 — AC102

- **Liên kết:** NFR29.
- **Loại / công cụ:** infrastructure / DOCKER+CONFIG.
- **Tiền điều kiện và dữ liệu:** Máy local có Node/Docker, Codex tạo secret/environment thực.
- **Bước thực hiện:** Khởi tạo Compose/network/volume/health/replica set/8 DB user/kết nối; kiểm 12 container thường trực, DB sẵn trước app ready; không yêu cầu tạo DB thủ công bằng Compass..
- **Kết quả mong đợi:** Từ môi trường chưa có hạ tầng, lệnh đã hướng dẫn tạo và khởi động Compose mục tiêu 12 container; network/volumes/healthcheck và DB user/8 URI được kiểm tra; không cần tạo DB thủ công. Nếu có transaction, replica set đã initialized.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC103 — AC103

- **Liên kết:** NFR29.
- **Loại / công cụ:** fixture / SEED+DB+POSTMAN.
- **Tiền điều kiện và dữ liệu:** Seed script idempotent đã viết.
- **Bước thực hiện:** Chạy seed hai lần; có ADMIN, hai Customer, ít nhất 5 Driver và 5 Booking đúng Customer/ID; không nhân bản hoặc ghi đè userdata; refresh location rồi thử nearby/history..
- **Kết quả mong đợi:** Seed chạy lại không nhân bản dữ liệu; có ADMIN, hai Customer kiểm tra ownership, ít nhất 5 Driver khác trạng thái/vị trí và 5 Booking của Customer cần thử. ID liên kết hợp lệ, giá/trạng thái phù hợp; vị trí được refresh trước nearby.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC104 — AC104

- **Liên kết:** NFR30.
- **Loại / công cụ:** evidence / REVIEW.
- **Tiền điều kiện và dữ liệu:** Có actual/evidence hoặc trạng thái BLOCKED/NOT_RUN rõ ràng.
- **Bước thực hiện:** Rà đủ 30 mục chấm và RTM; không tự điền PASS; mỗi FAIL có actual; thiếu dependency ghi BLOCKED; không thêm mục chấm 31..
- **Kết quả mong đợi:** Có báo cáo đủ mục chấm 1–30 và RTM; mỗi kết luận có expected/actual/evidence, trạng thái đúng NFR30. Không tạo mục chấm 31; chưa chạy ghi NOT_RUN/BLOCKED, không ghi PASS.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## TC105 — AC105

- **Liên kết:** NFR10–NFR11, FR25–FR27.
- **Loại / công cụ:** replay/security / POSTMAN+CONCURRENCY+DB.
- **Tiền điều kiện và dữ liệu:** PENDING/FAILED/COMPLETED là fixture độc lập, tool callback giữ key local.
- **Bước thực hiện:** Replay request/callback; key khác payload 409; thử signature/mismatch/stale và race create/retry/callback; đếm tối đa một PENDING/COMPLETED và ba attempt, không double charge..
- **Kết quả mong đợi:** Replay cùng key và body trả cùng paymentId/kết quả; cùng key khác body → 409; callback trùng không ghi thêm. Gửi đồng thời nhiều payment/retry không có hơn một PENDING/COMPLETED cho Trip và không vượt 3 attempt. Callback sai chữ ký, sai amount/reference/timestamp bị từ chối; không có double charge kể cả dùng key mới sau COMPLETED.
- **Trạng thái:** BLOCKED — Backend/hạ tầng hoặc repository kiểm chứng chưa sẵn sàng trong bộ nguồn hiện tại.
- **Actual / evidence:** chưa có.

## Mã ngoài phạm vi

TC57–TC58/AC57–AC58/FR24/UC21: CASH ngoài MVP; giữ mã truy xuất, không tạo case triển khai hoặc đánh dấu thiếu test.

## Các nhóm biến thể bắt buộc tách khi thực thi

| Case chính | Biến thể tối thiểu |
| --- | --- |
| TC03 | Thiếu field; phone sai; password ngắn/dài; phone trùng |
| TC12 | Sai mã; hết hạn; invalidated; consumed; hết lượt sai |
| TC24 | Mỗi điều kiện online còn thiếu là một fixture độc lập |
| TC30 | page/limit mặc định, biên hợp lệ/sai, sai kiểu và empty page |
| TC37 | Cùng Booking, cùng Driver khác Booking, timeout/reconcile |
| TC41 | Hủy trước ACCEPT; ACCEPT muộn; race đồng thời |
| TC46 | Bỏ mốc; kết thúc chưa từng action; replay action đã thành công |
| TC62 | Sai signature; amount; reference; currency; timestamp; Payment không có |
| TC65 | PENDING, COMPLETED và hết 3 attempt FAILED |
| TC74 | Điểm biên/sai kiểu, comment dài/XSS, sai chủ, chưa hoàn thành, duplicate |
| TC95 | Payload tamper, alg none, expired, wrong key/issuer/audience |
| TC97 | Ngưỡng 429; counter qua restart; Redis lỗi; tải cao đo thực |
| TC105 | Request replay, callback replay, key conflict, race create/retry/callback và kiểm DB |

Các timeout/restart/publish failure cần chạy trên local fixture có kiểm soát, không thêm endpoint quản trị công khai để sửa state hoặc tự mint token. Nếu dùng clock/test factory phải ở code test nội bộ, không làm nới bảo mật API demo.
