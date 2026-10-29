# Báo cáo tổng kiểm tra CAB System — 28/10/2026

## Reset lần2 và chẩn đoán đặt chuyến thứ hai — 29/10/2026

Người dùng xác nhận muốn d01 nhận chuyến2 sau khi hoàn thành chuyến1. Trước reset DB chỉ có một Booking mới b21/t04 COMPLETED. Đã tái hiện: POST đúng key/body cũ trả200 b21 với responseSnapshot SEARCHING, GET b21 trả trạng thái hiện tại COMPLETED. POST với key mới tạo b22/201 và offer i05 đúng d01; đã hủy Booking proof trước ACCEPT. Không phải d01 không được tái sử dụng; dùng cùng key là replay theo yêu cầu câu30, không được bỏ cơ chế này.

Sau đó backup đủ8 DB, kiểm20 queue rỗng, reset có chọn lọc b21/b22/t04/i04/i05,11 notification và event liên quan; giữ20 Booking mẫu/3 Trip mẫu/tài khoản/APPROVED/chính sách không hạn. d01 online,rảnh,tọa độ10.8/106.7. Bộ đếm tiếp b21/t04/i04. Mỗi service kiểm preservation theo snapshot trong transaction, không sửa source backend, không xóa volume. Evidence kiểm nguyên nhân `.local/evidence/second-booking-idempotency-2026-10-29T06-40-31-631Z.json`; reset `.local/evidence/reset-manual-flow-second-2026-10-29T06-43-38-959Z.json`. Backup tại `.local/reset-manual-flow-20261029-2/`; hướng dẫn đã thêm bảng key chuyến1/chuyến2. Không cần build Docker.

## Hiển thị tid đầu response nhận chuyến — 29/10/2026

API nhận chuyến vốn đã trả tid ngoài cùng nhưng ở cuối JSON. Đã đưa tid lên đầu riêng response có invitation+booking+tid tại Gateway; không đổi hợp đồng, nghiệp vụ hay tạo Trip mới. Postman giữ auto-save tid và thêm assertion tid khớp booking.tid khi ACCEPTED; URL guide hướng dẫn dùng biến tid cho câu17. Rebuild/restart riêng Gateway. Kiểm thực tế replay i04 đã ACCEPTED trả tid=t04 ở dòng đầu, toàn bộ giá trị response giữ nguyên so với trước sửa; không tạo lại hoặc thay trạng thái chuyến. Evidence `.local/evidence/invitation-tid-first-2026-10-29T06-26-04-253Z.json` (xem file invitation-tid-first mới nhất trong .local/evidence). Unit39/39, check28/28 và Postman48 operation đạt.

## B25 không xuất hiện trong invitations d01 — 29/10/2026

Read-only kiểm thực tế: b24/t05 d01 COMPLETED, Driver hiện không activeTrip. B25 tạo04:23:17Z (11:23 giờ Việt Nam), candidates=[d02], cursor1, status SEARCHING; invitation i07 có driver d02/PENDING. D02 Login đọc invitations và notification n47/booking.invitation_created/b25 được200. D01 location pickup cập nhật04:28:09Z (11:28), sau khi b25 đã tạo. Không có lỗi mất offer hoặc giữ chỗ chưa release qua quan sát hiện tại; b25 đã chọn d02 và không tự đổi người nhận khi d01 cập nhật vị trí sau đó.

Đã bổ sung đúng thứ tự câu18: Driver rảnh → đưa tọa độ về pickup → online → Customer tạo Booking bằng key mới → đúng Driver nhận offer. Chưa hủy/chuyển/nhận b25 thay người dùng. Bằng chứng API `.local/evidence/b25-d02-diagnosis-2026-10-29T04-37-04-919Z.json`, DB đọc riêng owner tại `.local/b25-review-20261029/booking-diagnostic.txt`. Chỉ chỉnh hướng dẫn, không đổi backend hoặc dữ liệu; không cần build Docker.

## Bỏ hạn nhận offer theo yêu cầu demo — 29/10/2026

Booking search không tự đổi PENDING sang EXPIRED; RespondInvitation không kiểm expires_at. Offer mới và event booking.invitation_created không sinh expiry; API view không trả expiresAt. Proto giữ tag8 optional/deprecated và event schema vẫn nhận expiry lịch sử nhưng không bắt buộc cho event mới; trạng thái EXPIRED cũ không được hồi sinh. Giữ đúng Driver, PENDING/SEARCHING, APPROVED/online/không bận, reservation/unique chống nhận2 chuyến. Khi không phản hồi, offer chờ vô thời hạn; Driver REJECT để xét ứng viên tiếp theo hoặc Customer hủy. Không bỏ TTL JWT/OTP/callback hay deadline gRPC.

Đã đồng bộ code/Proto/OpenAPI05/event schema+example/contracts/SRS/Bounded Context/hướng dẫn và smoke-dispatch (thay kịch bản timeout bằng nhận chậm). Rebuild/restart Gateway, Booking, Notification để consumer dùng event schema mới. Unit39/39, check28/28 và Postman48 operation đạt. Runtime tạo b23, chờ35 giây trước Login d01, notifications có offer i05, PENDING không expiresAt; ACCEPT200 tạo t04 ASSIGNED. Sau đó Customer hủy Booking/Trip kiểm thử và đợi Driver rảnh, giữ vị trí/online ban đầu; b21 NO_DRIVER không đổi. Evidence `.local/evidence/no-offer-expiry-2026-10-29T03-22-57-636Z.json`; checkpoint `.local/no-offer-expiry-20261029/source-before.zip`. Không tạo Payment/account mới, không xóa dữ liệu cũ.

## Demo dùng vị trí cuối cùng — bỏ hạn120 giây theo yêu cầu 29/10

Đã bỏ age guard tại Driver eligible/SetAvailability, Booking search (recheck candidate) và ETA. Vẫn giữ yêu cầu có vị trí, account ACTIVE, APPROVED, online, BIKE active, không bận/giữ chỗ, khoảng cách <=1 km. Không ghi lại updatedAt khi đọc hoặc bật online. locationIsFresh vẫn tính tuổi thật để ADMIN tham khảo, không chặn nghiệp vụ; hạn offer30 giây giữ nguyên. SRS RULE13/AC23/AC28/AC43, Bounded Context, API/contracts/runbook và hướng dẫn đã đồng bộ; không thêm config/abstraction.

