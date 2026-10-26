# Đánh giá và phân rã API CAB

## 1. Kết luận đánh giá trước khi phân rã

Ảnh hợp lý để xác định các nhóm năng lực, nhưng chưa đủ chứng minh đó là các bounded context hoàn chỉnh. Cột Use Case bị che nên không đánh giá nội dung cột này; liên kết UC bên dưới lấy từ SRS hiện tại. Không dùng số file để suy ra số microservice.

| Điểm trong ảnh | Nhận xét | Điều chỉnh |
|---|---|---|
| Identity & Access / Customer | Tài khoản và hồ sơ khách hàng có thể trùng nguồn dữ liệu UserAccount. | Identity sở hữu xác thực/quyền; Customer chỉ quản lý trường khách hàng cho vận hành. /me dùng chung nằm Identity. |
| Booking & Dispatch / Trip | SRS dùng Trip cho cả yêu cầu và chuyến; nếu hai service cùng ghi trạng thái sẽ chồng trách nhiệm. | Trip sở hữu vòng đời; Dispatch sở hữu lời mời/chính sách chọn tài xế. Hiện là nhóm API/module; nếu tách service phải thiết kế context map/command/event rõ. |
| Driver & Vehicle | Gộp có cơ sở vì điều kiện nhận chuyến gắn hồ sơ, xe và vị trí. | Phân biệt AVAILABLE với busy; tài xế không tự cấp điều kiện phân công. |
| Fare & Payment | Hợp lý cho bản đơn giản; tính cước và thanh toán vẫn có trách nhiệm riêng. | TripCompleted kích hoạt tính cước, payment status không đổi completed trip. Công thức/adapter chưa chốt. |
| Rating & Feedback | SRS chỉ có đánh giá tài xế. | Chỉ tạo Review theo FR34; không mở rộng thành khiếu nại tổng quát. |
| Notification | Là gửi theo mốc/sự kiện, không phải tác vụ người dùng gửi tùy ý. | Mô tả workflow nội bộ, không tạo REST API thiếu căn cứ. Không tuyên bố dùng broker/AsyncAPI khi chưa thiết kế. |
| Reporting | Tổng hợp/read model, không sở hữu dữ liệu nguồn. | Không mặc định cần service/database riêng. |
| Thiếu Support và Audit | FR38 và FR41–FR42 chưa được thể hiện trong ảnh. | Bổ sung Support Management và Audit Log; đây có thể là module hỗ trợ, chưa chốt bounded context riêng. |

## 2. Phân biệt các khái niệm

| Khái niệm | Trả lời câu hỏi | Ví dụ CAB |
|---|---|---|
| Bounded context | Mô hình, thuật ngữ và quy tắc nào nhất quán trong một ranh giới nghiệp vụ? | Dispatch hiểu tài xế như ứng viên nhận chuyến; Payment hiểu Trip như tham chiếu khoản phải thu. |
| Use Case | Tác nhân muốn đạt mục tiêu gì và qua luồng nào? | UC04 đặt xe; UC13 phản hồi lời mời; UC07 thanh toán. |
| API specification | Client gọi chức năng nào, dữ liệu vào/ra, quyền và lỗi thế nào? | booking-driver-dispatch.yaml chứa API tạo Trip và phản hồi Invitation. |
| Endpoint | Một method + path cụ thể. | POST /trips. |

Quan hệ không phải 1–1. Một nhóm nghiệp vụ/context có nhiều UC; một UC gọi nhiều endpoint và có thể đi qua nhiều nhóm. AC bao gồm cả kiểm thử nghiệp vụ/phi chức năng, không phải mỗi AC tạo một endpoint.

Ví dụ UC04 đi qua Identity để xác thực, Booking/Dispatch để tìm/phân công, Trip để xem trạng thái và Notification để thông báo.

