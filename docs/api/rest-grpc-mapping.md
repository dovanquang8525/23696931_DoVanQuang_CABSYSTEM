# REST → gRPC mapping

**ID công khai hiện hành:** cid=c29, did=d01, aid=a01, bid=b01, tid=t01, pid=p01, nid=n01, rid=r01; thêm vid cho Vehicle, iid cho Invitation và oid cho OTP challenge. API/URL dùng các mã ngắn do server cấp; cid/did chính là ID Customer/Driver, không còn customerId/driverId hay accountId ObjectId trong JSON công khai. MongoDB _id và JWT sub là định danh kỹ thuật nội bộ, không nhập vào URL. ADMIN cũng có aid; không tự nhập ID khi Register.

Identity v3: Register không nhận cid/did/role/name/oid. Driver có plateNumber, lần đầu trả OTP_REQUIRED 202; lần sau thêm code, tạo account 201. Protobuf RegisterRequest dành riêng tag 3/4/5/7/8 cũ, plate_number tag9 và code tag10. DriverLocationInput/UpdateTripLocationRequest/NearbyRequest có location_code; Booking Create có pickup_code/destination_code. Danh sách 47 REST operation/peer allowlist giữ nguyên, chỉ mở rộng request/response của operation đã có.

Identity v2: Register dùng cid/did/email và không nhận role/name; Login dùng email, password. RequestOtp REST chỉ có phone, Gateway đặt purpose DRIVER_REGISTRATION vào RPC nội bộ. PATCH name được map sang full_name trong Customer/Driver RPC; response full_name thành REST name. Các ID nội bộ và danh sách RPC/REST endpoint dưới đây giữ nguyên. Register protobuf dành riêng các tag cũ 3/4; Login dành riêng tag phone cũ 1, email dùng tag mới 3.

Base path: /api/v1, trừ Health dùng root. Đây là contract mapping, chưa phải routing đã chạy.