Rebuild/restart Gateway, Driver và Booking thành công. Unit38/38, check27/27 và Postman48 operation đạt. Runtime dùng d01.location.updatedAt=2026-10-28T15:51:24.941Z không refresh: bật online200, Customer nearby thấy d01, offline không xuất hiện và tọa độ xa không thấy ai. Booking b22 gửi invitation i04 và notification cho d01. Sau kiểm thử đã hủy b22 trước ACCEPT, không tạo Trip/Payment; Driver còn rảnh và location/timestamp/online giữ nguyên. b21 vẫn NO_DRIVER, không hồi sinh Booking cũ; người dùng tạo Booking mới bằng key mới để thử. Evidence `.local/evidence/last-known-location-2026-10-29T03-09-36-147Z.json`, source checkpoint `.local/last-known-location-20261029/source-before.zip`.

## Kiểm tra b21 không có thông báo Driver — 29/10/2026

Đã đọc thực tế qua Gateway và DB của booking_service: b21 của c01 tạo lúc02:45:11.736Z, chuyển NO_DRIVER lúc02:45:11.882Z, candidates=[], cursor0, không có invitation. D01 online/APPROVED nhưng location.updatedAt=2026-10-28T15:51:24.941Z, trước lúc đặt hơn10 giờ; d02 cũng vị trí cũ. FindCandidates loại vị trí quá120 giây nên chưa phát booking.invitation_created cho b21, không phải Notification làm mất offer. Notifications d01 có12 bản ghi nhưng không có b21; lịch sử invitations d01 cũng không có b21. Health12 thành phần healthy. Không gán mặc định c01→d01 hoặc sửa Booking NO_DRIVER.

Read-only diagnostics tại `.local/booking-b21-review-20261029/`, API evidence `.local/evidence/b21-driver-notifications-2026-10-29T02-58-15-090Z.json`. Đã thêm cảnh báo chuẩn bị tọa độ trước câu15, Login/online không làm mới vị trí và cần key mới nếu Booking cũ NO_DRIVER. Không đổi code, dữ liệu hoặc hàng đợi; không cần rebuild Docker.

## Duyệt toàn bộ Driver mẫu — 29/10/2026

Theo yêu cầu mới chỉ áp dụng cho bộ mẫu hiện có, d05 đã Submit lại REJECTED→PENDING qua API của chính d05; ADMIN duyệt d04/d05 APPROVED qua Gateway. Cả5 d01–d05 hiện APPROVED. Đã kiểm giữ nguyên aid/name/email/license/online/location/vehicle so với snapshot trước; lý do từ chối d05 được xóa theo logic duyệt, thời gian duyệt cập nhật. D01/d02 online, d03/d04/d05 offline. Không tự cấp online hay bỏ điều kiện khoảng cách/freshness. Tài khoản đăng ký mới vẫn qua OTP/DRAFT/Submit PENDING và ADMIN quyết định; không sửa backend/enum hay bật auto-approval.

Snapshot trước/sau nằm tại `.local/approve-demo-drivers-20261029/` (private, ignored). Evidence `.local/evidence/approve-demo-drivers-2026-10-29T02-39-10-344Z.json`. Đã đồng bộ trạng thái bộ mẫu ở hướng dẫn URL, hướng dẫn nhập tay và ACCOUNTS.local.md; các kết quả REJECTED trước đó là lịch sử kiểm thử. Không cần rebuild/restart Docker.

## Rà soát hồ sơ Driver bị từ chối — 29/10/2026

Đã đối chiếu SRS RULE34/AC13/AC18/AC21: DriverProfile là hồ sơ đăng ký, role DRIVER không tự cấp quyền nhận chuyến. DB qua API hiện có d05 REJECTED/offline, d04 PENDING/offline; không thấy enum REJECT trong kết quả. Runtime xác nhận d05 Login/đọc hồ sơ được để bổ sung, bật online bị409, tự PATCH approvalStatus bị400, Customer nearby ngay tọa độ d05 không có d05; hồ sơ không bị thay đổi sau các thử lỗi. API filter approvalStatus=REJECT trả400. Bằng chứng `.local/evidence/driver-approval-review-2026-10-29T02-28-14-165Z.json`.

Không tìm thấy lỗi cấp quyền để sửa backend; giữ luồng REJECTED→sửa→PENDING→duyệt, không xóa dữ liệu hay đổi vai trò. Đã bổ sung bảng ý nghĩa trạng thái/quyền và cách gọi hồ sơ đăng ký tại URL_POSTMAN_30.md, MANUAL_POSTMAN_30.md. ADMIN tra cứu hồ sơ từ chối không có nghĩa được phép nhận chuyến. Chỉ thay tài liệu, không cần rebuild/restart Docker.

## Tên tài xế ngay trong danh sách Booking

Đã sửa views.booking để trả did và DriverPublic snapshot gồm did/name/vehicle sau khi đã có trip_id. Dùng operation.dispatch.driver đã lưu, không thêm gRPC query cho từng item hay đổi dữ liệu Mongo. Thêm Proto Booking fields12/13 optional; đồng bộ Booking schema trong04-bookings và05-invitations (kèm DriverPublic/Vehicle), Postman assertions và contracts snapshot. Các responseSnapshot idempotency cũ vẫn giữ nguyên; NO_DRIVER không có Driver; không tiết lộ email/license/aid của Driver cho Customer qua danh sách Booking.

Rebuild/restart Gateway và Booking thành công. npm test38/38, check27/27 và Postman48 operation đạt. Runtime ADMIN/Customer c02 trả cùng danh sách, b18 có d01/name NGUYEN VAN HUNG/xe v01, NO_DRIVER không có driver, chi tiết b19/b20 cũng có snapshot, khác chủ403. Evidence `.local/evidence/booking-driver-list-2026-10-28T16-00-45-698Z.json`. Source checkpoint `.local/booking-driver-list-20261028/source-before.zip`. Không tạo Booking/Trip mới trong lần sửa này.

## Thêm Booking COMPLETED theo yêu cầu rõ ràng mới của người dùng

Sau khi người dùng yêu cầu Booking đã hoàn thành chuyến, đã tạo3 Booking thật và thực hiện Driver ACCEPT/arrival/start/location/completion qua Gateway: c02 b18/t01, c03 b19/t02, c04 b20/t03. d01 thực hiện tuần tự; completedAt của chuyến trước <=assignedAt chuyến sau. Driver ban đầu không bận và không có offer PENDING, không hủy/chiếm chuyến cũ. Hoàn tất đã trả tọa độ và online về giá trị trước chạy. Không tạo Payment. Lần này được cấp phép riêng cho3 chuyến COMPLETED, không chạy lại kế hoạch12 chuyến đã bị chặn trước đây.