Nguồn kiến trúc tham khảo: [Martin Fowler — Bounded Context](https://martinfowler.com/bliki/BoundedContext.html), [Microsoft — Domain analysis](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis). Đây là cơ sở giải thích khái niệm; phạm vi API CAB lấy từ SRS.

## 3. Danh mục 12 YAML

| File | UC liên quan trực tiếp | FR chính | Endpoint |
|---|---|---|---|
| `01-identity-access.yaml` | UC01, UC02, UC03, UC16 | FR01, FR02, FR03, FR04, FR40 | 5 |
| `02-customer-management.yaml` | UC17 | FR35 | 2 |
| `03-driver-vehicle-management.yaml` | UC04, UC05, UC10, UC11, UC12, UC18, UC19 | FR05, FR06, FR07, FR08 | 10 |
| `04-booking-driver-dispatch.yaml` | UC04, UC13 | FR09, FR10, FR11, FR12, FR13, FR14, FR15, FR16 | 3 |
| `05-trip-management.yaml` | UC05, UC06, UC08, UC14, UC20, UC21 | FR17, FR18, FR19, FR20, FR21, FR33, FR36, FR37 | 8 |
| `06-fare-payment.yaml` | UC07, UC14, UC15, UC22, UC23 | FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR29 | 9 |
| `07-rating-feedback.yaml` | UC09 | FR34 | 1 |
| `08-reporting.yaml` | UC24 | FR39 | 1 |
| `09-support-management.yaml` | UC23 | FR38 | 2 |
| `10-audit-log.yaml` | UC25 | FR41, FR42 | 1 |
| `11-notification-workflow.yaml` | Hỗ trợ UC04–UC07, UC13–UC15 | FR30–FR32 | Không có HTTP endpoint |
| `12-cab-openapi.yaml` | Tổng hợp | FR01–FR42 qua API + xử lý nội bộ | 42 (bản tổng hợp, không thêm endpoint) |

10 file OpenAPI theo nhóm + 1 workflow Notification + 1 OpenAPI tổng hợp = **12 YAML**. Một file có nhiều endpoint. Notification workflow là YAML tùy chỉnh nội bộ, **không phải OpenAPI/AsyncAPI và không nhập vào Swagger Editor**. Nếu bài tập yêu cầu mọi YAML đều là API-specification, chỉ nộp 10 file nhóm; workflow là tài liệu bổ trợ.

## 4. Từ FR/AC sang API

| File | Method | Endpoint | FR | UC liên quan | AC |
|---|---|---|---|---|---|
| `01-identity-access.yaml` | POST | `/accounts` | FR01, FR41 | UC01 | AC01, AC02, AC63 |
| `01-identity-access.yaml` | POST | `/sessions` | FR02, FR41 | UC02 | AC03, AC04, AC63 |
| `01-identity-access.yaml` | GET | `/me` | FR03, FR40 | UC03 | AC05, AC62, AC69 |
| `01-identity-access.yaml` | PATCH | `/me` | FR03, FR40, FR41 | UC03 | AC05, AC06, AC62, AC63, AC69 |
| `01-identity-access.yaml` | POST | `/admin/driver-accounts` | FR04, FR40, FR41 | UC16 | AC07, AC08, AC62, AC63, AC69 |
| `02-customer-management.yaml` | GET | `/admin/customers` | FR35, FR40 | UC17 | AC55, AC62, AC69 |
| `02-customer-management.yaml` | PATCH | `/admin/customers/{customerId}` | FR35, FR40, FR41 | UC17 | AC55, AC62, AC63, AC69 |
| `03-driver-vehicle-management.yaml` | GET | `/drivers/me` | FR05, FR40 | UC10, UC18 | AC09, AC10, AC62, AC69 |
| `03-driver-vehicle-management.yaml` | PATCH | `/drivers/me` | FR05, FR40, FR41 | UC10, UC18 | AC09, AC10, AC62, AC63, AC69 |
| `03-driver-vehicle-management.yaml` | GET | `/admin/drivers` | FR05, FR36, FR40 | UC10, UC18, UC20 | AC09, AC10, AC56, AC62, AC69 |
| `03-driver-vehicle-management.yaml` | PATCH | `/admin/drivers/{driverId}` | FR05, FR40, FR41 | UC10, UC18 | AC09, AC10, AC62, AC63, AC69 |
| `03-driver-vehicle-management.yaml` | GET | `/vehicle-types` | FR06, FR09, FR40 | UC04, UC11, UC19 | AC11, AC17, AC18, AC62, AC69 |
| `03-driver-vehicle-management.yaml` | PUT | `/drivers/me/availability` | FR07, FR40, FR41 | UC12 | AC13, AC14, AC62, AC63, AC69 |
| `03-driver-vehicle-management.yaml` | PUT | `/drivers/me/location` | FR08, FR40, FR41 | UC04, UC05 | AC15, AC16, AC62, AC63, AC69 |
| `03-driver-vehicle-management.yaml` | POST | `/vehicles` | FR06, FR40, FR41 | UC11, UC19 | AC11, AC12, AC62, AC63, AC69 |
| `03-driver-vehicle-management.yaml` | GET | `/vehicles` | FR06, FR40 | UC11, UC19 | AC11, AC12, AC62, AC69 |
| `03-driver-vehicle-management.yaml` | PATCH | `/vehicles/{vehicleId}` | FR06, FR40, FR41 | UC11, UC19 | AC11, AC12, AC62, AC63, AC69 |
| `04-booking-driver-dispatch.yaml` | POST | `/trips` | FR09, FR10, FR11, FR12, FR15, FR16, FR30, FR40, FR41 | UC04, UC05, UC06, UC13, UC14 | AC16, AC17, AC18, AC19, AC20, AC21, AC22, AC27, AC28, AC48, AC51, AC62, AC63, AC69 |
| `04-booking-driver-dispatch.yaml` | GET | `/drivers/me/invitations` | FR12, FR13, FR40 | UC04, UC13 | AC22, AC23, AC24, AC62, AC69 |
| `04-booking-driver-dispatch.yaml` | POST | `/drivers/me/invitations/{invitationId}/responses` | FR13, FR14, FR15, FR16, FR30, FR40, FR41 | UC04, UC05, UC06, UC13, UC14 | AC23, AC24, AC25, AC26, AC27, AC28, AC48, AC51, AC62, AC63, AC69 |
| `05-trip-management.yaml` | POST | `/drivers/me/trips/{tripId}/status-events` | FR17, FR22, FR30, FR40, FR41 | UC04, UC05, UC06, UC07, UC14 | AC29, AC30, AC31, AC37, AC38, AC46, AC48, AC51, AC62, AC63, AC69 |
| `05-trip-management.yaml` | GET | `/trips/{tripId}` | FR18, FR33, FR40 | UC05, UC08 | AC32, AC52, AC62, AC69 |
| `05-trip-management.yaml` | GET | `/trips/{tripId}/eta` | FR19, FR40 | UC05 | AC16, AC33, AC62, AC69 |
| `05-trip-management.yaml` | POST | `/trips/{tripId}/cancellations` | FR20, FR40, FR41 | UC06 | AC34, AC36, AC62, AC63, AC69 |
| `05-trip-management.yaml` | POST | `/trips/{tripId}/cancellations/{cancellationId}/confirmation` | FR20, FR21, FR30, FR31, FR40, FR41 | UC04, UC05, UC06, UC13, UC14 | AC34, AC35, AC36, AC48, AC49, AC51, AC62, AC63, AC69 |
| `05-trip-management.yaml` | GET | `/customers/me/trips` | FR33, FR40 | UC08 | AC52, AC62, AC69 |
| `05-trip-management.yaml` | GET | `/admin/trips` | FR36, FR37, FR40 | UC20, UC21 | AC56, AC57, AC62, AC69 |
| `05-trip-management.yaml` | GET | `/admin/trips/{tripId}` | FR36, FR37, FR40 | UC20, UC21 | AC56, AC57, AC62, AC69 |
| `06-fare-payment.yaml` | GET | `/trips/{tripId}/bill` | FR22, FR23, FR40 | UC07, UC14 | AC37, AC38, AC39, AC62, AC69 |
| `06-fare-payment.yaml` | PUT | `/trips/{tripId}/payment-method` | FR23, FR40, FR41 | UC07 | AC39, AC62, AC63, AC69 |
| `06-fare-payment.yaml` | POST | `/drivers/me/trips/{tripId}/cash-confirmations` | FR24, FR32, FR40, FR41 | UC07, UC15 | AC40, AC50, AC51, AC62, AC63, AC69 |
| `06-fare-payment.yaml` | POST | `/trips/{tripId}/payments` | FR25, FR40, FR41 | UC07 | AC41, AC45, AC62, AC63, AC69 |
| `06-fare-payment.yaml` | POST | `/integrations/payments/{provider}/events` | FR26, FR27, FR32, FR41 | UC07, UC15 | AC42, AC43, AC44, AC46, AC50, AC51, AC63 |
| `06-fare-payment.yaml` | GET | `/payments/{paymentId}` | FR25, FR27, FR28, FR40 | UC07, UC23 | AC41, AC44, AC45, AC46, AC62, AC69 |
| `06-fare-payment.yaml` | POST | `/payments/{paymentId}/retries` | FR25, FR27, FR28, FR40, FR41 | UC07, UC23 | AC41, AC44, AC45, AC46, AC62, AC63, AC69 |
| `06-fare-payment.yaml` | POST | `/payments/{paymentId}/reconciliations` | FR26, FR27, FR28, FR32, FR40, FR41 | UC07, UC15, UC23 | AC42, AC43, AC44, AC45, AC46, AC50, AC51, AC62, AC63, AC69 |
| `06-fare-payment.yaml` | GET | `/admin/payments` | FR29, FR40 | UC22 | AC47, AC62, AC69 |
| `07-rating-feedback.yaml` | POST | `/trips/{tripId}/reviews` | FR34, FR40, FR41 | UC09 | AC53, AC54, AC62, AC63, AC69 |
| `08-reporting.yaml` | GET | `/admin/reports/operations` | FR39, FR40 | UC24 | AC60, AC61, AC62, AC69 |
| `09-support-management.yaml` | POST | `/admin/support-cases` | FR38, FR40, FR41 | UC23 | AC58, AC59, AC62, AC63, AC69 |
| `09-support-management.yaml` | PATCH | `/admin/support-cases/{supportCaseId}` | FR38, FR40, FR41 | UC23 | AC58, AC59, AC62, AC63, AC69 |
| `10-audit-log.yaml` | GET | `/admin/audit-logs` | FR40, FR42 | UC25 | AC62, AC64, AC69, AC71 |

## 5. Đối chiếu đầy đủ FR

| FR | Nội dung SRS | Cơ chế/nhóm liên quan |
|---|---|---|
| FR01 — Đăng ký tài khoản | Hệ thống cho phép khách hàng và tài xế đăng ký; kiểm tra thông tin bắt buộc và thông tin định danh bị trùng trước khi tạo tài khoản. | 01-identity-access.yaml |
| FR02 — Đăng nhập | Hệ thống xác thực thông tin đăng nhập và cho phép người dùng truy cập theo quyền được cấp. | 01-identity-access.yaml |
| FR03 — Cập nhật thông tin cá nhân | Hệ thống cho phép người dùng xem và cập nhật thông tin cá nhân của mình; kiểm tra dữ liệu trước khi lưu. | 01-identity-access.yaml |
| FR04 — Tạo tài khoản tài xế | Hệ thống cho phép nhân viên vận hành có quyền tạo tài khoản tài xế. | 01-identity-access.yaml |
| FR05 — Quản lý hồ sơ tài xế | Hệ thống cho phép tài xế cập nhật hồ sơ của mình và nhân viên vận hành có quyền tra cứu, cập nhật hồ sơ tài xế. | 03-driver-vehicle-management.yaml |
| FR06 — Quản lý phương tiện | Hệ thống cho phép ghi nhận, tra cứu và cập nhật thông tin phương tiện, loại xe và tài xế liên quan theo quyền được cấp. | 03-driver-vehicle-management.yaml |
| FR07 — Cập nhật trạng thái hoạt động | Hệ thống cho phép tài xế chuyển trạng thái sẵn sàng hoặc không sẵn sàng nhận chuyến khi đáp ứng điều kiện vận hành. | 03-driver-vehicle-management.yaml |
| FR08 — Ghi nhận vị trí tài xế | Hệ thống tiếp nhận và lưu vị trí tài xế cùng thời điểm cập nhật để phục vụ tìm tài xế và dự kiến thời gian đến. | 03-driver-vehicle-management.yaml |
| FR09 — Tạo yêu cầu đặt xe | Hệ thống cho phép khách hàng nhập điểm đón, điểm đến và chọn loại xe; kiểm tra dữ liệu trước khi ghi nhận yêu cầu. | 03-driver-vehicle-management.yaml, 04-booking-driver-dispatch.yaml |
| FR10 — Tìm tài xế phù hợp | Hệ thống xác định tài xế đáp ứng loại xe, trạng thái sẵn sàng, vị trí và các điều kiện vận hành đã thống nhất. | 04-booking-driver-dispatch.yaml |
| FR11 — Xếp thứ tự ưu tiên tài xế | Hệ thống sắp xếp các tài xế phù hợp theo chính sách ưu tiên, có xét khoảng cách đến điểm đón. | 04-booking-driver-dispatch.yaml |
| FR12 — Gửi lời mời nhận chuyến | Hệ thống gửi thông tin yêu cầu cho tài xế được chọn và ghi nhận thời hạn phản hồi. | 04-booking-driver-dispatch.yaml |
| FR13 — Phản hồi lời mời nhận chuyến | Hệ thống cho phép tài xế chấp nhận hoặc từ chối lời mời còn hiệu lực và ghi nhận kết quả. | 04-booking-driver-dispatch.yaml |
| FR14 — Xác nhận phân công tài xế | Khi tài xế chấp nhận, hệ thống kiểm tra lại điều kiện phân công; chỉ xác nhận một tài xế cho một yêu cầu và không phân công tài xế đang bận chuyến khác. | 04-booking-driver-dispatch.yaml |
| FR15 — Tìm tài xế thay thế | Khi tài xế từ chối, hết thời gian phản hồi hoặc không còn đủ điều kiện, hệ thống tiếp tục tìm tài xế khác trong cùng yêu cầu. | 04-booking-driver-dispatch.yaml |
| FR16 — Kết thúc tìm kiếm không thành công | Khi không có tài xế phù hợp hoặc đạt giới hạn tìm kiếm, hệ thống ghi nhận kết quả không tìm được tài xế và thông báo cho khách hàng. | 04-booking-driver-dispatch.yaml |
| FR17 — Cập nhật trạng thái chuyến | Hệ thống cho phép tài xế được phân công cập nhật đã đến điểm đón, đã đón khách, đang di chuyển và hoàn thành; từ chối chuyển trạng thái không hợp lệ. | 05-trip-management.yaml |
| FR18 — Xem thông tin chuyến hiện tại | Hệ thống cho phép khách hàng xem trạng thái tìm xe, trạng thái chuyến và thông tin tài xế được phân công cho chuyến của mình. | 05-trip-management.yaml |
| FR19 — Hiển thị thời gian đến dự kiến | Hệ thống tính hoặc lấy thời gian tài xế đến điểm đón dự kiến từ nguồn đã thống nhất và hiển thị cho khách hàng khi có dữ liệu. | 05-trip-management.yaml |
| FR20 — Yêu cầu hủy chuyến | Hệ thống tiếp nhận yêu cầu hủy và lý do; kiểm tra người yêu cầu, trạng thái chuyến và điều kiện hủy theo chính sách. | 05-trip-management.yaml |
| FR21 — Xác nhận và xử lý hủy chuyến | Sau xác nhận hợp lệ, hệ thống ghi nhận chuyến đã hủy, lý do và người thực hiện; dừng tìm kiếm hoặc kết thúc phân công, đồng thời ghi nhận phí hủy nếu có. | 05-trip-management.yaml |
| FR22 — Tính cước chuyến xe | Hệ thống tính và lưu số tiền phải trả sau khi chuyến hoàn thành theo loại dịch vụ, thông tin chuyến và công thức đã thống nhất. | 05-trip-management.yaml, 06-fare-payment.yaml |
| FR23 — Xem khoản phải trả và chọn thanh toán | Hệ thống hiển thị số tiền phải trả và cho khách hàng lựa chọn tiền mặt hoặc phương thức điện tử được hỗ trợ. | 06-fare-payment.yaml |
| FR24 — Xác nhận thanh toán tiền mặt | Hệ thống cho phép người có quyền xác nhận đã thu tiền mặt và ghi nhận người xác nhận, thời điểm, số tiền cùng chuyến liên quan. | 06-fare-payment.yaml |
| FR25 — Khởi tạo thanh toán điện tử | Hệ thống tạo yêu cầu thanh toán với nhà cung cấp bên ngoài và lưu mã tham chiếu giao dịch gắn với chuyến. | 06-fare-payment.yaml |
| FR26 — Ghi nhận kết quả thanh toán điện tử | Hệ thống tiếp nhận, xác minh và ghi nhận kết quả từ nhà cung cấp; xử lý kết quả trùng mà không ghi nhận thanh toán nhiều lần. | 06-fare-payment.yaml |
| FR27 — Xử lý thanh toán thất bại | Hệ thống hiển thị kết quả thất bại và cho phép xử lý lại theo chính sách; mỗi lần xử lý được ghi nhận để tra cứu. | 06-fare-payment.yaml |
| FR28 — Kiểm tra giao dịch chưa rõ kết quả | Hệ thống hỗ trợ kiểm tra kết quả giao dịch đang chờ xác nhận trước khi cho phép thanh toán lại theo chính sách. | 06-fare-payment.yaml |
| FR29 — Tra cứu giao dịch thanh toán | Hệ thống cho phép nhân viên có quyền tìm và xem giao dịch theo chuyến, thời gian hoặc trạng thái thanh toán. | 06-fare-payment.yaml |
| FR30 — Thông báo tiến trình chuyến | Hệ thống gửi thông báo cho khách hàng khi yêu cầu được tiếp nhận, có tài xế nhận chuyến, tài xế đến điểm đón và chuyến hoàn thành; thông báo hủy cho bên liên quan. | 04-booking-driver-dispatch.yaml, 05-trip-management.yaml, 11-notification-workflow.yaml |
| FR31 — Thông báo thay đổi cho tài xế | Hệ thống thông báo cho tài xế về các thay đổi liên quan đến chuyến được phân công. Lời mời chuyến mới được xử lý tại FR12. | 05-trip-management.yaml, 11-notification-workflow.yaml |
| FR32 — Thông báo kết quả thanh toán | Hệ thống thông báo kết quả thanh toán cho khách hàng sau khi kết quả được ghi nhận. | 06-fare-payment.yaml, 11-notification-workflow.yaml |
| FR33 — Xem lịch sử chuyến | Hệ thống cho phép khách hàng xem danh sách và chi tiết chuyến thuộc tài khoản của mình, bao gồm số tiền phải trả và trạng thái thanh toán. | 05-trip-management.yaml |
| FR34 — Gửi đánh giá tài xế | Hệ thống cho phép khách hàng đánh giá tài xế của chuyến đã hoàn thành; kiểm tra điều kiện và dữ liệu trước khi lưu. | 07-rating-feedback.yaml |
| FR35 — Quản lý khách hàng | Hệ thống cho phép nhân viên có quyền tra cứu và cập nhật các thông tin khách hàng được phép chỉnh sửa. | 02-customer-management.yaml |
| FR36 — Theo dõi hoạt động vận hành | Hệ thống cho phép nhân viên có quyền xem chuyến đang diễn ra, chi tiết chuyến và trạng thái tài xế. | 03-driver-vehicle-management.yaml, 05-trip-management.yaml |
| FR37 — Tra cứu lịch sử chuyến trong quản trị | Hệ thống cho phép nhân viên có quyền tìm và xem lịch sử chuyến theo khách hàng, tài xế, thời gian hoặc trạng thái. | 05-trip-management.yaml |
| FR38 — Ghi nhận xử lý sự cố | Hệ thống cho phép nhân viên có quyền ghi nhận sự cố, nội dung và kết quả xử lý gắn với chuyến hoặc giao dịch; lưu người thực hiện và thời điểm. | 09-support-management.yaml |
| FR39 — Xem báo cáo hoạt động | Hệ thống tổng hợp và hiển thị số lượng chuyến, doanh thu, tỷ lệ hoàn thành, tỷ lệ hủy và hiệu quả tài xế theo khoảng thời gian được chọn. | 08-reporting.yaml |
| FR40 — Kiểm tra quyền truy cập | Hệ thống kiểm tra vai trò, quyền và phạm vi dữ liệu trước khi cho phép thực hiện chức năng; từ chối truy cập không được phép. | 01-identity-access.yaml, 02-customer-management.yaml, 03-driver-vehicle-management.yaml, 04-booking-driver-dispatch.yaml, 05-trip-management.yaml, 06-fare-payment.yaml, 07-rating-feedback.yaml, 08-reporting.yaml, 09-support-management.yaml, 10-audit-log.yaml |
| FR41 — Ghi nhận thao tác quan trọng | Hệ thống lưu người thực hiện, hành động, đối tượng liên quan, thời điểm và kết quả của các thao tác thuộc danh sách cần lưu vết. | 01-identity-access.yaml, 02-customer-management.yaml, 03-driver-vehicle-management.yaml, 04-booking-driver-dispatch.yaml, 05-trip-management.yaml, 06-fare-payment.yaml, 07-rating-feedback.yaml, 09-support-management.yaml |
| FR42 — Tra cứu lưu vết | Hệ thống cho phép người có quyền tra cứu lưu vết theo người thực hiện, thời gian, hành động hoặc đối tượng liên quan. | 10-audit-log.yaml |

## 6. AC chức năng và phi chức năng

Tất cả AC01–AC64 được liên kết. YAML lưu x-ac-ids và x-ac-criteria, mapping mô tả API hoặc cơ chế kích hoạt, không chứng minh tiêu chí đã pass.

| AC | Tiêu chí nguyên văn SRS | API/cơ chế |
|---|---|---|
| AC01 | Khi thông tin đăng ký hợp lệ và định danh chưa tồn tại, hệ thống tạo đúng một tài khoản với vai trò khách hàng hoặc tài xế được chọn. | 01-identity-access.yaml |
| AC02 | Khi thiếu trường bắt buộc, sai định dạng hoặc trùng định danh, hệ thống không tạo tài khoản và thông báo nội dung cần sửa. | 01-identity-access.yaml |
| AC03 | Khi thông tin đăng nhập đúng và tài khoản được phép hoạt động, hệ thống tạo phiên truy cập hợp lệ. | 01-identity-access.yaml |
| AC04 | Khi thông tin đăng nhập sai hoặc tài khoản không được phép hoạt động, hệ thống không tạo phiên truy cập. | 01-identity-access.yaml |
| AC05 | Khi người dùng gửi thông tin cá nhân hợp lệ trong phạm vi được sửa, hệ thống lưu thay đổi và hiển thị dữ liệu mới. | 01-identity-access.yaml |
| AC06 | Khi cập nhật không hợp lệ hoặc người dùng cố sửa vai trò, quyền qua hồ sơ cá nhân, hệ thống không lưu thay đổi đó. | 01-identity-access.yaml |
| AC07 | Nhân viên có quyền tạo được tài khoản tài xế từ dữ liệu hợp lệ; hệ thống ghi nhận người tạo và thời điểm. | 01-identity-access.yaml |
| AC08 | Dữ liệu không hợp lệ hoặc định danh đã tồn tại không tạo thêm tài khoản tài xế. | 01-identity-access.yaml |
| AC09 | Tài xế sửa được trường hồ sơ của mình được phép sửa; nhân viên sửa được hồ sơ trong phạm vi quyền; dữ liệu hợp lệ được lưu. | 03-driver-vehicle-management.yaml |
| AC10 | Dữ liệu hồ sơ không hợp lệ hoặc thao tác ngoài quyền không làm thay đổi hồ sơ đã lưu. | 03-driver-vehicle-management.yaml |
| AC11 | Phương tiện chỉ được tạo hoặc cập nhật khi biển số không trùng phương tiện khác, loại xe và tài xế liên quan hợp lệ. | 03-driver-vehicle-management.yaml |
| AC12 | Tài xế không được cập nhật phương tiện ngoài quyền quản lý; thay đổi ảnh hưởng chuyến đang diễn ra phải tuân thủ chính sách đã thống nhất. | 03-driver-vehicle-management.yaml |
| AC13 | Tài xế đủ điều kiện có thể bật sẵn sàng; khi chuyển sang không sẵn sàng, tài xế không được xét cho chuyến mới. | 03-driver-vehicle-management.yaml |
| AC14 | Tài xế đang thực hiện chuyến không được coi là tài xế rảnh để nhận thêm; tắt nhận chuyến mới không tự hủy chuyến đã nhận. | 03-driver-vehicle-management.yaml |
| AC15 | Vị trí tài xế hợp lệ được lưu cùng thời điểm cập nhật; vị trí không hợp lệ không ghi đè vị trí hợp lệ đang có. | 03-driver-vehicle-management.yaml |
| AC16 | Vị trí không đáp ứng điều kiện về độ mới được xử lý theo chính sách; không được mặc nhiên dùng như vị trí hiện tại hợp lệ. | 03-driver-vehicle-management.yaml, 04-booking-driver-dispatch.yaml, 05-trip-management.yaml |
| AC17 | Với điểm đón, điểm đến và loại xe hợp lệ, hệ thống ghi nhận yêu cầu đặt xe và hiển thị trạng thái đang tìm tài xế. | 03-driver-vehicle-management.yaml, 04-booking-driver-dispatch.yaml |
| AC18 | Khi thông tin đặt xe không hợp lệ, hệ thống không đưa yêu cầu vào tìm tài xế và thông báo trường cần sửa. | 03-driver-vehicle-management.yaml, 04-booking-driver-dispatch.yaml |
| AC19 | Khi gửi lại cùng một thao tác tạo yêu cầu do lỗi kết nối, hệ thống không tạo nhiều yêu cầu trùng cho thao tác đó. | 04-booking-driver-dispatch.yaml |
| AC20 | Danh sách tài xế được xét chỉ gồm người sẵn sàng, phù hợp loại xe và đáp ứng các điều kiện vận hành đã thống nhất. | 04-booking-driver-dispatch.yaml |
| AC21 | Thứ tự mời tài xế tuân thủ chính sách ưu tiên đã thống nhất, có xét khoảng cách đến điểm đón. | 04-booking-driver-dispatch.yaml |
| AC22 | Lời mời được gửi đến đúng tài xế được chọn, có thông tin chuyến cần thiết và thời hạn phản hồi. | 04-booking-driver-dispatch.yaml |
| AC23 | Phản hồi chấp nhận hoặc từ chối của đúng tài xế được ghi nhận khi lời mời còn hiệu lực. | 04-booking-driver-dispatch.yaml |
| AC24 | Phản hồi sau khi lời mời hết hiệu lực không được dùng để xác nhận phân công. | 04-booking-driver-dispatch.yaml |
| AC25 | Phân công chỉ thành công khi yêu cầu còn hiệu lực, lời mời hợp lệ và tài xế chưa bận chuyến khác. | 04-booking-driver-dispatch.yaml |
| AC26 | Khi có thao tác đồng thời, mỗi chuyến chỉ được phân công một tài xế và mỗi tài xế không được nhận hai chuyến đang thực hiện. | 04-booking-driver-dispatch.yaml |
| AC27 | Khi tài xế từ chối, hết hạn hoặc không còn đủ điều kiện, hệ thống tìm tài xế khác trong cùng yêu cầu; khách hàng không phải đặt lại. | 04-booking-driver-dispatch.yaml |
| AC28 | Khi không còn tài xế phù hợp hoặc đạt giới hạn tìm kiếm, hệ thống kết thúc tìm và thông báo không tìm được tài xế; không ghi nhận thành khách hàng hủy. | 04-booking-driver-dispatch.yaml |
| AC29 | Tài xế được phân công cập nhật được các mốc hợp lệ; mỗi mốc được lưu cùng thời điểm và hiển thị trạng thái mới. | 05-trip-management.yaml |
| AC30 | Cập nhật sai thứ tự, bởi tài xế khác hoặc trên chuyến đã kết thúc bị từ chối; trạng thái hiện tại được giữ nguyên. | 05-trip-management.yaml |
| AC31 | Gửi lại cùng thao tác cập nhật không tạo thêm chuyển trạng thái hoặc ghi đè sai thời điểm của mốc đã ghi nhận. | 05-trip-management.yaml |
| AC32 | Khách hàng xem được trạng thái chuyến của mình và thông tin tài xế sau khi phân công; không xem được chuyến của khách hàng khác. | 05-trip-management.yaml |
| AC33 | Khi có dữ liệu đủ điều kiện, thời gian đến dự kiến được hiển thị; khi không đủ dữ liệu, hệ thống hiển thị chưa có ước tính. | 05-trip-management.yaml |
| AC34 | Hệ thống kiểm tra quyền, trạng thái và điều kiện hủy; yêu cầu không đủ điều kiện bị từ chối với thông báo lý do. | 05-trip-management.yaml |
| AC35 | Sau xác nhận hủy hợp lệ, hệ thống lưu người hủy, thời điểm, lý do; dừng tìm hoặc kết thúc phân công và không tiếp tục phân công chuyến đã hủy. | 05-trip-management.yaml |
| AC36 | Phí hủy chỉ được áp dụng theo chính sách và được hiển thị trước xác nhận; nếu khách hàng không xác nhận, chuyến chưa bị hủy bởi yêu cầu đó. | 05-trip-management.yaml |
| AC37 | Khi chuyến hoàn thành và đủ dữ liệu, hệ thống tính, lưu cước đúng công thức và quy tắc làm tròn đã thống nhất. | 05-trip-management.yaml, 06-fare-payment.yaml |
| AC38 | Khi thiếu dữ liệu tính cước, hệ thống không xác nhận cước cuối cùng; giữ kết quả chuyến hoàn thành và ghi nhận cần xử lý cước. | 05-trip-management.yaml, 06-fare-payment.yaml |
| AC39 | Khách hàng xem được khoản phải trả và lựa chọn tiền mặt hoặc phương thức điện tử được hỗ trợ. | 06-fare-payment.yaml |
| AC40 | Thanh toán tiền mặt chỉ được ghi nhận thành công sau xác nhận của người có quyền; lưu số tiền, người xác nhận, thời điểm và chuyến liên quan. | 06-fare-payment.yaml |
| AC41 | Giao dịch điện tử được tạo với đúng chuyến và số tiền; thông tin tham chiếu được lưu để theo dõi kết quả. | 06-fare-payment.yaml |
| AC42 | Chỉ kết quả hợp lệ đã được xác minh từ nhà cung cấp mới làm thay đổi trạng thái thanh toán. | 06-fare-payment.yaml |
| AC43 | Kết quả giao dịch gửi lặp không làm ghi nhận thu tiền nhiều lần; kết quả không hợp lệ không được ghi nhận thành công. | 06-fare-payment.yaml |
| AC44 | Thanh toán thất bại được ghi nhận và thông báo; khách hàng xử lý lại theo chính sách, các lần xử lý vẫn tra cứu được. | 06-fare-payment.yaml |
| AC45 | Giao dịch chưa rõ kết quả được kiểm tra trước khi cho phép trả lại; khoản đã thanh toán đủ không được thu lại trong luồng thông thường. | 06-fare-payment.yaml |
| AC46 | Thanh toán thất bại hoặc đang chờ không làm chuyến đã hoàn thành trở thành chuyến chưa hoàn thành. | 05-trip-management.yaml, 06-fare-payment.yaml |
| AC47 | Nhân viên có quyền tìm và xem được các lần thanh toán theo điều kiện; không có kết quả thì hiển thị danh sách trống. | 06-fare-payment.yaml |
| AC48 | Khách hàng nhận thông báo tại các mốc tiếp nhận yêu cầu, phân công, đến điểm đón và hoàn thành; thông báo hủy được gửi đến bên liên quan. | 04-booking-driver-dispatch.yaml, 05-trip-management.yaml, 11-notification-workflow.yaml |
| AC49 | Thay đổi liên quan đến chuyến được thông báo đúng tài xế được phân công. | 05-trip-management.yaml, 11-notification-workflow.yaml |
| AC50 | Kết quả thanh toán được thông báo cho đúng khách hàng và nhất quán với trạng thái đã ghi nhận. | 06-fare-payment.yaml, 11-notification-workflow.yaml |
| AC51 | Lỗi gửi thông báo không làm đảo ngược hoặc mất kết quả đặt xe, cập nhật chuyến hay thanh toán đã lưu. | 04-booking-driver-dispatch.yaml, 05-trip-management.yaml, 06-fare-payment.yaml, 11-notification-workflow.yaml |
| AC52 | Khách hàng xem được danh sách, chi tiết và khoản phải trả của chuyến thuộc mình; chuyến chưa xác định cước được hiển thị rõ. | 05-trip-management.yaml |
| AC53 | Đánh giá được lưu khi người gửi là khách hàng của chuyến đã hoàn thành và điểm nằm trong thang cho phép. | 07-rating-feedback.yaml |
| AC54 | Chuyến chưa hoàn thành, chuyến của người khác, điểm không hợp lệ hoặc đánh giá trùng bị từ chối theo quy tắc đã thống nhất. | 07-rating-feedback.yaml |
| AC55 | Nhân viên có quyền tra cứu và cập nhật trường khách hàng được phép; thay đổi hợp lệ được lưu và thao tác quan trọng được ghi vết. | 02-customer-management.yaml |
| AC56 | Nhân viên có quyền xem chuyến đang diễn ra, trạng thái tài xế và chi tiết được phép; dữ liệu chưa cập nhật được nhận diện rõ. | 03-driver-vehicle-management.yaml, 05-trip-management.yaml |
| AC57 | Lịch sử chuyến được trả về đúng điều kiện lọc và phạm vi quyền; khoảng thời gian không hợp lệ được yêu cầu sửa. | 05-trip-management.yaml |
| AC58 | Hồ sơ sự cố được lưu với chuyến, nội dung và trạng thái; nếu gắn giao dịch, giao dịch phải thuộc cùng chuyến. | 09-support-management.yaml |
| AC59 | Kết quả xử lý được lưu cùng người xử lý và thời điểm; người vượt quyền không được thực hiện biện pháp xử lý bị hạn chế. | 09-support-management.yaml |
| AC60 | Báo cáo tính đúng các chỉ số theo công thức đã thống nhất trên bộ dữ liệu kiểm thử và khoảng thời gian được chọn. | 08-reporting.yaml |
| AC61 | Khi không có dữ liệu hoặc mẫu số bằng 0, báo cáo hiển thị rõ tình trạng; không phát sinh lỗi chia và không tạo tỷ lệ thiếu căn cứ. | 08-reporting.yaml |
| AC62 | Người chưa xác thực, phiên không hợp lệ hoặc không đủ quyền không được truy cập chức năng và dữ liệu bị hạn chế, kể cả khi gọi trực tiếp API. | 01-identity-access.yaml, 02-customer-management.yaml, 03-driver-vehicle-management.yaml, 04-booking-driver-dispatch.yaml, 05-trip-management.yaml, 06-fare-payment.yaml, 07-rating-feedback.yaml, 08-reporting.yaml, 09-support-management.yaml, 10-audit-log.yaml |
| AC63 | Thao tác thuộc danh sách lưu vết có bản ghi gồm người hoặc hệ thống thực hiện, hành động, đối tượng, thời điểm và kết quả. | 01-identity-access.yaml, 02-customer-management.yaml, 03-driver-vehicle-management.yaml, 04-booking-driver-dispatch.yaml, 05-trip-management.yaml, 06-fare-payment.yaml, 07-rating-feedback.yaml, 09-support-management.yaml |
| AC64 | Người có quyền tra cứu được lưu vết theo điều kiện; người không có quyền bị từ chối; chức năng không cho phép sửa hoặc xóa lưu vết. | 10-audit-log.yaml |
| AC65 | Trong môi trường và kịch bản tải đã xác định với 50 người dùng đồng thời, ít nhất 95% yêu cầu thông thường phản hồi trong 2 giây; không tính thời gian chờ tài xế hoặc bên ngoài. | Kiểm chứng runtime/hạ tầng/UI theo SRS; không thêm endpoint nghiệp vụ. |
| AC66 | Khi kết nối bình thường, trạng thái chuyến mới được hiển thị trong 5 giây kể từ khi CAB ghi nhận thành công. | Kiểm chứng runtime/hạ tầng/UI theo SRS; không thêm endpoint nghiệp vụ. |
| AC67 | Khi giả lập lỗi thanh toán hoặc thông báo, các thao tác tạo yêu cầu, tìm tài xế và theo dõi chuyến vẫn hoạt động. | Kiểm chứng runtime/hạ tầng/UI theo SRS; không thêm endpoint nghiệp vụ. |
| AC68 | Thao tác đồng thời, gửi lại hoặc mất kết nối không gây phân công trùng, thanh toán trùng hoặc mất kết quả đã ghi nhận. | Kiểm chứng runtime/hạ tầng/UI theo SRS; không thêm endpoint nghiệp vụ. |
| AC69 | Phiên hết hạn hoặc bị thu hồi không truy cập được chức năng bảo vệ; quyền được kiểm tra tại máy chủ. | Kiểm chứng runtime/hạ tầng/UI theo SRS; không thêm endpoint nghiệp vụ. |
| AC70 | Mật khẩu không lưu dạng rõ; dữ liệu truyền được bảo vệ trong môi trường triển khai; dữ liệu nhạy cảm không xuất hiện trái phép trong dữ liệu trả về, cơ sở dữ liệu hoặc nhật ký. | Kiểm chứng runtime/hạ tầng/UI theo SRS; không thêm endpoint nghiệp vụ. |
| AC71 | Người dùng thông thường không sửa hoặc xóa được lưu vết; thời gian lưu tuân thủ chính sách đã xác nhận. | Kiểm chứng runtime/hạ tầng/UI theo SRS; không thêm endpoint nghiệp vụ. |
| AC72 | Bản sao lưu được tạo hằng ngày và khôi phục thử thành công; theo mức đề xuất, dữ liệu mất không quá 24 giờ và khôi phục trong 4 giờ. | Kiểm chứng runtime/hạ tầng/UI theo SRS; không thêm endpoint nghiệp vụ. |
| AC73 | Các luồng chính hoạt động trên trình duyệt và kích thước màn hình đã chọn; thông báo lỗi rõ ràng và giữ lại dữ liệu hợp lệ khi yêu cầu sửa. | Kiểm chứng runtime/hạ tầng/UI theo SRS; không thêm endpoint nghiệp vụ. |
| AC74 | Lỗi được ghi nhận với thông tin đủ để liên kết đến yêu cầu liên quan; tình trạng thành phần có thể được kiểm tra mà không lộ dữ liệu nhạy cảm. | Kiểm chứng runtime/hạ tầng/UI theo SRS; không thêm endpoint nghiệp vụ. |

## 7. Phạm vi bản cơ bản và phần chưa chốt

So với bản 57 file endpoint: gộp theo nhóm nghiệp vụ, hợp nhất phương tiện tài xế/admin theo quyền, bỏ endpoint get-by-id/list-current dư khi danh sách hoặc endpoint chi tiết sẵn có đáp ứng cùng mục tiêu. Không cắt FR/AC để đạt số lượng file. Không thêm DELETE, thay đổi quyền, hoàn tiền hay gửi thông báo tùy ý.

Chưa chốt: policy đăng ký/hồ sơ, điều kiện tài xế/xe, ưu tiên/thời hạn lời mời/giới hạn tìm, freshness/ETA, phí và quyền hủy, cước/làm tròn, xác nhận tiền mặt, retry/provider signature, thang đánh giá, báo cáo/audit retention. Không đưa con số tùy ý thành yêu cầu đã được phê duyệt.

Tách dữ liệu/worker/service cần thiết kế tiếp nếu chọn microservices. Gói hiện là hợp đồng API phía client/gateway và workflow nội bộ mức cơ bản; không phải đủ hợp đồng giao tiếp mọi microservice.