| YAML | Method | REST path | operationId | Target |
| --- | --- | --- | --- | --- |
| 01-auth.yaml | POST | /auth/otp-challenges | requestDriverOtp | cab.auth.v1.AuthService/RequestOtp |
| 01-auth.yaml | POST | /auth/otp-challenges/{oid}/verify | verifyDriverOtp | cab.auth.v1.AuthService/VerifyOtp |
| 01-auth.yaml | POST | /auth/register | registerAccount | cab.auth.v1.AuthService/Register |
| 01-auth.yaml | POST | /auth/login | loginAccount | cab.auth.v1.AuthService/Login |
| 01-auth.yaml | GET | /auth/me | getIdentity | cab.auth.v1.AuthService/GetIdentity |
| 02-customers.yaml | GET | /customers/me | getMyCustomer | cab.customer.v1.CustomerService/GetMyCustomer |
| 02-customers.yaml | PATCH | /customers/me | updateMyCustomer | cab.customer.v1.CustomerService/UpdateMyCustomer |
| 02-customers.yaml | GET | /customers/{cid} | getCustomerById | cab.customer.v1.CustomerService/GetCustomer |
| 02-customers.yaml | GET | /admin/customers | listCustomers | cab.customer.v1.CustomerService/ListCustomers |
| 03-drivers.yaml | GET | /drivers/me | getMyDriver | cab.driver.v1.DriverService/GetMyDriver |
| 03-drivers.yaml | PATCH | /drivers/me | updateMyDriver | cab.driver.v1.DriverService/UpdateMyDriver |
| 03-drivers.yaml | GET | /drivers/{did} | getDriverById | cab.driver.v1.DriverService/GetDriver |
| 03-drivers.yaml | GET | /drivers/me/vehicle | getMyVehicle | cab.driver.v1.DriverService/GetMyVehicle |
| 03-drivers.yaml | PUT | /drivers/me/vehicle | upsertMyVehicle | cab.driver.v1.DriverService/UpsertMyVehicle |
| 03-drivers.yaml | POST | /drivers/me/submissions | submitDriverProfile | cab.driver.v1.DriverService/SubmitDriver |
| 03-drivers.yaml | PUT | /drivers/me/availability | setDriverAvailability | cab.driver.v1.DriverService/SetAvailability |
| 03-drivers.yaml | PUT | /drivers/me/location | updateDriverLocation | cab.driver.v1.DriverService/UpdateDriverLocation |
| 03-drivers.yaml | GET | /drivers/nearby | listNearbyDrivers | cab.driver.v1.DriverService/ListNearbyDrivers |
| 03-drivers.yaml | GET | /admin/drivers | listDrivers | cab.driver.v1.DriverService/ListDrivers |
| 03-drivers.yaml | POST | /admin/drivers/{did}/approval-decisions | decideDriverApproval | cab.driver.v1.DriverService/DecideDriverApproval |
| 04-bookings.yaml | POST | /bookings | createBooking | cab.booking.v1.BookingService/CreateBooking |
| 04-bookings.yaml | GET | /bookings | listMyBookings | cab.booking.v1.BookingService/ListMyBookings |
| 04-bookings.yaml | GET | /bookings/{bid} | getBooking | cab.booking.v1.BookingService/GetBooking |
| 04-bookings.yaml | POST | /bookings/{bid}/cancellation-preview | previewBookingCancellation | cab.booking.v1.BookingService/PreviewBookingCancellation |
| 04-bookings.yaml | POST | /bookings/{bid}/cancellation | cancelBooking | cab.booking.v1.BookingService/CancelBooking |
| 04-bookings.yaml | GET | /admin/bookings | listBookings | cab.booking.v1.BookingService/ListBookings |
| 05-invitations.yaml | GET | /drivers/me/invitations | listMyInvitations | cab.booking.v1.BookingService/ListMyInvitations |
| 05-invitations.yaml | POST | /invitations/{iid}/response | respondInvitation | cab.booking.v1.BookingService/RespondInvitation |
| 06-trips.yaml | GET | /trips/{tid} | getTrip | cab.trip.v1.TripService/GetTrip |
| 06-trips.yaml | POST | /trips/{tid}/arrival | arriveTrip | cab.trip.v1.TripService/ArriveTrip |
| 06-trips.yaml | POST | /trips/{tid}/start | startTrip | cab.trip.v1.TripService/StartTrip |
| 06-trips.yaml | POST | /trips/{tid}/completion | completeTrip | cab.trip.v1.TripService/CompleteTrip |
| 06-trips.yaml | PUT | /trips/{tid}/location | updateTripLocation | cab.trip.v1.TripService/UpdateTripLocation |
| 06-trips.yaml | GET | /admin/trips | listTrips | cab.trip.v1.TripService/ListTrips |
| 07-payments.yaml | GET | /trips/{tid}/payment-summary | getPaymentSummary | cab.payment.v1.PaymentService/GetPaymentSummary |
| 07-payments.yaml | POST | /trips/{tid}/payments | createPayment | cab.payment.v1.PaymentService/CreatePayment |
| 07-payments.yaml | GET | /payments/{pid} | getPayment | cab.payment.v1.PaymentService/GetPayment |
| 07-payments.yaml | POST | /payments/{pid}/retries | retryPayment | cab.payment.v1.PaymentService/RetryPayment |
| 07-payments.yaml | POST | /payments/mock/callback | handleMockCallback | cab.payment.v1.PaymentService/HandleMockCallback |
| 07-payments.yaml | GET | /admin/payments | listPayments | cab.payment.v1.PaymentService/ListPayments |
| 08-notifications.yaml | GET | /notifications | listMyNotifications | cab.notification.v1.NotificationService/ListMyNotifications |
| 08-notifications.yaml | GET | /notifications/{nid} | getNotification | cab.notification.v1.NotificationService/GetNotification |
| 09-ratings.yaml | POST | /trips/{tid}/reviews | createReview | cab.rating.v1.RatingService/CreateReview |
| 09-ratings.yaml | GET | /trips/{tid}/reviews | getReviewByTrip | cab.rating.v1.RatingService/GetReviewByTrip |
| 10-health.yaml | GET | /health | gatewayHealth | Gateway local + grpc.health.v1.Health/Check |
| 10-health.yaml | GET | /ready | gatewayReady | Gateway local + grpc.health.v1.Health/Check |
| 10-health.yaml | GET | /health/services | gatewayServiceHealth | Gateway local + grpc.health.v1.Health/Check |

Gateway đổi cid/did/aid/bid/tid/pid/nid/rid/vid/iid/oid sang field protobuf customer_id/driver_id/account_id/... khi gọi RPC, và đổi ngược response. JWT sub/ownership vẫn dùng Account _id nội bộ. Không đổi endpoint nghiệp vụ hoặc thêm service.