Kiểm tra ADMIN và Customer cho từng cid khớp danh sách, Booking SEARCHING đã hiện ở cả hai phía trước nhận chuyến, sau đó đồng bộ COMPLETED; đọc chi tiết có trip.did/trip.driver tên/xe; chặn Customer đọc Booking người khác403. c01 giữ5; c02/c03/c04 mỗi khách4; c05 giữ3; tổng20. Snapshot trước tạo và tiến độ tại `.local/completed-bookings-20261028/progress.private.json`, tổng hợp verification.json. Evidence `.local/evidence/completed-bookings-2026-10-28T15-51-24-923Z.json` và `.local/evidence/completed-booking-details-2026-10-28T15-51-59-474Z.json`. Không sửa backend hoặc cấu hình, không cần rebuild/restart Docker.

## Thêm 3 Booking lịch sử cho mỗi c02–c05

Đã tiếp tục tiến trình bị ngắt theo phương án Booking-only. Bộ duyệt tự động đã từ chối phương án tạo/hoàn thành12 Trip thật vì tác động ngoài thêm Booking; lệnh đó chưa chạy. Phương án đã thực hiện chỉ ghi12 lịch sử NO_DRIVER/CANCELED vào database thuộc booking_service, transaction và bộ đếm ID hiện hành, không tạo Trip/event/payment hay gán tài xế. Sao lưu trước thêm tại `.local/customer-bookings-20261028/bookings-before.private.json`; danh sách mới tại created.json, kết quả tại verification.json cùng thư mục (Git ignored). Không xóa/đổi dữ liệu cũ, tài khoản hoặc trạng thái Driver.

c01 vẫn5 Booking b01–b05; c02 b06–b08, c03 b09–b11, c04 b12–b14, c05 b15–b17 (mỗi khách3), tổng17. ADMIN lọc từng cid khớp hoàn toàn lịch sử token Customer tương ứng, phân trang mỗi khách mới2–1, khác chủ403, Customer gọi admin route403, ready200. Evidence `.local/evidence/customer-bookings-history-2026-10-28T09-20-58-304Z.json`. Không có Driver được phân công trong12 mẫu mới nên không phát sinh xung đột lịch; chưa dùng bộ mẫu này để chứng minh tái sử dụng Driver ở các Trip khác thời điểm. Chức năng xem Booking đang đặt vẫn dùng cùng API, không có bộ lọc trạng thái mặc định. Không thay backend/Compose; không cần rebuild/restart Docker.

## Câu 14 — lịch sử Booking của Customer được chọn

Đối chiếu trực tiếp PHIEU_CHAM_PROJECT.pdf trang2: Booking liên quan Customer, có ít nhất5 Booking mẫu, limit/paging; không quy định role ADMIN trong tiêu chí này. Theo lựa chọn người dùng, dùng ADMIN GET `/api/v1/admin/bookings?cid=c01&page=1&limit=2`. Backend đã lọc customer_id và không mặc định giới hạn ngày/trạng thái; không cần đổi code, không thêm API. Booking mới của cùng Customer sẽ nằm trong lịch sử khi đọc lại. Endpoint quản trị không cid vẫn phục vụ tra cứu toàn bộ, được tách khỏi phép thử chính câu14 trong hướng dẫn.

Đã sửa request Postman listBookings mặc định dùng cid và thêm assertion đúng Customer; cập nhật URL guide và ma trận. Runtime chỉ đọc: ADMIN c01 có5/c02 có0, lịch sử khớp Customer, page1 b01/b02 và page2 b03/b04 không trùng; cid=01 sai trả400, Customer gọi admin route403. Evidence `.local/evidence/customer-booking-filter-2026-10-28T09-05-14-014Z.json`. Không tạo/xóa Booking trong lần kiểm này. Không thay code/YAML/Proto/Compose nên không rebuild/restart Docker cho thay đổi này.

## Vị trí Driver và hồ sơ ADMIN nearby — cập nhật mới nhất

Đã sao lưu source và 5 hồ sơ tại `.local/driver-positions-20261028/` trước chỉnh sửa. Chỉ đổi location/version của d01–d05; giữ nguyên tài khoản, tên, approvalStatus, online, xe, ID và Booking. 5 tọa độ khác nhau: d01/d02/d03 cách điểm (10.8,106.7) lần lượt 0m/312m/556m; d04/d05 cách 2,224km/3,117km nên bị loại khỏi nearby tại đây. Không xóa dữ liệu.

ADMIN nhận items[].driver đầy đủ, khớp GET /drivers/{did}; CUSTOMER vẫn DriverPublic, không email/aid/license. Proto thêm admin_profile optional nội bộ, Gateway đưa về driver và bỏ adminProfile; YAML/Postman/contracts/guide đã đồng bộ. Rebuild/restart Gateway/Driver thành công. npm test37/37, check26/26 và Postman48 operation đạt. Runtime xác nhận đúng 3 ID, hai Driver ngoài 1km không xuất hiện, 5 vị trí riêng, phân trang limit2 có 2–1 item và quyền riêng tư Customer. Evidence `.local/evidence/driver-positions-2026-10-28T08-31-34-636Z.json`. Các kết quả 5 Driver cùng trong 1km bên dưới là lịch sử trước lần cập nhật này.

## ADMIN tra cứu câu 11–14 theo yêu cầu mới

ADMIN dùng list/get Customer, Driver, Booking và `GET /api/v1/admin/drivers/nearby?latitude=10.8&longitude=106.7&page=1&limit=2`. URL chung `/drivers/nearby` với ADMIN có cùng hành vi. Tra cứu trong 1 km dựa trên tọa độ cuối cùng, gồm offline/PENDING/REJECTED/vị trí cũ; response bổ sung approvalStatus/isOnline/locationIsFresh. CUSTOMER nearby và booking dispatch giữ nguyên bộ lọc nhận chuyến và freshness120 giây. Không sửa timestamps/online hay dữ liệu tài khoản để tạo kết quả.

Đã đồng bộ Gateway/YAML, Proto common (field optional), Driver, mapping, SRS/contracts, Postman catalog và hướng dẫn. Thêm 1 REST operation, tổng48; dùng lại ListNearbyDrivers gRPC, không thêm service/RPC. Rebuild/restart Gateway và Driver thành công. npm test37/37, npm run check26/26 và kiểm Postman đủ48 operation đạt. Runtime20 HTTP checks đạt: ADMIN câu11–14, nearby alias, 5 vị trí cũ vẫn thấy, 2 trang limit2 không trùng, limit1 đúng1 item, tọa độ xa rỗng, sai quyền403/thiếu token401/input sai400; Customer nearby vẫn không thấy tài xế offline/chờ duyệt/vị trí cũ. Evidence `.local/evidence/admin-search-2026-10-28T08-08-43-679Z.json`. Hướng dẫn thực hiện: [URL_POSTMAN_30.md](URL_POSTMAN_30.md).

