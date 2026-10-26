# Trạng thái tổ chức repository CAB System

Ngày thực hiện: **27/10/2026** (Asia/Saigon).

Repository gốc: `E:\Nam_4_HK1\Lap_Trinh_Huong_Dich_Du\CAB\23696931_DoVanQuang_CABSYSTEM`, được xác nhận bằng `git rev-parse --show-toplevel`.

## Trước khi tổ chức

19 file dữ liệu/tài liệu ngoài `.git/`, gồm 18 file tracked và `srs2.md` untracked. Không có thay đổi tracked hoặc staged trước nhiệm vụ. Không có README, AGENTS, thư mục dịch vụ, backend hay Docker Compose. Đã liệt kê toàn bộ cây kể cả file ẩn; có `.postman/`, không có `.github/` hoặc AGENTS.md có sẵn trong repository.

```text
.
├── .git/                           # Metadata Git, không liệt kê nội bộ
├── .postman/resources.yaml
├── api-specifications/
│   ├── 01-identity-access.yaml
│   ├── 02-customer-management.yaml
│   ├── 03-driver-vehicle-management.yaml
│   ├── 04-booking-driver-dispatch.yaml
│   ├── 05-trip-management.yaml
│   ├── 06-fare-payment.yaml
│   ├── 07-rating-feedback.yaml
│   ├── 08-reporting.yaml
│   ├── 09-support-management.yaml
│   ├── 10-audit-log.yaml
│   └── Danh_gia_va_mapping.md
├── ddd/
│   ├── Bounded-Context.md
│   ├── bounded-context-model.png
│   └── CAB_ThietKe_MicroService_8_BoundedContext.docx
├── erd/ERD.png
├── postman/
│   ├── collections/
│   ├── documents/
│   ├── environments/
│   ├── flows/
│   ├── globals/workspace.globals.yaml
│   ├── mocks/
│   └── specs/
├── srs.md                          # Git ghi nhận tên SRS.MD
└── srs2.md                         # Untracked, SRS 2.0 ngày 26/10/2026
```

## File đã di chuyển

| Đường dẫn cũ thực tế                               | Đường dẫn mới                                                             | Phương thức                         |
| -------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------- |
| srs.md (Git: SRS.MD)                               | docs/SRS.md                                                               | git mv                              |
| srs2.md                                            | docs/srs2.md                                                              | Move-Item; giữ trạng thái untracked |
| ddd/Bounded-Context.md                             | docs/Bounded-Context.md                                                   | git mv                              |
| erd/ERD.png                                        | docs/diagrams/erd/ERD.png                                                 | git mv                              |
| ddd/bounded-context-model.png                      | docs/diagrams/bounded-context/bounded-context-model.png                   | git mv                              |
| ddd/CAB_ThietKe_MicroService_8_BoundedContext.docx | docs/diagrams/microservice/CAB_ThietKe_MicroService_8_BoundedContext.docx | git mv                              |

Không tạo bản sao SRS. Hai phiên bản có sẵn được giữ riêng, không hợp nhất hoặc sửa nghiệp vụ. Không đổi API, tên service hoặc nội dung sơ đồ. Các thư mục `ddd/`, `erd/` được giữ trống trên đĩa sau khi chuyển; Git không theo dõi thư mục trống này.

## File đã tạo

5 tài liệu quản lý: `README.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/GRADING_MATRIX.md`, `docs/PROJECT_STATUS.md`.

20 file `.gitkeep` tại:

- `docs/references/`, `docs/prompts/`.
- `gateway/`, `proto/`, `infra/`, `scripts/`.
- `services/auth_service/`, `services/customer_service/`, `services/driver_service/`, `services/booking_service/`, `services/trip_service/`, `services/payment_service/`, `services/notification_service/`, `services/rating_service/`.
- Các thư mục Postman vốn trống: `postman/collections/`, `postman/documents/`, `postman/environments/`, `postman/flows/`, `postman/mocks/`, `postman/specs/`.

## Cây cuối cùng

`*` ở tên thư mục dưới đây nghĩa là có `.gitkeep`; đây là chú thích, không thuộc tên thật.

```text
.
├── .git/
├── .postman/resources.yaml
├── AGENTS.md
├── README.md
├── api-specifications/
│   ├── 01-identity-access.yaml
│   ├── 02-customer-management.yaml
│   ├── 03-driver-vehicle-management.yaml
│   ├── 04-booking-driver-dispatch.yaml
│   ├── 05-trip-management.yaml
│   ├── 06-fare-payment.yaml
│   ├── 07-rating-feedback.yaml
│   ├── 08-reporting.yaml
│   ├── 09-support-management.yaml
│   ├── 10-audit-log.yaml
│   └── Danh_gia_va_mapping.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── Bounded-Context.md
│   ├── GRADING_MATRIX.md
│   ├── PROJECT_STATUS.md
│   ├── SRS.md
│   ├── srs2.md
│   ├── diagrams/
│   │   ├── erd/ERD.png
│   │   ├── bounded-context/bounded-context-model.png
│   │   └── microservice/CAB_ThietKe_MicroService_8_BoundedContext.docx
│   ├── references/*
│   └── prompts/*
├── gateway/*
├── proto/*
├── services/
│   ├── auth_service/*
│   ├── customer_service/*
│   ├── driver_service/*
│   ├── booking_service/*
│   ├── trip_service/*
│   ├── payment_service/*
│   ├── notification_service/*
│   └── rating_service/*
├── infra/*
├── scripts/*
├── postman/
│   ├── collections/*
│   ├── documents/*
│   ├── environments/*
│   ├── flows/*
│   ├── globals/workspace.globals.yaml
│   ├── mocks/*
│   └── specs/*
├── ddd/                            # Trống, không được Git theo dõi
└── erd/                            # Trống, không được Git theo dõi
```

