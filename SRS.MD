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
```
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

## 4. Scope

### 4.1. Scope Definition

Phạm vi của CAB System tập trung vào việc xây dựng một nền tảng đặt xe trực tuyến
hỗ trợ toàn bộ quy trình nghiệp vụ chính:

**Đặt xe → Tìm tài xế → Phân công tài xế → Thực hiện chuyến → Tính cước →
Thanh toán → Thông báo → Đánh giá → Quản trị và báo cáo**

Phạm vi được xác định dựa trên yêu cầu của khách hàng và thời gian xây dựng,
triển khai sản phẩm dự kiến là **7 tuần**.

---

### 4.2. In Scope

Các chức năng sau nằm trong phạm vi xây dựng của hệ thống CAB:

#### 4.2.1. Quản lý khách hàng

- Đăng ký tài khoản.
- Đăng nhập.
- Cập nhật thông tin cá nhân.
- Nhập điểm đón và điểm đến.
- Lựa chọn loại xe.
- Gửi yêu cầu đặt xe.
- Theo dõi trạng thái chuyến đi.
- Xem lịch sử chuyến đi.
- Xem số tiền phải trả.
- Đánh giá tài xế sau khi hoàn thành chuyến.

#### 4.2.2. Quản lý tài xế

- Đăng ký tài khoản hoặc được nhân viên vận hành tạo tài khoản.
- Cập nhật hồ sơ tài xế.
- Quản lý thông tin phương tiện.
- Cập nhật trạng thái hoạt động.
- Chuyển sang trạng thái sẵn sàng nhận chuyến.
- Nhận thông báo về chuyến mới.
- Chấp nhận hoặc từ chối chuyến.
- Cập nhật trạng thái chuyến:
  - Đã đến điểm đón.
  - Đã đón khách.
  - Đang di chuyển.
  - Hoàn thành chuyến.
- Lưu thông tin vị trí của tài xế.

#### 4.2.3. Quản lý đặt xe và phân công tài xế

- Tiếp nhận yêu cầu đặt xe.
- Xác định tài xế phù hợp.
- Xem xét vị trí của tài xế.
- Xem xét trạng thái sẵn sàng của tài xế.
- Áp dụng các tiêu chí vận hành để lựa chọn tài xế.
- Ưu tiên tài xế phù hợp và gần khách hàng.
- Gửi yêu cầu đến tài xế.
- Xử lý trường hợp tài xế không phản hồi.
- Xử lý trường hợp tài xế từ chối.
- Tiếp tục tìm tài xế khác mà không yêu cầu khách hàng tạo lại yêu cầu.
- Thông báo cho khách hàng khi không tìm được tài xế.

#### 4.2.4. Quản lý chuyến đi

- Quản lý vòng đời của chuyến đi.
- Cập nhật trạng thái chuyến.
- Theo dõi chuyến đang diễn ra.
- Lưu thông tin chuyến đi.
- Liên kết khách hàng, tài xế và phương tiện với chuyến đi.
- Lưu lịch sử chuyến đi.

#### 4.2.5. Tính cước

- Xác định số tiền khách hàng phải trả sau khi chuyến hoàn thành.
- Tính cước dựa trên loại dịch vụ và thông tin chuyến đi.

> **Note:** Chi tiết công thức tính cước chưa được khách hàng chốt và phải
> được BA làm rõ trước khi triển khai.

#### 4.2.6. Thanh toán

- Hỗ trợ thanh toán bằng tiền mặt.
- Hỗ trợ thanh toán điện tử.
- Tích hợp với nhà cung cấp thanh toán bên ngoài.
- Không lưu trực tiếp thông tin nhạy cảm của thẻ hoặc tài khoản thanh toán.
- Ghi nhận kết quả giao dịch.
- Thông báo kết quả thanh toán.
- Xử lý lại giao dịch thanh toán điện tử thất bại theo chính sách doanh nghiệp.

#### 4.2.7. Thông báo

- Thông báo khi yêu cầu đặt xe được tiếp nhận.
- Thông báo khi tài xế nhận chuyến.
- Thông báo khi tài xế đến điểm đón.
- Thông báo khi chuyến hoàn thành.
- Thông báo kết quả thanh toán.
- Thông báo cho tài xế về chuyến mới.
- Thông báo cho tài xế về thay đổi liên quan đến chuyến đang thực hiện.
- Thiết kế khả năng mở rộng thêm các kênh thông báo trong tương lai.

#### 4.2.8. Quản trị và vận hành

- Quản lý khách hàng.
- Quản lý tài xế.
- Quản lý phương tiện.
- Quản lý chuyến đi.
- Theo dõi các chuyến đang diễn ra.
- Kiểm tra trạng thái tài xế.
- Xử lý các trường hợp chuyến bị lỗi.
- Tra cứu lịch sử giao dịch.
- Phân quyền các chức năng quản trị.

#### 4.2.9. Báo cáo

Hệ thống cần hỗ trợ báo cáo:

- Số lượng chuyến.
- Doanh thu.
- Tỷ lệ chuyến hoàn thành.
- Tỷ lệ hủy.
- Hiệu quả hoạt động của tài xế.

#### 4.2.10. Bảo mật và kiểm soát truy cập

- Xác thực khách hàng và tài xế.
- Kiểm soát quyền truy cập chức năng quản trị.
- Bảo vệ thông tin cá nhân.
- Bảo vệ thông tin phương tiện.
- Bảo vệ dữ liệu vị trí.
- Bảo vệ dữ liệu giao dịch.
- Lưu vết các thao tác quan trọng.

---

### 4.3. Out of Scope

Các nội dung sau **không nên tự đưa vào phạm vi triển khai hiện tại** vì
tài liệu khách hàng chưa yêu cầu hoặc chưa cung cấp đủ thông tin để xác định
yêu cầu cụ thể:

- Tự phát triển hệ thống thanh toán riêng thay cho nhà cung cấp bên ngoài.
- Lưu trữ trực tiếp thông tin thẻ hoặc thông tin tài khoản thanh toán nhạy cảm.
- Tự xây dựng hệ thống cung cấp dịch vụ thông báo thay cho các nhà cung cấp
  bên ngoài.
- Tự xác định công thức tính cước khi khách hàng chưa chốt quy tắc.
- Tự xác định tiêu chí ưu tiên tài xế khi chưa được khách hàng xác nhận.
- Tự xác định thời gian tài xế phải phản hồi.
- Tự xác định chính sách hủy chuyến.
- Tự quyết định thời gian lưu trữ dữ liệu.
- Tự quyết định cách xử lý mất kết nối mạng khi chưa có chính sách nghiệp vụ.
- Các loại dịch vụ mới chưa được yêu cầu trong giai đoạn hiện tại.
- Các phương thức thanh toán mới chưa được xác định.
- Các kênh thông báo mới chưa được xác định cụ thể.
- Các thành phần kỹ thuật mới không phục vụ trực tiếp phạm vi CAB hiện tại.

> **Important:** Out of Scope ở đây không có nghĩa là các chức năng trên sẽ
> không bao giờ được xây dựng. Một số nội dung được đưa vào **Future Scope**
> hoặc **Open Questions** thay vì loại bỏ vĩnh viễn.

---

### 4.4. Future Scope

Các khả năng được khách hàng định hướng cho tương lai:

- Bổ sung các loại dịch vụ mới.
- Bổ sung phương thức thanh toán mới.
- Bổ sung nhà cung cấp thông báo.
- Thay đổi các thành phần kỹ thuật.
- Mở rộng hệ thống khi số lượng khách hàng và tài xế tăng.
- Triển khai thêm các chức năng mà không ảnh hưởng lớn đến hệ thống hiện tại.

Mục tiêu của kiến trúc hiện tại là tạo nền tảng đủ linh hoạt để các khả năng
trên có thể được bổ sung mà không cần xây dựng lại toàn bộ ứng dụng.

---

### 4.5. Module của hệ thống

Dựa trên phạm vi nghiệp vụ, hệ thống CAB có thể được chia thành các module
cơ bản sau:

| Module | Nội dung chính | Phạm vi |
|---|---|---|
| **M01 - Customer Management** | Tài khoản, thông tin cá nhân, lịch sử chuyến, đánh giá | In Scope |
| **M02 - Driver Management** | Hồ sơ tài xế, phương tiện, trạng thái hoạt động | In Scope |
| **M03 - Booking Management** | Tạo và quản lý yêu cầu đặt xe | In Scope |
| **M04 - Driver Matching** | Tìm kiếm và phân công tài xế | In Scope |
| **M05 - Trip Management** | Quản lý trạng thái và vòng đời chuyến | In Scope |
| **M06 - Fare Management** | Tính cước chuyến đi | In Scope |
| **M07 - Payment Management** | Thanh toán tiền mặt và điện tử | In Scope |
| **M08 - Notification** | Gửi thông báo cho khách hàng và tài xế | In Scope |
| **M09 - Operation/Admin** | Quản trị và hỗ trợ vận hành | In Scope |
| **M10 - Reporting** | Báo cáo hoạt động và kinh doanh | In Scope |
| **M11 - Authentication & Authorization** | Xác thực và phân quyền | In Scope |
| **M12 - Audit & Logging** | Lưu vết thao tác quan trọng | In Scope |
| **M13 - External Payment Integration** | Tích hợp nhà cung cấp thanh toán | In Scope |
| **M14 - Notification Provider Integration** | Tích hợp nhà cung cấp thông báo | In Scope |

---

### 4.6. MBB Scope Prioritization

Để kiểm soát phạm vi trong thời gian triển khai **7 tuần**, các hạng mục được
phân loại thành:

- **Must Build (MB):** Bắt buộc phải có để hệ thống đáp ứng quy trình nghiệp vụ
  cốt lõi.
- **Better Build (BB):** Nên xây dựng nếu nguồn lực và thời gian cho phép.
- **Beyond Build (B):** Không triển khai trong giai đoạn hiện tại, có thể xem
  xét trong tương lai.

| ID | Module / Requirement | MBB | Lý do |
|---|---|---|---|
| **M01** | Customer Management | **MB** | Khách hàng là người tạo và sử dụng yêu cầu đặt xe. |
| **M02** | Driver Management | **MB** | Cần quản lý tài xế để thực hiện và phân công chuyến. |
| **M03** | Booking Management | **MB** | Là điểm bắt đầu của toàn bộ quy trình đặt xe. |
| **M04** | Driver Matching | **MB** | Là chức năng nghiệp vụ cốt lõi và giải quyết trực tiếp vấn đề phân công thủ công. |
| **M05** | Trip Management | **MB** | Cần quản lý vòng đời chuyến từ nhận chuyến đến hoàn thành. |
| **M06** | Fare Management | **MB** | Cần xác định số tiền khách hàng phải trả sau chuyến. |
| **M07** | Payment Management | **MB** | Thanh toán là một phần của quy trình nghiệp vụ cốt lõi. |
| **M08** | Notification | **MB** | Khách hàng và tài xế cần nhận thông báo trong các trạng thái quan trọng. |
| **M09** | Operation/Admin | **MB** | Nhân viên vận hành cần quản lý và xử lý các tình huống trong hệ thống. |
| **M10** | Reporting | **BB** | Quan trọng cho quản trị nhưng không trực tiếp tạo ra quy trình đặt xe. |
| **M11** | Authentication & Authorization | **MB** | Là yêu cầu bắt buộc về xác thực và kiểm soát quyền truy cập. |
| **M12** | Audit & Logging | **MB** | Yêu cầu lưu vết các thao tác quan trọng để kiểm tra sự cố. |
| **M13** | Payment Provider Integration | **MB** | Cần thiết để hỗ trợ thanh toán điện tử theo yêu cầu. |
| **M14** | Notification Provider Integration | **MB** | Cần thiết để triển khai cơ chế thông báo. |
| **M15** | Dịch vụ/loại xe mới | **B** | Chưa được yêu cầu cụ thể trong giai đoạn hiện tại. |
| **M16** | Phương thức thanh toán mới | **B** | Khách hàng chỉ yêu cầu tiền mặt và thanh toán điện tử hiện tại. |
| **M17** | Nhà cung cấp thông báo mới | **B** | Là khả năng mở rộng trong tương lai. |
| **M18** | Các thay đổi kỹ thuật không phục vụ yêu cầu hiện tại | **B** | Không thuộc nhu cầu nghiệp vụ của giai đoạn hiện tại. |

---

### 4.7. Scope Boundary

Phạm vi hệ thống CAB trong giai đoạn hiện tại được giới hạn như sau:

```text
                    CAB SYSTEM
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    CUSTOMER          DRIVER          OPERATION
        │                │                │
        └────────────────┼────────────────┘
                         │
                    BOOKING
                         │
                  DRIVER MATCHING
                         │
                       TRIP
                         │
                 ┌───────┴───────┐
                 │               │
              FARE           NOTIFICATION
                 │
              PAYMENT
                 │
          EXTERNAL PROVIDER