## Bộ dữ liệu demo mới — thay thế dữ liệu kiểm thử cũ

Người dùng đã xác nhận xóa Customer/Driver/Booking cũ cùng Trip/Payment mock/Rating/Notification/OTP/event/idempotency liên quan sau sao lưu. Đã sao lưu đủ 8 database và source tại `.local/demo-reset-20261028/`, ghi SHA256; 20 queue đã rỗng trước khi làm sạch. Mỗi thao tác DB dùng quyền của service sở hữu và transaction. Không drop database, không xóa volumes/secrets; mọi ADMIN giữ nguyên toàn bộ document và password.

- Customer c01–c05 và Driver d01–d05: tên tiếng Việt IN HOA không dấu. Thông tin đăng nhập chỉ lưu local tại `.local/demo-reset-20261028/ACCOUNTS.local.md`, không đưa credentials vào Postman template/Git.
- d01/d02 APPROVED + online gần A; d03 APPROVED/offline; d04 PENDING; d05 REJECTED. Vị trí phải refresh trong 120 giây trước nearby, không tự gia hạn hay bỏ điều kiện freshness.
- Booking b01–b05 của c01: b01–b03 NO_DRIVER, b04–b05 CANCELED. Đây là lịch sử mẫu, không tạo Trip COMPLETED giả. Trip/Payment/Review/Notification ban đầu rỗng. Các ID mới tiếp theo c06/d06/b06; kiểm chứng bằng counter, không tạo account thừa để thử.
- Runtime qua Gateway: login, danh sách đúng 5/5/5, nearby đúng d01/d02, tọa độ và mã A cùng kết quả, phân trang Booking 2–2–1, ownership403, sai password401 đều đạt. Evidence `.local/evidence/demo-reset-2026-10-28T06-50-57-940Z.json`. Đã verify số lượng/counter/hash của từng DB và ADMIN so với backup.

Các bằng chứng audit bên dưới là lịch sử trước khi làm sạch: account/ID như c29 hoặc d09 không còn trong bộ mẫu hiện tại. Không chạy lại seed/fixture cũ nếu muốn giữ đúng bộ mẫu 5/5/5. Trạng thái 30 tiêu chí không tự nâng PASS từ việc seed dữ liệu.

## Sửa quyền ADMIN nearby — câu 13

Gateway trước đây chỉ cho CUSTOMER trong YAML, trong khi Driver Service đã cho CUSTOMER/ADMIN. Đã đồng bộ YAML, thêm kiểm tra hợp đồng roles, rebuild/restart riêng Gateway. npm test 37/37 và npm run check đạt. Runtime ADMIN/CUSTOMER nearby HTTP200; A và tọa độ 10.8/106.7 trả cùng kết quả; No Auth401, trộn hai dạng vị trí400. Evidence: .local/evidence/nearby-admin-fix-2026-10-28T06-38-50-378Z.json. Lúc kiểm tra totalItems=0; d09 APPROVED nhưng offline và vị trí cũ nên không đủ điều kiện nearby. Không thay đổi trạng thái Driver để tạo kết quả giả.

## Cập nhật ID công khai theo yêu cầu mới

Người dùng xác nhận đổi cả tên field và giá trị: cid/c29, did/d01, aid/a01, bid/b01, tid/t01, pid/p01, nid/n01, rid/r01; bổ sung vid (Vehicle), iid (Invitation), oid (OTP challenge). Tất cả ID do server cấp. Customer/Driver ID chính là cid/did; không còn một customerId/driverId dài để nhập URL. Mongo _id và JWT sub giữ nội bộ để bảo toàn account/ownership. Không có API đăng ký ADMIN mới; ADMIN hiện có cũng nhận aid.

**Đã kiểm thực:** GET /api/v1/customers/c29 bằng ADMIN →200, response cid=c29/aid=a38; Customer khác →403. URL ObjectId cũ →400. GET Customer/Driver của chủ sở hữu theo mã ngắn →200. Các danh sách ADMIN trả cid/did/bid/tid/pid ngắn cho cả dữ liệu cũ và mới; Vehicle có vid, Review có rid, Notification có nid/aid và bid/tid/pid/did theo đối tượng.

### Dữ liệu và bảo toàn

- Checkpoint source trước sửa: .local/short-ids-20261028-122717/source-before.zip; file URL_POSTMAN_30.md chưa commit từ lượt trước cũng được giữ trong checkpoint.
- Đã dừng ứng dụng sau khi xác nhận queues rỗng; sao lưu đủ 8 database bằng user của service sở hữu. Backup riêng ở cùng thư mục .local, không đưa vào Git/Docker image.
- Plan review 294 bản ghi nghiệp vụ, 0 tham chiếu mồ côi. Apply và verify đều exit0 cho 8 service, trong transaction của từng DB. Số lượng bản ghi tại thời điểm migration và tất cả Mongo _id được giữ. Outbox đã publish/inbox hashes giữ nguyên làm lịch sử; không emit event giả trong migration.
- Password hash/email/phone/role/status/license encrypted/số tiền/cước/timestamps không thay đổi. Mã cid/did đã có được giữ; hồ sơ legacy thiếu mã được backfill đồng bộ với Auth. Không xóa/đăng ký lại account, không reset DB/volumes/secrets.
- Các tham chiếu Booking/Trip/Payment/Review/Vehicle/Invitation/Notification, response snapshot và payment idempotency hash được chuyển đồng bộ. Payment referenceCode dùng CAB-pNN tương ứng pid; amount/status/attempt không đổi.
- Sau migration các test mới có tạo thêm tài khoản/chuyến/payment/review riêng; do đó không chạy lại verify/plan cũ để so tổng dữ liệu sau khi đã phát sinh bản ghi mới. Dữ liệu test được giữ, Driver test đã OFFLINE.

### Kiểm thử

- 37 unit tests đạt, gồm atomic ID counter và plan giữ c29/_id/password/money/references. Static check vẫn kiểm 47 REST operation/8 service; internal RPC giữ tên wire cũ và thêm aid vào AccountAccess, không thêm method/service.
- 7 test Python callback tools đạt sau đổi body sang pid; HMAC vẫn ký chính xác raw bytes, không xuất signing secret.
- Validation runtime:34 PASS và một trường hợp account demo đã có trả409 đúng kỳ vọng; login vẫn200, Driver OTP/Submit/security đạt. Evidence .local/evidence/validation-1793166198740.json.
- Account cũ và c29/ADMIN aid: .local/evidence/short-id-existing-accounts-2026-10-28T05-44-59-026Z.json.
- Backend smoke toàn luồng, fare, cancel, Review, callback/retry/replay/ownership: .local/evidence/backend-smoke-2026-10-28T05-45-15-957Z.json.
- Onboarding approve/reject/resubmit/online: .local/evidence/onboarding-2026-10-28T05-45-17-396Z.json.
- Dispatch reject/timeout/concurrency: .local/evidence/dispatch-2026-10-28T05-47-09-513Z.json.
- Register/Login/OTP regression: .local/identity-run.43710285-b2a6-4355-bd66-c4213d88819f.json.
- Public IDs/ownership/admin lists/Vehicle/Review/Notification: .local/evidence/short-id-public-contract-2026-10-28T05-54-45-398Z.json.
- Final image build/start: exit0; health 12 components HTTP200; ADMIN GET /customers/c29 HTTP200, other Customer HTTP403. Evidence .local/evidence/short-id-final-image-2026-10-28T06-00-21-179Z.json.

