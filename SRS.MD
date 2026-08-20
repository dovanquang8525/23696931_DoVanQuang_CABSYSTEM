# Software Requirements Specification (SRS)

## 1. Business Analysis

### 1.1. Business Context

#### 1.1.1. Bối cảnh doanh nghiệp

Công ty ABC là doanh nghiệp cung cấp dịch vụ đặt xe trực tuyến. Hiện tại,
khách hàng có thể yêu cầu xe thông qua tổng đài hoặc một ứng dụng đơn giản.

Tuy nhiên, hệ thống hiện tại còn nhiều hạn chế:

- Việc phân công tài xế chủ yếu được thực hiện thủ công.
- Khách hàng khó theo dõi trạng thái chuyến đi.
- Thông tin thanh toán chưa được quản lý tập trung.
- Bộ phận vận hành gặp khó khăn khi muốn mở rộng hệ thống.

Ban lãnh đạo mong muốn xây dựng một nền tảng CAB mới có khả năng phục vụ
số lượng lớn khách hàng và tài xế, đồng thời có thể phát triển thêm các
tính năng trong tương lai.

### 1.2. Business Problem

#### 1.2.1. Vấn đề kinh doanh cốt lõi

Công ty ABC đang gặp khó khăn trong việc quản lý và mở rộng dịch vụ đặt xe
do quy trình phân công tài xế còn phụ thuộc nhiều vào xử lý thủ công,
khả năng theo dõi chuyến và quản lý thanh toán còn hạn chế, hoạt động vận hành
chưa được tập trung và hệ thống hiện tại thiếu khả năng mở rộng linh hoạt.

Điều này ảnh hưởng đến:

- Trải nghiệm của khách hàng.
- Hiệu quả vận hành.
- Khả năng kiểm soát hoạt động.
- Khả năng mở rộng quy mô dịch vụ.
- Khả năng phát triển các tính năng mới trong tương lai.

#### 1.2.2. Các vấn đề cụ thể

| # | Business Problem | Tác động |
|---|---|---|
| 1 | Phân công tài xế chủ yếu thủ công | Khó mở rộng và giảm hiệu quả vận hành |
| 2 | Khách hàng khó theo dõi chuyến đi | Trải nghiệm khách hàng không minh bạch |
| 3 | Thanh toán chưa được quản lý tập trung | Khó kiểm soát giao dịch |
| 4 | Khó mở rộng hệ thống | Hạn chế khả năng tăng quy mô dịch vụ |
| 5 | Vận hành khó theo dõi và xử lý sự cố | Tăng khó khăn trong quản lý |
| 6 | Hệ thống thông báo thiếu tính linh hoạt | Khó mở rộng thêm các kênh thông báo |
| 7 | Thiếu dữ liệu quản trị đầy đủ | Khó đánh giá hiệu quả kinh doanh |

### 1.3. As-Is vs To-Be

| As-Is (Hiện tại) | To-Be (Mong muốn) |
|---|---|
| Phân công tài xế chủ yếu thủ công | Tự động tìm và ưu tiên tài xế phù hợp |
| Khó theo dõi trạng thái chuyến | Khách hàng theo dõi được trạng thái chuyến |
| Thanh toán chưa tập trung | Quản lý quy trình thanh toán tập trung |
| Vận hành khó kiểm soát | Có giao diện quản trị tập trung |
| Khó mở rộng hệ thống | Các thành phần có thể mở rộng độc lập |
| Thông báo chưa linh hoạt | Có khả năng mở rộng nhiều kênh thông báo |
| Dữ liệu quản trị chưa đầy đủ | Có báo cáo phục vụ quản trị |

### 1.4. Business Objectives

Các mục tiêu kinh doanh được xác định từ yêu cầu của khách hàng:

- Xây dựng nền tảng đặt xe có khả năng phục vụ số lượng lớn khách hàng và
  tài xế.
- Số hóa quy trình từ đặt xe đến hoàn thành chuyến.
- Tự động hóa việc tìm và phân công tài xế.
- Cải thiện khả năng theo dõi chuyến đi.
- Quản lý tập trung thông tin chuyến đi và thanh toán.
- Hỗ trợ nhân viên vận hành quản lý và xử lý sự cố.
- Cung cấp dữ liệu và báo cáo cho ban lãnh đạo.
- Đảm bảo kiến trúc đủ linh hoạt để phát triển các dịch vụ và tính năng mới.

## 2. Stakeholder Analysis

### 2.1. Stakeholder