## Kiểm tra bảo toàn và Git

- Đã chụp SHA-256 trước thao tác và đối chiếu **19/19 file gốc** tại vị trí sau tổ chức: toàn bộ nội dung khớp, kể cả `srs2.md` untracked và metadata Postman. Không ghi đè hoặc thất lạc file.
- Không có file trùng tên hoặc trùng SHA-256 trước tổ chức. Hai SRS là hai phiên bản khác nội dung, không phải bản sao giống nhau. Các `.gitkeep` mới cùng rỗng là chủ ý.
- Đã xác nhận đúng 8 thư mục service và 20 `.gitkeep`.
- `git status --short`: 5 rename được stage bởi `git mv`; tài liệu mới, `.gitkeep` và `docs/srs2.md` vẫn untracked. Không stage nội dung SRS 2.0 thay người dùng.
- `git diff --cached --stat`: 5 file đổi vị trí, 0 dòng thêm, 0 dòng xóa. `git diff --check` và `git diff --cached --check` không báo lỗi.
- Đã rà đích liên kết Markdown nội bộ, đường dẫn YAML/Postman và external relationships trong DOCX. DOCX không có external relationship. Chưa kiểm tra khả dụng URL web hay kiểm định toàn bộ OpenAPI schema.
- Không commit, push, merge, reset, clean hoặc xóa lịch sử Git. Không npm install, không Docker build/up, không tạo backend, database hoặc prompts.

## Tham chiếu tồn đọng và nguồn thiếu

Các tham chiếu sau đã tồn tại trước khi di chuyển; không có đủ bằng chứng ánh xạ đúng đích nên được giữ nguyên và đánh dấu cần xử lý:

| Vị trí                                    | Vấn đề                                                                                                                             | Hướng xử lý tiếp theo                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| docs/SRS.md:9                             | Link `sandbox:/workspace/scratch/102ec265fda2/project_sources/03-Customer-Requirement.docx` từ môi trường khác, không có file đích | Bổ sung nguồn thật vào docs/references rồi cập nhật link tương đối            |
| docs/SRS.md:1046                          | `image.png` không tồn tại; cú pháp ảnh nằm trong mã Mermaid ở bản gốc                                                              | Xác minh ảnh nguồn; không tự thay bằng ERD.png hoặc sửa sơ đồ                 |
| .postman/resources.yaml:7–18              | 12 tham chiếu tới api-document/ không tồn tại                                                                                      | Đối chiếu workspace/spec gốc; không tự ghép với 10 YAML có tên và nhóm khác   |
| 10 YAML trong api-specifications/         | 52 lần x-source dùng 02-srs.md không tồn tại                                                                                       | Xác minh phiên bản nguồn trước khi đổi; chưa đủ cơ sở chọn SRS.md hay srs2.md |
| api-specifications/Danh_gia_va_mapping.md | Nhắc 11-notification-workflow.yaml và 12-cab-openapi.yaml nhưng không có hai file này                                              | Xác minh tài liệu cũ; không tạo YAML giả                                      |

Chưa có `Customer-Requirement.docx`, `CAB.docx`, `PHIEU_CHAM_PROJECT.pdf` và bản mẫu `Thiết Kế Micro-Service.docx` mà tài liệu nhắc đến. File thiết kế `CAB_ThietKe_MicroService_8_BoundedContext.docx` hiện có là một file khác, đã được bảo toàn. Ma trận chấm chỉ có 30 vị trí trống; chưa trích xuất tiêu chí do thiếu PDF nguồn.

Không có liên kết nội bộ nào có thể sửa đích một cách chắc chắn trong các tài liệu gốc; không thay tham chiếu dựa trên suy đoán. Các liên kết trong tài liệu quản lý mới sử dụng vị trí hiện tại.

## Giai đoạn tiếp theo

1. Bổ sung tài liệu khách hàng và phiếu chấm vào docs/references, đối chiếu chính xác 30 tiêu chí.
2. Xác nhận sử dụng phiên bản SRS nào làm chuẩn và đồng bộ Bounded Context, Word, YAML theo phạm vi đã chốt; xử lý các tham chiếu tồn đọng.
3. Sau khi chốt thiết kế, chuẩn bị contracts proto/event, kế hoạch P01–P30 và triển khai 8 service, Gateway, hạ tầng trong nhiệm vụ riêng.

**Trạng thái:** hoàn thành tổ chức thư mục và kiểm tra bảo toàn file. Backend, Docker và kiểm thử nghiệp vụ chưa hoàn thành.