Các kết quả này là regression kỹ thuật; không tự đổi trạng thái browser XSS/trình bày hoặc yêu cầu tải>1000/s còn thiếu trong bảng chấm.

### Thành phần đã đồng bộ

Gateway mapping +10 YAML +Auth.proto AccountAccess.aid +validator/counters +8 service +seed +event schemas/examples +callback signer +runtime/unit/Python tests +Postman hiện hành/env template/manifest +SRS/Bounded Context/contracts/README/runbook/hướng dẫn tay/URL. MongoDB fields nội bộ và Proto customer_id/driver_id/... vẫn được ánh xạ rõ tại Gateway; eventId/requestId/correlationId giữ vai trò trace kỹ thuật. Không thêm framework hoặc service.

Các phần audit/validation phía dưới là snapshot các lượt trước đổi ID. Hướng dẫn nhập URL mới: [URL_POSTMAN_30.md](URL_POSTMAN_30.md). Các collection v1/v2 legacy và PDF cũ chỉ tham khảo; dùng collection CAB Current - Gateway REST với các biến cid/did/aid/bid/tid/pid/nid/rid/vid/iid/oid mới. Không dùng session export chứa ObjectId cũ làm mã tài nguyên hiện hành.


## Cập nhật validation demo — 28/10/2026

Yêu cầu mới thay chính sách Password/Phone cũ trong phần audit phía dưới. Chỉ dùng cho học tập/demo local, không xem là thiết kế production. Password String không rỗng, không trim/không điều kiện độ phức tạp; Phone String không rỗng sau trim, không ràng buộc 10 chữ số, giữ leading zero và unique. Không còn giới hạn 64 ký tự password; giới hạn kích thước HTTP request hiện có vẫn giữ. Email validation, Argon2id, JWT, role/ownership, OTP/mock/rate limit không thay đổi. Không thêm feature flag, service, dependency hoặc Mongoose; dự án dùng MongoDB driver trực tiếp và Proto string sẵn có.

### Kết quả 11 trường hợp bắt buộc

| Mục | Kiểm thử thực tế | Kết quả |
| --- | --- | --- |
|1|Register quang123@gmail.com/password 123/phone String 0123|PASS,HTTP201,account mới được giữ lại|
|2|Login email/password 123|PASS,HTTP200,JWT và profile đồng bộ|
|3|Password một ký tự a|PASS,Register201; Driver password a login200|
|4|Phone ngắn|PASS,0123 và phone numeric ngắn dạng String được chấp nhận|
|5|Phone chứa chữ|PASS,Customer abc+UUID và Driver driver-UUID đăng ký được|
|6|Password rỗng|PASS,HTTP400|
|7|Phone rỗng|PASS,HTTP400; whitespace-only/null/Number/object/thiếu cũng400|
|8|Email không hợp lệ|PASS,HTTP400; NoSQL object không bypass|
|9|Login password sai một ký tự|PASS,HTTP401|
|10|MongoDB lưu password|PASS,owner auth_service đọc account thật: Argon2id hash,verify123 đúng,không field password rõ; phone String 0123|
|11|Driver OTP với password a/phone chứa chữ|PASS,202→sai OTP400/cooldown429/binding password400→201→login200→SubmitPENDING|

- 35/35 unit tests: `.local/evidence/validation-unit.txt`.
- Static check exit0: `.local/evidence/validation-static.txt`; checker Postman47 operation exit0: `.local/evidence/validation-postman.txt`.
- 35 HTTP checks PASS, gồm11 tình huống và bổ sung type/duplicate/security: `.local/evidence/validation-1793159958238.json`.
- Hash DB thực PASS: `.local/evidence/validation-storage.txt`. Không in hash,token hoặc secrets vào báo cáo.
- Regression Auth/Customer cũ25 checks PASS: `.local/identity-run.7504f86c-7d37-41e1-8043-d3b7f03181a2.json`; ADMIN hiện có login200 bằng password cũ.
- Build/restart image chung bản cuối: `.local/evidence/validation-build-final.txt`, `.local/evidence/validation-start-final.txt`.

Các kiểm tra SQL/NoSQL input400, XSS name400, JWT sửa role401, Customer gọi Driver403, thiếu token401 vẫn đạt. Không suy ra browser XSS hay throughput>1000/s đã đạt. Không đổi/xóa tài khoản cũ, không seed/repair Admin,không xóa DB/volumes và không đổi secret. Chỉ thêm tài khoản/dữ liệu kiểm thử mới.

Build cuối exit0; xác nhận đủ 12 container healthy và infra_init exit0; image có validator mới và script smoke-validation. Evidence trạng thái: `.local/evidence/validation-containers-final.json`; login/health cuối: `.local/evidence/validation-final-http.txt`.

### Đồng bộ và file thay đổi

Validator dùng chung áp dụng tại Auth/OTP/seed; Gateway đọc schema OpenAPI. Phone được đổi cả response Account để GET/auth/me không 500 khi dùng số ngắn/chữ. Mã OTP vẫn 6 chữ số. Proto không có ràng buộc độ dài nên không đổi wire contract. Customer/Driver không có validator password/phone riêng cần sửa.

Đã phát hiện collection hiện tại được chuyển sang YAML native sau audit trước. Giữ nguyên format; manifest/checker dùng đúng directory/environment YAML qua adapter hiện có, không tái tạo JSON hoặc ghi đè thư mục người dùng. Trước commit, environment template đã để trống email/phone/password/token người dùng. Hướng dẫn vẫn dùng quang123@gmail.com/123/0123 làm ví dụ demo để tự nhập local. Bốn response schema phone nhúng trong catalog legacy cũng được cập nhật, nhưng phần nghiệp vụ cũ vẫn có nhãn OUTDATED. Nội dung phiếu chấm/PDF gốc không sửa.