| Stakeholder | Vai trò |
|---|---|
| **Khách hàng** | Đăng ký tài khoản, đăng nhập, cập nhật thông tin cá nhân, đặt xe, theo dõi chuyến đi, xem lịch sử chuyến, thanh toán và đánh giá tài xế. |
| **Tài xế** | Đăng ký hoặc được tạo tài khoản, quản lý hồ sơ và phương tiện, cập nhật trạng thái hoạt động, nhận/từ chối chuyến và cập nhật trạng thái chuyến đi. |
| **Nhân viên vận hành** | Quản lý khách hàng, tài xế, phương tiện và chuyến đi; theo dõi các chuyến đang diễn ra, trạng thái tài xế, xử lý sự cố và tra cứu lịch sử giao dịch. |
| **Ban lãnh đạo** | Theo dõi và sử dụng các báo cáo về số lượng chuyến, doanh thu, tỷ lệ hoàn thành, tỷ lệ hủy và hiệu quả hoạt động của tài xế. |
| **Nhà cung cấp thanh toán** | Cung cấp dịch vụ thanh toán điện tử bên ngoài cho hệ thống CAB. |
| **Nhà cung cấp thông báo** | Cung cấp các kênh thông báo cho khách hàng và tài xế, đồng thời có khả năng mở rộng thêm các kênh trong tương lai. |

### 2.2. Stakeholder Matrix

Ma trận stakeholder được xây dựng dựa trên hai tiêu chí:

- **Influence:** Mức độ ảnh hưởng hoặc quyền quyết định đối với hệ thống.
- **Interest:** Mức độ quan tâm và mức độ liên quan của stakeholder đối với hệ thống.

