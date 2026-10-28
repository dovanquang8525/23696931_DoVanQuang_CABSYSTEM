# CAB System — 30 prompt triển khai (P01–P30)

## Snapshot và giới hạn kiểm chứng
- Nguồn: `dovanquang8525/23696931_DoVanQuang_CABSYSTEM`, branch **main**, commit **02c4da26403934e3f1826d269742f63eba645529** (GitHub connector, đọc 27/10/2026). Không thay đổi repo từ cuộc trò chuyện này.
- Đã đọc trực tiếp `AGENTS.md`, `docs/GRADING_MATRIX.md`, `docs/SRS.md` (phần đầu), `docs/ARCHITECTURE.md`, `docs/Bounded-Context.md` (phần đầu), `docs/api/contracts.md`, `docs/api/rest-grpc-mapping.md`, `docs/events/topology.json`, `docs/PROJECT_STATUS.md`, `README.md`, `.gitignore`, `.env.example`, `postman/README.md`, `postman/documents/AUDIT.md` (qua connector), `scripts/sync_postman.py` (một phần) và checklist. Danh sách file từ GitHub commit là snapshot, không phải kiểm thử runtime. PDF gốc có mặt trong commit nhưng **chưa được mở/kiểm đối chiếu trực tiếp từng trang PDF**; ma trận nguồn `docs/GRADING_MATRIX.md` tuyên bố đã trích đúng 30 tiêu chí từ PDF trang 2–6. Trước dùng để chấm chính thức, đối chiếu trực tiếp PDF.
- Commit không liệt kê `package.json`, `Dockerfile`, Compose hay service source; thư mục `gateway/`, `infra/`, `services/` có `.gitkeep`; `proto/` có hợp đồng; `scripts/` có Postman tooling; `postman/` có collections và evidence template. **Không có bằng chứng backend hoặc hạ tầng hoạt động**. Cần khảo sát HEAD và local untracked lại tại P01.
- **Xung đột cần chặn theo từng phạm vi:** `docs/Bounded-Context.md` còn CASH/route/event cũ, trong khi `docs/SRS.md`, `docs/api/contracts.md` và `docs/api/` định nghĩa BIKE + MOCK_ONLINE; `README.md` và `docs/PROJECT_STATUS.md` có thông tin lịch sử/đường dẫn di chuyển chưa hoàn toàn đồng nhất với danh sách snapshot; `AGENTS.md` mô tả `baseUrl` tổng quát nhưng Postman chính sử dụng `base_url`. Chỉ coi bộ contracts hiện hành là thiết kế, không là code.
- Script `scripts/sync_postman.py` là generator **legacy, candidate-only**, cố tình từ chối ghi collection trực tiếp; chạy generator vào đích chính có nguy cơ mất assertion và fixture. Không làm vậy.

## Phương pháp sử dụng
1. Giải nén ZIP vào **root repository** để được `docs/prompts/README.md` và 30 file Pxx. Giữ nguyên file có sẵn. Trong VS Code mở prompt theo **thứ tự thực hiện** bên dưới, không chỉ chạy P01→P30.
2. Mỗi lần mở phiên Codex mới, dán toàn văn đúng một prompt; Codex đọc repo, sửa file khi hợp đồng rõ, nhưng **chỉ đưa lệnh terminal để người dùng tự nhập bằng Git Bash**. Không sửa repo qua ChatGPT/GitHub connector khi tạo tài liệu này.
3. Gửi lại output Git Bash cho Codex trước khi công bố runtime PASS, rồi cập nhật `docs/PROJECT_STATUS.md` và evidence. Nếu thiếu artifact kỹ thuật thực sự thiết yếu, quay lại prompt tạo artifact đó; không quay lại chỉ vì thiếu báo cáo/checkpoint hình thức.
4. Mục chấm ≠ thứ tự chạy. Từng Pxx sở hữu đúng một tiêu chí gốc; công việc kỹ thuật được thực hiện trong prompt sở hữu phù hợp nhất. Các bước test smoke cần đủ fixture, không chạy toàn bộ collection mù quáng.

