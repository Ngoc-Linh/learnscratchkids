// Bài viết blog / Góc phụ huynh. Dòng bắt đầu bằng "## " là tiêu đề nhỏ.
// Đây là nội dung nháp - hãy chỉnh sửa theo giọng văn của bạn.

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Phương pháp" | "Thực hành tại nhà" | "Định hướng";
  date: string; // YYYY-MM-DD
  body: string[];
};

export const POSTS: Post[] = [
  {
    slug: "vi-sao-nen-cho-con-hoc-lap-trinh-som",
    title: "Vì sao nên cho con làm quen với lập trình từ sớm?",
    excerpt:
      "Lập trình không chỉ để trở thành kỹ sư. Đó là cách để trẻ học tư duy logic, kiên nhẫn và dám thử sai.",
    category: "Phương pháp",
    date: "2026-10-01",
    body: [
      "Trong thời đại số, trẻ tiếp xúc với màn hình từ rất sớm. Điều quan trọng không phải là cấm hoàn toàn, mà là giúp con chuyển từ vai trò người tiêu thụ sang người tạo ra.",
      "## Lập trình dạy con điều gì?",
      "Khi tự làm một trò chơi, con phải chia bài toán lớn thành các bước nhỏ, dự đoán điều gì sẽ xảy ra, rồi kiểm tra và sửa lỗi. Đó chính là tư duy logic và tư duy giải quyết vấn đề.",
      "## Vì sao chọn Scratch?",
      "Scratch dùng các khối lệnh kéo thả nên con không cần gõ chính xác từng ký tự. Con có thể tập trung vào ý tưởng và thấy kết quả ngay lập tức, nhờ vậy dễ giữ hứng thú.",
      "## Bố mẹ có cần biết lập trình không?",
      "Không cần. Điều con cần nhất là một người lắng nghe con kể về sản phẩm của mình và khích lệ khi con gặp lỗi.",
    ],
  },
  {
    slug: "5-hoat-dong-thuc-hanh-scratch-cung-con",
    title: "5 hoạt động thực hành Scratch cùng con tại nhà",
    excerpt: "Những gợi ý đơn giản để bố mẹ đồng hành cùng con mà không cần kiến thức lập trình.",
    category: "Thực hành tại nhà",
    date: "2026-10-10",
    body: [
      "Bố mẹ không cần là người giỏi công nghệ để đồng hành cùng con. Dưới đây là vài hoạt động nhỏ, mỗi lần 15-20 phút.",
      "## 1. Mời con làm 'giáo viên'",
      "Hãy nhờ con giải thích sản phẩm của con: nhân vật làm gì, vì sao game tính điểm như vậy. Khi giải thích, con hệ thống lại kiến thức.",
      "## 2. Chơi thử và góp ý",
      "Chơi thử game của con và nói điều bạn thích trước, sau đó hỏi: 'Nếu thêm một điều mới thì con sẽ thêm gì?'.",
      "## 3. Thử thách 'Sửa lỗi cùng nhau'",
      "Khi game không chạy đúng, đừng sửa hộ. Hãy hỏi: 'Con nghĩ lỗi nằm ở đâu? Mình thử chia nhỏ ra từng đoạn nhé.'",
      "## 4. Vẽ kế hoạch trên giấy",
      "Trước khi làm, cho con vẽ nhanh nhân vật, màn chơi và luật chơi ra giấy. Thói quen lên kế hoạch rất quan trọng.",
      "## 5. Đặt giờ chơi - giờ tạo",
      "Thỏa thuận với con: mỗi buổi dành một phần thời gian để chơi, một phần để tạo. Con sẽ dần thấy tạo ra game thú vị không kém chơi game.",
    ],
  },
  {
    slug: "tu-scratch-sang-python-khi-nao-con-san-sang",
    title: "Từ Scratch sang Python: khi nào con đã sẵn sàng?",
    excerpt: "Những dấu hiệu cho thấy con có thể bắt đầu làm quen với việc gõ mã nguồn.",
    category: "Định hướng",
    date: "2026-10-20",
    body: [
      "Scratch là bước đệm tuyệt vời, nhưng sau một thời gian nhiều bạn muốn tạo ra những sản phẩm phức tạp hơn. Đó là lúc có thể nghĩ đến ngôn ngữ gõ lệnh như Python.",
      "## Một số dấu hiệu con đã sẵn sàng",
      "Con đã làm chủ biến số, vòng lặp, điều kiện và tự tạo được khối lệnh. Con thường tự nghĩ ra tính năng mới cho game và tự tìm cách sửa lỗi.",
      "## Chuyển đổi nhẹ nhàng",
      "Khóa chuyển tiếp đối chiếu từng khối lệnh Scratch với câu lệnh Python tương ứng, để con thấy mình không phải học lại từ đầu mà chỉ đang đổi cách viết.",
      "## Lời khuyên",
      "Đừng vội. Nếu con còn đang hứng thú với Scratch, hãy để con tiếp tục sáng tạo thêm; việc chuyển tiếp sẽ tự nhiên hơn khi con cảm thấy Scratch bắt đầu 'chật'.",
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