- `docs/BACKEND_RUNBOOK.md`.
- `docs/Bounded-Context.md`.
- `docs/GRADING_MATRIX.md`.
- `docs/MANUAL_POSTMAN_30.md`.
- `docs/PROJECT_STATUS.md`.
- `docs/SRS.md`.
- `docs/api/01-auth.yaml`.
- `docs/api/IDENTITY_V2_DECISION.md`.
- `docs/api/contracts.md`.
- `docs/api/contracts.sha256.json`.
- `package.json`.
- `postman/README.md`.
- `postman/collections/CAB System - Gateway REST (docs-api)/01-auth/getIdentity - Xem định danh Account.request.yaml`.
- `postman/collections/CAB System - Gateway REST (docs-api)/01-auth/loginAccount - Đăng nhập và nhận JWT.request.yaml`.
- `postman/collections/CAB System - Gateway REST (docs-api)/01-auth/loginAdmin - Seeded account; no public admin registration.request.yaml`.
- `postman/collections/CAB System - Gateway REST (docs-api)/01-auth/loginDriver.request.yaml`.
- `postman/documents/Test-Cases.md`.
- `postman/documents/api-source-manifest.json`.
- `postman/documents/test-cases.json`.
- `postman/environments/CAB Current - local template.environment.yaml`.
- `scripts/check-identity-contracts.cjs`.
- `scripts/check_postman.cjs`.
- `scripts/identity-validation.cjs`.
- `scripts/identity.test.cjs`.
- `scripts/seed.cjs`.
- Thêm `scripts/smoke-validation.cjs`: suite regression tái sử dụng bằng `npm.cmd run test:validation`.

Chỉ cập nhật hash hợp đồng của 01-auth.yaml và contracts.md sau khi kiểm diff/test; hash các hợp đồng không liên quan được giữ nguyên. Checkpoint trước lượt này: `.local/validation-20261028-105434/workspace-before.zip`, Git status kèm theo. Danh sách diff đầy đủ: `.local/validation-20261028-105434/changes.json`.

### Thao tác Postman

Collection hiện hành: `postman/collections/CAB Current - Gateway REST/`; environment: `postman/environments/CAB Current - local template.environment.yaml`. Chọn registerAccount với email/password/phone String; sau201 chọn loginAccount để nhận token. Tài khoản demo quang123@gmail.com/123/0123 đã được tạo trong lượt này. Đăng ký lại cùng email/phone trả409 là đúng; không reset tài khoản. Driver giữ quy trình hai bước OTP rồi submit hồ sơ. Xem [Postman README](../postman/README.md) và [hướng dẫn tay](MANUAL_POSTMAN_30.md).

Phần A–G phía dưới là snapshot audit trước thay chính sách validation; các kết quả34 unit tests ở đó thuộc lượt trước, không thay kết quả35 tests nêu trên.

## A. Trước và sau

Trước audit: repository có nhiều thay đổi chưa commit và phần lớn backend chưa được Git theo dõi. Mongo restart với lỗi ghi keyfile /tmp/cab-mongo-keyfile; 8 service restart, Gateway unhealthy. README/runbook vừa nói chưa có backend/Compose vừa ghi Identity v2/v3; bộ Postman v3 báo OUTDATED. npm test bỏ sót event-bus.test.cjs và seed-admin.test.cjs.

Sau chỉnh sửa: image chung build thành công; infra_init exit 0, 12 container healthy. Đã restart Mongo và chạy lại backend regression để xác nhận keyfile không lỗi lại. Giữ đúng 8 service, REST qua Gateway, gRPC nội bộ, một MongoDB instance/8 database có isolation, Redis rate limiting và RabbitMQ. Không thêm dependency runtime hoặc service.

Luồng chính Booking → Driver nhận → Trip COMPLETED → Payment mock callback/retry → Review đã chạy thực qua Gateway. Kết quả kỹ thuật: 25 PASS, 1 FAIL mức tải mục 29, 4 NOT TESTED cho phần trình bày/browser. Đây không phải điểm giảng viên hoặc xác nhận đã thao tác Postman UI.

## Điểm khôi phục và bảo toàn

- `.local/audit-20261028-095551/git-status-before.txt`: Git status trước sửa, gồm thay đổi có sẵn của người dùng.
- `.local/audit-20261028-095551/workspace-before.zip`: 487 file source/tài liệu theo Git và file chưa ignore; có manifest. Đây là checkpoint file, không phải backup MongoDB hoặc Docker volumes. File đã bị người dùng xóa trước audit không được tự khôi phục.
- Không commit/push/merge/reset Git. Không xóa MongoDB data, volumes, queue hoặc credentials. Không đổi secret đang chạy; người dùng tự bổ sung CAB_ADMIN_PASSWORD trong .env để đăng nhập ADMIN hiện có.
- Không tạo ADMIN mới. Đề xuất ADMIN test đã bị bộ duyệt chặn và người dùng chọn dùng credentials hiện có; không thực hiện thao tác đó.
- Dữ liệu test Customer/Driver/Booking/Trip/Payment/Review mới được giữ lại để đối chiếu; không xóa sau test. Tài khoản cũ không bị đổi password/profile. Driver fixture của audit đã để OFFLINE sau cùng.

## B. File đã sửa, thêm, xóa và giữ

So sánh với checkpoint đầu lượt, không dùng toàn bộ git diff để nhận nhầm thay đổi có sẵn là thay đổi của audit.

