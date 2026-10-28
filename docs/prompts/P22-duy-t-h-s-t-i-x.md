# P22 — POSTMAN: Duyệt hồ sơ tài xế

**Tiêu chí gốc #22/30:** POSTMAN: Duyệt hồ sơ tài xế (xem `docs/GRADING_MATRIX.md`, `PHIEU_CHAM_PROJECT.pdf`, trang 3; không đổi tên mục chấm).\
**Mục tiêu:** ADMIN duyệt/từ chối DRIVER, sự kiện approval và khả năng Driver đọc trạng thái.

## Đầu vào bắt buộc (đường dẫn thuộc snapshot main 02c4da26403934e3f1826d269742f63eba645529)
- `docs/api/03-drivers.yaml`
- `docs/events/topology.json`
- `proto/driver.proto`

## Tiên quyết và checkpoint
**Phải thực hiện trước:** P21, P07, P03. Kiểm nhanh artifact thực sự cần cho công việc hiện tại. **P01 là bước khảo sát hỗ trợ, không phải khóa cứng P02:** nếu file báo cáo P01 thiếu nhưng `.gitignore`, `.env.example`, `AGENTS.md` đã có, P02 tự đọc và làm tiếp; ghi `P01 documentation pending` thay vì dừng. Với các prompt khác, thiếu *artifact kỹ thuật* bắt buộc thì chỉ chặn phần phụ thuộc, vẫn hoàn thành phần độc lập. Không bắt người dùng xuất toàn bộ AGENTS/README/prompts ra terminal.

## Phạm vi công việc Codex được tạo/sửa
- `services/driver_service/src/`
- `postman/collections/`

**Các bước cụ thể:**
1. Đối chiếu tiêu chí #22 trong `docs/GRADING_MATRIX.md`, `postman/documents/grading-checklist.json` và nội dung smoke của `PHIEU_CHAM_PROJECT.pdf` qua ma trận đã trích. Ghi chính xác positive/negative/boundary phù hợp mục chấm.
2. Khảo sát implementations/fixtures tồn tại và lập bảng `EXISTING_IMPL`, `SCAFFOLD`, `DOC_ONLY`, `MISSING`, `CONFLICT`. Không tự động chạy setup lại hoặc ghi đè.
3. ADMIN duyệt/từ chối DRIVER, sự kiện approval và khả năng Driver đọc trạng thái. Chỉ dùng dữ liệu field/state/route/RPC và constants từ nguồn hợp đồng. Những file trong phần dự kiến là kế hoạch, kiểm tra file đã tồn tại trước khi chọn tên thực tế.
4. Chỉ bổ sung test đúng phạm vi prompt; không bắt buộc tạo test hạ tầng cho câu mô tả P01/P02. Phân biệt static và runtime. Nếu cần setup, Codex tạo file, người dùng tự chạy lệnh.
5. Nếu có ảnh hưởng Postman, giữ assertion/fixture; tuyệt đối không thay collection chính bằng generator cũ.

## Lệnh đề xuất cho người dùng (Git Bash; Codex không chạy)
```bash
docker compose ps
```

**Quy tắc lệnh:** VS Code/Codex đã mở workspace thì Codex tự đọc file bằng chức năng đọc của mình; **không đưa lệnh `cat -n`, `for file ... cat`, `find` dài, hoặc yêu cầu dán toàn bộ file trong terminal**. Người dùng chỉ chạy lệnh có tác dụng kiểm chứng/cài đặt cần thiết, tối đa 1–3 lệnh ngắn mỗi lượt và chỉ khi tới đúng bước. Nếu đường dẫn cố định `cd /e/...` chưa được xác nhận trên máy hiện tại, dùng root workspace, không đoán. Lệnh npm chỉ đề xuất sau khi package/script đã có; không gọi kiểm tĩnh là runtime PASS.

## Tiêu chí hoàn thành và bằng chứng
ADMIN-only approve/reject, state change chuẩn, event đúng topology. Chỉ thu bằng chứng phù hợp bản chất tiêu chí: câu mô tả dùng file/code đã kiểm; câu runtime cần output HTTP/DB/log thực. Không buộc mọi câu phải có đủ HTTP, DB và screenshot. Thư mục bằng chứng gợi ý: `postman/evidence/` (không commit secret). Giữ trạng thái `BLOCKED`/`NOT_RUN` nếu chưa có output thật.

## Kết thúc phiên (ngắn gọn, không chặn bước sau vì báo cáo thiếu)
Nêu `Đã làm | Chưa làm/bị chặn | File sửa | Lệnh Git Bash cần tôi chạy (nếu có) | NEXT`. Nếu thực sự có lỗi, nêu đúng file và nguyên nhân, không tự sửa requirement. Chỉ cập nhật **một mục tóm tắt ngắn** trong `docs/PROJECT_STATUS.md`; nếu file chưa tồn tại thì tạo khi thuận tiện, không coi việc cập nhật tài liệu là điều kiện bắt buộc để khởi động prompt kế tiếp. Tránh yêu cầu tôi gửi dump toàn bộ repo.

## Quy tắc chung (áp dụng trong phiên Codex mới)
- Tự đọc file trực tiếp trong VS Code/workspace; tự xác định trạng thái file và thay đổi chưa commit. **Không bắt người dùng chạy command để in hàng loạt tài liệu mà Codex đọc được**. Chỉ xin đúng dữ liệu mà Codex không truy cập được, ví dụ kết quả `docker compose ps` hoặc HTTP runtime.
- Trước sửa đọc `AGENTS.md`, nguồn hợp đồng liên quan và `docs/PROJECT_STATUS.md` nếu có. Giữ code phù hợp; không git reset/commit/push. Không tự thay SRS, OTP, Vehicle, state, fare, payment hay topology event. Xung đột nghiệp vụ ghi `file + vị trí + ảnh hưởng`; chỉ chặn công việc phụ thuộc vào xung đột đó.
- 8 service, BIKE, MOCK_ONLINE, Gateway REST→gRPC, synchronous gRPC, RabbitMQ theo `docs/events/topology.json`, Redis rate limit, MongoDB 8 database logic. Không tự thêm service hay event.
- Codex **được tạo/sửa file** nhưng **không chạy terminal**; đưa lệnh cụ thể để tôi nhập bằng Git Bash chỉ khi cần cài đặt hoặc xác minh. Có thể chuẩn bị code trước khi runtime sẵn sàng; không báo PASS runtime nếu chưa có output thật.
- Postman chính: `postman/collections/CAB-MVP.postman_collection.json` + `postman/environments/CAB-Local.postman_environment copy.json` (`base_url`, snake_case). Bảo toàn assertions, fixtures và test flow; `scripts/sync_postman.py` chỉ cho legacy candidate, không ghi đè bộ chính; không chạy toàn collection khi fixture khác nhau.
- Trạng thái phân biệt `IMPLEMENTED_UNTESTED`, `STATIC_OK`, `PASS`, `FAIL`, `BLOCKED`, `NOT_RUN`. Không sửa assertion để làm test qua. Khi user chưa chạy lệnh kiểm tra, báo `cần người dùng chạy`, **không chuyển toàn bộ nhiệm vụ thành bài đọc terminal**.
