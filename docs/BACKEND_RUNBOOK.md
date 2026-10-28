# Cài đặt, khởi động và kiểm tra local

Dùng khi cài máy, chạy demo hoặc tìm lỗi container/API. Chạy các lệnh bằng PowerShell ở root repository. Cần Node.js >=22, Docker Desktop và Docker Compose. Git Bash dùng `npm` thay `npm.cmd`.

## Cài đặt và khởi động

```powershell
npm.cmd ci
npm.cmd run setup:local
npm.cmd test
npm.cmd run check
node scripts/check_postman.cjs
docker compose config --quiet
docker compose build gateway
docker compose up -d --no-build
docker compose ps -a
Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod http://localhost:3000/ready
Invoke-RestMethod http://localhost:3000/health/services
```

Các Node container dùng chung image `cab-backend:local`, nhưng là process/service riêng. Build `gateway` tạo image cho cả 8 service và `infra_init`. Kỳ vọng `infra_init` exit 0; 12 container còn lại healthy; inventory có 12 thành phần. Bootstrap kiểm quyền mỗi DB user với cả 7 DB còn lại.

`.env.example` là mẫu không chứa secret; `.env` chỉ lưu local. Không thay key/password đang dùng với dữ liệu cũ. `setup:local` chỉ bổ sung trường thiếu/rỗng, không chữa mật khẩu khác với dữ liệu đã lưu.

## ADMIN và dữ liệu demo

Chỉ khi chưa có ADMIN, tạo bằng cấu hình seed local:

```powershell
docker compose exec -T auth_service node scripts/seed.cjs auth_service --admin-only
```

Email seed là `admin@cab.local`. Password ADMIN đã tồn tại được giữ nguyên. Nếu chạy suite developer với ADMIN khác password seed, điền `CAB_ADMIN_PASSWORD` trong `.env` local. Không đưa password thật vào tài liệu/Git. Dữ liệu developer 5 Driver/5 Booking là tùy chọn, chạy bằng Git Bash tại root:

```bash
bash scripts/seed-local.sh --fixtures
```

Script từ chối trùng tài khoản ngoài seed và giữ password cũ. `SEED_PASSWORD` hiện tại không đảm bảo đăng nhập được tài khoản tạo trước đây. Khi buổi chấm yêu cầu tự nhập, dùng [hướng dẫn tay](MANUAL_POSTMAN_30.md). Driver cập nhật location trước online/nearby; vị trí mới có hiệu lực 120 giây.

## Test

```powershell
npm.cmd test
npm.cmd run check
node scripts/check_postman.cjs
node --env-file=.env scripts/smoke-identity.cjs
npm.cmd run test:runtime
npm.cmd run test:onboarding
node --env-file=.env scripts/smoke-dispatch.cjs
docker compose exec -T auth_service node scripts/verify-storage.cjs auth_service
docker compose exec -T driver_service node scripts/verify-storage.cjs driver_service
```

`npm test` chạy 5 file test, gồm topology RabbitMQ và bảo toàn ADMIN seed. `check` kiểm syntax/kiến trúc/hợp đồng; checker Postman chỉ kiểm tĩnh. Các suite runtime tạo dữ liệu và dùng tài khoản developer đã seed; không chạy cùng Driver đang dùng trong Postman. Chờ hết cửa sổ rate limit 60 giây giữa các suite; không xóa counters để làm test đạt.

`smoke-identity` tạo tài khoản mới. `test:runtime` kiểm luồng chính, cước, hủy, ownership, callback/retry/replay. `test:onboarding` kiểm OTP, submit, approve/reject và thông báo. `smoke-dispatch` kiểm reject/timeout/cạnh tranh nhận chuyến. Evidence ở `.local/evidence/` và `.local/identity-run.*.json`. Một suite đạt không đồng nghĩa đủ 30 mục trước giảng viên.

Storage test kiểm mẫu tối đa 100 bản ghi, xác nhận Argon2id và AES-256-GCM, không chứng minh mã hóa toàn ổ đĩa. XSS browser: `node scripts/xss-harness.cjs`, mở `http://127.0.0.1:3100`, nhập token và lưu kết quả. Load: `node --env-file=.env scripts/rate-load.cjs`; xem tốc độ thực, 429/Retry-After và health. Nếu <=1000 request/s thì chưa đủ bằng chứng tải trong PDF.

## Khi có lỗi

```powershell
docker compose logs --tail 80 gateway auth_service driver_service booking_service trip_service payment_service
docker compose logs --tail 40 mongo infra_init rabbitmq
docker compose ps -a
```

| Hiện tượng | Cách kiểm tra/xử lý |
| --- | --- |
| PowerShell chặn npm.ps1 | Dùng npm.cmd; không cần đổi ExecutionPolicy |
| Mongo keyfile Permission denied sau restart | Compose hiện dùng /run/cab-mongo; chạy docker compose up -d mongo, giữ volumes/key cũ |
| Login seed trả 401 | Kiểm email/password thực; không reset/ghi đè credentials |
| 503 PROFILE_NOT_READY | Kiểm consumer, outbox/inbox và RabbitMQ; chờ đồng bộ, không đăng ký lại |
| 429 RATE_LIMITED | Chờ Retry-After; không hạ quota |
| Nearby rỗng | APPROVED, xe active, ONLINE, không bận, trong 1 km, vị trí chưa quá 120 giây |
| Payment 409 | Trip COMPLETED có cước; không có attempt PENDING/COMPLETED; retry từ FAILED mới nhất |
| Callback 401/400 | Ký đúng raw JSON/timestamp bằng key local; không sửa body sau ký |
| Checker v3 báo OUTDATED | Collection cũ; bộ hiện hành dùng scripts/check_postman.cjs |

Không chạy down -v, prune volumes, reset dữ liệu hoặc đổi keys để chữa lỗi. Kết quả gần nhất và phần còn thiếu ở [PROJECT_STATUS.md](PROJECT_STATUS.md).

## Regression validation demo

Password hiện chấp nhận String ít nhất1 ký tự ("123", "a"); Phone String không rỗng sau trim, ví dụ "0123"/"abc123". Email, Argon2id/JWT/role/OTP giữ nguyên; chỉ dùng policy này trong học tập/demo local. Không reset mật khẩu account cũ.

Từ PowerShell ở root: `npm.cmd run test:validation`. Kiểm các case input/HTTP/Driver OTP qua Gateway; hash trong DB được kiểm riêng. Sau thay source phải build image chung bằng `docker compose build gateway`, rồi `docker compose up -d --no-build`. Xem [hướng dẫn Postman](../postman/README.md).
