# Bao phủ AC và request Postman

Mỗi dòng liệt kê request **hỗ trợ** AC, không khẳng định request tự động chứng minh toàn bộ AC. Đọc Test-Cases.md để thực hiện các biến thể và kiểm DB/log/event/concurrency/harness/load còn thiếu. API catalog là thư viện request theo hợp đồng, không phải một kịch bản chạy trọn bộ.

| Case / AC | Công cụ theo thiết kế | Request hỗ trợ | Kết quả thực thi |
| --- | --- | --- | --- |
| TC01 / AC01 | POSTMAN | Register new Customer | BLOCKED |
| TC02 / AC02 | POSTMAN+DB | Register new Driver; Poll onboarding profile ready | BLOCKED |
| TC03 / AC03 | POSTMAN | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC04 / AC04 | POSTMAN | No public ADMIN registration | BLOCKED |
| TC05 / AC05 | POSTMAN | Login customer; Login customer2; Login driver; Login admin; Login onboarding Driver | BLOCKED |
| TC06 / AC06 | POSTMAN | Login customer; Login customer2; Login driver; Login admin | BLOCKED |
| TC07 / AC07 | POSTMAN | Current Customer profile | BLOCKED |
| TC08 / AC08 | POSTMAN | Profile cannot change role | BLOCKED |
| TC09 / AC09 | POSTMAN+DB | Request onboarding OTP | BLOCKED |
| TC10 / AC10 | POSTMAN | Catalog hỗ trợ một phần: Catalog requestDriverOtp | BLOCKED |
| TC11 / AC11 | POSTMAN+DB | Verify onboarding OTP | BLOCKED |
| TC12 / AC12 | POSTMAN+DB | Catalog hỗ trợ một phần: Catalog verifyDriverOtp | BLOCKED |
| TC13 / AC13 | POSTMAN | Complete onboarding profile | BLOCKED |
| TC14 / AC14 | POSTMAN | Catalog hỗ trợ một phần: Catalog updateMyDriver | BLOCKED |
| TC15 / AC15 | POSTMAN+DB | Create onboarding BIKE | BLOCKED |
| TC16 / AC16 | POSTMAN+DB | Catalog hỗ trợ một phần: Catalog upsertMyVehicle | BLOCKED |
| TC17 / AC17 | POSTMAN+DB | Catalog hỗ trợ một phần: Catalog upsertMyVehicle | BLOCKED |
| TC18 / AC18 | POSTMAN | Submit Driver PENDING | BLOCKED |
| TC19 / AC19 | POSTMAN | Catalog hỗ trợ một phần: Catalog submitDriverProfile | BLOCKED |
| TC20 / AC20 | POSTMAN+EVENT | Seed Driver profile; Admin approves onboarding Driver; Onboarding Driver reads approval notice | BLOCKED |
| TC21 / AC21 | POSTMAN+EVENT | Catalog hỗ trợ một phần: Catalog decideDriverApproval | BLOCKED |
| TC22 / AC22 | POSTMAN | Catalog hỗ trợ một phần: Catalog decideDriverApproval | BLOCKED |
| TC23 / AC23 | POSTMAN | Seed Driver profile; Driver online; Rate fixture online | BLOCKED |
| TC24 / AC24 | POSTMAN | Reject online before approval | BLOCKED |
| TC25 / AC25 | POSTMAN | Catalog hỗ trợ một phần: Catalog setDriverAvailability | BLOCKED |
| TC26 / AC26 | POSTMAN | Refresh Driver location; Cancel fixture refresh location; Rate fixture refresh location | BLOCKED |
| TC27 / AC27 | POSTMAN | Catalog hỗ trợ một phần: Catalog updateDriverLocation | BLOCKED |
| TC28 / AC28 | POSTMAN+DB | Nearby within 1 km | BLOCKED |
| TC29 / AC29 | POSTMAN | Nearby within 1 km | BLOCKED |
| TC30 / AC30 | POSTMAN | Nearby within 1 km; History paging with seed; Nearby limit 51 rejected | BLOCKED |
| TC31 / AC31 | POSTMAN | Create fresh Booking; Booking cannot choose CAR | BLOCKED |
| TC32 / AC32 | POSTMAN+DB | Create fresh Booking; Replay Booking same key/body; Booking key conflict | BLOCKED |
| TC33 / AC33 | POSTMAN+DB | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC34 / AC34 | POSTMAN+DB | Poll own invitation; Poll cancellation invitation | BLOCKED |
| TC35 / AC35 | POSTMAN+INTEGRATION | Accept matching invitation | BLOCKED |
| TC36 / AC36 | POSTMAN+DB | Accept matching invitation; Accept cancellation fixture | BLOCKED |
| TC37 / AC37 | CONCURRENCY+DB | Catalog hỗ trợ một phần: Catalog respondInvitation | BLOCKED |
| TC38 / AC38 | POSTMAN+DB | Catalog hỗ trợ một phần: Catalog respondInvitation | BLOCKED |
| TC39 / AC39 | POSTMAN+WORKER | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC40 / AC40 | POSTMAN+DB | Create Booking in empty area; Poll NO_DRIVER without Trip | BLOCKED |
| TC41 / AC41 | POSTMAN+CONCURRENCY | Cancel rate-limit fixture if still searching | BLOCKED |
| TC42 / AC42 | POSTMAN | Poll NO_DRIVER without Trip | BLOCKED |
| TC43 / AC43 | POSTMAN | Catalog hỗ trợ một phần: Catalog getBooking | BLOCKED |
| TC44 / AC44 | POSTMAN | Catalog hỗ trợ một phần: Catalog getBooking | BLOCKED |
| TC45 / AC45 | POSTMAN | Driver arrived; Driver started | BLOCKED |
| TC46 / AC46 | POSTMAN+DB | Start canceled Trip denied | BLOCKED |
| TC47 / AC47 | POSTMAN+DB | Trip location | BLOCKED |
| TC48 / AC48 | POSTMAN | Catalog hỗ trợ một phần: Catalog updateTripLocation | BLOCKED |
| TC49 / AC49 | POSTMAN | Create cancellation Booking; Preview zero cancellation fee | BLOCKED |
| TC50 / AC50 | POSTMAN+EVENT | Confirm assigned cancellation; Read canceled Trip; No payment for canceled Trip | BLOCKED |
| TC51 / AC51 | POSTMAN+DB | Replay cancellation | BLOCKED |
| TC52 / AC52 | POSTMAN+EVENT | Poll Booking final view; Check Driver released | BLOCKED |
| TC53 / AC53 | POSTMAN+DB | Complete Trip and check fare | BLOCKED |
| TC54 / AC54 | INTEGRATION+POSTMAN | Complete Trip and check fare | BLOCKED |
| TC55 / AC55 | INTEGRATION+DB | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC56 / AC56 | POSTMAN | Catalog hỗ trợ một phần: Catalog getPaymentSummary | BLOCKED |
| TC59 / AC59 | POSTMAN | Create mock Payment | BLOCKED |
| TC60 / AC60 | POSTMAN+DB | Replay Payment same key/body; Replay retry same key | BLOCKED |
| TC61 / AC61 | POSTMAN+MOCK | Poll successful Payment; Send prepared signed callback | BLOCKED |
| TC62 / AC62 | POSTMAN+MOCK | Invalid mock signature always rejected; Reject prepared signed wrong data; Verify callback-negative Payment still pending | BLOCKED |
| TC63 / AC63 | POSTMAN+DB | Verify original Payment still completed; Send prepared signed callback; Replay exact prepared callback | BLOCKED |
| TC64 / AC64 | POSTMAN+MOCK | Create retry with fresh key | BLOCKED |
| TC65 / AC65 | POSTMAN+DB | Catalog hỗ trợ một phần: Catalog retryPayment | BLOCKED |
| TC66 / AC66 | POSTMAN | Poll successful Payment; Read retry result | BLOCKED |
| TC67 / AC67 | POSTMAN+EVENT | Poll own milestone notifications | BLOCKED |
| TC68 / AC68 | POSTMAN+EVENT | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC69 / AC69 | POSTMAN+EVENT | Poll own milestone notifications | BLOCKED |
| TC70 / AC70 | EVENT+DB | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC71 / AC71 | POSTMAN | Poll own milestone notifications; Other Customer cannot read notification; Onboarding Driver reads approval notice | BLOCKED |
| TC72 / AC72 | POSTMAN | Poll Booking final view; History paging with seed | BLOCKED |
| TC73 / AC73 | POSTMAN | Create Review 1–5 | BLOCKED |
| TC74 / AC74 | POSTMAN+DB | Rating 6 rejected; XSS comment rejected; Review duplicate rejected | BLOCKED |
| TC75 / AC75 | POSTMAN | Catalog hỗ trợ một phần: Catalog getCustomerById, Catalog listCustomers | BLOCKED |
| TC76 / AC76 | POSTMAN+FAILURE | Catalog hỗ trợ một phần: Catalog listBookings | BLOCKED |
| TC77 / AC77 | POSTMAN | Catalog hỗ trợ một phần: Catalog listBookings | BLOCKED |
| TC78 / AC78 | POSTMAN | Catalog hỗ trợ một phần: Catalog listPayments | BLOCKED |
| TC79 / AC79 | POSTMAN | Missing JWT | BLOCKED |
| TC80 / AC80 | POSTMAN | Other Customer profile; Customer cannot update Driver; Other Customer cannot read Booking; Other Customer cannot read Payment; Other Customer cannot read notification | BLOCKED |
| TC81 / AC81 | GRPC+NETWORK | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC82 / AC82 | LOG | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC83 / AC83 | LOG+DB+POSTMAN | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC84 / AC84 | POSTMAN | Health process | BLOCKED |
| TC85 / AC85 | POSTMAN+DOCKER | Gateway ready | BLOCKED |
| TC86 / AC86 | POSTMAN+DOCKER | Service health inventory | BLOCKED |
| TC87 / AC87 | LOAD | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC88 / AC88 | FAILURE+DB | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC89 / AC89 | CODE+DB | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC90 / AC90 | DOCKER+DB | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC91 / AC91 | CONTRACT+POSTMAN | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC92 / AC92 | POSTMAN+REDIS | Catalog hỗ trợ một phần: Catalog loginAccount | BLOCKED |
| TC93 / AC93 | DB+CONFIG | Catalog hỗ trợ một phần: Catalog updateMyDriver | BLOCKED |
| TC94 / AC94 | POSTMAN+DB | NoSQL operator rejected; SQL payload rejected | BLOCKED |
| TC95 / AC95 | POSTMAN+INTEGRATION | Tampered JWT role and sub | BLOCKED |
| TC96 / AC96 | POSTMAN+HARNESS | XSS in profile rejected; XSS comment rejected | BLOCKED |
| TC97 / AC97 | POSTMAN+REDIS+LOAD | Booking rate request 01; Booking rate request 02; Booking rate request 03; Booking rate request 04; Booking rate request 05; Booking rate request 06; Booking rate request 07; Booking rate request 08; Booking rate request 09; Booking rate request 10; Booking rate request 11; Read rate-limit fixture before cleanup | BLOCKED |
| TC98 / AC98 | CODE+GRPC+NETWORK | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC99 / AC99 | RABBITMQ+DB | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC100 / AC100 | FAILURE+DB | Poll onboarding profile ready | BLOCKED |
| TC101 / AC101 | GIT+CODE | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC102 / AC102 | DOCKER+CONFIG | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC103 / AC103 | SEED+DB+POSTMAN | History paging with seed | BLOCKED |
| TC104 / AC104 | REVIEW | Thực hiện theo case bằng công cụ/fixture riêng | BLOCKED |
| TC105 / AC105 | POSTMAN+CONCURRENCY+DB | Replay Payment same key/body; New key after paid rejected; Verify original Payment still completed; Invalid mock signature always rejected; Send prepared signed callback; Replay exact prepared callback; Replay retry same key | BLOCKED |
