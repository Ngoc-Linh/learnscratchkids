export type GuideCategory = "PRACTICE" | "EXAM";

export type GuideArticleFields = {
  category: GuideCategory;
  title: string;
  summary: string;
  prompt: string;
  imageUrl: string;
  imageAlt: string;
  blockCode: string;
  algorithm: string[];
  explanation: string;
  published: boolean;
};

export type GuideArticle = GuideArticleFields & {
  id: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

type GuideSeedArticle = Omit<GuideArticleFields, "published"> & { slug: string };

const seedArticles: GuideSeedArticle[] = [
  {
    category: "PRACTICE",
    title: "Luyện tập: Game Hứng Táo",
    slug: "luyen-tap-game-hung-tao",
    summary: "Thực hành biến số, vòng lặp, điều kiện và phát hiện va chạm qua trò chơi hứng táo.",
    prompt:
      "Điều khiển giỏ bằng phím trái/phải để hứng táo rơi. Mỗi quả táo được hứng cộng 1 điểm; táo chạm đất làm mất 1 mạng. Bắt đầu với 3 mạng và kết thúc khi số mạng bằng 0.",
    imageUrl: "/images/giai-de/game-hung-tao.svg",
    imageAlt: "Các khối Scratch minh họa vòng lặp táo rơi và cập nhật điểm",
    blockCode: `SÂN KHẤU\nKhi bấm cờ xanh\n  đặt [Điểm] thành 0\n  đặt [Mạng] thành 3\n  gửi tin [Bắt đầu]\n\nGIỎ\nKhi nhận [Bắt đầu]\n  liên tục\n    nếu phím phải được nhấn → thay đổi x một lượng 8\n    nếu phím trái được nhấn → thay đổi x một lượng -8\n\nTÁO\nKhi nhận [Bắt đầu]\n  liên tục\n    đi tới x ngẫu nhiên, y 170\n    lặp đến khi chạm Giỏ hoặc y < -160\n      thay đổi y một lượng -5\n      đợi 0.03 giây\n    nếu chạm Giỏ → thay đổi [Điểm] một lượng 1\n    nếu không → thay đổi [Mạng] một lượng -1\n    nếu [Mạng] = 0 → gửi tin [Kết thúc]`,
    algorithm: [
      "Khởi tạo Điểm = 0 và Mạng = 3 đúng một lần khi bấm cờ xanh.",
      "Giỏ đọc phím liên tục, thay đổi tọa độ x theo hướng tương ứng và giới hạn chuyển động trong sân khấu.",
      "Táo bắt đầu ở vị trí x ngẫu nhiên phía trên. Vòng lặp làm táo rơi từng bước cho tới khi chạm giỏ hoặc chạm đáy.",
      "Sau khi vòng lặp kết thúc, chỉ xử lý một kết quả: chạm giỏ thì cộng điểm; chạm đáy thì trừ mạng.",
      "Khi mạng bằng 0, gửi thông điệp kết thúc để sân khấu hiển thị thông báo và dừng trò chơi.",
    ],
    explanation:
      "Tách chương trình thành ba vai trò giúp tìm lỗi dễ hơn: Sân khấu khởi tạo và điều phối, Giỏ nhận bàn phím, Táo xử lý lượt rơi.\n\nĐiểm quan trọng là kiểm tra va chạm sau vòng lặp rơi. Nếu đặt lệnh cộng điểm bên trong vòng lặp, một lần chạm có thể được tính nhiều lần. Mỗi lượt táo phải kết thúc bằng đúng một trong hai nhánh: được hứng hoặc bị bỏ lỡ.\n\nHãy thử các tình huống: bắt đầu lại phải đặt Điểm về 0 và Mạng về 3; hứng một quả chỉ cộng đúng 1; bỏ lỡ một quả chỉ trừ đúng 1; giỏ không được đi ra ngoài sân khấu.",
  },
  {
    category: "PRACTICE",
    title: "Luyện tập: Đèn giao thông tự động",
    slug: "luyen-tap-den-giao-thong",
    summary: "Dùng thông điệp, trang phục và bộ đếm thời gian để mô phỏng đèn xanh - vàng - đỏ.",
    prompt:
      "Tạo đèn giao thông tự đổi màu theo chu kỳ: xanh 5 giây, vàng 2 giây, đỏ 5 giây rồi lặp lại. Hiển thị tên màu hiện tại bằng lời thoại hoặc biến.",
    imageUrl: "/images/giai-de/den-giao-thong.svg",
    imageAlt: "Các khối Scratch minh họa chu kỳ đèn giao thông",
    blockCode: `ĐÈN GIAO THÔNG\nKhi bấm cờ xanh\n  liên tục\n    chuyển trang phục thành [Xanh]\n    nói [Đèn xanh] trong 5 giây\n    chuyển trang phục thành [Vàng]\n    nói [Đèn vàng] trong 2 giây\n    chuyển trang phục thành [Đỏ]\n    nói [Đèn đỏ] trong 5 giây`,
    algorithm: [
      "Tạo ba trang phục có tên Xanh, Vàng, Đỏ và kiểm tra thứ tự trước khi lập trình.",
      "Bắt đầu tại trang phục Xanh để lần chạy đầu tiên luôn có trạng thái rõ ràng.",
      "Lần lượt đổi trang phục và chờ đúng thời lượng quy định.",
      "Đặt toàn bộ chu kỳ trong khối liên tục để sau đèn đỏ chương trình quay lại đèn xanh.",
      "Nếu muốn đồng bộ nhiều nhân vật, phát tin Xanh/Vàng/Đỏ và để từng nhân vật phản hồi tin tương ứng.",
    ],
    explanation:
      "Đề bài là một chuỗi trạng thái tuần hoàn. Mỗi trạng thái gồm hai thao tác: hiển thị màu và chờ đủ thời gian. Vòng lặp liên tục đóng vai trò nối trạng thái cuối (đỏ) về trạng thái đầu (xanh).\n\nDùng thời gian chờ riêng cho từng màu thay vì một khoảng chờ chung. Kiểm thử bằng đồng hồ: một chu kỳ chuẩn dài 12 giây (5 + 2 + 5). Nếu chu kỳ bắt đầu ở màu khác, hãy đặt trang phục đầu tiên ngay dưới sự kiện cờ xanh.",
  },
  {
    category: "EXAM",
    title: "Đề thi mẫu: Mê cung tìm chìa khóa",
    slug: "de-thi-me-cung-tim-chia-khoa",
    summary: "Đề tổng hợp điều khiển, cảm biến màu, biến trạng thái, phát tin và xử lý điều kiện thắng.",
    prompt:
      "Trong mê cung, nhân vật di chuyển bằng bốn phím và không được xuyên tường. Người chơi phải lấy chìa khóa trước khi chạm cửa. Nếu chưa có chìa, cửa từ chối; nếu đã lấy chìa, hiện lời chúc và kết thúc màn chơi.",
    imageUrl: "/images/giai-de/me-cung-chia-khoa.svg",
    imageAlt: "Các khối Scratch minh họa di chuyển trong mê cung và điều kiện mở cửa",
    blockCode: `NHÂN VẬT\nKhi bấm cờ xanh\n  đặt [Đã có chìa] thành 0\n  đi tới điểm xuất phát\n  liên tục\n    nếu phím phải → đổi x 4\n      nếu chạm màu tường → đổi x -4\n    nếu phím trái → đổi x -4\n      nếu chạm màu tường → đổi x 4\n\nCHÌA KHÓA\nKhi bấm cờ xanh → hiện\nLiên tục\n  nếu chạm Nhân vật\n    đặt [Đã có chìa] thành 1\n    ẩn\n\nCỬA\nLiên tục\n  nếu chạm Nhân vật\n    nếu [Đã có chìa] = 1 → gửi tin [Thắng]\n    nếu không → nói [Hãy tìm chìa khóa trước!]`,
    algorithm: [
      "Khi bắt đầu, đặt biến Đã có chìa = 0, đưa nhân vật về điểm xuất phát và hiện lại chìa khóa.",
      "Mỗi lần bấm hướng, di chuyển một bước nhỏ. Nếu chạm đúng màu tường thì hoàn tác bước vừa đi.",
      "Khi nhân vật chạm chìa, đặt Đã có chìa = 1, phát hiệu ứng và ẩn chìa để không thể nhặt lặp.",
      "Cửa kiểm tra va chạm. Chỉ khi biến Đã có chìa bằng 1 mới gửi thông điệp Thắng.",
      "Sân khấu nhận Thắng, hiện kết quả và dừng trò chơi. Không dừng ở nhánh cửa bị khóa.",
    ],
    explanation:
      "Bài thi có ba trạng thái chính: chưa có chìa, đã có chìa và đã thắng. Biến Đã có chìa ghi nhớ tiến độ giữa các lần nhân vật chạm vật thể.\n\nĐể không xuyên tường, dùng bước di chuyển nhỏ (3–5 đơn vị) rồi kiểm tra va chạm; nếu chạm màu tường thì trả nhân vật về vị trí vừa trước bước đó. Màu tường trong cảm biến phải trùng màu trên mê cung.\n\nKiểm thử bắt buộc: chạm cửa trước chìa thì chưa thắng; lấy chìa thì chìa biến mất; sau đó chạm cửa mới thắng; bấm cờ xanh lần nữa thì biến trở về 0 và chìa xuất hiện lại.",
  },
  {
    category: "EXAM",
    title: "Đề thi mẫu: Quiz 5 câu hỏi",
    slug: "de-thi-quiz-5-cau-hoi",
    summary: "Đề vận dụng biến điểm, danh sách câu hỏi, toán tử so sánh và thông báo kết quả.",
    prompt:
      "Tạo trò chơi hỏi đáp 5 câu. Mỗi câu trả lời đúng được 2 điểm, sai không bị trừ điểm. Sau câu thứ 5, hiển thị tổng điểm và lời nhận xét phù hợp.",
    imageUrl: "/images/giai-de/quiz-5-cau.svg",
    imageAlt: "Các khối Scratch minh họa nhập câu trả lời và cộng điểm quiz",
    blockCode: `SÂN KHẤU\nKhi bấm cờ xanh\n  đặt [Điểm] thành 0\n  đặt [Câu] thành 1\n  lặp lại 5 lần\n    hỏi [Câu hỏi số (Câu)] và đợi\n    nếu <trả lời = đáp án đúng> thì\n      thay đổi [Điểm] một lượng 2\n      nói [Chính xác!] trong 1 giây\n    nếu không\n      nói [Thử lại ở câu sau nhé!] trong 1 giây\n    thay đổi [Câu] một lượng 1\n  nói [Tổng điểm]`,
    algorithm: [
      "Đặt Điểm = 0 và Câu = 1 lúc bắt đầu để mỗi lần chơi bắt đầu sạch.",
      "Lặp đúng 5 lần; mỗi lượt hiển thị câu hỏi tương ứng với chỉ số Câu và chờ người chơi nhập câu trả lời.",
      "So sánh trả lời với đáp án. Nếu đúng cộng 2; nếu sai chỉ thông báo, không thay đổi Điểm.",
      "Tăng Câu sau khi xử lý xong câu hỏi hiện tại để chuyển sang câu tiếp theo.",
      "Sau vòng lặp, kiểm tra tổng điểm và đưa ra nhận xét theo các mốc (0–4, 6–8, 10 điểm).",
    ],
    explanation:
      "Vòng lặp giúp tránh sao chép năm cụm lệnh giống nhau. Nếu đề yêu cầu câu hỏi khác nhau, có thể lưu câu hỏi và đáp án trong hai danh sách cùng vị trí: Câu hỏi số 1 so với Đáp án số 1.\n\nKhối hỏi và đợi lưu nội dung người chơi nhập trong biến trả lời. Phép so sánh cần thống nhất chữ hoa/thường và khoảng trắng nếu đáp án là văn bản; với câu trả lời số, dùng kiểu dữ liệu số.\n\nĐiểm tối đa là 10. Kiểm thử lần lượt trả lời đúng cả 5 câu (10 điểm), sai cả 5 câu (0 điểm), và đúng xen kẽ để xác nhận mỗi câu đúng chỉ được cộng 2 điểm.",
  },
];

export function createGuideSeedArticles() {
  const now = new Date();
  return seedArticles.map((article, index) => ({
    ...article,
    id: `guide-seed-${index + 1}`,
    published: true,
    createdAt: now,
    updatedAt: now,
  }));
}