## Bảng ánh xạ 30 mục chấm, prerequisite và đầu ra
| Prompt | Tiêu chí gốc | Tiên quyết | Đầu ra trọng tâm |
|---|---|---|---|
| [P01](P01-m-t-ki-n-tr-c-t-ch-c-source-code.md) | Mô tả kiến trúc tổ chức source code | — | docs/PROJECT_STATUS.md, docs/implementation/repository-inventory.md |
| [P02](P02-ki-m-tra-gitignore-v-env-tr-n-github.md) | Kiểm tra .gitignore và .env trên github | P01 (mềm, chỉ khảo sát) | .env.example, .gitignore |
| [P03](P03-m-t-nhi-m-v-gateway-trong-h-th-ng.md) | Mô tả nhiệm vụ gateway trong hệ thống | P01, P02, P04, P05, P09, P10, P24 | gateway/package.json, gateway/src/ |
| [P04](P04-m-t-ipc-c-a-c-c-microservice.md) | Mô tả IPC của các microservice | P01, P02 | proto/, scripts/check_contracts.* |
| [P05](P05-compose-h-th-ng-v-li-t-k-c-c-container.md) | Compose hệ thống và liệt kê các container | P01, P02, P04, P07 | compose.yaml, infra/ |
| [P06](P06-api-health-check.md) | POSTMAN: API health check | P03, P05, P07, P09, P10, P11, P12, P13, P14, P15, P16, P19, P20, P22 | gateway/src/, postman/evidence/ |
| [P07](P07-ki-m-tra-h-th-ng-kafka-rabbit-mq.md) | Kiểm tra hệ thống Kafka / Rabbit MQ | P01, P02, P04 | infra/rabbitmq/, services/*/src/ |
| [P08](P08-ki-m-tra-m-i-request-u-ph-i-i-qua-gateway.md) | Kiểm tra mọi request đều phải đi qua Gateway | P03, P05, P06 | compose.yaml, gateway/src/ |
| [P09](P09-ng-k-t-i-kho-n-kh-ch-h-ng.md) | POSTMAN: Đăng ký tài khoản khách hàng | P04, P07, P10, P05 | services/auth_service/src/, services/customer_service/src/ |
| [P10](P10-ng-nh-p-kh-ch-h-ng.md) | POSTMAN: Đăng nhập khách hàng | P01, P02, P04, P05 | services/auth_service/src/, infra/mongo/ |
| [P11](P11-l-y-th-ng-tin-kh-ch-h-ng-v-i-m-s.md) | POSTMAN: Lấy thông tin khách hàng với mã số | P09, P03 | services/customer_service/src/, postman/collections/ |
| [P12](P12-l-y-th-ng-tin-t-i-x-v-i-m-s.md) | POSTMAN: Lấy thông tin tài xế với mã số | P21, P22, P03 | services/driver_service/src/, postman/collections/ |
| [P13](P13-li-t-k-danh-s-ch-t-i-x-t-i-khu-v-c.md) | POSTMAN: Liệt kê danh sách tài xế tại khu vực | P21, P22, P23, P03 | services/driver_service/src/, scripts/seed* |
| [P14](P14-li-t-k-danh-s-ch-c-c-booking-c-a-customer.md) | POSTMAN: Liệt kê danh sách các booking của Customer | P15, P03 | services/booking_service/src/, scripts/seed* |
| [P15](P15-t-xe.md) | POSTMAN: Đặt xe | P09, P13, P07, P03 | services/booking_service/src/, postman/collections/ |
| [P16](P16-t-i-x-nh-n-chuy-n.md) | POSTMAN: Tài xế nhận chuyến | P15, P17, P03 | services/booking_service/src/, services/trip_service/src/ |
| [P17](P17-c-p-nh-t-tr-ng-th-i-chuy-n.md) | POSTMAN: Cập nhật trạng thái chuyến | P04, P05, P07, P10 | services/trip_service/src/, postman/collections/ |
| [P18](P18-h-y-chuy-n.md) | POSTMAN: Hủy chuyến | P16, P22 | services/booking_service/src/, services/trip_service/src/ |
| [P19](P19-thanh-to-n-online.md) | POSTMAN: Thanh toán online | P17, P07, P03 | services/payment_service/src/, postman/collections/ |
| [P20](P20-nh-gi-chuy-n-i.md) | POSTMAN: Đánh giá chuyến đi | P17, P09, P03 | services/rating_service/src/, postman/collections/ |
| [P21](P21-ng-k-t-i-x.md) | POSTMAN: Đăng ký tài xế | P10, P07, P03 | services/auth_service/src/, services/driver_service/src/ |
| [P22](P22-duy-t-h-s-t-i-x.md) | POSTMAN: Duyệt hồ sơ tài xế | P21, P07, P03 | services/driver_service/src/, postman/collections/ |
| [P23](P23-b-t-t-t-tr-ng-th-i-nh-n-chuy-n.md) | POSTMAN: Bật/tắt trạng thái nhận chuyến | P22, P03 | services/driver_service/src/, postman/collections/ |
| [P24](P24-data-encryption-at-rest.md) | POSTMAN: Data encryption at rest | P02, P05, P10 | services/auth_service/src/, infra/ |
| [P25](P25-sql-injection-attempt.md) | POSTMAN: SQL injection attempt | P03, P09, P10 | services/auth_service/src/, gateway/src/ |
| [P26](P26-xss-input-test.md) | POSTMAN: XSS input test | P03, P09 | gateway/src/, services/customer_service/src/ |
| [P27](P27-jwt-tampering.md) | POSTMAN: JWT tampering | P03, P10 | gateway/src/, services/*/src/ |
| [P28](P28-unauthorized-api-access.md) | POSTMAN: Unauthorized API access | P03, P11, P12, P22 | gateway/src/, services/*/src/ |
| [P29](P29-rate-limit-attack.md) | POSTMAN: Rate limit attack | P03, P05 | gateway/src/, scripts/load/ |
| [P30](P30-replay-attack-idempotency.md) | POSTMAN: Replay attack (idempotency) | P15, P19 | services/booking_service/src/, services/payment_service/src/ |

## Thứ tự triển khai thực tế (topological order)

1. **P01** — Mô tả kiến trúc tổ chức source code; prerequisites: không. Output: docs/PROJECT_STATUS.md, docs/implementation/repository-inventory.md.
2. **P02** — Kiểm tra .gitignore và .env trên github; P01 là tham khảo, không chặn bởi tài liệu đầu ra. Output: .env.example, .gitignore.
3. **P04** — Mô tả IPC của các microservice; prerequisites: P01, P02. Output: proto/, scripts/check_contracts.*.
4. **P07** — Kiểm tra hệ thống Kafka / Rabbit MQ; prerequisites: P01, P02, P04. Output: infra/rabbitmq/, services/*/src/.
5. **P05** — Compose hệ thống và liệt kê các container; prerequisites: P01, P02, P04, P07. Output: compose.yaml, infra/.
6. **P10** — POSTMAN: Đăng nhập khách hàng; prerequisites: P01, P02, P04, P05. Output: services/auth_service/src/, infra/mongo/.
7. **P24** — POSTMAN: Data encryption at rest; prerequisites: P02, P05, P10. Output: services/auth_service/src/, infra/.
8. **P17** — POSTMAN: Cập nhật trạng thái chuyến; prerequisites: P04, P05, P07, P10. Output: services/trip_service/src/, postman/collections/.
9. **P09** — POSTMAN: Đăng ký tài khoản khách hàng; prerequisites: P04, P07, P10, P05. Output: services/auth_service/src/, services/customer_service/src/.
10. **P03** — Mô tả nhiệm vụ gateway trong hệ thống; prerequisites: P01, P02, P04, P05, P09, P10, P24. Output: gateway/package.json, gateway/src/.
11. **P21** — POSTMAN: Đăng ký tài xế; prerequisites: P10, P07, P03. Output: services/auth_service/src/, services/driver_service/src/.
12. **P22** — POSTMAN: Duyệt hồ sơ tài xế; prerequisites: P21, P07, P03. Output: services/driver_service/src/, postman/collections/.
13. **P23** — POSTMAN: Bật/tắt trạng thái nhận chuyến; prerequisites: P22, P03. Output: services/driver_service/src/, postman/collections/.
14. **P13** — POSTMAN: Liệt kê danh sách tài xế tại khu vực; prerequisites: P21, P22, P23, P03. Output: services/driver_service/src/, scripts/seed*.
15. **P15** — POSTMAN: Đặt xe; prerequisites: P09, P13, P07, P03. Output: services/booking_service/src/, postman/collections/.
16. **P16** — POSTMAN: Tài xế nhận chuyến; prerequisites: P15, P17, P03. Output: services/booking_service/src/, services/trip_service/src/.
17. **P18** — POSTMAN: Hủy chuyến; prerequisites: P16, P22. Output: services/booking_service/src/, services/trip_service/src/.
18. **P19** — POSTMAN: Thanh toán online; prerequisites: P17, P07, P03. Output: services/payment_service/src/, postman/collections/.
19. **P20** — POSTMAN: Đánh giá chuyến đi; prerequisites: P17, P09, P03. Output: services/rating_service/src/, postman/collections/.
20. **P11** — POSTMAN: Lấy thông tin khách hàng với mã số; prerequisites: P09, P03. Output: services/customer_service/src/, postman/collections/.
21. **P12** — POSTMAN: Lấy thông tin tài xế với mã số; prerequisites: P21, P22, P03. Output: services/driver_service/src/, postman/collections/.
22. **P14** — POSTMAN: Liệt kê danh sách các booking của Customer; prerequisites: P15, P03. Output: services/booking_service/src/, scripts/seed*.
23. **P06** — POSTMAN: API health check; prerequisites: P03, P05, P07, P09, P10, P11, P12, P13, P14, P15, P16, P19, P20, P22. Output: gateway/src/, postman/evidence/.
24. **P08** — Kiểm tra mọi request đều phải đi qua Gateway; prerequisites: P03, P05, P06. Output: compose.yaml, gateway/src/.
25. **P25** — POSTMAN: SQL injection attempt; prerequisites: P03, P09, P10. Output: services/auth_service/src/, gateway/src/.
26. **P26** — POSTMAN: XSS input test; prerequisites: P03, P09. Output: gateway/src/, services/customer_service/src/.
27. **P27** — POSTMAN: JWT tampering; prerequisites: P03, P10. Output: gateway/src/, services/*/src/.
28. **P28** — POSTMAN: Unauthorized API access; prerequisites: P03, P11, P12, P22. Output: gateway/src/, services/*/src/.
29. **P29** — POSTMAN: Rate limit attack; prerequisites: P03, P05. Output: gateway/src/, scripts/load/.
30. **P30** — POSTMAN: Replay attack (idempotency); prerequisites: P15, P19. Output: services/booking_service/src/, services/payment_service/src/.