```
##Cần xác thực lại với khách hàng các yêu cầu trên để chuyển sang bước tiếp theo

## 5. Business Requirements

Business Requirements (BR) mô tả các nhu cầu nghiệp vụ mà hệ thống CAB cần
đáp ứng để giải quyết Business Problem và đạt được các Business Goals đã
xác định.

### 5.1. Danh sách Business Requirements

| Mã BR | Tên Business Requirement | Diễn giải |
|---|---|---|
| **BR01** | **Đặt chuyến xe** | Hệ thống phải hỗ trợ khách hàng tạo yêu cầu đặt xe bằng cách nhập điểm đón, điểm đến và lựa chọn loại xe. |
| **BR02** | **Tìm và phân công tài xế** | Hệ thống phải tự động xác định và phân công tài xế phù hợp dựa trên vị trí, trạng thái sẵn sàng và các tiêu chí vận hành. |
| **BR03** | **Xử lý từ chối hoặc không phản hồi của tài xế** | Hệ thống phải tiếp tục tìm tài xế khác khi tài xế được đề xuất không phản hồi hoặc từ chối chuyến mà không yêu cầu khách hàng tạo lại yêu cầu. |
| **BR04** | **Theo dõi trạng thái chuyến xe** | Hệ thống phải cho phép khách hàng theo dõi trạng thái của yêu cầu và chuyến đi từ khi tìm tài xế đến khi chuyến hoàn thành. |
| **BR05** | **Quản lý thông tin tài xế** | Hệ thống phải hỗ trợ quản lý hồ sơ tài xế, thông tin phương tiện và trạng thái hoạt động của tài xế. |
| **BR06** | **Quản lý thực hiện chuyến** | Hệ thống phải hỗ trợ tài xế cập nhật các trạng thái trong quá trình thực hiện chuyến, bao gồm đến điểm đón, đón khách, đang di chuyển và hoàn thành chuyến. |
| **BR07** | **Quản lý vị trí tài xế** | Hệ thống phải lưu thông tin vị trí của tài xế để hỗ trợ tìm tài xế gần khách hàng và cải thiện khả năng dự kiến thời gian đến. |
| **BR08** | **Tính cước chuyến đi** | Hệ thống phải xác định số tiền khách hàng phải trả sau khi chuyến đi hoàn thành dựa trên loại dịch vụ và thông tin chuyến đi. |
| **BR09** | **Thanh toán chuyến đi** | Hệ thống phải hỗ trợ thanh toán bằng tiền mặt và phương thức thanh toán điện tử thông qua nhà cung cấp thanh toán bên ngoài. |
| **BR10** | **Xử lý thanh toán thất bại** | Hệ thống phải thông báo cho khách hàng khi thanh toán điện tử thất bại và hỗ trợ xử lý lại theo chính sách của doanh nghiệp. |
| **BR11** | **Quản lý thông báo** | Hệ thống phải cung cấp thông báo cho khách hàng và tài xế tại các thời điểm quan trọng trong quá trình đặt và thực hiện chuyến. |
| **BR12** | **Quản lý khách hàng** | Hệ thống phải hỗ trợ đăng ký tài khoản, đăng nhập và cập nhật thông tin cá nhân của khách hàng. |
| **BR13** | **Quản lý lịch sử chuyến đi** | Hệ thống phải cho phép khách hàng xem lại lịch sử chuyến đi và số tiền phải trả. |
| **BR14** | **Đánh giá tài xế** | Hệ thống phải cho phép khách hàng đánh giá tài xế sau khi chuyến đi hoàn thành. |
| **BR15** | **Quản lý vận hành** | Hệ thống phải cung cấp giao diện quản trị để nhân viên vận hành quản lý khách hàng, tài xế, phương tiện và chuyến đi. |
| **BR16** | **Theo dõi và xử lý sự cố** | Hệ thống phải hỗ trợ nhân viên vận hành theo dõi các chuyến đang diễn ra, kiểm tra trạng thái tài xế và xử lý các trường hợp chuyến bị lỗi. |
| **BR17** | **Tra cứu giao dịch** | Hệ thống phải cho phép nhân viên vận hành tra cứu lịch sử giao dịch. |
| **BR18** | **Phân quyền quản trị** | Hệ thống phải kiểm soát quyền truy cập để nhân viên thông thường không thể thực hiện các thao tác quản trị nhạy cảm. |
| **BR19** | **Báo cáo hoạt động và kinh doanh** | Hệ thống phải cung cấp báo cáo về số lượng chuyến, doanh thu, tỷ lệ chuyến hoàn thành, tỷ lệ hủy và hiệu quả hoạt động của tài xế. |
| **BR20** | **Xác thực người dùng** | Hệ thống phải xác thực khách hàng và tài xế trước khi cho phép sử dụng các chức năng yêu cầu tài khoản. |
| **BR21** | **Bảo vệ dữ liệu** | Hệ thống phải bảo vệ thông tin cá nhân, thông tin phương tiện, dữ liệu vị trí và dữ liệu giao dịch. |
| **BR22** | **Lưu vết hoạt động** | Hệ thống phải lưu vết các thao tác quan trọng để phục vụ kiểm tra và xử lý sự cố. |
| **BR23** | **Khả năng mở rộng hệ thống** | Hệ thống phải cho phép các thành phần mở rộng độc lập khi tải tăng và hạn chế việc lỗi ở một thành phần làm ảnh hưởng đến toàn bộ hệ thống. |
| **BR24** | **Triển khai chức năng từng phần** | Hệ thống phải cho phép các chức năng mới được triển khai từng phần và hạn chế ảnh hưởng đến các chức năng đang hoạt động. |
| **BR25** | **Khả năng mở rộng dịch vụ** | Hệ thống phải có khả năng hỗ trợ bổ sung loại dịch vụ, phương thức thanh toán, nhà cung cấp thông báo hoặc thay đổi một số thành phần kỹ thuật trong tương lai. |

### 5.2. Business Requirements theo nhóm nghiệp vụ

Các Business Requirements có thể được nhóm theo các quy trình nghiệp vụ chính:

#### Customer & Booking

- **BR01** — Đặt chuyến xe
- **BR04** — Theo dõi trạng thái chuyến xe
- **BR12** — Quản lý khách hàng
- **BR13** — Quản lý lịch sử chuyến đi
- **BR14** — Đánh giá tài xế

#### Driver & Trip

- **BR05** — Quản lý thông tin tài xế
- **BR06** — Quản lý thực hiện chuyến
- **BR07** — Quản lý vị trí tài xế

#### Driver Matching

- **BR02** — Tìm và phân công tài xế
- **BR03** — Xử lý từ chối hoặc không phản hồi của tài xế

#### Fare & Payment

- **BR08** — Tính cước chuyến đi
- **BR09** — Thanh toán chuyến đi
- **BR10** — Xử lý thanh toán thất bại

#### Notification

- **BR11** — Quản lý thông báo

#### Operation & Administration

- **BR15** — Quản lý vận hành
- **BR16** — Theo dõi và xử lý sự cố
- **BR17** — Tra cứu giao dịch
- **BR18** — Phân quyền quản trị

#### Reporting

- **BR19** — Báo cáo hoạt động và kinh doanh

#### Security

- **BR20** — Xác thực người dùng
- **BR21** — Bảo vệ dữ liệu
- **BR22** — Lưu vết hoạt động

#### Scalability & Future Development

- **BR23** — Khả năng mở rộng hệ thống
- **BR24** — Triển khai chức năng từng phần
- **BR25** — Khả năng mở rộng dịch vụ

### 5.3. Business Requirement Traceability

Các Business Requirements cần liên kết ngược với Business Goals để đảm bảo
mỗi yêu cầu đều phục vụ một mục tiêu kinh doanh cụ thể.

| Business Goal | Business Requirements liên quan |
|---|---|
| **BG01 — Giảm thời gian tìm và phân công tài xế** | BR02, BR03, BR07 |
| **BG02 — Hỗ trợ và quản lý thanh toán** | BR08, BR09, BR10, BR17 |
| **BG03 — Cải thiện khả năng theo dõi chuyến đi** | BR04, BR06, BR07, BR11 |
| **BG04 — Nâng cao hiệu quả vận hành** | BR05, BR15, BR16, BR17, BR18 |
| **BG05 — Cải thiện khả năng giao tiếp và thông báo** | BR11 |
| **BG06 — Nâng cao khả năng quản trị và ra quyết định** | BR19 |
| **BG07 — Đảm bảo khả năng mở rộng của hệ thống** | BR23, BR24 |
| **BG08 — Đảm bảo tính bảo mật và khả năng kiểm soát hệ thống** | BR18, BR20, BR21, BR22 |
| **BG09 — Nâng cao trải nghiệm khách hàng sau chuyến đi** | BR13, BR14 |
| **BG10 — Tăng khả năng phát triển dịch vụ trong tương lai** | BR25 |

## bước 6

# 7. Functional Requirements

Functional Requirement (FR) mô tả các chức năng mà hệ thống CAB phải cung cấp
để đáp ứng các Business Requirement (BR) đã xác định.

Các FR được phân rã từ BR và chỉ bao gồm những chức năng có cơ sở từ yêu cầu
của khách hàng. Những quy tắc chưa được khách hàng chốt sẽ được đánh dấu là
Open Question thay vì tự giả định.

---

## 7.1. BR01 — Quản lý tài khoản khách hàng

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR01** | Đăng ký tài khoản khách hàng | Hệ thống cho phép khách hàng đăng ký tài khoản mới. |
| **FR02** | Nhập thông tin đăng ký | Hệ thống cho phép khách hàng nhập các thông tin cần thiết khi đăng ký. |
| **FR03** | Đăng nhập | Hệ thống cho phép khách hàng đăng nhập vào tài khoản. |
| **FR04** | Xác thực khách hàng | Hệ thống phải xác thực khách hàng trước khi cho phép sử dụng các chức năng yêu cầu tài khoản. |
| **FR05** | Xem thông tin cá nhân | Hệ thống cho phép khách hàng xem thông tin cá nhân của mình. |
| **FR06** | Cập nhật thông tin cá nhân | Hệ thống cho phép khách hàng cập nhật thông tin cá nhân. |

---

## 7.2. BR02 — Quản lý tài khoản và hồ sơ tài xế

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR07** | Đăng ký tài khoản tài xế | Hệ thống cho phép tài xế đăng ký tài khoản. |
| **FR08** | Tạo tài khoản tài xế | Hệ thống cho phép nhân viên vận hành tạo tài khoản cho tài xế. |
| **FR09** | Quản lý hồ sơ tài xế | Hệ thống cho phép tài xế cập nhật thông tin hồ sơ. |
| **FR10** | Quản lý thông tin phương tiện | Hệ thống cho phép lưu trữ và cập nhật thông tin phương tiện của tài xế. |
| **FR11** | Đăng nhập tài xế | Hệ thống cho phép tài xế đăng nhập vào hệ thống. |
| **FR12** | Xác thực tài xế | Hệ thống phải xác thực tài xế trước khi sử dụng các chức năng yêu cầu tài khoản. |
| **FR13** | Cập nhật trạng thái hoạt động | Hệ thống cho phép tài xế cập nhật trạng thái hoạt động. |
| **FR14** | Chuyển sang trạng thái sẵn sàng | Hệ thống cho phép tài xế chuyển sang trạng thái sẵn sàng nhận chuyến khi đang làm việc. |

---

## 7.3. BR03 — Đặt chuyến xe

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR15** | Tạo yêu cầu đặt chuyến | Hệ thống cho phép khách hàng tạo yêu cầu đặt xe. |
| **FR16** | Nhập điểm đón | Hệ thống cho phép khách hàng nhập điểm đón của chuyến đi. |
| **FR17** | Nhập điểm đến | Hệ thống cho phép khách hàng nhập điểm đến của chuyến đi. |
| **FR18** | Lựa chọn loại xe | Hệ thống cho phép khách hàng lựa chọn loại xe khi tạo yêu cầu. |
| **FR19** | Gửi yêu cầu đặt xe | Hệ thống tiếp nhận và lưu yêu cầu đặt xe sau khi khách hàng gửi yêu cầu. |
| **FR20** | Hiển thị trạng thái tìm tài xế | Hệ thống thông báo cho khách hàng biết yêu cầu đang được xử lý và tìm tài xế. |

---

## 7.4. BR04 — Tìm và phân công tài xế

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR21** | Xác định vị trí tài xế | Hệ thống lưu thông tin vị trí của tài xế để phục vụ việc tìm tài xế. |
| **FR22** | Xác định tài xế sẵn sàng | Hệ thống xác định các tài xế đang ở trạng thái sẵn sàng nhận chuyến. |
| **FR23** | Xác định tài xế phù hợp | Hệ thống xác định các tài xế phù hợp với yêu cầu chuyến đi dựa trên vị trí, trạng thái sẵn sàng và các tiêu chí vận hành đã được xác định. |
| **FR24** | Ưu tiên tài xế phù hợp và gần khách hàng | Hệ thống ưu tiên các tài xế phù hợp và gần khách hàng khi thực hiện phân công. |
| **FR25** | Gửi yêu cầu đến tài xế | Hệ thống gửi thông tin yêu cầu chuyến đến tài xế được lựa chọn. |
| **FR26** | Xử lý tài xế từ chối | Khi tài xế từ chối chuyến, hệ thống tiếp tục tìm tài xế khác mà không yêu cầu khách hàng tạo lại yêu cầu. |
| **FR27** | Xử lý tài xế không phản hồi | Khi tài xế được đề xuất không phản hồi, hệ thống phải có khả năng tiếp tục tìm tài xế khác theo chính sách được xác định. |
| **FR28** | Thông báo không tìm được tài xế | Nếu không tìm được tài xế phù hợp, hệ thống phải thông báo rõ ràng cho khách hàng. |

> **Open Question:** Bán kính tìm tài xế, thời gian chờ phản hồi và thứ tự
> ưu tiên cụ thể giữa các tài xế chưa được khách hàng chốt.
>
> Không tự quy định các giá trị như `1 km`, `2 km`, `5 phút` hoặc ưu tiên
> tài xế có đánh giá cao nếu chưa có Business Rule tương ứng.

---

## 7.5. BR05 — Chấp nhận và xác nhận chuyến

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR29** | Thông báo chuyến mới cho tài xế | Hệ thống gửi thông báo cho tài xế khi có yêu cầu chuyến phù hợp. |
| **FR30** | Xem thông tin yêu cầu chuyến | Tài xế có thể xem thông tin cần thiết của yêu cầu chuyến. |
| **FR31** | Chấp nhận chuyến | Tài xế có thể chấp nhận yêu cầu chuyến. |
| **FR32** | Từ chối chuyến | Tài xế có thể từ chối yêu cầu chuyến. |
| **FR33** | Xác nhận tài xế | Khi tài xế chấp nhận, hệ thống xác nhận tài xế được phân công cho chuyến. |
| **FR34** | Thông báo tài xế cho khách hàng | Hệ thống thông báo cho khách hàng biết tài xế đã nhận chuyến. |

---

## 7.6. BR06 — Theo dõi và thực hiện chuyến

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR35** | Theo dõi tài xế đang thực hiện chuyến | Hệ thống cho phép khách hàng theo dõi thông tin liên quan đến tài xế trong quá trình thực hiện chuyến. |
| **FR36** | Hiển thị thời gian dự kiến tài xế đến | Hệ thống cung cấp thời gian dự kiến tài xế đến điểm đón. |
| **FR37** | Cập nhật trạng thái chuyến | Hệ thống cập nhật trạng thái hiện tại của chuyến đi. |
| **FR38** | Cập nhật tài xế đã đến điểm đón | Hệ thống ghi nhận trạng thái tài xế đã đến điểm đón. |
| **FR39** | Thông báo tài xế đã đến | Hệ thống thông báo cho khách hàng khi tài xế đến điểm đón. |
| **FR40** | Ghi nhận chuyến hoàn thành | Hệ thống ghi nhận trạng thái hoàn thành khi chuyến đi kết thúc. |
| **FR41** | Thông báo chuyến hoàn thành | Hệ thống thông báo cho khách hàng khi chuyến đi hoàn thành. |

---

## 7.7. BR07 — Tính cước chuyến đi

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR42** | Xác định thông tin tính cước | Hệ thống sử dụng loại dịch vụ và thông tin chuyến đi để phục vụ việc tính cước. |
| **FR43** | Tính số tiền phải trả | Hệ thống xác định số tiền khách hàng phải trả sau khi chuyến đi hoàn thành. |
| **FR44** | Lưu kết quả tính cước | Hệ thống lưu số tiền phải trả của chuyến đi. |
| **FR45** | Hiển thị số tiền phải trả | Hệ thống cho phép khách hàng xem số tiền phải trả. |

> **Open Question:** Công thức tính cước và các quy tắc tính giá chưa được
> khách hàng chốt. Vì vậy chưa phân rã thành các FR như "tính theo km",
> "tính theo thời gian", "phụ phí", v.v.

---

## 7.8. BR08 — Thanh toán

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR46** | Chọn phương thức thanh toán | Hệ thống cho phép khách hàng lựa chọn phương thức thanh toán. |
| **FR47** | Thanh toán tiền mặt | Hệ thống hỗ trợ ghi nhận thanh toán bằng tiền mặt. |
| **FR48** | Thanh toán điện tử | Hệ thống hỗ trợ thanh toán điện tử thông qua nhà cung cấp thanh toán bên ngoài. |
| **FR49** | Tích hợp nhà cung cấp thanh toán | Hệ thống tích hợp với nhà cung cấp thanh toán bên ngoài để xử lý giao dịch điện tử. |
| **FR50** | Không lưu thông tin thanh toán nhạy cảm | Hệ thống CAB không lưu trực tiếp thông tin nhạy cảm của thẻ hoặc tài khoản thanh toán. |
| **FR51** | Ghi nhận kết quả thanh toán | Hệ thống ghi nhận trạng thái kết quả của giao dịch thanh toán. |
| **FR52** | Thông báo thanh toán thất bại | Khi thanh toán điện tử thất bại, hệ thống thông báo cho khách hàng. |
| **FR53** | Xử lý lại thanh toán | Hệ thống cho phép xử lý lại giao dịch thanh toán thất bại theo chính sách của doanh nghiệp. |
| **FR54** | Thông báo thanh toán thành công | Hệ thống thông báo cho khách hàng khi thanh toán có kết quả thành công. |

---

## 7.9. BR09 — Thông báo

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR55** | Thông báo tiếp nhận yêu cầu | Hệ thống thông báo cho khách hàng khi yêu cầu đặt xe được tiếp nhận. |
| **FR56** | Thông báo tài xế nhận chuyến | Hệ thống thông báo cho khách hàng khi có tài xế nhận chuyến. |
| **FR57** | Thông báo tài xế đến điểm đón | Hệ thống thông báo cho khách hàng khi tài xế đến điểm đón. |
| **FR58** | Thông báo hoàn thành chuyến | Hệ thống thông báo cho khách hàng khi chuyến hoàn thành. |
| **FR59** | Thông báo kết quả thanh toán | Hệ thống thông báo cho khách hàng khi thanh toán có kết quả. |
| **FR60** | Thông báo chuyến mới cho tài xế | Hệ thống thông báo cho tài xế khi có chuyến mới phù hợp. |
| **FR61** | Thông báo thay đổi chuyến | Hệ thống thông báo cho tài xế khi có thay đổi liên quan đến chuyến đang thực hiện. |

---

## 7.10. BR10 — Lịch sử chuyến đi và đánh giá

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR62** | Xem lịch sử chuyến đi | Hệ thống cho phép khách hàng xem lịch sử các chuyến đã thực hiện. |
| **FR63** | Xem thông tin chuyến | Hệ thống cho phép khách hàng xem thông tin của từng chuyến trong lịch sử. |
| **FR64** | Xem số tiền phải trả | Hệ thống cho phép khách hàng xem số tiền phải trả của chuyến. |
| **FR65** | Đánh giá tài xế | Hệ thống cho phép khách hàng đánh giá tài xế sau khi chuyến hoàn thành. |
| **FR66** | Lưu đánh giá | Hệ thống lưu thông tin đánh giá của khách hàng. |

---

## 7.11. BR11 — Quản lý khách hàng

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR67** | Xem danh sách khách hàng | Hệ thống quản trị cho phép nhân viên vận hành xem thông tin khách hàng. |
| **FR68** | Tìm kiếm khách hàng | Hệ thống cho phép nhân viên vận hành tra cứu khách hàng. |
| **FR69** | Xem thông tin khách hàng | Hệ thống cho phép nhân viên vận hành xem thông tin khách hàng theo quyền được cấp. |

---

## 7.12. BR12 — Quản lý tài xế và phương tiện

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR70** | Xem danh sách tài xế | Hệ thống quản trị cho phép nhân viên vận hành xem danh sách tài xế. |
| **FR71** | Tra cứu tài xế | Hệ thống cho phép nhân viên vận hành tìm kiếm và tra cứu thông tin tài xế. |
| **FR72** | Xem hồ sơ tài xế | Hệ thống cho phép nhân viên vận hành xem hồ sơ tài xế theo quyền. |
| **FR73** | Quản lý phương tiện | Hệ thống cho phép nhân viên vận hành quản lý thông tin phương tiện. |
| **FR74** | Kiểm tra trạng thái tài xế | Hệ thống cho phép nhân viên vận hành kiểm tra trạng thái hoạt động của tài xế. |

---

## 7.13. BR13 — Quản lý chuyến đi

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR75** | Xem chuyến đang diễn ra | Hệ thống quản trị cho phép nhân viên vận hành xem các chuyến đang diễn ra. |
| **FR76** | Xem trạng thái chuyến | Hệ thống cho phép nhân viên vận hành kiểm tra trạng thái của chuyến. |
| **FR77** | Xem thông tin chuyến | Hệ thống cho phép nhân viên vận hành xem thông tin liên quan đến chuyến. |
| **FR78** | Hỗ trợ xử lý chuyến bị lỗi | Hệ thống cung cấp chức năng để nhân viên vận hành hỗ trợ xử lý các trường hợp chuyến bị lỗi. |

---

## 7.14. BR14 — Quản lý giao dịch

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR79** | Tra cứu lịch sử giao dịch | Hệ thống cho phép nhân viên vận hành tra cứu lịch sử giao dịch. |
| **FR80** | Xem trạng thái giao dịch | Hệ thống cho phép nhân viên vận hành xem trạng thái của giao dịch. |
| **FR81** | Tra cứu giao dịch liên quan đến chuyến | Hệ thống cho phép đối chiếu thông tin giao dịch với chuyến đi liên quan. |

---

## 7.15. BR15 — Phân quyền quản trị

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR82** | Xác thực nhân viên | Hệ thống yêu cầu nhân viên xác thực trước khi truy cập chức năng quản trị. |
| **FR83** | Kiểm tra quyền truy cập | Hệ thống kiểm tra quyền của nhân viên trước khi cho phép thực hiện thao tác. |
| **FR84** | Hạn chế thao tác nhạy cảm | Hệ thống không cho phép nhân viên thông thường thực hiện các thao tác nhạy cảm nếu không có quyền. |
| **FR85** | Quản lý quyền truy cập | Hệ thống hỗ trợ kiểm soát quyền truy cập đối với các chức năng quản trị. |

---

## 7.16. BR16 — Báo cáo hoạt động và kinh doanh

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR86** | Báo cáo số lượng chuyến | Hệ thống cung cấp báo cáo về số lượng chuyến. |
| **FR87** | Báo cáo doanh thu | Hệ thống cung cấp báo cáo về doanh thu. |
| **FR88** | Báo cáo tỷ lệ hoàn thành | Hệ thống cung cấp báo cáo về tỷ lệ chuyến hoàn thành. |
| **FR89** | Báo cáo tỷ lệ hủy | Hệ thống cung cấp báo cáo về tỷ lệ chuyến bị hủy. |
| **FR90** | Báo cáo hiệu quả tài xế | Hệ thống cung cấp dữ liệu/báo cáo phục vụ đánh giá hiệu quả hoạt động của tài xế. |

---

## 7.17. BR17 — Lưu vết hoạt động

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR91** | Ghi nhận thao tác quan trọng | Hệ thống phải ghi nhận các thao tác quan trọng được thực hiện trên hệ thống. |
| **FR92** | Lưu thông tin người thực hiện | Hệ thống lưu thông tin người thực hiện thao tác. |
| **FR93** | Lưu thời điểm thao tác | Hệ thống lưu thời điểm thực hiện thao tác. |
| **FR94** | Tra cứu log | Hệ thống cung cấp khả năng tra cứu các log phục vụ kiểm tra và xử lý sự cố. |

---

## 7.18. BR18 — Bảo vệ dữ liệu

| Mã FR | Tên Functional Requirement | Diễn giải |
|---|---|---|
| **FR95** | Bảo vệ thông tin cá nhân | Hệ thống phải bảo vệ thông tin cá nhân của người dùng. |
| **FR96** | Bảo vệ thông tin phương tiện | Hệ thống phải bảo vệ thông tin phương tiện. |
| **FR97** | Bảo vệ dữ liệu vị trí | Hệ thống phải bảo vệ dữ liệu vị trí của tài xế. |
| **FR98** | Bảo vệ dữ liệu giao dịch | Hệ thống phải bảo vệ dữ liệu giao dịch. |

---

# 7.19. Functional Requirements chưa thể xác định chi tiết

Một số yêu cầu trong tài liệu khách hàng **chưa đủ thông tin để phân rã thành
FR chi tiết**. Không nên tự thêm quy tắc nghiệp vụ vào FR.

| ID | Nội dung chưa xác định | Liên quan |
|---|---|---|
| **FRQ01** | Bán kính tìm tài xế cụ thể | BR04 |
| **FRQ02** | Công thức và quy tắc tính cước | BR07 |
| **FRQ03** | Tiêu chí ưu tiên tài xế cụ thể | BR04 |
| **FRQ04** | Thời gian tài xế phải phản hồi | BR04 |
| **FRQ05** | Chính sách hủy chuyến | BR03, BR06 |
| **FRQ06** | Cách xử lý khi mất kết nối mạng | BR03, BR06, BR08 |
| **FRQ07** | Thời gian lưu trữ dữ liệu | BR10, BR14, BR17 |
| **FRQ08** | Chính sách xử lý lại thanh toán thất bại | BR08 |

---

# 7.20. Traceability — BR → FR

| Business Requirement | Functional Requirements |
|---|---|
| **BR01 — Quản lý tài khoản khách hàng** | FR01–FR06 |
| **BR02 — Quản lý tài khoản và hồ sơ tài xế** | FR07–FR14 |
| **BR03 — Đặt chuyến xe** | FR15–FR20 |
| **BR04 — Tìm và phân công tài xế** | FR21–FR28 |
| **BR05 — Chấp nhận và xác nhận chuyến** | FR29–FR34 |
| **BR06 — Theo dõi và thực hiện chuyến** | FR35–FR41 |
| **BR07 — Tính cước chuyến đi** | FR42–FR45 |
| **BR08 — Thanh toán** | FR46–FR54 |
| **BR09 — Thông báo** | FR55–FR61 |
| **BR10 — Lịch sử chuyến đi và đánh giá** | FR62–FR66 |
| **BR11 — Quản lý khách hàng** | FR67–FR69 |
| **BR12 — Quản lý tài xế và phương tiện** | FR70–FR74 |
| **BR13 — Quản lý chuyến đi** | FR75–FR78 |
| **BR14 — Quản lý giao dịch** | FR79–FR81 |
| **BR15 — Phân quyền quản trị** | FR82–FR85 |
| **BR16 — Báo cáo hoạt động và kinh doanh** | FR86–FR90 |
| **BR17 — Lưu vết hoạt động** | FR91–FR94 |
| **BR18 — Bảo vệ dữ liệu** | FR95–FR98 |

---

# 7.21. Nguyên tắc phân rã FR

Khi xây dựng Functional Requirement, áp dụng các nguyên tắc:

1. **Mỗi FR mô tả một chức năng cụ thể mà hệ thống phải thực hiện.**
2. **FR phải truy ngược được về một BR.**
3. Không đưa chi tiết kỹ thuật triển khai vào FR nếu khách hàng chưa yêu cầu.
4. Không tự tạo Business Rule từ giả định của BA.
5. Các thông tin chưa được khách hàng xác nhận phải được đánh dấu
   **Open Question**.
6. Một BR có thể được phân rã thành nhiều FR.
7. Một FR không nên chứa nhiều chức năng độc lập nếu có thể tách thành các FR
   riêng biệt.
8. FR phải đủ cụ thể để ở bước tiếp theo có thể xây dựng Use Case,
   Acceptance Criteria và Test Case.

## 8. Business Rules

Business Rules là các quy tắc và ràng buộc nghiệp vụ mà hệ thống CAB phải
tuân thủ trong quá trình xử lý các nghiệp vụ.

Các Business Rules được xây dựng dựa trên Business Requirements và Business
Processes đã xác định ở các bước trước.

---

### 8.1. Danh sách Business Rules

| Mã Rule | Business Rule | Diễn giải |
|---|---|---|
| **BRULE01** | **Yêu cầu đặt xe phải có thông tin chuyến** | Một yêu cầu đặt xe phải có điểm đón, điểm đến và loại xe/dịch vụ trước khi được gửi đến hệ thống. |
| **BRULE02** | **Khách hàng phải được xác thực** | Khách hàng phải đăng nhập/xác thực trước khi sử dụng các chức năng yêu cầu tài khoản. |
| **BRULE03** | **Chỉ tài xế sẵn sàng mới được tìm để phân công** | Hệ thống chỉ xem xét các tài xế đang ở trạng thái sẵn sàng nhận chuyến khi tìm tài xế. |
| **BRULE04** | **Ưu tiên tài xế phù hợp và gần khách hàng** | Khi tìm tài xế, hệ thống phải ưu tiên tài xế phù hợp và gần khách hàng dựa trên các tiêu chí vận hành. |
| **BRULE05** | **Tài xế phải phản hồi yêu cầu chuyến** | Tài xế được đề xuất phải có khả năng chấp nhận hoặc từ chối chuyến. |
| **BRULE06** | **Tài xế từ chối hoặc không phản hồi** | Nếu tài xế từ chối hoặc không phản hồi, hệ thống phải tiếp tục tìm tài xế khác mà không yêu cầu khách hàng tạo lại yêu cầu. |
| **BRULE07** | **Không tìm được tài xế** | Nếu không còn tài xế phù hợp, hệ thống phải thông báo rõ ràng cho khách hàng. |
| **BRULE08** | **Chỉ tài xế phù hợp mới được nhận chuyến** | Chuyến đi chỉ được phân công cho tài xế đáp ứng các điều kiện lựa chọn của hệ thống. |
| **BRULE09** | **Tài xế phải cập nhật trạng thái chuyến** | Trong quá trình thực hiện chuyến, tài xế phải cập nhật các trạng thái theo quy trình nghiệp vụ. |
| **BRULE10** | **Trạng thái chuyến phải theo đúng vòng đời** | Chuyến đi phải được xử lý theo các trạng thái nghiệp vụ từ nhận chuyến, đến điểm đón, đón khách, di chuyển và hoàn thành. |
| **BRULE11** | **Chỉ chuyến hoàn thành mới được tính cước cuối cùng** | Hệ thống xác định số tiền khách hàng phải trả sau khi chuyến đi hoàn thành. |
| **BRULE12** | **Cước phải dựa trên thông tin chuyến** | Số tiền phải trả được xác định dựa trên loại dịch vụ và thông tin chuyến đi. |
| **BRULE13** | **Hỗ trợ hai nhóm phương thức thanh toán** | Khách hàng có thể thanh toán bằng tiền mặt hoặc phương thức thanh toán điện tử. |
| **BRULE14** | **Không lưu dữ liệu thanh toán nhạy cảm** | Hệ thống CAB không được lưu trực tiếp thông tin nhạy cảm của thẻ hoặc tài khoản thanh toán. |
| **BRULE15** | **Thanh toán điện tử phải thông qua nhà cung cấp bên ngoài** | Giao dịch thanh toán điện tử phải được xử lý thông qua nhà cung cấp thanh toán bên ngoài. |
| **BRULE16** | **Thanh toán thất bại phải được thông báo** | Khi thanh toán điện tử thất bại, hệ thống phải thông báo cho khách hàng. |
| **BRULE17** | **Thanh toán thất bại được xử lý lại theo chính sách** | Khi giao dịch thất bại, việc xử lý lại phải tuân theo chính sách của doanh nghiệp. |
| **BRULE18** | **Thông báo theo sự kiện nghiệp vụ** | Hệ thống phải gửi thông báo khi xảy ra các sự kiện quan trọng như nhận yêu cầu, tài xế nhận chuyến, tài xế đến điểm đón, hoàn thành chuyến và có kết quả thanh toán. |
| **BRULE19** | **Tài xế nhận thông báo về chuyến mới** | Tài xế phải nhận được thông báo khi có chuyến mới phù hợp. |
| **BRULE20** | **Chức năng quản trị phải được phân quyền** | Nhân viên chỉ được thực hiện các thao tác quản trị phù hợp với quyền được cấp. |
| **BRULE21** | **Dữ liệu quan trọng phải được bảo vệ** | Thông tin cá nhân, phương tiện, vị trí và giao dịch phải được bảo vệ. |
| **BRULE22** | **Thao tác quan trọng phải được lưu vết** | Các thao tác quan trọng trong hệ thống phải được ghi nhận để phục vụ kiểm tra và xử lý sự cố. |
| **BRULE23** | **Lỗi thanh toán/thông báo không được làm dừng toàn hệ thống** | Một lỗi xảy ra tại chức năng thanh toán hoặc thông báo không được làm cho toàn bộ hệ thống đặt xe ngừng hoạt động. |
| **BRULE24** | **Chức năng mới không được gây ảnh hưởng lớn đến chức năng đang hoạt động** | Các chức năng mới phải có khả năng được triển khai từng phần và hạn chế ảnh hưởng đến các chức năng hiện tại. |

---

### 8.2. Business Rules theo nghiệp vụ

#### 8.2.1. Booking Rules

| Rule | Quy định |
|---|---|
| **BRULE01** | Yêu cầu phải có điểm đón, điểm đến và loại xe/dịch vụ. |
| **BRULE02** | Khách hàng phải được xác thực khi sử dụng chức năng yêu cầu tài khoản. |

#### 8.2.2. Driver Matching Rules

| Rule | Quy định |
|---|---|
| **BRULE03** | Chỉ tài xế đang sẵn sàng nhận chuyến mới được xem xét. |
| **BRULE04** | Hệ thống ưu tiên tài xế phù hợp và gần khách hàng. |
| **BRULE05** | Tài xế có thể chấp nhận hoặc từ chối chuyến. |
| **BRULE06** | Tài xế từ chối hoặc không phản hồi thì hệ thống tiếp tục tìm tài xế khác. |
| **BRULE07** | Không tìm được tài xế thì phải thông báo cho khách hàng. |

#### 8.2.3. Trip Rules

| Rule | Quy định |
|---|---|
| **BRULE08** | Chuyến chỉ được phân công cho tài xế đáp ứng điều kiện phù hợp. |
| **BRULE09** | Tài xế phải cập nhật trạng thái trong quá trình thực hiện chuyến. |
| **BRULE10** | Chuyến phải tuân theo vòng đời trạng thái được định nghĩa. |

#### 8.2.4. Fare & Payment Rules

| Rule | Quy định |
|---|---|
| **BRULE11** | Chỉ sau khi chuyến hoàn thành mới xác định số tiền phải trả cuối cùng. |
| **BRULE12** | Cước dựa trên loại dịch vụ và thông tin chuyến. |
| **BRULE13** | Hỗ trợ tiền mặt và thanh toán điện tử. |
| **BRULE14** | Không lưu trực tiếp dữ liệu thanh toán nhạy cảm trong CAB. |
| **BRULE15** | Thanh toán điện tử được xử lý thông qua nhà cung cấp bên ngoài. |
| **BRULE16** | Thanh toán thất bại phải được thông báo cho khách hàng. |
| **BRULE17** | Xử lý lại thanh toán thất bại theo chính sách doanh nghiệp. |

#### 8.2.5. Notification Rules

| Rule | Quy định |
|---|---|
| **BRULE18** | Khách hàng phải nhận thông báo tại các sự kiện quan trọng. |
| **BRULE19** | Tài xế phải nhận thông báo về chuyến mới và các thay đổi liên quan đến chuyến đang thực hiện. |

#### 8.2.6. Administration & Security Rules

| Rule | Quy định |
|---|---|
| **BRULE20** | Chức năng quản trị phải được kiểm soát bằng quyền truy cập. |
| **BRULE21** | Dữ liệu cá nhân, phương tiện, vị trí và giao dịch phải được bảo vệ. |
| **BRULE22** | Các thao tác quan trọng phải được lưu vết. |

#### 8.2.7. System Availability & Scalability Rules

| Rule | Quy định |
|---|---|
| **BRULE23** | Lỗi tại một thành phần như thanh toán hoặc thông báo không được làm toàn hệ thống ngừng hoạt động. |
| **BRULE24** | Chức năng mới phải có khả năng triển khai từng phần và hạn chế ảnh hưởng đến chức năng đang hoạt động. |

---

## 8.3. Exceptions

Exception mô tả các trường hợp nghiệp vụ không diễn ra theo luồng bình
thường và cách hệ thống cần phản ứng.

| Mã Exception | Trường hợp | Cách xử lý |
|---|---|---|
| **EX01** | Không tìm thấy tài xế phù hợp | Hệ thống thông báo rõ ràng cho khách hàng. |
| **EX02** | Tài xế từ chối chuyến | Hệ thống tiếp tục tìm tài xế khác. |
| **EX03** | Tài xế không phản hồi | Hệ thống tiếp tục tìm tài xế khác. |
| **EX04** | Thanh toán điện tử thất bại | Thông báo cho khách hàng và cho phép xử lý lại theo chính sách doanh nghiệp. |
| **EX05** | Thành phần thông báo gặp lỗi | Lỗi thông báo không được làm toàn bộ hệ thống đặt xe ngừng hoạt động. |
| **EX06** | Thành phần thanh toán gặp lỗi | Hệ thống đặt xe vẫn phải duy trì hoạt động ở mức phù hợp, đồng thời xử lý trạng thái thanh toán theo chính sách. |
| **EX07** | Người dùng không có quyền thực hiện thao tác quản trị | Hệ thống từ chối thao tác. |
| **EX08** | Phát sinh lỗi trong chuyến đi | Nhân viên vận hành có thể kiểm tra và xử lý trường hợp chuyến bị lỗi. |

---

## 8.4. Business Rules chưa được xác định

Các quy tắc dưới đây **không được tự xác định ở giai đoạn hiện tại** vì tài
liệu khách hàng chưa cung cấp đủ thông tin.

| ID | Business Rule chưa xác định | Trạng thái |
|---|---|---|
| **TBR01** | Thời gian tài xế phải phản hồi trước khi chuyển sang tài xế khác | TBD |
| **TBR02** | Công thức tính cước cụ thể | TBD |
| **TBR03** | Thứ tự và trọng số của các tiêu chí ưu tiên tài xế | TBD |
| **TBR04** | Chính sách hủy chuyến | TBD |
| **TBR05** | Cách xử lý khi mất kết nối mạng | TBD |
| **TBR06** | Thời gian lưu trữ dữ liệu | TBD |
| **TBR07** | Số lần cho phép thử lại thanh toán thất bại | TBD |
| **TBR08** | Quy trình xử lý và đối soát thanh toán tiền mặt | TBD |

## 9. Data Modeling

Data Modeling được thực hiện nhằm xác định các thực thể (Entity), thuộc tính
(Attribute) và mối quan hệ (Relationship) giữa các thực thể dựa trên các
Business Requirements và Business Processes đã xác định.

Mục tiêu của bước này là tạo cơ sở để xây dựng mô hình **Entity Relationship
Diagram (ERD)** cho hệ thống CAB.

---

### 9.1. Xác định các Entity

Dựa trên yêu cầu nghiệp vụ, hệ thống CAB có các Entity chính sau:

| Mã Entity | Entity | Diễn giải |
|---|---|---|
| **E01** | **Customer** | Lưu thông tin khách hàng sử dụng dịch vụ đặt xe. |
| **E02** | **Driver** | Lưu thông tin tài xế cung cấp dịch vụ. |
| **E03** | **Vehicle** | Lưu thông tin phương tiện được tài xế sử dụng. |
| **E04** | **Booking** | Lưu yêu cầu đặt xe do khách hàng tạo. |
| **E05** | **Trip** | Lưu thông tin chuyến đi thực tế sau khi booking được phân công cho tài xế. |
| **E06** | **Location** | Lưu thông tin vị trí phục vụ việc xác định điểm đón, điểm đến và vị trí tài xế. |
| **E07** | **Fare** | Lưu thông tin cước của chuyến đi. |
| **E08** | **Payment** | Lưu thông tin và trạng thái thanh toán của chuyến đi. |
| **E09** | **Notification** | Lưu thông tin các thông báo được gửi đến khách hàng hoặc tài xế. |
| **E10** | **Review** | Lưu đánh giá của khách hàng đối với tài xế sau chuyến đi. |
| **E11** | **Transaction** | Lưu thông tin giao dịch phục vụ tra cứu và quản lý vận hành. |
| **E12** | **Admin/Operator** | Lưu thông tin nhân viên vận hành sử dụng hệ thống quản trị. |

---

### 9.2. Xác định Attributes

#### E01 — Customer

| Attribute | Ý nghĩa |
|---|---|
| `customer_id` | Mã khách hàng |
| `full_name` | Họ tên khách hàng |
| `phone` | Số điện thoại |
| `email` | Email |
| `password` | Thông tin xác thực |
| `status` | Trạng thái tài khoản |
| `created_at` | Thời điểm tạo tài khoản |

> Tài liệu yêu cầu khách hàng có thể đăng ký, đăng nhập và cập nhật thông tin
> cá nhân. :contentReference[oaicite:2]{index=2}

---

#### E02 — Driver

| Attribute | Ý nghĩa |
|---|---|
| `driver_id` | Mã tài xế |
| `full_name` | Họ tên tài xế |
| `phone` | Số điện thoại |
| `email` | Email |
| `password` | Thông tin xác thực |
| `status` | Trạng thái tài xế |
| `availability_status` | Trạng thái sẵn sàng nhận chuyến |
| `created_at` | Thời điểm tạo tài khoản |

Tài xế có thể được đăng ký hoặc được nhân viên vận hành tạo tài khoản, cập
nhật hồ sơ và trạng thái hoạt động. :contentReference[oaicite:3]{index=3}

---

#### E03 — Vehicle

| Attribute | Ý nghĩa |
|---|---|
| `vehicle_id` | Mã phương tiện |
| `driver_id` | Mã tài xế sở hữu/sử dụng phương tiện |
| `vehicle_type` | Loại xe |
| `license_plate` | Biển số xe |
| `status` | Trạng thái phương tiện |

Tài liệu yêu cầu quản lý thông tin phương tiện của tài xế. :contentReference[oaicite:4]{index=4}

---

#### E04 — Booking

| Attribute | Ý nghĩa |
|---|---|
| `booking_id` | Mã yêu cầu đặt xe |
| `customer_id` | Khách hàng tạo yêu cầu |
| `pickup_location_id` | Điểm đón |
| `destination_location_id` | Điểm đến |
| `vehicle_type` | Loại xe/dịch vụ khách hàng lựa chọn |
| `status` | Trạng thái yêu cầu |
| `created_at` | Thời điểm tạo yêu cầu |

Booking đại diện cho yêu cầu đặt xe được khách hàng tạo trước khi hệ thống
tìm và phân công tài xế. Khách hàng cần nhập điểm đón, điểm đến và lựa chọn
loại xe. :contentReference[oaicite:5]{index=5}

---

#### E05 — Trip

| Attribute | Ý nghĩa |
|---|---|
| `trip_id` | Mã chuyến đi |
| `booking_id` | Booking tương ứng |
| `customer_id` | Khách hàng |
| `driver_id` | Tài xế được phân công |
| `vehicle_id` | Phương tiện thực hiện chuyến |
| `status` | Trạng thái chuyến |
| `start_time` | Thời điểm bắt đầu |
| `end_time` | Thời điểm kết thúc |
| `estimated_arrival_time` | Thời gian dự kiến tài xế đến |

Trip đại diện cho chuyến đi thực tế sau khi yêu cầu đặt xe được xử lý và tài
xế được phân công.

Các trạng thái chuyến được tài liệu đề cập gồm:

- Đã nhận chuyến
- Đã đến điểm đón
- Đã đón khách
- Đang di chuyển
- Hoàn thành chuyến

:contentReference[oaicite:6]{index=6}

---

#### E06 — Location

| Attribute | Ý nghĩa |
|---|---|
| `location_id` | Mã vị trí |
| `latitude` | Vĩ độ |
| `longitude` | Kinh độ |
| `address` | Địa chỉ |
| `location_type` | Loại vị trí |

`Location` được sử dụng cho:

- Điểm đón.
- Điểm đến.
- Vị trí hiện tại của tài xế.

Doanh nghiệp muốn lưu vị trí tài xế để hỗ trợ tìm tài xế gần khách hàng và
cải thiện khả năng dự kiến thời gian đến. :contentReference[oaicite:7]{index=7}

---

#### E07 — Fare

| Attribute | Ý nghĩa |
|---|---|
| `fare_id` | Mã cước |
| `trip_id` | Mã chuyến |
| `service_type` | Loại dịch vụ |
| `amount` | Số tiền phải trả |
| `created_at` | Thời điểm xác định cước |

Hệ thống cần xác định số tiền khách hàng phải trả sau khi chuyến hoàn thành,
dựa trên loại dịch vụ và thông tin chuyến đi. :contentReference[oaicite:8]{index=8}

> **TBD:** Công thức tính cước cụ thể chưa được khách hàng chốt.

---

#### E08 — Payment

| Attribute | Ý nghĩa |
|---|---|
| `payment_id` | Mã thanh toán |
| `trip_id` | Mã chuyến |
| `payment_method` | Phương thức thanh toán |
| `amount` | Số tiền thanh toán |
| `status` | Trạng thái thanh toán |
| `paid_at` | Thời điểm thanh toán |

Các phương thức hiện tại:

- `CASH`
- `ELECTRONIC`

Hệ thống phải tích hợp với nhà cung cấp thanh toán bên ngoài và không lưu
trực tiếp thông tin nhạy cảm của thẻ hoặc tài khoản thanh toán. :contentReference[oaicite:9]{index=9}

---

#### E09 — Notification

| Attribute | Ý nghĩa |
|---|---|
| `notification_id` | Mã thông báo |
| `recipient_type` | Loại người nhận |
| `recipient_id` | Người nhận |
| `notification_type` | Loại thông báo |
| `message` | Nội dung |
| `status` | Trạng thái gửi |
| `created_at` | Thời điểm tạo |

Các sự kiện cần thông báo gồm:

- Yêu cầu đặt xe được tiếp nhận.
- Tài xế nhận chuyến.
- Tài xế đến điểm đón.
- Chuyến hoàn thành.
- Thanh toán có kết quả.
- Tài xế có chuyến mới.
- Thay đổi liên quan đến chuyến đang thực hiện.

:contentReference[oaicite:10]{index=10}

---

#### E10 — Review

| Attribute | Ý nghĩa |
|---|---|
| `review_id` | Mã đánh giá |
| `trip_id` | Mã chuyến |
| `customer_id` | Khách hàng đánh giá |
| `driver_id` | Tài xế được đánh giá |
| `rating` | Điểm đánh giá |
| `comment` | Nội dung đánh giá |
| `created_at` | Thời điểm đánh giá |

Khách hàng có thể đánh giá tài xế sau khi hoàn thành chuyến. :contentReference[oaicite:11]{index=11}

---

#### E11 — Transaction

| Attribute | Ý nghĩa |
|---|---|
| `transaction_id` | Mã giao dịch |
| `payment_id` | Mã thanh toán |
| `transaction_type` | Loại giao dịch |
| `amount` | Giá trị giao dịch |
| `status` | Trạng thái giao dịch |
| `provider_reference` | Mã tham chiếu từ nhà cung cấp |
| `created_at` | Thời điểm giao dịch |

Entity này phục vụ việc tra cứu lịch sử giao dịch và quản lý kết quả giao dịch
thanh toán.

Tài liệu yêu cầu nhân viên vận hành có thể tra cứu lịch sử giao dịch. :contentReference[oaicite:12]{index=12}

---

#### E12 — Admin / Operator

| Attribute | Ý nghĩa |
|---|---|
| `operator_id` | Mã nhân viên |
| `full_name` | Họ tên |
| `email` | Email |
| `password` | Thông tin xác thực |
| `role` | Vai trò/quyền |
| `status` | Trạng thái tài khoản |

Nhân viên vận hành cần giao diện quản trị để quản lý khách hàng, tài xế,
phương tiện, chuyến đi và xử lý các trường hợp chuyến bị lỗi. Một số chức năng
phải được phân quyền. :contentReference[oaicite:13]{index=13}

---

## 9.3. Entity Relationships

Các mối quan hệ nghiệp vụ chính:

| Relationship | Cardinality | Diễn giải |
|---|---|---|
| Customer — Booking | 1 : N | Một khách hàng có thể tạo nhiều yêu cầu đặt xe. |
| Booking — Trip | 1 : 0..1 | Một booking có thể chưa có chuyến hoặc được tạo thành một chuyến sau khi phân công tài xế. |
| Driver — Vehicle | 1 : N | Một tài xế có thể được liên kết với phương tiện. |
| Driver — Trip | 1 : N | Một tài xế có thể thực hiện nhiều chuyến. |
| Customer — Trip | 1 : N | Một khách hàng có thể thực hiện nhiều chuyến. |
| Vehicle — Trip | 1 : N | Một phương tiện có thể được sử dụng cho nhiều chuyến. |
| Trip — Fare | 1 : 1 | Một chuyến có một thông tin cước cuối cùng. |
| Trip — Payment | 1 : 0..1 | Một chuyến có thể chưa thanh toán hoặc có một thông tin thanh toán. |
| Payment — Transaction | 1 : N | Một payment có thể có các giao dịch/attempt liên quan. |
| Customer — Review | 1 : N | Một khách hàng có thể tạo nhiều đánh giá. |
| Driver — Review | 1 : N | Một tài xế có thể nhận nhiều đánh giá. |
| Trip — Review | 1 : 0..1 | Một chuyến có thể có tối đa một đánh giá từ khách hàng. |
| Customer — Notification | 1 : N | Khách hàng có thể nhận nhiều thông báo. |
| Driver — Notification | 1 : N | Tài xế có thể nhận nhiều thông báo. |
| Location — Booking | 1 : N | Một vị trí có thể được sử dụng làm điểm đón/điểm đến của nhiều booking. |
| Driver — Location | 1 : N | Một tài xế có thể có nhiều bản ghi vị trí theo thời gian. |
| Operator — Audit Log | 1 : N | Một nhân viên vận hành có thể tạo nhiều bản ghi thao tác. |

---

## 9.4. ERD — Business Data Model

```mermaid
erDiagram

    CUSTOMER {
        int customer_id PK
        string full_name
        string phone
        string email
        string password
        string status
        datetime created_at
    }

    DRIVER {
        int driver_id PK
        string full_name
        string phone
        string email
        string password
        string status
        string availability_status
        datetime created_at
    }

    VEHICLE {
        int vehicle_id PK
        int driver_id FK
        string vehicle_type
        string license_plate
        string status
    }

    BOOKING {
        int booking_id PK
        int customer_id FK
        int pickup_location_id FK
        int destination_location_id FK
        string vehicle_type
        string status
        datetime created_at
    }

    TRIP {
        int trip_id PK
        int booking_id FK
        int customer_id FK
        int driver_id FK
        int vehicle_id FK
        string status
        datetime start_time
        datetime end_time
        datetime estimated_arrival_time
    }

    LOCATION {
        int location_id PK
        decimal latitude
        decimal longitude
        string address
        string location_type
    }

    DRIVER_LOCATION {
        int driver_location_id PK
        int driver_id FK
        decimal latitude
        decimal longitude
        datetime recorded_at
    }

    FARE {
        int fare_id PK
        int trip_id FK
        string service_type
        decimal amount
        datetime created_at
    }

    PAYMENT {
        int payment_id PK
        int trip_id FK
        string payment_method
        decimal amount
        string status
        datetime paid_at
    }

    TRANSACTION {
        int transaction_id PK
        int payment_id FK
        string transaction_type
        decimal amount
        string status
        string provider_reference
        datetime created_at
    }

    NOTIFICATION {
        int notification_id PK
        string recipient_type
        int recipient_id
        string notification_type
        string message
        string status
        datetime created_at
    }

    REVIEW {
        int review_id PK
        int trip_id FK
        int customer_id FK
        int driver_id FK
        int rating
        string comment
        datetime created_at
    }

    OPERATOR {
        int operator_id PK
        string full_name
        string email
        string password
        string role
        string status
    }

    AUDIT_LOG {
        int audit_log_id PK
        int operator_id FK
        string action
        string entity_type
        int entity_id
        datetime created_at
    }

    CUSTOMER ||--o{ BOOKING : creates
    BOOKING ||--o| TRIP : generates

    DRIVER ||--o{ VEHICLE : uses
    DRIVER ||--o{ TRIP : performs
    CUSTOMER ||--o{ TRIP : takes
    VEHICLE ||--o{ TRIP : used_for

    BOOKING }o--|| LOCATION : pickup
    BOOKING }o--|| LOCATION : destination

    DRIVER ||--o{ DRIVER_LOCATION : has

    TRIP ||--|| FARE : has
    TRIP ||--o| PAYMENT : has
    PAYMENT ||--o{ TRANSACTION : contains

    CUSTOMER ||--o{ REVIEW : writes
    DRIVER ||--o{ REVIEW : receives
    TRIP ||--o| REVIEW : receives

    OPERATOR ||--o{ AUDIT_LOG : creates
```

## còn 9.5 -> 9.6

## 10. Non-Functional Requirements

Non-Functional Requirements (NFR) mô tả các yêu cầu về chất lượng, hiệu năng,
bảo mật, khả năng mở rộng, tính ổn định và khả năng bảo trì của hệ thống CAB.

Các yêu cầu này không mô tả hệ thống phải thực hiện nghiệp vụ gì mà mô tả
hệ thống phải thực hiện các nghiệp vụ đó như thế nào.

---

### 10.1. Danh sách Non-Functional Requirements

| Mã NFR | Nhóm | Tên yêu cầu | Diễn giải |
|---|---|---|---|
| **NFR01** | Performance | **Hiệu năng** | Hệ thống phải có khả năng xử lý các yêu cầu đặt xe và các thao tác chính với thời gian phản hồi phù hợp với nhu cầu sử dụng thực tế. |
| **NFR02** | Performance | **Tìm tài xế nhanh** | Hệ thống phải hỗ trợ quá trình tìm và phân công tài xế nhanh chóng để giảm thời gian chờ của khách hàng. |
| **NFR03** | Scalability | **Khả năng mở rộng khi tải tăng** | Hệ thống phải có khả năng mở rộng các thành phần độc lập khi số lượng người dùng và yêu cầu tăng cao. |
| **NFR04** | Availability | **Hoạt động ổn định** | Hệ thống phải hoạt động ổn định trong các thời điểm nhu cầu sử dụng tăng cao. |
| **NFR05** | Fault Tolerance | **Cô lập lỗi giữa các thành phần** | Lỗi xảy ra ở chức năng thanh toán hoặc thông báo không được làm cho toàn bộ hệ thống đặt xe ngừng hoạt động. |
| **NFR06** | Security | **Bảo vệ dữ liệu người dùng** | Hệ thống phải bảo vệ thông tin cá nhân của khách hàng và tài xế. |
| **NFR07** | Security | **Bảo vệ dữ liệu thanh toán** | Hệ thống không được lưu trực tiếp thông tin nhạy cảm của thẻ hoặc tài khoản thanh toán. |
| **NFR08** | Security | **Kiểm soát quyền truy cập** | Hệ thống phải hỗ trợ phân quyền để nhân viên thông thường không thể thực hiện các thao tác quản trị nhạy cảm. |
| **NFR09** | Maintainability | **Dễ bảo trì** | Các thành phần của hệ thống cần có khả năng được thay đổi hoặc bảo trì mà hạn chế ảnh hưởng đến các thành phần khác. |
| **NFR10** | Extensibility | **Mở rộng kênh thông báo** | Hệ thống phải cho phép bổ sung các kênh hoặc nhà cung cấp thông báo mới mà không phải thay đổi toàn bộ hệ thống. |
| **NFR11** | Extensibility | **Mở rộng phương thức thanh toán** | Kiến trúc hệ thống phải cho phép bổ sung thêm phương thức hoặc nhà cung cấp thanh toán trong tương lai. |
| **NFR12** | Extensibility | **Mở rộng loại dịch vụ** | Hệ thống phải có khả năng bổ sung các loại dịch vụ mới mà không phải xây dựng lại toàn bộ ứng dụng. |
| **NFR13** | Deployability | **Triển khai từng phần** | Các chức năng mới phải có khả năng được triển khai từng phần và hạn chế ảnh hưởng đến các chức năng đang hoạt động. |
| **NFR14** | Reliability | **Không để lỗi cục bộ làm dừng toàn hệ thống** | Khi một thành phần gặp sự cố, các chức năng khác vẫn phải tiếp tục hoạt động ở mức phù hợp. |
| **NFR15** | Auditability | **Lưu vết hoạt động** | Các thao tác quan trọng của hệ thống cần được lưu vết để phục vụ kiểm tra và xử lý sự cố. |

---

## 10.2. NFR theo nhóm

### 10.2.1. Performance

#### NFR01 — Hiệu năng

Hệ thống phải có khả năng xử lý các thao tác chính như:

- Đặt chuyến.
- Tìm tài xế.
- Theo dõi trạng thái chuyến.
- Thanh toán.
- Gửi thông báo.

với thời gian phản hồi phù hợp với nhu cầu sử dụng thực tế.

> **TBD:** Tài liệu chưa xác định cụ thể thời gian phản hồi tối đa
> (ví dụ: 2 giây, 3 giây...). Cần xác nhận với stakeholder.

#### NFR02 — Tìm tài xế nhanh

Hệ thống cần hỗ trợ việc tìm và phân công tài xế nhanh nhằm giảm thời gian
khách hàng phải chờ.

---

### 10.2.2. Availability & Reliability

#### NFR03 — Khả năng mở rộng khi tải tăng

Hệ thống phải có khả năng mở rộng các thành phần độc lập khi tải tăng.

#### NFR04 — Hoạt động ổn định

Hệ thống phải hoạt động ổn định trong các thời điểm nhu cầu tăng cao.

#### NFR05 — Cô lập lỗi

Một lỗi xảy ra ở chức năng thanh toán hoặc thông báo không được làm toàn bộ
hệ thống đặt xe ngừng hoạt động.

```text
Thanh toán lỗi
     ↓
Không làm dừng
     ↓
Hệ thống đặt xe
```
# 11. Use Case Modeling

Use Case Modeling được sử dụng để xác định các Actor tương tác với hệ thống
và các chức năng mà mỗi Actor có thể thực hiện.

Mỗi Use Case mô tả một mục tiêu nghiệp vụ mà Actor muốn đạt được thông qua
hệ thống.

---

## 11.1. Xác định Actors

| Mã Actor | Actor | Vai trò |
|---|---|---|
| **A01** | **Customer** | Người sử dụng ứng dụng để đặt xe, theo dõi chuyến, thanh toán và đánh giá tài xế. |
| **A02** | **Driver** | Người cung cấp dịch vụ vận chuyển, nhận chuyến, thực hiện chuyến và cập nhật trạng thái chuyến. |
| **A03** | **Operator** | Nhân viên vận hành, quản lý khách hàng, tài xế, phương tiện, chuyến đi và xử lý các trường hợp phát sinh. |
| **A04** | **Management** | Ban lãnh đạo sử dụng báo cáo để theo dõi và đánh giá hoạt động kinh doanh. |
| **A05** | **Payment Provider** | Hệ thống bên ngoài xử lý các giao dịch thanh toán điện tử. |
| **A06** | **Notification Provider** | Hệ thống bên ngoài hỗ trợ gửi thông báo đến khách hàng hoặc tài xế. |

---

## 11.2. Xác định Use Cases

### Customer

Customer có các Use Case chính:

| Mã UC | Use Case | Diễn giải |
|---|---|---|
| **UC01** | Đăng ký tài khoản | Customer tạo tài khoản để sử dụng hệ thống. |
| **UC02** | Đăng nhập | Customer đăng nhập vào ứng dụng. |
| **UC03** | Quản lý thông tin cá nhân | Customer xem và cập nhật thông tin cá nhân. |
| **UC04** | Đặt chuyến xe | Customer nhập điểm đón, điểm đến, chọn loại xe và gửi yêu cầu đặt xe. |
| **UC05** | Theo dõi chuyến | Customer theo dõi trạng thái chuyến và thông tin tài xế. |
| **UC06** | Xem lịch sử chuyến | Customer xem lại các chuyến đã thực hiện. |
| **UC07** | Thanh toán | Customer thực hiện thanh toán cho chuyến đi bằng tiền mặt hoặc điện tử. |
| **UC08** | Đánh giá tài xế | Customer đánh giá tài xế sau khi chuyến hoàn thành. |
| **UC09** | Nhận thông báo | Customer nhận các thông báo liên quan đến yêu cầu và chuyến đi. |

---

### Driver

Driver có các Use Case chính:

| Mã UC | Use Case | Diễn giải |
|---|---|---|
| **UC10** | Đăng nhập | Driver đăng nhập vào ứng dụng tài xế. |
| **UC11** | Quản lý hồ sơ tài xế | Driver xem và cập nhật thông tin hồ sơ. |
| **UC12** | Cập nhật trạng thái sẵn sàng | Driver chuyển trạng thái sẵn sàng hoặc không sẵn sàng nhận chuyến. |
| **UC13** | Nhận yêu cầu chuyến | Driver nhận thông tin yêu cầu chuyến từ hệ thống. |
| **UC14** | Chấp nhận chuyến | Driver chấp nhận yêu cầu chuyến. |
| **UC15** | Từ chối chuyến | Driver từ chối yêu cầu chuyến. |
| **UC16** | Cập nhật trạng thái chuyến | Driver cập nhật các trạng thái: đã nhận, đã đến điểm đón, đã đón khách, đang di chuyển và hoàn thành. |
| **UC17** | Cập nhật vị trí | Hệ thống nhận và cập nhật vị trí hiện tại của Driver. |
| **UC18** | Xem lịch sử chuyến | Driver xem các chuyến đã thực hiện. |
| **UC19** | Nhận thông báo | Driver nhận thông báo về chuyến mới và các thay đổi liên quan đến chuyến. |

---

### Operator

Operator có các Use Case chính:

| Mã UC | Use Case | Diễn giải |
|---|---|---|
| **UC20** | Đăng nhập quản trị | Operator đăng nhập vào hệ thống quản trị. |
| **UC21** | Quản lý Customer | Operator xem và quản lý thông tin khách hàng. |
| **UC22** | Quản lý Driver | Operator xem và quản lý thông tin tài xế. |
| **UC23** | Quản lý Vehicle | Operator quản lý thông tin phương tiện. |
| **UC24** | Quản lý Trip | Operator theo dõi và quản lý các chuyến đi. |
| **UC25** | Theo dõi chuyến đang diễn ra | Operator theo dõi các chuyến đang thực hiện. |
| **UC26** | Xử lý chuyến bị lỗi | Operator kiểm tra và hỗ trợ xử lý các trường hợp chuyến bị lỗi. |
| **UC27** | Tra cứu giao dịch | Operator tra cứu lịch sử giao dịch. |

---

### Management

Management có các Use Case:

| Mã UC | Use Case | Diễn giải |
|---|---|---|
| **UC28** | Xem báo cáo hoạt động | Management xem các báo cáo về hoạt động của hệ thống. |
| **UC29** | Xem chỉ số kinh doanh | Management theo dõi số chuyến, doanh thu, tỷ lệ hoàn thành, tỷ lệ hủy và hiệu quả hoạt động của tài xế. |

---

### External Systems

| Mã UC | Use Case | Diễn giải |
|---|---|---|
| **UC30** | Xử lý thanh toán điện tử | Payment Provider xử lý giao dịch thanh toán điện tử. |
| **UC31** | Gửi thông báo | Notification Provider hỗ trợ gửi thông báo. |

---

# 11.3. Use Case Diagram

```mermaid
flowchart LR

    Customer((Customer))
    Driver((Driver))
    Operator((Operator))
    Management((Management))
    Payment((Payment Provider))
    Notification((Notification Provider))

    subgraph CAB["CAB System"]

        UC01["UC01<br/>Đăng ký tài khoản"]
        UC02["UC02<br/>Đăng nhập"]
        UC03["UC03<br/>Quản lý thông tin cá nhân"]
        UC04["UC04<br/>Đặt chuyến xe"]
        UC05["UC05<br/>Theo dõi chuyến"]
        UC06["UC06<br/>Xem lịch sử chuyến"]
        UC07["UC07<br/>Thanh toán"]
        UC08["UC08<br/>Đánh giá tài xế"]
        UC09["UC09<br/>Nhận thông báo"]

        UC10["UC10<br/>Đăng nhập"]
        UC11["UC11<br/>Quản lý hồ sơ tài xế"]
        UC12["UC12<br/>Cập nhật trạng thái sẵn sàng"]
        UC13["UC13<br/>Nhận yêu cầu chuyến"]
        UC14["UC14<br/>Chấp nhận chuyến"]
        UC15["UC15<br/>Từ chối chuyến"]
        UC16["UC16<br/>Cập nhật trạng thái chuyến"]
        UC17["UC17<br/>Cập nhật vị trí"]
        UC18["UC18<br/>Xem lịch sử chuyến"]
        UC19["UC19<br/>Nhận thông báo"]

        UC20["UC20<br/>Đăng nhập quản trị"]
        UC21["UC21<br/>Quản lý Customer"]
        UC22["UC22<br/>Quản lý Driver"]
        UC23["UC23<br/>Quản lý Vehicle"]
        UC24["UC24<br/>Quản lý Trip"]
        UC25["UC25<br/>Theo dõi chuyến đang diễn ra"]
        UC26["UC26<br/>Xử lý chuyến bị lỗi"]
        UC27["UC27<br/>Tra cứu giao dịch"]

        UC28["UC28<br/>Xem báo cáo hoạt động"]
        UC29["UC29<br/>Xem chỉ số kinh doanh"]

        UC30["UC30<br/>Xử lý thanh toán điện tử"]
        UC31["UC31<br/>Gửi thông báo"]
    end

    Customer --- UC01
    Customer --- UC02
    Customer --- UC03
    Customer --- UC04
    Customer --- UC05
    Customer --- UC06
    Customer --- UC07
    Customer --- UC08
    Customer --- UC09

    Driver --- UC10
    Driver --- UC11
    Driver --- UC12
    Driver --- UC13
    Driver --- UC14
    Driver --- UC15
    Driver --- UC16
    Driver --- UC17
    Driver --- UC18
    Driver --- UC19

    Operator --- UC20
    Operator --- UC21
    Operator --- UC22
    Operator --- UC23
    Operator --- UC24
    Operator --- UC25
    Operator --- UC26
    Operator --- UC27

    Management --- UC28
    Management --- UC29

    Payment --- UC30
    Notification --- UC31

    UC07 --- UC30
    UC09 --- UC31
    UC19 --- UC31
```

# 12. Use Case Specification

Use Case Specification mô tả chi tiết cách Actor tương tác với hệ thống CAB để
đạt được một mục tiêu nghiệp vụ cụ thể.

Mỗi Use Case bao gồm:

* **Use Case ID**
* **Use Case Name**
* **Primary Actor**
* **Supporting Actor**
* **Goal**
* **Preconditions**
* **Trigger**
* **Main Success Scenario**
* **Alternative / Exception Flows**
* **Postconditions**
* **Business Rules**
* **Related Functional Requirements**

> **Lưu ý:** Các giá trị nghiệp vụ chưa được khách hàng xác nhận như bán kính
> tìm tài xế, thời gian phản hồi, công thức tính cước hoặc số lần retry thanh
> toán không được tự giả định trong Use Case Specification.

---

# 12.1. Customer Use Cases

## UC01 — Đăng ký tài khoản

| Thuộc tính           | Nội dung                                                        |
| -------------------- | --------------------------------------------------------------- |
| **Use Case ID**      | UC01                                                            |
| **Use Case Name**    | Đăng ký tài khoản                                               |
| **Primary Actor**    | Customer                                                        |
| **Supporting Actor** | —                                                               |
| **Goal**             | Tạo tài khoản mới để sử dụng các chức năng yêu cầu tài khoản.   |
| **Preconditions**    | Customer chưa có tài khoản hoặc chưa sử dụng tài khoản hiện có. |
| **Trigger**          | Customer chọn chức năng đăng ký tài khoản.                      |

### Main Success Scenario

1. Customer chọn **Đăng ký tài khoản**.
2. Hệ thống hiển thị biểu mẫu đăng ký.
3. Customer nhập các thông tin cần thiết.
4. Customer gửi thông tin đăng ký.
5. Hệ thống kiểm tra tính hợp lệ của thông tin.
6. Hệ thống tạo tài khoản Customer.
7. Hệ thống thông báo đăng ký thành công.

### Alternative / Exception Flows

* **A1.** Thông tin đăng ký không hợp lệ → Hệ thống yêu cầu Customer sửa
  thông tin.
* **A2.** Tài khoản/thông tin định danh đã tồn tại → Hệ thống thông báo và
  không tạo tài khoản mới.
* **A3.** Hệ thống không thể tạo tài khoản → Hệ thống thông báo lỗi.

### Postconditions

* Tài khoản Customer được tạo thành công hoặc yêu cầu đăng ký bị từ chối.

### Business Rules

* BRULE02 — Khách hàng phải được xác thực khi sử dụng chức năng yêu cầu tài khoản.

### Related FR

* FR01, FR02

---

## UC02 — Đăng nhập

| Thuộc tính        | Nội dung                                                       |
| ----------------- | -------------------------------------------------------------- |
| **Use Case ID**   | UC02                                                           |
| **Use Case Name** | Đăng nhập                                                      |
| **Primary Actor** | Customer                                                       |
| **Goal**          | Xác thực Customer để truy cập các chức năng yêu cầu tài khoản. |
| **Preconditions** | Customer đã có tài khoản.                                      |
| **Trigger**       | Customer chọn chức năng đăng nhập.                             |

### Main Success Scenario

1. Customer nhập thông tin đăng nhập.
2. Hệ thống tiếp nhận thông tin.
3. Hệ thống xác thực thông tin.
4. Hệ thống xác định tài khoản hợp lệ.
5. Hệ thống cho phép Customer đăng nhập.

### Alternative / Exception Flows

* **A1.** Thông tin đăng nhập không đúng → Hệ thống từ chối đăng nhập.
* **A2.** Tài khoản không ở trạng thái có thể sử dụng → Hệ thống thông báo
  trạng thái tài khoản.

### Postconditions

* Customer được xác thực và có quyền sử dụng các chức năng tương ứng.

### Business Rules

* BRULE02

### Related FR

* FR03, FR04

---

## UC03 — Quản lý thông tin cá nhân

| Thuộc tính        | Nội dung                             |
| ----------------- | ------------------------------------ |
| **Use Case ID**   | UC03                                 |
| **Use Case Name** | Quản lý thông tin cá nhân            |
| **Primary Actor** | Customer                             |
| **Goal**          | Xem và cập nhật thông tin cá nhân.   |
| **Preconditions** | Customer đã đăng nhập.               |
| **Trigger**       | Customer truy cập thông tin cá nhân. |

### Main Success Scenario

1. Customer chọn **Thông tin cá nhân**.
2. Hệ thống hiển thị thông tin hiện tại.
3. Customer chọn cập nhật thông tin.
4. Customer thay đổi thông tin.
5. Customer lưu thay đổi.
6. Hệ thống kiểm tra thông tin.
7. Hệ thống lưu thông tin mới.
8. Hệ thống thông báo cập nhật thành công.

### Alternative / Exception Flows

* **A1.** Thông tin không hợp lệ → Hệ thống yêu cầu nhập lại.
* **A2.** Lỗi khi lưu → Hệ thống không cập nhật dữ liệu và thông báo lỗi.

### Postconditions

* Thông tin cá nhân được cập nhật nếu thao tác thành công.

### Related FR

* FR05, FR06

---

## UC04 — Đặt chuyến xe

| Thuộc tính        | Nội dung                        |
| ----------------- | ------------------------------- |
| **Use Case ID**   | UC04                            |
| **Use Case Name** | Đặt chuyến xe                   |
| **Primary Actor** | Customer                        |
| **Goal**          | Tạo một yêu cầu đặt xe.         |
| **Preconditions** | Customer đã đăng nhập.          |
| **Trigger**       | Customer chọn chức năng đặt xe. |

### Main Success Scenario

1. Customer chọn **Đặt xe**.
2. Hệ thống yêu cầu nhập thông tin chuyến.
3. Customer nhập điểm đón.
4. Customer nhập điểm đến.
5. Customer lựa chọn loại xe/dịch vụ.
6. Customer gửi yêu cầu đặt xe.
7. Hệ thống kiểm tra thông tin yêu cầu.
8. Hệ thống tạo Booking.
9. Hệ thống chuyển Booking sang trạng thái tìm tài xế.
10. Hệ thống thông báo yêu cầu đã được tiếp nhận.
11. Hệ thống bắt đầu quá trình tìm tài xế.

### Alternative / Exception Flows

* **A1.** Thiếu điểm đón, điểm đến hoặc loại xe → Không cho gửi yêu cầu.
* **A2.** Thông tin chuyến không hợp lệ → Hệ thống yêu cầu chỉnh sửa.
* **A3.** Không thể tạo Booking → Hệ thống thông báo lỗi.

### Postconditions

* Booking được tạo và chuyển sang quá trình tìm tài xế.

### Business Rules

* BRULE01
* BRULE02

### Related FR

* FR15–FR20

---

## UC05 — Theo dõi chuyến

| Thuộc tính        | Nội dung                                                  |
| ----------------- | --------------------------------------------------------- |
| **Use Case ID**   | UC05                                                      |
| **Use Case Name** | Theo dõi chuyến                                           |
| **Primary Actor** | Customer                                                  |
| **Goal**          | Theo dõi trạng thái và thông tin liên quan đến chuyến đi. |
| **Preconditions** | Customer có Booking/Trip hợp lệ.                          |
| **Trigger**       | Customer mở màn hình theo dõi chuyến.                     |

### Main Success Scenario

1. Customer chọn chuyến đang theo dõi.
2. Hệ thống hiển thị trạng thái hiện tại.
3. Hệ thống hiển thị thông tin tài xế nếu đã được phân công.
4. Hệ thống hiển thị thời gian dự kiến tài xế đến nếu có.
5. Hệ thống cập nhật trạng thái khi có thay đổi.
6. Customer tiếp tục theo dõi cho đến khi chuyến hoàn thành.

### Alternative / Exception Flows

* **A1.** Chưa tìm được tài xế → Hiển thị trạng thái đang tìm tài xế.
* **A2.** Không tìm được tài xế → Hiển thị trạng thái không tìm được tài xế.
* **A3.** Không thể cập nhật dữ liệu → Hiển thị trạng thái gần nhất đã biết.

### Postconditions

* Customer có thể biết trạng thái mới nhất của chuyến trong phạm vi dữ liệu
  hệ thống cung cấp.

### Related FR

* FR35–FR37

---

## UC06 — Xem lịch sử chuyến

| Thuộc tính        | Nội dung                         |
| ----------------- | -------------------------------- |
| **Use Case ID**   | UC06                             |
| **Use Case Name** | Xem lịch sử chuyến               |
| **Primary Actor** | Customer                         |
| **Goal**          | Xem lại các chuyến đã thực hiện. |
| **Preconditions** | Customer đã đăng nhập.           |
| **Trigger**       | Customer chọn lịch sử chuyến.    |

### Main Success Scenario

1. Customer chọn **Lịch sử chuyến**.
2. Hệ thống truy vấn các Trip thuộc Customer.
3. Hệ thống hiển thị danh sách chuyến.
4. Customer chọn một chuyến.
5. Hệ thống hiển thị thông tin chi tiết chuyến và số tiền phải trả.

### Alternative / Exception Flows

* **A1.** Không có lịch sử chuyến → Hệ thống hiển thị danh sách rỗng.
* **A2.** Không thể tải dữ liệu → Hệ thống thông báo lỗi.

### Related FR

* FR62–FR64

---

## UC07 — Thanh toán

| Thuộc tính           | Nội dung                                   |
| -------------------- | ------------------------------------------ |
| **Use Case ID**      | UC07                                       |
| **Use Case Name**    | Thanh toán                                 |
| **Primary Actor**    | Customer                                   |
| **Supporting Actor** | Payment Provider                           |
| **Goal**             | Thanh toán số tiền phải trả cho chuyến đi. |
| **Preconditions**    | Trip đã hoàn thành và có số tiền phải trả. |
| **Trigger**          | Customer thực hiện thanh toán.             |

### Main Success Scenario

1. Hệ thống hiển thị số tiền phải trả.
2. Customer lựa chọn phương thức thanh toán.
3. Nếu chọn tiền mặt, hệ thống ghi nhận phương thức tiền mặt.
4. Nếu chọn thanh toán điện tử, hệ thống gửi yêu cầu đến Payment Provider.
5. Payment Provider xử lý giao dịch.
6. Hệ thống nhận kết quả giao dịch.
7. Hệ thống lưu trạng thái thanh toán.
8. Hệ thống thông báo kết quả cho Customer.

### Alternative / Exception Flows

* **A1.** Thanh toán điện tử thất bại → Hệ thống thông báo thất bại.
* **A2.** Customer thực hiện lại thanh toán → Hệ thống xử lý lại theo chính
  sách doanh nghiệp.
* **A3.** Payment Provider không phản hồi → Hệ thống ghi nhận trạng thái
  phù hợp và không làm dừng toàn bộ hệ thống.

### Postconditions

* Payment được ghi nhận với trạng thái tương ứng.

### Business Rules

* BRULE11–BRULE17

### Related FR

* FR45–FR54

---

## UC08 — Đánh giá tài xế

| Thuộc tính        | Nội dung                              |
| ----------------- | ------------------------------------- |
| **Use Case ID**   | UC08                                  |
| **Use Case Name** | Đánh giá tài xế                       |
| **Primary Actor** | Customer                              |
| **Goal**          | Gửi đánh giá về tài xế sau chuyến đi. |
| **Preconditions** | Trip đã hoàn thành.                   |
| **Trigger**       | Customer chọn đánh giá tài xế.        |

### Main Success Scenario

1. Customer mở thông tin Trip đã hoàn thành.
2. Hệ thống hiển thị chức năng đánh giá.
3. Customer nhập điểm đánh giá và nội dung nếu có.
4. Customer gửi đánh giá.
5. Hệ thống kiểm tra dữ liệu.
6. Hệ thống lưu Review.
7. Hệ thống thông báo đánh giá đã được ghi nhận.

### Alternative / Exception Flows

* **A1.** Trip chưa hoàn thành → Không cho phép đánh giá.
* **A2.** Dữ liệu đánh giá không hợp lệ → Yêu cầu nhập lại.
* **A3.** Lỗi lưu Review → Thông báo lỗi.

### Related FR

* FR65, FR66

---

## UC09 — Nhận thông báo

| Thuộc tính           | Nội dung                                                            |
| -------------------- | ------------------------------------------------------------------- |
| **Use Case ID**      | UC09                                                                |
| **Use Case Name**    | Nhận thông báo                                                      |
| **Primary Actor**    | Customer                                                            |
| **Supporting Actor** | Notification Provider                                               |
| **Goal**             | Customer nhận được thông tin quan trọng liên quan đến Booking/Trip. |
| **Preconditions**    | Customer có tài khoản và có sự kiện cần thông báo.                  |
| **Trigger**          | Một sự kiện nghiệp vụ phát sinh.                                    |

### Main Success Scenario

1. Một sự kiện nghiệp vụ xảy ra.
2. CAB tạo thông báo.
3. CAB gửi thông báo thông qua Notification Provider.
4. Notification Provider thực hiện gửi.
5. Customer nhận thông báo.
6. Hệ thống ghi nhận trạng thái gửi.

### Alternative / Exception Flows

* **A1.** Notification Provider lỗi → Hệ thống ghi nhận lỗi và tiếp tục xử lý
  các nghiệp vụ khác.

### Related FR

* FR55–FR59

---

# 12.2. Driver Use Cases

## UC10 — Đăng nhập tài xế

| Thuộc tính        | Nội dung                             |
| ----------------- | ------------------------------------ |
| **Use Case ID**   | UC10                                 |
| **Use Case Name** | Đăng nhập                            |
| **Primary Actor** | Driver                               |
| **Goal**          | Xác thực Driver để sử dụng hệ thống. |
| **Preconditions** | Driver đã có tài khoản.              |
| **Trigger**       | Driver thực hiện đăng nhập.          |

### Main Success Scenario

1. Driver nhập thông tin đăng nhập.
2. Hệ thống xác thực thông tin.
3. Hệ thống xác nhận tài khoản hợp lệ.
4. Hệ thống cho phép Driver truy cập ứng dụng.

### Alternative / Exception Flows

* **A1.** Thông tin đăng nhập không hợp lệ → Từ chối đăng nhập.
* **A2.** Tài khoản không thể sử dụng → Thông báo trạng thái tài khoản.

### Related FR

* FR11, FR12

---

## UC11 — Quản lý hồ sơ tài xế

| Thuộc tính        | Nội dung                      |
| ----------------- | ----------------------------- |
| **Use Case ID**   | UC11                          |
| **Use Case Name** | Quản lý hồ sơ tài xế          |
| **Primary Actor** | Driver                        |
| **Goal**          | Xem và cập nhật hồ sơ tài xế. |
| **Preconditions** | Driver đã đăng nhập.          |
| **Trigger**       | Driver mở hồ sơ cá nhân.      |

### Main Success Scenario

1. Driver mở hồ sơ.
2. Hệ thống hiển thị thông tin hiện tại.
3. Driver cập nhật thông tin.
4. Driver lưu thay đổi.
5. Hệ thống kiểm tra dữ liệu.
6. Hệ thống lưu thay đổi.

### Alternative / Exception Flows

* **A1.** Dữ liệu không hợp lệ → Yêu cầu chỉnh sửa.
* **A2.** Lỗi lưu → Không cập nhật dữ liệu.

### Related FR

* FR09, FR10

---

## UC12 — Cập nhật trạng thái sẵn sàng

| Thuộc tính        | Nội dung                                               |
| ----------------- | ------------------------------------------------------ |
| **Use Case ID**   | UC12                                                   |
| **Use Case Name** | Cập nhật trạng thái sẵn sàng                           |
| **Primary Actor** | Driver                                                 |
| **Goal**          | Cho hệ thống biết Driver có thể nhận chuyến hay không. |
| **Preconditions** | Driver đã đăng nhập.                                   |
| **Trigger**       | Driver thay đổi trạng thái hoạt động.                  |

### Main Success Scenario

1. Driver chọn trạng thái hoạt động.
2. Driver chuyển sang trạng thái sẵn sàng.
3. Hệ thống cập nhật `availability_status`.
4. Hệ thống đưa Driver vào nhóm có thể được xem xét phân công.

### Alternative / Exception Flows

* **A1.** Driver chuyển sang không sẵn sàng → Hệ thống không đưa Driver vào
  danh sách tìm kiếm mới.
* **A2.** Không thể cập nhật trạng thái → Giữ trạng thái trước đó và thông báo lỗi.

### Business Rules

* BRULE03

### Related FR

* FR13, FR14

---

## UC13 — Nhận yêu cầu chuyến

| Thuộc tính        | Nội dung                                                |
| ----------------- | ------------------------------------------------------- |
| **Use Case ID**   | UC13                                                    |
| **Use Case Name** | Nhận yêu cầu chuyến                                     |
| **Primary Actor** | Driver                                                  |
| **Goal**          | Nhận và xem thông tin một chuyến được hệ thống đề xuất. |
| **Preconditions** | Driver đang sẵn sàng và được hệ thống lựa chọn.         |
| **Trigger**       | Hệ thống gửi yêu cầu chuyến đến Driver.                 |

### Main Success Scenario

1. Hệ thống xác định Driver phù hợp.
2. Hệ thống gửi thông tin chuyến.
3. Driver nhận thông báo.
4. Driver mở yêu cầu.
5. Hệ thống hiển thị thông tin chuyến.

### Alternative / Exception Flows

* **A1.** Driver không phản hồi → Hệ thống xử lý theo quy tắc tìm tài xế.
* **A2.** Driver từ chối → Chuyển sang quy trình tìm tài xế khác.

### Related FR

* FR22–FR25, FR29–FR30

---

## UC14 — Chấp nhận chuyến

| Thuộc tính        | Nội dung                                                   |
| ----------------- | ---------------------------------------------------------- |
| **Use Case ID**   | UC14                                                       |
| **Use Case Name** | Chấp nhận chuyến                                           |
| **Primary Actor** | Driver                                                     |
| **Goal**          | Chấp nhận yêu cầu chuyến được hệ thống đề xuất.            |
| **Preconditions** | Driver nhận được yêu cầu hợp lệ và vẫn có thể nhận chuyến. |
| **Trigger**       | Driver chọn **Chấp nhận**.                                 |

### Main Success Scenario

1. Driver chọn chấp nhận chuyến.
2. Hệ thống kiểm tra trạng thái yêu cầu.
3. Hệ thống xác nhận Driver được phân công.
4. Hệ thống tạo/cập nhật Trip.
5. Hệ thống cập nhật trạng thái Driver.
6. Hệ thống thông báo cho Customer.

### Alternative / Exception Flows

* **A1.** Chuyến đã được Driver khác nhận → Hệ thống thông báo không thể
  nhận chuyến.
* **A2.** Chuyến không còn hợp lệ → Từ chối thao tác.
* **A3.** Lỗi hệ thống → Không xác nhận phân công.

### Business Rules

* BRULE08

### Related FR

* FR31, FR33, FR34

---

## UC15 — Từ chối chuyến

| Thuộc tính        | Nội dung                             |
| ----------------- | ------------------------------------ |
| **Use Case ID**   | UC15                                 |
| **Use Case Name** | Từ chối chuyến                       |
| **Primary Actor** | Driver                               |
| **Goal**          | Từ chối một yêu cầu chuyến.          |
| **Preconditions** | Driver đang nhận một yêu cầu chuyến. |
| **Trigger**       | Driver chọn **Từ chối**.             |

### Main Success Scenario

1. Driver chọn từ chối.
2. Hệ thống ghi nhận việc từ chối.
3. Hệ thống loại Driver khỏi yêu cầu hiện tại.
4. Hệ thống tiếp tục tìm Driver khác.
5. Customer tiếp tục giữ Booking hiện tại.

### Alternative / Exception Flows

* **A1.** Booking đã được xử lý bởi Driver khác → Hệ thống thông báo trạng
  thái hiện tại.

### Business Rules

* BRULE06

### Related FR

* FR26, FR32

---

## UC16 — Cập nhật trạng thái chuyến

| Thuộc tính        | Nội dung                                                   |
| ----------------- | ---------------------------------------------------------- |
| **Use Case ID**   | UC16                                                       |
| **Use Case Name** | Cập nhật trạng thái chuyến                                 |
| **Primary Actor** | Driver                                                     |
| **Goal**          | Cập nhật trạng thái Trip trong quá trình thực hiện chuyến. |
| **Preconditions** | Driver đã được phân công cho Trip.                         |
| **Trigger**       | Trạng thái chuyến thay đổi.                                |

### Main Success Scenario

1. Driver mở Trip hiện tại.
2. Driver cập nhật trạng thái.
3. Hệ thống kiểm tra trạng thái hiện tại.
4. Hệ thống ghi nhận trạng thái mới.
5. Hệ thống thông báo cho các Actor liên quan nếu cần.
6. Quá trình tiếp tục cho đến khi Trip hoàn thành.

### Các trạng thái nghiệp vụ

```text
Assigned
   ↓
Arrived at Pickup
   ↓
Passenger Picked Up
   ↓
In Progress
   ↓
Completed
```

### Alternative / Exception Flows

* **A1.** Driver cố cập nhật trạng thái không phù hợp với vòng đời chuyến →
  Hệ thống từ chối thao tác.
* **A2.** Không thể cập nhật → Giữ trạng thái hiện tại và thông báo lỗi.

### Business Rules

* BRULE09
* BRULE10

### Related FR

* FR37–FR40

---

## UC17 — Cập nhật vị trí

| Thuộc tính        | Nội dung                                                                   |
| ----------------- | -------------------------------------------------------------------------- |
| **Use Case ID**   | UC17                                                                       |
| **Use Case Name** | Cập nhật vị trí                                                            |
| **Primary Actor** | Driver                                                                     |
| **Goal**          | Cập nhật vị trí hiện tại để hệ thống hỗ trợ tìm tài xế và theo dõi chuyến. |
| **Preconditions** | Driver đã đăng nhập và cho phép hệ thống nhận vị trí.                      |
| **Trigger**       | Vị trí Driver thay đổi hoặc hệ thống yêu cầu cập nhật vị trí.              |

### Main Success Scenario

1. Ứng dụng Driver lấy vị trí hiện tại.
2. Hệ thống tiếp nhận dữ liệu vị trí.
3. Hệ thống lưu bản ghi vị trí.
4. Dữ liệu được sử dụng cho các nghiệp vụ liên quan.

### Alternative / Exception Flows

* **A1.** Không lấy được vị trí → Hệ thống không cập nhật bản ghi mới.
* **A2.** Mất kết nối → Dữ liệu được xử lý theo chính sách chưa được xác định.

### Open Question

* Tần suất cập nhật vị trí chưa được khách hàng xác định.
* Chính sách xử lý mất kết nối chưa được xác định.

### Related FR

* FR21, FR35, FR36

---

## UC18 — Xem lịch sử chuyến

| Thuộc tính        | Nội dung                            |
| ----------------- | ----------------------------------- |
| **Use Case ID**   | UC18                                |
| **Use Case Name** | Xem lịch sử chuyến                  |
| **Primary Actor** | Driver                              |
| **Goal**          | Xem các chuyến Driver đã thực hiện. |
| **Preconditions** | Driver đã đăng nhập.                |
| **Trigger**       | Driver mở lịch sử chuyến.           |

### Main Success Scenario

1. Driver chọn lịch sử chuyến.
2. Hệ thống truy vấn các Trip thuộc Driver.
3. Hệ thống hiển thị danh sách.
4. Driver chọn một Trip để xem chi tiết.

### Alternative / Exception Flows

* **A1.** Không có chuyến → Hiển thị danh sách rỗng.
* **A2.** Không thể tải dữ liệu → Thông báo lỗi.

### Related FR

* Phạm vi này **chưa có FR riêng trong danh sách FR hiện tại**.

> Đây là một điểm cần bổ sung vào FR nếu UC18 thực sự nằm trong Scope.

---

## UC19 — Nhận thông báo

| Thuộc tính           | Nội dung                                                                |
| -------------------- | ----------------------------------------------------------------------- |
| **Use Case ID**      | UC19                                                                    |
| **Use Case Name**    | Nhận thông báo                                                          |
| **Primary Actor**    | Driver                                                                  |
| **Supporting Actor** | Notification Provider                                                   |
| **Goal**             | Driver nhận thông tin về chuyến mới hoặc thay đổi liên quan đến chuyến. |
| **Preconditions**    | Driver có sự kiện cần thông báo.                                        |
| **Trigger**          | Một sự kiện nghiệp vụ phát sinh.                                        |

### Main Success Scenario

1. Hệ thống phát sinh sự kiện.
2. CAB tạo Notification.
3. CAB gửi Notification đến Notification Provider.
4. Provider thực hiện gửi.
5. Driver nhận thông báo.
6. Hệ thống ghi nhận trạng thái gửi.

### Alternative / Exception Flows

* **A1.** Provider gặp lỗi → Hệ thống ghi nhận lỗi và không làm dừng các
  nghiệp vụ khác.

### Business Rules

* BRULE19

### Related FR

* FR60, FR61

---

# 12.3. Operator Use Cases

## UC20 — Đăng nhập quản trị

| Thuộc tính        | Nội dung                                         |
| ----------------- | ------------------------------------------------ |
| **Use Case ID**   | UC20                                             |
| **Use Case Name** | Đăng nhập quản trị                               |
| **Primary Actor** | Operator                                         |
| **Goal**          | Xác thực Operator để truy cập hệ thống quản trị. |
| **Preconditions** | Operator có tài khoản hợp lệ.                    |
| **Trigger**       | Operator đăng nhập hệ thống quản trị.            |

### Main Success Scenario

1. Operator nhập thông tin đăng nhập.
2. Hệ thống xác thực.
3. Hệ thống kiểm tra trạng thái tài khoản.
4. Hệ thống xác định quyền.
5. Hệ thống cho phép truy cập chức năng quản trị phù hợp.

### Alternative / Exception Flows

* **A1.** Sai thông tin → Từ chối đăng nhập.
* **A2.** Tài khoản không hoạt động → Từ chối truy cập.

### Business Rules

* BRULE20

### Related FR

* FR82, FR83

---

## UC21 — Quản lý Customer

| Thuộc tính        | Nội dung                                                     |
| ----------------- | ------------------------------------------------------------ |
| **Use Case ID**   | UC21                                                         |
| **Use Case Name** | Quản lý Customer                                             |
| **Primary Actor** | Operator                                                     |
| **Goal**          | Tra cứu và quản lý thông tin khách hàng theo quyền được cấp. |
| **Preconditions** | Operator đã đăng nhập và có quyền phù hợp.                   |
| **Trigger**       | Operator truy cập chức năng Customer Management.             |

### Main Success Scenario

1. Operator mở danh sách Customer.
2. Hệ thống hiển thị danh sách.
3. Operator tìm kiếm Customer nếu cần.
4. Operator chọn Customer.
5. Hệ thống hiển thị thông tin theo quyền.

### Alternative / Exception Flows

* **A1.** Không tìm thấy Customer → Hiển thị kết quả rỗng.
* **A2.** Không đủ quyền → Từ chối thao tác.

### Related FR

* FR67–FR69

---

## UC22 — Quản lý Driver

| Thuộc tính        | Nội dung                                   |
| ----------------- | ------------------------------------------ |
| **Use Case ID**   | UC22                                       |
| **Use Case Name** | Quản lý Driver                             |
| **Primary Actor** | Operator                                   |
| **Goal**          | Tra cứu và quản lý thông tin Driver.       |
| **Preconditions** | Operator đã đăng nhập và có quyền phù hợp. |
| **Trigger**       | Operator truy cập Driver Management.       |

### Main Success Scenario

1. Operator mở danh sách Driver.
2. Hệ thống hiển thị danh sách.
3. Operator tìm kiếm Driver.
4. Operator xem hồ sơ Driver.
5. Hệ thống hiển thị thông tin theo quyền.

### Alternative / Exception Flows

* **A1.** Không tìm thấy Driver → Hiển thị kết quả rỗng.
* **A2.** Không đủ quyền → Từ chối thao tác.

### Related FR

* FR70–FR72

---

## UC23 — Quản lý Vehicle

| Thuộc tính        | Nội dung                                   |
| ----------------- | ------------------------------------------ |
| **Use Case ID**   | UC23                                       |
| **Use Case Name** | Quản lý Vehicle                            |
| **Primary Actor** | Operator                                   |
| **Goal**          | Quản lý thông tin phương tiện.             |
| **Preconditions** | Operator đã đăng nhập và có quyền phù hợp. |
| **Trigger**       | Operator truy cập Vehicle Management.      |

### Main Success Scenario

1. Operator mở danh sách Vehicle.
2. Hệ thống hiển thị phương tiện.
3. Operator tìm kiếm hoặc chọn Vehicle.
4. Hệ thống hiển thị thông tin phương tiện.
5. Operator thực hiện thao tác được cấp quyền.
6. Hệ thống lưu thay đổi nếu có.

### Alternative / Exception Flows

* **A1.** Không đủ quyền → Từ chối thao tác.
* **A2.** Dữ liệu không hợp lệ → Không lưu thay đổi.

### Related FR

* FR73

---

## UC24 — Quản lý Trip

| Thuộc tính        | Nội dung                            |
| ----------------- | ----------------------------------- |
| **Use Case ID**   | UC24                                |
| **Use Case Name** | Quản lý Trip                        |
| **Primary Actor** | Operator                            |
| **Goal**          | Theo dõi và quản lý thông tin Trip. |
| **Preconditions** | Operator đã đăng nhập.              |
| **Trigger**       | Operator truy cập Trip Management.  |

### Main Success Scenario

1. Operator mở danh sách Trip.
2. Hệ thống hiển thị Trip.
3. Operator tìm kiếm Trip.
4. Operator chọn Trip.
5. Hệ thống hiển thị thông tin Trip.
6. Operator thực hiện thao tác được cấp quyền.

### Alternative / Exception Flows

* **A1.** Không tìm thấy Trip → Hiển thị kết quả rỗng.
* **A2.** Không đủ quyền → Từ chối thao tác.

### Related FR

* FR75–FR77

---

## UC25 — Theo dõi chuyến đang diễn ra

| Thuộc tính        | Nội dung                                |
| ----------------- | --------------------------------------- |
| **Use Case ID**   | UC25                                    |
| **Use Case Name** | Theo dõi chuyến đang diễn ra            |
| **Primary Actor** | Operator                                |
| **Goal**          | Theo dõi các Trip đang được thực hiện.  |
| **Preconditions** | Operator đã đăng nhập.                  |
| **Trigger**       | Operator mở màn hình theo dõi vận hành. |

### Main Success Scenario

1. Operator mở danh sách chuyến đang diễn ra.
2. Hệ thống hiển thị các Trip đang hoạt động.
3. Operator chọn một Trip.
4. Hệ thống hiển thị trạng thái, Customer, Driver và thông tin liên quan.
5. Hệ thống cập nhật dữ liệu khi trạng thái thay đổi.

### Alternative / Exception Flows

* **A1.** Không có Trip đang diễn ra → Hiển thị danh sách rỗng.
* **A2.** Dữ liệu cập nhật không khả dụng → Hiển thị dữ liệu gần nhất.

### Related FR

* FR75, FR76, FR77

---

## UC26 — Xử lý chuyến bị lỗi

| Thuộc tính        | Nội dung                                                    |
| ----------------- | ----------------------------------------------------------- |
| **Use Case ID**   | UC26                                                        |
| **Use Case Name** | Xử lý chuyến bị lỗi                                         |
| **Primary Actor** | Operator                                                    |
| **Goal**          | Kiểm tra và hỗ trợ xử lý các trường hợp Trip phát sinh lỗi. |
| **Preconditions** | Operator đã đăng nhập và có quyền xử lý sự cố.              |
| **Trigger**       | Trip phát sinh lỗi hoặc Operator phát hiện bất thường.      |

### Main Success Scenario

1. Operator xác định Trip bị lỗi.
2. Operator mở thông tin Trip.
3. Hệ thống hiển thị trạng thái và thông tin liên quan.
4. Operator kiểm tra nguyên nhân hoặc thông tin hiện có.
5. Operator thực hiện thao tác được hệ thống hỗ trợ.
6. Hệ thống ghi nhận thao tác.
7. Trip được đưa về trạng thái phù hợp.

### Alternative / Exception Flows

* **A1.** Operator không đủ quyền → Từ chối thao tác.
* **A2.** Không thể xử lý tự động → Operator tiếp tục xử lý theo quy trình
  vận hành của doanh nghiệp.

### Open Question

Quy trình xử lý cụ thể cho từng loại lỗi chưa được khách hàng xác định.

### Related FR

* FR78

---

## UC27 — Tra cứu giao dịch

| Thuộc tính        | Nội dung                                   |
| ----------------- | ------------------------------------------ |
| **Use Case ID**   | UC27                                       |
| **Use Case Name** | Tra cứu giao dịch                          |
| **Primary Actor** | Operator                                   |
| **Goal**          | Tra cứu lịch sử và trạng thái giao dịch.   |
| **Preconditions** | Operator đã đăng nhập và có quyền phù hợp. |
| **Trigger**       | Operator truy cập Transaction Management.  |

### Main Success Scenario

1. Operator mở chức năng tra cứu giao dịch.
2. Hệ thống hiển thị giao dịch.
3. Operator tìm kiếm giao dịch.
4. Operator chọn một giao dịch.
5. Hệ thống hiển thị trạng thái và thông tin liên quan.
6. Operator có thể đối chiếu giao dịch với Trip.

### Alternative / Exception Flows

* **A1.** Không tìm thấy giao dịch → Hiển thị kết quả rỗng.
* **A2.** Không đủ quyền → Từ chối truy cập.

### Related FR

* FR79–FR81

---

# 12.4. Management Use Cases

## UC28 — Xem báo cáo hoạt động

| Thuộc tính        | Nội dung                                    |
| ----------------- | ------------------------------------------- |
| **Use Case ID**   | UC28                                        |
| **Use Case Name** | Xem báo cáo hoạt động                       |
| **Primary Actor** | Management                                  |
| **Goal**          | Theo dõi các chỉ số hoạt động của hệ thống. |
| **Preconditions** | Management có quyền truy cập báo cáo.       |
| **Trigger**       | Management mở chức năng báo cáo.            |

### Main Success Scenario

1. Management truy cập báo cáo.
2. Hệ thống tổng hợp dữ liệu.
3. Hệ thống hiển thị các chỉ số hoạt động.
4. Management xem và phân tích báo cáo.

### Báo cáo có thể bao gồm

* Số lượng chuyến.
* Tỷ lệ hoàn thành.
* Tỷ lệ hủy.
* Hiệu quả hoạt động của tài xế.

### Alternative / Exception Flows

* **A1.** Không có dữ liệu → Hiển thị báo cáo không có dữ liệu.
* **A2.** Không thể tổng hợp dữ liệu → Thông báo lỗi.

### Related FR

* FR86, FR88–FR90

---

## UC29 — Xem chỉ số kinh doanh

| Thuộc tính        | Nội dung                                                        |
| ----------------- | --------------------------------------------------------------- |
| **Use Case ID**   | UC29                                                            |
| **Use Case Name** | Xem chỉ số kinh doanh                                           |
| **Primary Actor** | Management                                                      |
| **Goal**          | Theo dõi doanh thu và các chỉ số phục vụ quyết định kinh doanh. |
| **Preconditions** | Management có quyền truy cập báo cáo kinh doanh.                |
| **Trigger**       | Management mở báo cáo kinh doanh.                               |

### Main Success Scenario

1. Management mở báo cáo kinh doanh.
2. Hệ thống tổng hợp dữ liệu.
3. Hệ thống hiển thị doanh thu và các chỉ số liên quan.
4. Management xem và đánh giá kết quả hoạt động.

### Alternative / Exception Flows

* **A1.** Không có dữ liệu → Hiển thị trạng thái không có dữ liệu.
* **A2.** Dữ liệu không thể tổng hợp → Thông báo lỗi.

### Related FR

* FR86, FR87, FR88, FR89, FR90

---

# 12.5. External System Use Cases

## UC30 — Xử lý thanh toán điện tử

| Thuộc tính           | Nội dung                                                   |
| -------------------- | ---------------------------------------------------------- |
| **Use Case ID**      | UC30                                                       |
| **Use Case Name**    | Xử lý thanh toán điện tử                                   |
| **Primary Actor**    | Payment Provider                                           |
| **Supporting Actor** | Customer / CAB                                             |
| **Goal**             | Xử lý giao dịch thanh toán điện tử và trả kết quả cho CAB. |
| **Preconditions**    | CAB đã gửi yêu cầu thanh toán hợp lệ.                      |
| **Trigger**          | CAB yêu cầu Payment Provider xử lý giao dịch.              |

### Main Success Scenario

1. CAB gửi yêu cầu thanh toán.
2. Payment Provider tiếp nhận yêu cầu.
3. Payment Provider xử lý giao dịch.
4. Payment Provider xác định kết quả.
5. Payment Provider trả kết quả cho CAB.
6. CAB ghi nhận trạng thái giao dịch.

### Alternative / Exception Flows

* **A1.** Giao dịch thất bại → Provider trả trạng thái thất bại.
* **A2.** Provider không phản hồi → CAB ghi nhận trạng thái phù hợp theo chính
  sách.
* **A3.** Giao dịch bị từ chối → CAB thông báo kết quả cho Customer.

### Related FR

* FR48, FR49, FR51–FR54

---

## UC31 — Gửi thông báo

| Thuộc tính           | Nội dung                                   |
| -------------------- | ------------------------------------------ |
| **Use Case ID**      | UC31                                       |
| **Use Case Name**    | Gửi thông báo                              |
| **Primary Actor**    | Notification Provider                      |
| **Supporting Actor** | CAB                                        |
| **Goal**             | Gửi thông báo đến Customer hoặc Driver.    |
| **Preconditions**    | CAB đã tạo thông báo cần gửi.              |
| **Trigger**          | CAB gửi yêu cầu đến Notification Provider. |

### Main Success Scenario

1. CAB tạo Notification.
2. CAB gửi yêu cầu đến Notification Provider.
3. Provider tiếp nhận yêu cầu.
4. Provider gửi thông báo đến người nhận.
5. Provider trả kết quả gửi.
6. CAB ghi nhận trạng thái gửi.

### Alternative / Exception Flows

* **A1.** Provider không thể gửi → CAB ghi nhận trạng thái thất bại.
* **A2.** Provider gặp lỗi → Các chức năng nghiệp vụ khác của CAB vẫn tiếp tục
  hoạt động.

### Business Rules

* BRULE18
* BRULE19
* BRULE23

### Related FR

* FR55–FR61

---

# 12.6. Use Case Relationship Summary

Các Use Case chính có quan hệ nghiệp vụ với nhau như sau:

```text
                         CUSTOMER
                            │
                            ▼
                    UC04 Đặt chuyến xe
                            │
                            ▼
                  Tìm và phân công tài xế
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
      UC14 Chấp nhận                 UC15 Từ chối
             │                             │
             │                             └──────► Tìm Driver khác
             ▼
      UC16 Cập nhật trạng thái
             │
             ▼
       UC05 Theo dõi chuyến
             │
             ▼
        Trip hoàn thành
             │
       ┌─────┴──────┐
       ▼            ▼
   UC07 Thanh toán  UC08 Đánh giá
       │
       ▼
UC30 Payment Provider
```

---

# 12.7. Use Case Traceability

| Use Case                              | Business Requirement | Functional Requirements |
| ------------------------------------- | -------------------- | ----------------------- |
| **UC01** Đăng ký tài khoản            | BR12                 | FR01–FR02               |
| **UC02** Đăng nhập                    | BR12, BR20           | FR03–FR04               |
| **UC03** Quản lý thông tin cá nhân    | BR12                 | FR05–FR06               |
| **UC04** Đặt chuyến xe                | BR01                 | FR15–FR20               |
| **UC05** Theo dõi chuyến              | BR04                 | FR35–FR37               |
| **UC06** Xem lịch sử chuyến           | BR13                 | FR62–FR64               |
| **UC07** Thanh toán                   | BR09                 | FR45–FR54               |
| **UC08** Đánh giá tài xế              | BR14                 | FR65–FR66               |
| **UC09** Nhận thông báo               | BR11                 | FR55–FR59               |
| **UC10** Đăng nhập Driver             | BR20                 | FR11–FR12               |
| **UC11** Quản lý hồ sơ Driver         | BR05                 | FR09–FR10               |
| **UC12** Cập nhật trạng thái sẵn sàng | BR05                 | FR13–FR14               |
| **UC13** Nhận yêu cầu chuyến          | BR02                 | FR22–FR25, FR29–FR30    |
| **UC14** Chấp nhận chuyến             | BR02                 | FR31, FR33–FR34         |
| **UC15** Từ chối chuyến               | BR03                 | FR26, FR32              |
| **UC16** Cập nhật trạng thái chuyến   | BR06                 | FR37–FR40               |
| **UC17** Cập nhật vị trí              | BR07                 | FR21, FR35–FR36         |
| **UC18** Xem lịch sử chuyến           | BR13                 | **Cần bổ sung FR**      |
| **UC19** Nhận thông báo               | BR11                 | FR60–FR61               |
| **UC20** Đăng nhập quản trị           | BR18, BR20           | FR82–FR83               |
| **UC21** Quản lý Customer             | BR15                 | FR67–FR69               |
| **UC22** Quản lý Driver               | BR15                 | FR70–FR72               |
| **UC23** Quản lý Vehicle              | BR15                 | FR73                    |
| **UC24** Quản lý Trip                 | BR15                 | FR75–FR77               |
| **UC25** Theo dõi chuyến đang diễn ra | BR16                 | FR75–FR77               |
| **UC26** Xử lý chuyến bị lỗi          | BR16                 | FR78                    |
| **UC27** Tra cứu giao dịch            | BR17                 | FR79–FR81               |
| **UC28** Xem báo cáo hoạt động        | BR19                 | FR86, FR88–FR90         |
| **UC29** Xem chỉ số kinh doanh        | BR19                 | FR87–FR90               |
| **UC30** Xử lý thanh toán điện tử     | BR09                 | FR48–FR51               |
| **UC31** Gửi thông báo                | BR11                 | FR55–FR61               |

---

# 12.8. Các điểm cần xác nhận trước khi chuyển sang bước tiếp theo

Sau khi đặc tả Use Case, vẫn còn một số điểm **không nên tự quyết định**:

| ID       | Vấn đề          | Cần xác nhận                                                                 |
| -------- | --------------- | ---------------------------------------------------------------------------- |
| **UQ01** | Đăng ký Driver  | Driver tự đăng ký hay chỉ Operator tạo tài khoản? Hay hỗ trợ cả hai?         |
| **UQ02** | Login           | Cơ chế đăng nhập của Customer, Driver và Operator có giống nhau không?       |
| **UQ03** | Driver Matching | Tiêu chí chính xác để lựa chọn Driver là gì?                                 |
| **UQ04** | Driver timeout  | Sau bao lâu không phản hồi thì chuyển sang Driver khác?                      |
| **UQ05** | Matching        | Hệ thống gửi cho từng Driver tuần tự hay nhiều Driver cùng lúc?              |
| **UQ06** | Trip status     | Có được phép quay ngược trạng thái hay chỉ đi theo một chiều?                |
| **UQ07** | Fare            | Công thức tính cước cụ thể là gì?                                            |
| **UQ08** | Payment         | Thanh toán tiền mặt được xác nhận bởi Driver, Customer hay Operator?         |
| **UQ09** | Payment retry   | Cho phép thử lại thanh toán bao nhiêu lần?                                   |
| **UQ10** | Cancellation    | Customer và Driver có được hủy chuyến không? Quy trình thế nào?              |
| **UQ11** | Location        | Tần suất cập nhật vị trí Driver là bao nhiêu?                                |
| **UQ12** | Notification    | Những kênh thông báo nào được triển khai trong phiên bản đầu tiên?           |
| **UQ13** | Review          | Có giới hạn thời gian để Customer đánh giá không?                            |
| **UQ14** | Vehicle         | Một Driver được quản lý bao nhiêu Vehicle?                                   |
| **UQ15** | Operator        | Operator có những Role nào và quyền của từng Role ra sao?                    |
| **UQ16** | Reporting       | Báo cáo cần lọc theo thời gian, khu vực, loại xe hay Driver không?           |
| **UQ17** | Data retention  | Dữ liệu Trip, Payment, Location và Audit Log được lưu bao lâu?               |
| **UQ18** | Network failure | Khi Customer/Driver mất mạng thì trạng thái và giao dịch được xử lý thế nào? |

---

# 12.9. Kiểm tra tính đầy đủ của Use Case Model

Trước khi chuyển sang các bước thiết kế tiếp theo, cần kiểm tra:

* Mỗi Actor đều có Use Case phù hợp.
* Mỗi Use Case đều có mục tiêu nghiệp vụ rõ ràng.
* Mỗi Use Case có thể truy ngược về BR/FR.
* Main Flow không chứa các Business Rule chưa được xác nhận.
* Alternative Flow bao phủ các trường hợp lỗi quan trọng.
* Các External System được xác định rõ.
* Các Open Question được tách riêng, không biến thành giả định.
* Các Use Case có thể dùng làm cơ sở xây dựng Sequence Diagram.
* Các Use Case có thể dùng để xây dựng Acceptance Criteria và Test Case.

> **Lưu ý quan trọng:** Use Case Specification không nên biến thành tài liệu
> thiết kế kỹ thuật. Các chi tiết như REST API, database query, microservice,
> Kafka, Redis, Docker... nên được xác định ở các bước System Design/Technical
> Design, không đưa vào Main Flow của Use Case nếu khách hàng chưa yêu cầu.

---

# 12.10. Recommended Next Step

Sau bước 12, quy trình phân tích có thể tiếp tục theo hướng:

```text
Business Problem
       ↓
Business Goals
       ↓
Scope
       ↓
Business Requirements
       ↓
Functional Requirements
       ↓
Business Rules
       ↓
Data Modeling
       ↓
Non-Functional Requirements
       ↓
Use Case Modeling
       ↓
Use Case Specification
       ↓
Activity Diagram
       ↓
Sequence Diagram
       ↓
System / Component Design
       ↓
Database Design
       ↓
Acceptance Criteria
       ↓
Test Cases
```

Đặc biệt, **UC04 → Driver Matching → UC14/UC15 → UC16 → UC07** là chuỗi
nghiệp vụ quan trọng nhất của CAB. Nên ưu tiên lấy chuỗi này để xây dựng
**Activity Diagram và Sequence Diagram đầu tiên**, thay vì vẽ toàn bộ 31 UC
một cách dàn trải.