```mermaid
quadrantChart
    title Stakeholder Matrix - CAB System
    x-axis Low Interest --> High Interest
    y-axis Low Influence --> High Influence

    quadrant-1 "Keep Satisfied"
    quadrant-2 "Manage Closely"
    quadrant-3 "Monitor"
    quadrant-4 "Keep Informed"

    "Ban lãnh đạo": [0.75, 0.90]
    "Nhân viên vận hành": [0.90, 0.80]

    "Nhà cung cấp thanh toán": [0.50, 0.75]
    "Nhà cung cấp thông báo": [0.40, 0.65]

    "Khách hàng": [0.85, 0.35]
    "Tài xế": [0.80, 0.30]

## 3. Business Goals

Business Goals (BG) được xác định dựa trên các vấn đề kinh doanh và kỳ vọng
của Công ty ABC. Mỗi Business Goal mô tả một kết quả mà doanh nghiệp mong
muốn đạt được, trong khi hệ thống sẽ cung cấp các chức năng và khả năng cần
thiết để hỗ trợ đạt được mục tiêu đó.

### 3.1. Danh sách Business Goals

| ID | Business Goal | Mục đích / System Support |
|---|---|---|
| **BG01** | **Giảm thời gian tìm và phân công tài xế** | Hệ thống tự động xác định và ưu tiên tài xế phù hợp dựa trên vị trí, trạng thái sẵn sàng và các tiêu chí vận hành. |
| **BG02** | **Hỗ trợ và quản lý thanh toán** | Cho phép khách hàng thanh toán bằng tiền mặt hoặc phương thức điện tử; tích hợp với nhà cung cấp thanh toán bên ngoài và không lưu thông tin thanh toán nhạy cảm trực tiếp trong hệ thống CAB. |
| **BG03** | **Cải thiện khả năng theo dõi chuyến đi** | Cho phép khách hàng biết trạng thái yêu cầu, tài xế đã nhận chuyến, thời gian dự kiến tài xế đến và trạng thái hiện tại của chuyến đi. |
| **BG04** | **Nâng cao hiệu quả vận hành** | Cung cấp giao diện quản trị để nhân viên vận hành quản lý khách hàng, tài xế, phương tiện và chuyến đi; theo dõi chuyến đang diễn ra và xử lý các trường hợp chuyến bị lỗi. |
| **BG05** | **Cải thiện khả năng giao tiếp và thông báo** | Gửi thông báo cho khách hàng và tài xế tại các thời điểm quan trọng trong vòng đời chuyến đi và cho phép mở rộng thêm các kênh thông báo trong tương lai. |
| **BG06** | **Nâng cao khả năng quản trị và ra quyết định** | Cung cấp dữ liệu và báo cáo về số lượng chuyến, doanh thu, tỷ lệ chuyến hoàn thành, tỷ lệ hủy và hiệu quả hoạt động của tài xế. |
| **BG07** | **Đảm bảo khả năng mở rộng của hệ thống** | Cho phép các thành phần của hệ thống mở rộng độc lập khi tải tăng và cho phép triển khai chức năng mới từng phần mà hạn chế ảnh hưởng đến các chức năng đang hoạt động. |
| **BG08** | **Đảm bảo tính bảo mật và khả năng kiểm soát hệ thống** | Xác thực người dùng, kiểm soát quyền truy cập các chức năng quản trị, bảo vệ dữ liệu cá nhân, dữ liệu phương tiện, vị trí và giao dịch; lưu vết các thao tác quan trọng. |
| **BG09** | **Nâng cao trải nghiệm khách hàng sau chuyến đi** | Cho phép khách hàng xem lịch sử chuyến đi, số tiền phải trả và đánh giá tài xế sau khi chuyến hoàn thành. |
| **BG10** | **Tăng khả năng phát triển dịch vụ trong tương lai** | Xây dựng nền tảng đủ linh hoạt để bổ sung loại dịch vụ, phương thức thanh toán, nhà cung cấp thông báo hoặc thay đổi thành phần kỹ thuật mà không phải xây dựng lại toàn bộ ứng dụng. |

### 3.2. Chi tiết Business Goals

#### BG01 — Giảm thời gian tìm và phân công tài xế

**Business Goal:**

Giảm thời gian cần thiết để tìm và phân công tài xế phù hợp cho một yêu cầu
đặt xe.

**System Support:**

- Tự động xác định các tài xế phù hợp.
- Ưu tiên tài xế gần khách hàng.
- Xem xét trạng thái sẵn sàng của tài xế.
- Xem xét các tiêu chí vận hành khác.
- Tự động tiếp tục tìm tài xế khác khi tài xế được đề xuất không phản hồi
  hoặc từ chối.
- Thông báo cho khách hàng khi không tìm được tài xế.

---

#### BG02 — Hỗ trợ và quản lý thanh toán

**Business Goal:**

Đảm bảo khách hàng có thể thanh toán chuyến đi bằng các phương thức phù hợp
và doanh nghiệp có thể quản lý kết quả thanh toán.

**System Support:**

- Tính số tiền khách hàng phải trả sau khi chuyến hoàn thành.
- Hỗ trợ thanh toán bằng tiền mặt.
- Hỗ trợ thanh toán điện tử.
- Tích hợp với nhà cung cấp thanh toán bên ngoài.
- Không lưu trực tiếp thông tin nhạy cảm của thẻ hoặc tài khoản thanh toán.
- Thông báo kết quả thanh toán cho khách hàng.
- Cho phép xử lý lại khi thanh toán điện tử thất bại theo chính sách doanh nghiệp.

---

#### BG03 — Cải thiện khả năng theo dõi chuyến đi

**Business Goal:**

Tăng tính minh bạch của quá trình đặt và thực hiện chuyến đối với khách hàng.

**System Support:**

- Hiển thị trạng thái đang tìm tài xế.
- Hiển thị tài xế đã nhận chuyến.
- Hiển thị thời gian dự kiến tài xế đến.
- Theo dõi trạng thái hiện tại của chuyến.
- Thông báo các thay đổi quan trọng trong quá trình thực hiện chuyến.

---

#### BG04 — Nâng cao hiệu quả vận hành

**Business Goal:**

Giúp nhân viên vận hành có khả năng theo dõi, quản lý và xử lý hoạt động
đặt xe từ một hệ thống tập trung.

**System Support:**

- Quản lý khách hàng.
- Quản lý tài xế.
- Quản lý phương tiện.
- Quản lý chuyến đi.
- Theo dõi các chuyến đang diễn ra.
- Kiểm tra trạng thái tài xế.
- Xử lý các trường hợp chuyến bị lỗi.
- Tra cứu lịch sử giao dịch.
- Phân quyền các chức năng quản trị.

---

#### BG05 — Cải thiện khả năng giao tiếp và thông báo

**Business Goal:**

Đảm bảo khách hàng và tài xế nhận được thông tin kịp thời trong quá trình
đặt và thực hiện chuyến.

**System Support:**

- Thông báo khi yêu cầu đặt xe được tiếp nhận.
- Thông báo khi tài xế nhận chuyến.
- Thông báo khi tài xế đến điểm đón.
- Thông báo khi chuyến hoàn thành.
- Thông báo kết quả thanh toán.
- Thông báo cho tài xế về chuyến mới hoặc thay đổi liên quan đến chuyến đang
  thực hiện.
- Hỗ trợ mở rộng thêm các kênh thông báo trong tương lai.

---

#### BG06 — Nâng cao khả năng quản trị và ra quyết định

**Business Goal:**

Cung cấp dữ liệu cần thiết để ban lãnh đạo theo dõi và đánh giá hiệu quả
kinh doanh và vận hành.

**System Support:**

- Báo cáo số lượng chuyến.
- Báo cáo doanh thu.
- Báo cáo tỷ lệ chuyến hoàn thành.
- Báo cáo tỷ lệ hủy.
- Báo cáo hiệu quả hoạt động của tài xế.

---

#### BG07 — Đảm bảo khả năng mở rộng của hệ thống

**Business Goal:**

Đảm bảo hệ thống có thể tiếp tục hoạt động khi số lượng khách hàng, tài xế
và tải hệ thống tăng lên.

**System Support:**

- Cho phép các thành phần mở rộng độc lập khi tải tăng.
- Hạn chế việc một lỗi tại thanh toán hoặc thông báo làm toàn bộ hệ thống
  đặt xe ngừng hoạt động.
- Cho phép triển khai chức năng mới từng phần.
- Hạn chế ảnh hưởng của chức năng mới đến các chức năng đang hoạt động.

---

#### BG08 — Đảm bảo tính bảo mật và khả năng kiểm soát hệ thống

**Business Goal:**

Bảo vệ dữ liệu và đảm bảo các thao tác trong hệ thống được thực hiện bởi
đúng đối tượng có quyền.

**System Support:**

- Xác thực khách hàng và tài xế trước khi sử dụng chức năng yêu cầu tài khoản.
- Kiểm soát quyền truy cập các chức năng quản trị.
- Bảo vệ thông tin cá nhân.
- Bảo vệ thông tin phương tiện.
- Bảo vệ dữ liệu vị trí.
- Bảo vệ dữ liệu giao dịch.
- Lưu vết các thao tác quan trọng để phục vụ kiểm tra khi có sự cố.

---

#### BG09 — Nâng cao trải nghiệm khách hàng sau chuyến đi

**Business Goal:**

Cải thiện trải nghiệm khách hàng sau khi hoàn thành chuyến và tạo cơ sở để
doanh nghiệp thu thập phản hồi về chất lượng tài xế.

**System Support:**

- Cho phép xem lịch sử chuyến đi.
- Cho phép xem số tiền phải trả.
- Cho phép đánh giá tài xế sau khi chuyến hoàn thành.

---

#### BG10 — Tăng khả năng phát triển dịch vụ trong tương lai

**Business Goal:**

Xây dựng nền tảng CAB có khả năng phát triển lâu dài mà không phải xây dựng
lại toàn bộ hệ thống khi có nhu cầu kinh doanh mới.

**System Support:**

- Có khả năng bổ sung loại dịch vụ mới.
- Có khả năng bổ sung phương thức thanh toán mới.
- Có khả năng bổ sung nhà cung cấp thông báo mới.
- Có khả năng thay đổi một số thành phần kỹ thuật.
- Hạn chế ảnh hưởng đến các thành phần đang hoạt động khi mở rộng hệ thống.

### 3.3. Business Goal Summary

| ID | Business Goal | Priority |
|---|---|---|
| **BG01** | Giảm thời gian tìm và phân công tài xế | High |
| **BG02** | Hỗ trợ và quản lý thanh toán | High |
| **BG03** | Cải thiện khả năng theo dõi chuyến đi | High |
| **BG04** | Nâng cao hiệu quả vận hành | High |
| **BG05** | Cải thiện khả năng giao tiếp và thông báo | High |
| **BG06** | Nâng cao khả năng quản trị và ra quyết định | Medium |
| **BG07** | Đảm bảo khả năng mở rộng của hệ thống | High |
| **BG08** | Đảm bảo tính bảo mật và khả năng kiểm soát hệ thống | High |
| **BG09** | Nâng cao trải nghiệm khách hàng sau chuyến đi | Medium |
| **BG10** | Tăng khả năng phát triển dịch vụ trong tương lai | High |

> **Note:** Priority là đánh giá ban đầu dựa trên mức độ quan trọng thể hiện
> trong yêu cầu khách hàng. Tài liệu chưa cung cấp thứ tự ưu tiên chính thức
> từ phía doanh nghiệp, vì vậy cần xác nhận lại với stakeholder trong các bước
> phân tích tiếp theo.