| File/nhóm | Thay đổi và lý do |
| --- | --- |
| compose.yaml | Keyfile Mongo sang /run/cab-mongo, thư mục quyền 700/file 400; giữ nguyên key/volumes |
| scripts/event-bus.cjs | Chỉ tạo outbox index khi có publisher; Customer/Notification vẫn consume/retry bình thường |
| scripts/service-runtime.cjs | Bỏ kiểm tra service lặp lại sau khi đã validate ở đầu hàm |
| scripts/verify-storage.cjs | Kiểm mẫu dữ liệu thực thay vì phụ thuộc đúng số lượng/seedTag/tiền tố DEMO; ghi rõ tối đa100 bản ghi, không phải full-disk encryption |
| package.json | npm test chạy đủ 5 file test hiện có |
| scripts/identity.test.cjs | Regression schema legacy Driver; giữ bắt buộc display code trong Register mới |
| docs/api/02-customers.yaml, 03-drivers.yaml, 04-bookings.yaml, 06-trips.yaml | Read model/snapshot cũ được thiếu cid/did; giá trị có mặt vẫn phải đúng pattern. Register/ID/JWT/ownership không đổi |
| docs/api/contracts.sha256.json | Chỉ cập nhật hash của 4 YAML sau khi kiểm diff/regression; không rebaseline toàn bộ |
| scripts/check_postman.cjs | Kiểm bộ Postman hiện hành: 47 operation, schema request, biến, cú pháp assertions; nhánh kiểm legacy được giữ |
| postman/documents/api-source-manifest.json | Thêm mục current và SHA-256; metadata/baseline legacy vẫn giữ |
| .env.example | Thêm biến CAB_ADMIN_PASSWORD rỗng dùng riêng test client; không inject credential test vào service |
| README.md, docs/BACKEND_RUNBOOK.md, docs/ARCHITECTURE.md, postman/README.md | Viết lại hướng dẫn hiện hành, lệnh PowerShell, điều kiện/kết quả/lỗi thường gặp |
| docs/SRS.md, docs/Bounded-Context.md | Bỏ banner Identity v2 cạnh tranh với quyết định v3 đầu tài liệu; giữ nội dung nghiệp vụ gốc và lịch sử có ngữ cảnh |
| docs/MANUAL_POSTMAN_30.md | Liên kết kết quả mới, bỏ khuyến nghị repair/password cứng trong chuẩn bị; giữ quy trình nhập tay |
| docs/DEFENSE_30_GUIDE.md | Gộp hướng dẫn trùng vào MANUAL_POSTMAN_30; file cũ thành chỉ dẫn đến nguồn hiện hành |
| docs/CAB_System_Huong_Dan_Postman_30_Cau_Cap_Nhat.md | Gắn nhãn bản ngày trước để đối chiếu PDF, dẫn đến hướng dẫn mới |
| docs/GRADING_MATRIX.md, docs/PROJECT_STATUS.md | Tiến độ 30 mục, kết quả thực, phát hiện và hướng dẫn tiếp theo |

Thêm đúng 2 artifact chính thức: `postman/collections/CAB-Current.postman_collection.json`, `postman/environments/CAB-Current.template.postman_environment.json`. Không tạo thêm Markdown báo cáo phân tán.

Xóa 16 placeholder `.gitkeep` vì thư mục đã có file thật; mỗi file đều có bản trong checkpoint:

- `docs/prompts/.gitkeep`.
- `gateway/.gitkeep`.
- `infra/.gitkeep`.
- `postman/collections/.gitkeep`.
- `postman/documents/.gitkeep`.
- `postman/environments/.gitkeep`.
- `proto/.gitkeep`.
- `scripts/.gitkeep`.
- `services/auth_service/.gitkeep`.
- `services/booking_service/.gitkeep`.
- `services/customer_service/.gitkeep`.
- `services/driver_service/.gitkeep`.
- `services/notification_service/.gitkeep`.
- `services/payment_service/.gitkeep`.
- `services/rating_service/.gitkeep`.
- `services/trip_service/.gitkeep`.

Giữ nguyên: PHIEU_CHAM_PROJECT.pdf, 4 ảnh mô hình chính thức, PDF hướng dẫn cũ, .postman/ metadata, toàn bộ collection/environment legacy, các tài liệu tham khảo/thiết kế gốc, .env/keys, các script recovery/reset chưa chạy. Giữ .gitkeep tại thư mục còn trống. Không xóa dependency: cả 10 dependency runtime có import sử dụng.

`ReleaseReservation` và `RecalculateFare` chưa thấy caller trực tiếp trong source hiện hành; giữ ở nhóm UNCERTAIN vì thuộc hợp đồng RPC/thiết kế phục hồi, chưa có quyết định loại bỏ toàn tuyến. Không xóa chỉ để giảm số file. Các guide/tests cũ chỉ tham khảo không tự dùng làm kết quả mới.

## C. Phát hiện và cách xử lý

| Loại | Phát hiện | Kết quả |
| --- | --- | --- |
| BUG | Mongo ghi lại file key do mongodb sở hữu trong thư mục /tmp sticky, bị Permission denied | Dùng thư mục riêng /run/cab-mongo; restart và regression thành công |
| BUG | ADMIN list Driver500 do5 hồ sơ seed thiếu did; chi tiết cũng500 | Read schemas legacy tương thích; list/detail bản cuối200, có unit regression; không rewrite DB |
| INCONSISTENCY | Customer/Driver/snapshot trước display codes khác schema mới | Đồng bộ4 YAML; response Register mới vẫn yêu cầu cid/did, proto đã hỗ trợ optional field nên không cần đổi wire |
| BUG | Storage checker đòi8 account seed dù local mặc định chỉ seed ADMIN | Kiểm sample thật không phụ thuộc seedTag; vẫn assert hash/không plaintext/encryption và decrypt |
| INCONSISTENCY | README nói chưa có Docker/backend; nhiều hướng dẫn Identity1/2/3 chồng nhau | Chọn nguồn hiện hành và gom hướng dẫn; bản cũ lưu checkpoint và tài liệu gốc |
| INCONSISTENCY | Postman v1/v3 YAML đang trỏ body/biến cũ | Giữ nguyên bản cũ; thêm collection hiện hành61 request, environment mẫu, checker47 operation |
| REDUNDANT | CustomerListItem trùng Customer sau khi read model hỗ trợ legacy | Bỏ schema phụ và dùng Customer trực tiếp |
| REDUNDANT | 16 placeholder ở thư mục có source; guide v1/v2 trùng | Xóa placeholder, gộp guide có checkpoint |
| REDUNDANT | Outbox index ở consumer-only; kiểm service lặp | Bỏ thao tác thừa, giữ bus/retry và validation cần thiết |
| REQUIRED | Redis limiter, gRPC peer/ownership, DB isolation, outbox/inbox/confirm/retry, reservation recovery | Giữ vì phục vụ phiếu/SRS; không thay bằng monolith hoặc framework mới |
| REQUIRED | Rating không publish/consume RabbitMQ | Giữ không kết nối broker; không buộc mọi service dùng event |
| UNCERTAIN | Mô hình gốc vẽ notification login/start/thanks và account.registered subscription khác topology thực | Giữ nguyên ảnh; ghi rõ sai khác ở ARCHITECTURE, không tự thêm event/API |
| UNCERTAIN | DOCX nguồn được SRS dẫn chiếu không có trong checkout | Không suy diễn nội dung thiếu; đối chiếu SRS/Use Case hiện có và PDF gốc |

Một số field snake_case trong DB/proto và camelCase/name ở REST là ánh xạ có chủ đích, không đổi tên hàng loạt. Không có endpoint REST mới hoặc event mới. Payment vẫn mock sau COMPLETED; Driver vẫn OTP mock/submit/ADMIN approval; BIKE giữ nguyên.

## D. Build và kiểm thử thực tế

