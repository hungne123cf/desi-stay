# 🇮🇳 YuvaStays - Tài Liệu Bàn Giao & Hướng Dẫn Vận Hành Cho Khách Hàng (Handover Guide)

Tài liệu này được soạn sẵn để bạn **bàn giao trực tiếp cho khách hàng mua web** hoặc dùng để tự vận hành hệ thống kinh doanh phòng trọ / nhà ở sinh viên Ấn Độ (**Student Housing & Co-Living Platform**).

---

## 🌟 1. Tổng Quan Giá Trị Thương Mại Của Website

Website được thiết kế đặc thù theo chuẩn hành vi thuê nhà của **sinh viên và phụ huynh Ấn Độ**:
* **Bộ lọc văn hóa đặc thù:** Lọc theo ăn uống (**Pure Veg Mess, Jain Food, Self-Cook**), giới tính (**Boys Only, Girls Only, Co-Ed**), phòng tắm riêng (**Attached Bath**), và khoảng cách đi bộ tới trường (**Walking Distance to Campus**).
* **Cam kết vàng:** **Zero Brokerage (0% phí môi giới)** – Yếu tố số 1 giúp sinh viên Ấn lựa chọn website thay vì qua cò mồi truyền thống.
* **Tích hợp WhatsApp 1-Chạm:** Tự động điền mã phòng và câu hỏi khi sinh viên bấm liên hệ qua WhatsApp.
* **Cơ chế Giữ phòng (Holding Token Deposit):** Thu cọc nhỏ online (₹1,500 – ₹2,500) qua **UPI (PhonePe, GPay, Paytm) / Thẻ** để xác nhận giữ phòng trong 48 giờ.
* **Hệ thống Quản trị (Admin Portal):** Quản lý toàn bộ danh sách phòng, thêm ảnh, sửa giá, theo dõi danh sách sinh viên đặt lịch.

---

## 🚀 2. Hướng Dẫn Triển Khai (Deploy) Lên Vercel Miễn Phí (Trong 3 Phút)

Website được xây dựng trên nền tảng **Next.js App Router + Tailwind CSS**, tương thích 100% với **Vercel** (miễn phí hosting vĩnh viễn):

