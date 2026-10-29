# ScratchKids – Website & khóa học lập trình Scratch

Website Next.js 15 (App Router) **gồm cả frontend và backend trong 1 project**, xây theo bản đề án `scratch_website_and_course_proposal.md`.

- **Frontend:** React 19, Tailwind CSS (màu cam & xanh Scratch, font to rõ, thân thiện với trẻ em)
- **Backend:** Route Handlers trong `src/app/api/*`, dữ liệu lưu trực tiếp trong file JSON `scratchkids.json`, đăng nhập bằng cookie JWT (`jose`) + `bcryptjs`
- **Triển khai:** GitHub → Vercel

## Tính năng theo đề án

| Hạng mục trong đề án | Trạng thái |
|---|---|
| Trang chủ: hero + CTA "Đăng ký học thử 0đ", giá trị mang lại, lộ trình, showcase, cảm nhận | `/` |
| Khóa học: lọc theo tuổi/trình độ, mục tiêu, số buổi, sản phẩm đầu ra, bài học thử | `/khoa-hoc`, `/khoa-hoc/[slug]` |
| Hướng dẫn giải đề Scratch: hai tab Luyện tập / Đề thi, bài viết động, đề bài, hình khối lệnh và giải thích thuật toán | `/huong-dan-giai-de` |
| 4 khóa: Mầm Chồi, Sáng Tạo - Cơ Bản, Game Master, Scratch → Python | `src/lib/courses.ts` |
| Showroom: đăng dự án, chơi thử (nhúng Scratch), thả tim, bình luận, bình chọn "Game của tháng" | `/san-pham` |
| Blog / Góc phụ huynh | `/blog`, `/blog/[slug]` (nội dung ở `src/lib/posts.ts`) |
| Đăng ký / tài khoản bằng số điện thoại | `/dang-ky`, `/dang-nhap`, `/tai-khoan` |
| Đăng ký khóa học (video / 1-1 / nhóm, học thử) | `/dang-ky-hoc` → bảng `Enrollment` |
| LMS: tích sao khi nộp bài, đổi quà | `/tai-khoan` (10 ⭐/bài, danh mục quà ở `src/lib/rewards.ts`) |
| Nộp bài bằng link dự án Scratch / link file `.sb3` | `/tai-khoan` |
| Quản lý tài khoản, học thử, bài nộp, đổi quà và đăng/sửa/xóa bài hướng dẫn kèm hình minh họa | `/admin` |
| Báo cáo tiến độ hằng tuần cho phụ huynh | Cron `/api/cron/weekly-report` (email qua Resend) |

## Chạy trên máy

```powershell
npm install
Copy-Item .env.example .env # chỉ cần khi chưa có .env
npm run db:seed             # tạo tài khoản admin nếu đã đặt ADMIN_PHONE, ADMIN_PASSWORD trong .env
npm run dev                 # http://localhost:3000
```

Ứng dụng tự tạo `scratchkids.json` ở thư mục gốc khi có thao tác đọc/ghi đầu tiên. File được `.gitignore` để tránh đưa thông tin tài khoản và dữ liệu học viên lên Git. Bốn bài hướng dẫn mẫu (hai bài Luyện tập, hai bài Đề thi) được tạo một lần để làm nội dung khởi đầu; Admin có thể sửa, ẩn hoặc xóa chúng và đăng bài mới. Ảnh tải lên từ `/admin` nằm trong `public/uploads/guide/`; hãy sao lưu thư mục này cùng `scratchkids.json`. `.env` chỉ chứa cấu hình tùy chọn như tài khoản admin ban đầu, email và cron; không cần PostgreSQL hay `DATABASE_URL`.

## Lưu ý triển khai

File JSON phù hợp chạy local hoặc một máy chủ Node.js có ổ đĩa ghi bền vững. Không triển khai cách lưu này trên Vercel/serverless hoặc nhiều instance: filesystem thường không bền vững và các instance không chia sẻ cùng file. Hãy sao lưu `scratchkids.json` thường xuyên; file chứa dữ liệu cá nhân và mật khẩu đã băm.

## Cần thay bằng nội dung thật của bạn

- `src/lib/site.ts`: **lời cảm nhận đang là nội dung MẪU** (có ghi chú hiển thị trên trang) – hãy thay bằng phản hồi thật rồi đặt `TESTIMONIALS_ARE_SAMPLE = false`. Cũng ở đây: lộ trình, giá trị mang lại, dự án mẫu.
- `src/lib/courses.ts`: tên các buổi học là **bản nháp** do mình soạn dựa trên mục tiêu/sản phẩm trong đề án; thêm `trialVideoEmbed` (link nhúng YouTube) để hiện video học thử.
- `src/lib/posts.ts`: 3 bài blog nháp.
- Học phí: bản đề án chưa nêu nên website **không hiển thị giá** (đang ghi "liên hệ để được tư vấn").
- Biến `NEXT_PUBLIC_HERO_VIDEO_EMBED`: video demo ở hero trang chủ.

## Giới hạn hiện tại / việc nên làm tiếp

- **Nộp file `.sb3`:** hiện chỉ nộp bằng *link* (Scratch, Google Drive...). Muốn tải file trực tiếp, thêm Vercel Blob/S3.
- **Báo cáo qua Zalo:** mới có email (Resend). Zalo cần đăng ký Zalo Official Account API.
- **Khóa video quay sẵn:** chưa có trình phát bài giảng trả phí/phân quyền; hiện đăng ký học được ghi nhận để trung tâm liên hệ. Chưa tích hợp thanh toán online.
- **Chống spam:** chưa có rate-limit/captcha cho form đăng ký và đăng nhập (nên thêm Vercel Firewall hoặc Upstash Ratelimit khi chạy thật).
- `/admin` thống kê số đăng ký học thử, quản lý trạng thái đăng ký và xem tài khoản; quản trị viên có thể cập nhật số điện thoại đăng nhập hoặc khóa/mở tài khoản.
- Quản trị viên có thể tạo, chỉnh sửa tên/số điện thoại/vai trò, khóa/mở và xóa tài khoản. Xóa tài khoản sẽ xóa dữ liệu học tập liên quan, nhưng giữ lại đăng ký học thử đã gửi.
- Đặt `ADMIN_PHONE` và `ADMIN_PASSWORD` trong `.env`, sau đó chạy `npm run db:seed` để tạo tài khoản quản trị đăng nhập bằng số điện thoại.
- **Nội dung của trẻ em:** bình luận công khai nên có kiểm duyệt (admin hiện chỉ xóa qua API `DELETE /api/comments/[id]`); cân nhắc điều khoản và chính sách bảo mật phù hợp quy định về dữ liệu của trẻ em.

## Cấu trúc thư mục

```
scratchkids.json   dữ liệu ứng dụng (tự tạo; không đưa lên Git)
scripts/seed.ts    khởi tạo tài khoản quản trị
src/app/           trang (frontend) + api/ (backend)
src/components/    component dùng chung
src/lib/           dữ liệu khóa học, auth, db, tiện ích
vercel.json        cron báo cáo tuần
```