## Gates bắt buộc
- **Gate tài liệu:** xung đột CASH/OTP/field/route/event được đối chiếu bằng file + vị trí và không tự giải quyết bằng ký ức hội thoại; rõ hợp đồng trước bước ảnh hưởng.
- **Gate hạ tầng:** `docker compose config` chỉ là tĩnh; phải có `docker compose ps`, health/readiness thực, 8 DB users/ownership, Redis, RabbitMQ và bảo toàn volumes.
- **Gate kiểm thử:** Tài liệu, generated collection, mock SDK, unit tests không tương đương PASS end-to-end. Giữ baseline 103 case/30 mục theo artifacts hiện có; run Postman theo folder/fixtures và ghi kết quả mỗi lần.
- **Gate tải cao & bảo mật:** XSS browser, database encryption at rest, replay đồng thời, broker DLQ, load >1000 req/s cần bằng chứng riêng; không được tuyên bố đã nghiệm thu do script tồn tại.

## Kiểm tra tự động nội bộ bộ prompt
Đúng 30 Pxx; criterion 01–30 duy nhất; prerequisite là DAG. Đường dẫn đầu vào trỏ tới snapshot GitHub đã thấy; các path đầu ra như `compose.yaml`, `gateway/src/`, `infra/mongo/` là **dự kiến tạo**, không được tuyên bố sẵn có. Mọi prompt phải kiểm lại các path khi triển khai ở máy người dùng.

