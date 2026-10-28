# Báo cáo tổng kiểm tra CAB System — 28/10/2026

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