1. **Bước 1:** Đẩy mã nguồn thư mục này lên **GitHub** (tạo repo cá nhân hoặc repo cho khách).
2. **Bước 2:** Truy cập [Vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
3. **Bước 3:** Bấm **"Add New Project"** -> Chọn repository `desi-stay`.
4. **Bước 4:** Ở phần Cấu hình:
   * **Framework Preset:** Next.js (Hệ thống tự nhận diện).
   * Bấm nút **"Deploy"**.
5. **Gắn Tên Miền (Custom Domain):**
   * Vào **Project Settings > Domains** trên Vercel.
   * Nhập tên miền khách sở hữu (ví dụ: `yuvastays.in` hoặc `desistudenthousing.com`).
   * Trỏ bản ghi DNS CNAME theo hướng dẫn trên màn hình Vercel là website sẽ kích hoạt SSL HTTPS tự động.

---

## 🔐 3. Hướng Dẫn Cấu Hình Đăng Nhập Google (Google OAuth)

Website đã tích hợp sẵn giao diện và luồng đăng nhập bằng Google. Khi muốn kết nối vào tài khoản Google Console thật của khách hàng:

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Tạo một **Project mới** (ví dụ: *YuvaStays Auth*).
3. Vào **APIs & Services > Credentials** > Chọn **Create Credentials > OAuth client ID**.
4. Chọn **Web application**:
   * **Authorized JavaScript origins:** Nhập link web của bạn (ví dụ: `https://yuvastays.in`).
   * **Authorized redirect URIs:** Nhập `https://yuvastays.in/auth/callback`.
5. Copy **Client ID** và **Client Secret** lưu vào file môi trường `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

---

## 💳 4. Hướng Dẫn Cấu Hình Cổng Thanh Toán Razorpay (UPI & Thẻ Ấn Độ)

Để tiền cọc Token của sinh viên chạy thẳng về tài khoản ngân hàng Ấn Độ của chủ web:

1. Đăng ký tài khoản tại [Razorpay.com](https://razorpay.com) (Cổng thanh toán số 1 Ấn Độ).
2. Vào **Settings > API Keys > Generate Key**.
3. Bạn sẽ nhận được `Key ID` (bắt đầu bằng `rzp_live_...` hoặc `rzp_test_...`).
4. Truy cập vào trang Quản trị của website:
   * Đường dẫn: `https://domain-cua-ban/admin`
   * Chọn tab **"Payment & WhatsApp Settings"**.
   * Dán `Razorpay Key ID` và `Số WhatsApp nhận thông báo` vào form rồi bấm **"Save Settings"**.
5. Ngoài ra, website hỗ trợ cả hình thức **Pay on Visit (Thanh toán cọc trực tiếp khi tới xem phòng)** dành cho những sinh viên muốn xem phòng tận mắt trước khi xuống tiền.

---

## 🛠️ 5. Hướng Dẫn Sử Dụng Trang Quản Trị (Admin Dashboard - `/admin`)

Trang Admin đã được phân quyền và bảo vệ.

### Tài khoản Demo Admin có sẵn:
* **Email:** `admin@desistays.com`
* **Mật khẩu:** Bất kỳ (hoặc bấm nút *"Demo Admin"* tại trang `/auth/login` để vào ngay).
* **Hoặc:** Bấm vào nút chọn vai trò **"Role: Student / Admin"** ở góc phải thanh menu trên cùng để chuyển đổi 1-chạm.

### Các thao tác chính trong Admin:
1. **Thêm phòng trọ mới (Add Listing):**
   * Bấm nút màu cam **"+ Add New Listing"**.
   * Điền Tên phòng, Thành phố (Bengaluru, Pune, Delhi NCR, Kota, Can Tho - Vietnam MBBS Hub), Trường đại học gần nhất, Khoảng cách đi bộ, Loại phòng (Single, Twin, Triple, Studio), Tùy chọn đồ ăn (Pure Veg, Jain, Non-Veg), Giá thuê/tháng và Số tiền cọc Token.
   * Dán link ảnh phòng và bấm **"Publish Listing"** -> Phòng sẽ hiển thị ngay ngoài trang chủ.
2. **Quản lý Khách đặt cọc & Lead (Bookings Tracker):**
   * Vào tab **"Student Bookings & Leads"**.
   * Bảng hiển thị: Tên sinh viên, SĐT WhatsApp, Trường đang học, Mã phòng muốn thuê, Số tiền cọc đã trả.
   * Có nút bấm màu xanh **"WhatsApp"**: Click là mở ngay cửa sổ chat với sinh viên để tư vấn tiếp.
   * Có thể đổi trạng thái đơn: *Token Paid -> Confirmed -> Check-in*.

---

## 💬 6. Mẹo Tăng Doanh Số Khi Chăm Sóc Sinh Viên Ấn Độ Qua WhatsApp

1. **Phản hồi siêu tốc (dưới 5 phút):** Sinh viên Ấn thường nhắn tin cho 3–4 nơi cùng lúc, bên nào trả lời nhanh bằng tiếng Anh thân thiện (*"Namaste / Hello! Yes, room is available, would you like a video call tour?"*) sẽ chiếm ưu thế chốt đơn 80%.
2. **Gửi Video Tour thực tế:** Sinh viên và phụ huynh rất sợ phòng thực tế khác ảnh chụp. Hãy quay 1 video ngắn 30 giây đi từ cổng vào phòng, mở tủ lạnh, quay khu bếp Pure Veg gửi qua WhatsApp.
3. **Nhấn mạnh sự đồng hương:** Nếu có các sinh viên cùng bang (ví dụ sinh viên Gujarat, Maharashtra, Tamil Nadu, Kerala,...) đang ở, hãy giới thiệu để các bạn cảm thấy an tâm và có cộng đồng hỗ trợ việc học.