## Cập nhật v2 — Cách làm gọn theo thời lượng bảo vệ
- **P01–P04** có phần minh chứng và lời nói khoảng 30 giây; các nội dung này dùng cấu trúc/code thực, không làm slide/bài luận riêng. P03/P04 vẫn phải triển khai Gateway/IPC thực trong giai đoạn phát triển; nói ngắn không đồng nghĩa cắt kỹ thuật.
- **Không lặp screenshot gây phiền:** Codex tự đọc các file trong workspace. Không hướng dẫn Git Bash `for ... cat -n`, dump AGENTS, README, prompt hoặc toàn bộ cây thư mục chỉ để kiểm tra P01/P02. Không yêu cầu gửi hàng trăm dòng output.
- **P01→P02 là phụ thuộc mềm:** nếu P01 chưa cập nhật inventory hoặc `docs/PROJECT_STATUS.md` nhưng repo đọc được và có `.gitignore`/`.env.example`, Codex tiến hành P02 và ghi lưu ý nhỏ.
- **Bảo toàn kiểm chứng:** mã nguồn, Compose, DB, RPC và RabbitMQ chỉ PASS khi có bằng chứng thích hợp; kiểm tĩnh không thay cho runtime. Mỗi lần chỉ đưa 1–3 lệnh ngắn thật sự cần cho user tự chạy.
- **Một mục chấm = một prompt**, đủ 30 số thứ tự; thứ tự thực hiện như bảng trên. Khi thiếu dữ liệu/contract ảnh hưởng nghiệp vụ, chỉ chặn phần chịu ảnh hưởng, không chặn khảo sát/sửa bảo mật độc lập.