| Kiểm tra | Kết quả và bằng chứng |
| --- | --- |
| npm.cmd test |34/34 đạt, `.local/evidence/unit-tests-final.txt` |
| npm.cmd run check |Exit0: lock/syntax/8 service/DB scope/hash hợp đồng,23 regression; `.local/evidence/static-check-final.txt` |
| Proto/handler/policy/REST |62 method có handler/policy,47 REST target; `.local/evidence/contracts-audit.json` |
| Current Postman checker |STATIC_OK;47 operation, body/variables/script syntax; `.local/evidence/postman-check-final.txt` |
| Docker config/build/up |Exit0; image dùng chung cho8 service/Gateway/init; `.local/evidence/docker-build-final.txt` |
| Start/restart |infra_init exit0;12 container healthy; Mongo restart không lỗi lại; `.local/evidence/docker-state-final.json` |
| DB isolation |Bootstrap xác nhận8 owner, mỗi user bị từ chối với 7 DB khác; `.local/evidence/bootstrap-final.txt` |
| Health/gRPC |/health,/ready,/health/services200,12 thành phần; backend smoke bản cuối |
| RabbitMQ |20 queue,4 consumer; register→profile, payment/cancel notifications; outage/recovery đạt |
| Identity HTTP |25 checks gồm profile synchronization đạt; `.local/identity-run.f402bda7-f9c0-4086-8848-e64538254c2e.json` |
| Backend bản cuối |`.local/evidence/backend-smoke-2026-10-28T03-26-15-332Z.json` |
| Onboarding |`.local/evidence/onboarding-2026-10-28T03-14-52-277Z.json` |
| Dispatch |`.local/evidence/dispatch-2026-10-28T03-16-12-737Z.json` |
| Nearby/legacy detail/cancel/JWT payload |`.local/evidence/audit-criteria-supplement-2026-10-28T03-26-17-716Z.json` |
| Encryption sample |Auth và Driver checker chạy trong owner container, cùng exit0; hash/encryption cấp ứng dụng, không full-disk |
| GitHub main |Connected GitHub: .gitignore có .env/.local; .env404; .env.example secret rỗng. Local git không track .env; không tuyên bố audit toàn lịch sử remote |
| Load Windows |1200 request/3.564s≈336.7/s:201x1,200x7,429x1192;1 Booking,Retry-After,health200 |
| Load Docker |5000 request/7.458s≈670.4/s,429x5000 do cửa sổ quota trước;health200. Không chứng minh throughput nghiệp vụ hay >1000/s |

Lần backend đầu đã FAIL ở admin/drivers500; giữ evidence lỗi `.local/evidence/backend-smoke-2026-10-28T03-11-25-388Z.json`, không thay snapshot/expected status để che lỗi. Lỗi đã sửa và suite cuối đạt. Một phép đo trong container lỗi ghi evidence EACCES; tạo thư mục evidence tạm cho user node rồi đo lại, không thay source/volume. Không dùng các lượt lỗi đó làm PASS.

Chưa chạy: fault-injection transient retry/DLQ/poison event thực, browser XSS và thao tác Postman UI. Recovery broker đã kiểm được, không suy ra retry/DLQ đã đạt. Không xóa dữ liệu để tạo trạng thái đẹp. Source scan và các test không phải bằng chứng mọi nhánh nghiệp vụ đều không có lỗi.

## E. Tiến độ 30 mục

Bảng đầy đủ gồm nội dung gốc, thành phần, trạng thái, evidence và bước thủ công ở [GRADING_MATRIX.md](GRADING_MATRIX.md). 25 PASS chỉ cho phạm vi kiểm kỹ thuật đã chạy; 1/3/4/26 NOT TESTED cho phần trình bày/browser;29 FAIL vì chưa đủ bằng chứng tải >1000 request/s. Không có bước cần ADMIN đang BLOCKED sau khi người dùng cập nhật mật khẩu local.

## F. Chỉ cần đọc các hướng dẫn này

1. [README](../README.md): tổng quan và chạy nhanh.
2. [BACKEND_RUNBOOK](BACKEND_RUNBOOK.md): cài/chạy/test/lỗi thường gặp.
3. [Postman README](../postman/README.md): collection hiện hành và thứ tự chạy.
4. [MANUAL_POSTMAN_30](MANUAL_POSTMAN_30.md): nhập tay và trả lời từng mục.
5. [ARCHITECTURE](ARCHITECTURE.md): giải thích 8 service/IPC/events/DB.
6. [GRADING_MATRIX](GRADING_MATRIX.md): theo dõi bằng chứng 30 mục.

SRS, Bounded Context và API contracts dùng tra cứu; các bản v1/v2/PDF ngày trước không phải checklist thao tác hiện hành.

## G. Tiếp tục từ câu11

1. Kiểm /ready, import collection/environment hiện hành; đăng nhập bằng email/password thật. Tự lưu local environment; không đưa secrets lên Git/Postman cloud.
2. Làm11–14: đọc Customer/Driver theo ID và token đúng, thử ownership;5 Driver khác trạng thái, refreshlocation và nearby page1/2;5 Booking rồi history paging.
3. Làm15–20 với một chuyến mới: bookingKey mới →offer đúng booking →ACCEPT →arrival/start/location/completion →paymentKey mới →callback đã ký →GET đã thanh toán →Review. Hủy dùng chuyến khác, kiểm notifications cả 2 bên.
4. Làm21–23: Driver mới, OTP202/đăng ký201, license/submitPENDING;ADMIN list/detail/reject hoặc approve;Driver xem kết quả và online/offline.
5. Làm24–30 theo bảng: DB sample/key không lộ plaintext; injection/JWT/role/ownership/replay bằng folder12. XSS chạy harness và xác nhận trên browser. Rate load chạy terminal với cửa sổ quota sạch và ghi tốc độ thực; hiện chưa đủ >1000/s.
6. Với bài cần tự trình bày/UI, chỉ đổi trạng thái sau khi có kết quả hoặc ảnh/video do người dùng xác nhận. Không lấy output generator/checker làm PASS.

Các lệnh chạy suite trên fixture riêng của lượt audit ở `.local/run-audit-suite.cjs` (prepare chỉ dùng một lần, giữ file cũ; backend/onboarding/dispatch/rate đọc fixture local). Đây là trợ cụ cục bộ, không framework runtime hoặc thành phần kiến trúc; không chạy lại các suite chung Driver cùng lúc. Credential/token của fixture nằm riêng ở `.local/audit-fixtures.private.json`, không in hoặc đưa vào báo cáo chia sẻ.

Environment local sẵn cho bước 11: `.local/CAB-Audit-20261028.postman_environment.json`. Import cùng collection hiện hành; có tài khoản/token fixture riêng, không có signing secret. Token có hạn 60 phút; đăng nhập lại khi hết hạn. ADMIN password không export, tự nhập từ cấu hình local nếu cần login lại. Không upload environment này.
