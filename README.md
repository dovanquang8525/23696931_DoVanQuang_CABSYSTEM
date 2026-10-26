# CAB System MVP

Hệ thống đặt xe CAB đang ở giai đoạn thiết kế, chưa hoàn tất triển khai backend hoặc Docker. Phạm vi MVP chỉ hỗ trợ BIKE; payment mock được thực hiện sau khi Trip ở trạng thái COMPLETED.

## Tài liệu

- [SRS hiện có](docs/SRS.md): bản gốc được chuyển từ `srs.md` (Git lưu tên `SRS.MD`).
- [SRS 2.0](docs/srs2.md): bản ngày 26/10/2026, vốn là file chưa được Git theo dõi; giữ riêng nguyên nội dung. Chưa hợp nhất hay thay thế bản gốc.
- [Bounded Context](docs/Bounded-Context.md), [kiến trúc](docs/ARCHITECTURE.md), [ma trận chấm điểm](docs/GRADING_MATRIX.md).
- [Trạng thái và báo cáo tổ chức repository](docs/PROJECT_STATUS.md): kiểm tra bảo toàn file, nguồn thiếu và tham chiếu cần xử lý.

SRS 2.0 ghi rõ YAML và thiết kế cũ chưa đồng bộ. Các tài liệu được bảo toàn để đối chiếu; không coi chúng là contracts đã hoàn thiện.

## Đúng 8 microservices

| Service | Trách nhiệm |
| --- | --- |
| auth_service | Identity & Access |
| customer_service | Customer Profile |
| driver_service | Driver & Vehicle |
| booking_service | Booking & Dispatch |
| trip_service | Trip Execution & Fare |
| payment_service | Payment |
| notification_service | Notification |
| rating_service | Rating |

## Công nghệ dự kiến

Client → Gateway dùng REST; Gateway → Service và giao tiếp đồng bộ nội bộ dùng gRPC. RabbitMQ phục vụ event bất đồng bộ, Redis phục vụ rate limiting tại Gateway. MongoDB có 8 database logic, mỗi service sở hữu một database. Docker dành cho giai đoạn triển khai tiếp theo; chưa có Compose. Ngôn ngữ và framework triển khai chưa được chốt trong lần tổ chức này.

## Cấu trúc repository

```text
.
├── AGENTS.md
├── README.md
├── .postman/                       # Metadata Postman giữ nguyên
├── api-specifications/             # 10 YAML và tài liệu mapping hiện có
├── docs/
│   ├── SRS.md
│   ├── srs2.md
│   ├── Bounded-Context.md
│   ├── ARCHITECTURE.md
│   ├── GRADING_MATRIX.md
│   ├── PROJECT_STATUS.md
│   ├── diagrams/
│   │   ├── erd/ERD.png
│   │   ├── bounded-context/bounded-context-model.png
│   │   └── microservice/CAB_ThietKe_MicroService_8_BoundedContext.docx
│   ├── references/
│   └── prompts/                    # Dành cho P01–P30, chưa viết prompt
├── gateway/
├── proto/
├── services/
│   ├── auth_service/
│   ├── customer_service/
│   ├── driver_service/
│   ├── booking_service/
│   ├── trip_service/
│   ├── payment_service/
│   ├── notification_service/
│   └── rating_service/
├── infra/
├── scripts/
└── postman/
    ├── collections/
    ├── documents/
    ├── environments/
    ├── flows/
    ├── globals/workspace.globals.yaml
    ├── mocks/
    └── specs/
```

Các thư mục trống cần lưu trong Git có `.gitkeep`. Các thư mục cũ `ddd/`, `erd/` hiện trống sau khi chuyển file, không có file được theo dõi tại đó. Không có hướng dẫn chạy hệ thống vì backend, contracts và hạ tầng chưa triển khai.
