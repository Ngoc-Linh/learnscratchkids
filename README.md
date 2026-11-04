# ScratchKids – Website & khóa học lập trình Scratch

Website Next.js 15 (App Router) **gồm cả frontend và backend trong 1 project**, xây theo bản đề án `scratch_website_and_course_proposal.md`.

- **Frontend:** React 19, Tailwind CSS (màu cam & xanh Scratch, font to rõ, thân thiện với trẻ em)
- **Backend:** Route Handlers trong `src/app/api/*`, dữ liệu lưu trong PostgreSQL (Neon), đăng nhập bằng cookie JWT (`jose`) + `bcryptjs`
- **Triển khai:** GitHub → Vercel

## Tính năng theo đề án

| Hạng mục trong đề án | Trạng thái |
|---|---|
| Trang chủ: hero + CTA "Đăng ký học thử 0đ", giá trị mang lại, lộ trình, showcase, cảm nhận | `/` |
| Khóa học: lọc theo tuổi/trình độ, mục tiêu, số buổi, sản phẩm đầu ra, bài học thử | `/khoa-hoc`, `/khoa-hoc/[slug]` |
| Hướng dẫn giải đề Scratch: hai tab Luyện tập / Đề thi, bài viết động, đề bài, hình khối lệnh và giải thích thuật toán | `/huong-dan-giai-de` |
| 4 khóa: Mầm Chồi, Sáng Tạo - Cơ Bản, Game Master, Scratch → Python | `src/lib/courses.ts` |
| Showroom: khách có thể đăng dự án không cần tài khoản; người đăng nhập dùng tên tài khoản. Chơi thử, thả tim, bình luận, bình chọn "Game của tháng" | `/san-pham` |
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
npm run db:deploy           # áp dụng migration PostgreSQL
npm run db:seed             # tạo tài khoản Admin và bài mẫu
npm run dev                 # http://localhost:3000
```

Tạo cơ sở dữ liệu PostgreSQL miễn phí qua tích hợp Neon trong Vercel Marketplace, sau đó cấu hình trong `.env`: `DATABASE_URL` là pooled connection string, `DIRECT_URL` là direct connection string. Cấu hình `ADMIN_PHONE` (mặc định `0342681138`), `ADMIN_PASSWORD` (tối thiểu 12 ký tự) và `AUTH_SECRET` ngẫu nhiên dài. Không đưa các giá trị bí mật vào Git.

Nếu cần giữ dữ liệu local hiện tại, sau khi có PostgreSQL và đã áp dụng schema, chạy `npm run db:import-json` một lần để nhập `scratchkids.json`. File cũ được giữ nguyên làm bản sao lưu; lệnh import có thể chạy lại và bỏ qua bản ghi trùng.

Bốn bài hướng dẫn mẫu (hai bài Luyện tập, hai bài Đề thi) được tạo một lần để làm nội dung khởi đầu; Admin có thể sửa, ẩn hoặc xóa chúng và đăng bài mới. Trên Vercel, quá trình build chạy migration và seed Admin từ các biến môi trường. Lưu ý ảnh tải lên trong `/admin` hiện dùng filesystem; ảnh upload mới cần chuyển sang object storage bền vững (ví dụ Vercel Blob) nếu muốn giữ qua các lần deploy.

## Lưu ý triển khai

PostgreSQL giữ tài khoản và dữ liệu ổn định qua các lần deploy/instance trên Vercel. Trước khi deploy, kết nối Neon và đặt đầy đủ `DATABASE_URL`, `DIRECT_URL`, `ADMIN_PHONE`, `ADMIN_PASSWORD`, `AUTH_SECRET` trong Project Settings → Environment Variables.

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
- Đặt `ADMIN_PHONE` và `ADMIN_PASSWORD` trong `.env` hoặc Environment Variables của Vercel để seed tài khoản quản trị đăng nhập bằng số điện thoại.
- **Nội dung của trẻ em:** bình luận công khai nên có kiểm duyệt (admin hiện chỉ xóa qua API `DELETE /api/comments/[id]`); cân nhắc điều khoản và chính sách bảo mật phù hợp quy định về dữ liệu của trẻ em.

## Cấu trúc thư mục

```
prisma/            schema và migration PostgreSQL
scratchkids.json   dữ liệu JSON cũ (chỉ dùng để import một lần; không đưa lên Git)
scripts/seed.ts    khởi tạo tài khoản quản trị
src/app/           trang (frontend) + api/ (backend)
src/components/    component dùng chung
src/lib/           dữ liệu khóa học, auth, db, tiện ích
vercel.json        cron báo cáo tuần
```
