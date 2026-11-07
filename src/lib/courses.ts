// Nguồn dữ liệu khóa học (theo bản đề án). Sửa nội dung tại đây, không cần database.
// Tên bài học là bản nháp - hãy chỉnh theo giáo án thật của bạn.

export type CourseColor = "green" | "yellow" | "red" | "blue";

export type Lesson = { no: number; title: string };

export type Course = {
  slug: string;
  title: string;
  level: "Cơ bản (Beginner)" | "Nâng cao (Advanced)" | "Luyện thi Tin học trẻ" | "Python";
  emoji: string;
  color: CourseColor;
  ageMin: number;
  ageMax: number;
  summary: string;
  audience: string;
  prerequisites: string;
  goals: string[];
  outputs: string[];
  lessons: Lesson[];
  // Dán link nhúng YouTube (https://www.youtube.com/embed/...) để hiện video học thử
  trialVideoEmbed?: string;
};

const L = (titles: string[]): Lesson[] => titles.map((title, i) => ({ no: i + 1, title }));

export const LEGACY_COURSES: Course[] = [
  {
    slug: "scratch-mam-choi",
    title: "Scratch Mầm Chồi",
    level: "Cơ bản (Beginner)",
    emoji: "🌱",
    color: "green",
    ageMin: 6,
    ageMax: 8,
    summary:
      "Làm quen với máy tính, thao tác chuột và tư duy thuật toán trực quan qua hình ảnh, nhân vật đơn giản.",
    audience: "Học sinh mới làm quen với máy tính và lập trình.",
    prerequisites: "Không yêu cầu kiến thức lập trình trước.",
    goals: [
      "Làm quen với máy tính và thao tác chuột",
      "Hiểu thuật toán trực quan qua hình ảnh và nhân vật",
      "Tạo được sản phẩm đầu tiên của riêng mình",
    ],
    outputs: ["Hoạt hình thi chạy đơn giản", "Thiệp chúc mừng tương tác"],
    lessons: L([
      "Làm quen máy tính và chuột",
      "Gặp gỡ sân khấu và nhân vật",
      "Cho nhân vật di chuyển",
      "Nhân vật biết nói",
      "Đổi trang phục, tạo hiệu ứng",
      "Thêm âm thanh vui nhộn",
      "Hoạt hình thi chạy",
      "Thiệp chúc mừng tương tác",
    ]),
  },
];

export const COURSES: Course[] = [
  {
    slug: "scratch-sang-tao-co-ban",
    title: "Scratch Cơ bản (Beginner)",
    level: "Cơ bản (Beginner)",
    emoji: "🎨",
    color: "yellow",
    ageMin: 8,
    ageMax: 11,
    summary:
      "Bắt đầu từ sân khấu, nhân vật và khối lệnh; từng bước tự tạo hoạt hình tương tác và trò chơi đầu tiên bằng Scratch.",
    audience: "Bé mới học lập trình hoặc đã biết thao tác máy tính cơ bản.",
    prerequisites: "Không cần biết lập trình; ưu tiên có thể sử dụng chuột và bàn phím.",
    goals: [
      "Làm quen sân khấu, nhân vật và các nhóm khối lệnh Scratch",
      "Biết dùng sự kiện, chuyển động, vòng lặp, điều kiện và cảm biến cơ bản",
      "Lập kế hoạch, thử nghiệm và hoàn thiện một sản phẩm tương tác",
    ],
    outputs: ["Hoạt hình có nhiều nhân vật và lời thoại", "Trò chơi tính điểm, có luật chơi rõ ràng"],
    lessons: L([
      "Khám phá Scratch: sân khấu, nhân vật và phông nền",
      "Lập trình chuyển động và tọa độ",
      "Bắt đầu chương trình bằng sự kiện",
      "Tạo hoạt cảnh bằng trang phục và âm thanh",
      "Dùng vòng lặp để tạo hành động liên tục",
      "Rẽ nhánh với điều kiện nếu - thì",
      "Điều khiển nhân vật bằng bàn phím",
      "Phát hiện chạm và tương tác giữa các nhân vật",
      "Tạo biến điểm và cập nhật kết quả",
      "Dùng thông điệp để phối hợp nhân vật",
      "Thiết kế màn chơi và kiểm thử",
      "Hoàn thiện dự án Scratch đầu tay",
    ]),
  },
  {
    slug: "scratch-nang-cao-game-master",
    title: "Scratch nâng cao (Advanced)",
    level: "Nâng cao (Advanced)",
    emoji: "🎮",
    color: "red",
    ageMin: 10,
    ageMax: 15,
    summary:
      "Mở rộng tư duy lập trình với danh sách, khối lệnh tự tạo, bản sao và thuật toán để xây dựng game nhiều màn chơi.",
    audience: "Bé đã có trải nghiệm làm hoạt hình hoặc trò chơi với Scratch.",
    prerequisites: "Nên biết biến, vòng lặp, điều kiện và thao tác Scratch cơ bản.",
    goals: [
      "Thiết kế chương trình có nhiều trạng thái và nhân vật phối hợp",
      "Sử dụng danh sách, bản sao và khối lệnh tự tạo phù hợp",
      "Tìm lỗi, tối ưu cách tổ chức và hoàn thiện game nhiều màn",
    ],
    outputs: ["Game arcade có điểm số và độ khó tăng dần", "Game nhiều màn với hướng dẫn và trạng thái thắng/thua"],
    lessons: L([
      "Ôn tập và phân tích cấu trúc một trò chơi",
      "Quản lý nhiều biến và trạng thái trò chơi",
      "Dùng danh sách để lưu dữ liệu",
      "Tạo khối lệnh riêng để tái sử dụng thuật toán",
      "Sinh và quản lý bản sao nhân vật",
      "Thiết kế phát hiện va chạm chính xác",
      "Tạo chuyển động, trọng lực và giới hạn sân khấu",
      "Xây dựng hệ thống điểm, mạng và kỷ lục",
      "Thiết kế màn chơi và độ khó tăng dần",
      "Hoàn thiện game arcade nhiều trạng thái",
      "Kiểm thử, tìm lỗi và tối ưu dự án",
      "Trình bày sản phẩm cuối khóa",
    ]),
  },
  {
    slug: "luyen-thi-tin-hoc-tre-scratch",
    title: "Luyện thi Tin học trẻ Scratch",
    level: "Luyện thi Tin học trẻ",
    emoji: "🏅",
    color: "green",
    ageMin: 9,
    ageMax: 15,
    summary:
      "Rèn cách đọc đề, phân tích yêu cầu và vận dụng Scratch để giải bài tập theo mục tiêu ôn luyện của học sinh.",
    audience: "Học sinh muốn củng cố Scratch và luyện giải bài có yêu cầu cụ thể.",
    prerequisites: "Nên nắm được sự kiện, chuyển động, vòng lặp, điều kiện và biến trong Scratch.",
    goals: [
      "Tách yêu cầu đề thành các bước và xác định dữ liệu cần dùng",
      "Vận dụng vòng lặp, điều kiện, biến, cảm biến và thông điệp",
      "Tự kiểm tra kết quả, phát hiện trường hợp biên và trình bày cách giải",
    ],
    outputs: ["Bộ bài thực hành Scratch theo chủ đề", "Bài giải có kiểm thử và phần trình bày thuật toán"],
    lessons: L([
      "Đọc đề, gạch chân yêu cầu và xác định đầu ra",
      "Chia bài toán thành nhân vật, sự kiện và hành động",
      "Ôn tập tọa độ, hướng và điều khiển",
      "Vòng lặp và điều kiện trong bài toán",
      "Biến số, tính điểm và theo dõi trạng thái",
      "Cảm biến chạm, màu sắc và tương tác",
      "Thông điệp và phối hợp nhiều nhân vật",
      "Thiết kế trò chơi theo bộ yêu cầu",
      "Luyện bài toán có nhiều điều kiện",
      "Kiểm thử kết quả và xử lý trường hợp biên",
      "Thực hành đề tổng hợp có giới hạn thời gian",
      "Rà soát lời giải và trình bày sản phẩm",
    ]),
  },
  {
    slug: "chuyen-tiep-scratch-sang-python",
    title: "Lập trình Python",
    level: "Python",
    emoji: "🐍",
    color: "blue",
    ageMin: 11,
    ageMax: 16,
    summary:
      "Làm quen với lập trình dạng văn bản bằng Python qua bài tập nhỏ, tư duy thuật toán và các dự án đầu tiên.",
    audience: "Học sinh sẵn sàng chuyển từ kéo thả sang viết mã lệnh.",
    prerequisites: "Không bắt buộc biết Python; khả năng đọc hiểu và sử dụng máy tính sẽ giúp học tốt hơn.",
    goals: [
      "Hiểu cách nhập lệnh, chạy chương trình và đọc thông báo lỗi",
      "Sử dụng biến, kiểu dữ liệu, điều kiện, vòng lặp và danh sách",
      "Viết hàm và áp dụng vào chương trình nhỏ của riêng mình",
    ],
    outputs: ["Bộ chương trình Python tương tác", "Trò chơi hoặc dự án Python nhỏ cuối khóa"],
    lessons: L([
      "Làm quen môi trường Python và cách chạy mã",
      "In nội dung và nhận dữ liệu từ bàn phím",
      "Biến, số, chuỗi và phép toán",
      "Điều kiện if, elif và else",
      "Vòng lặp for và while",
      "Chuỗi và danh sách",
      "Viết hàm để chia nhỏ chương trình",
      "Đọc lỗi và sửa chương trình từng bước",
      "Xây dựng trò chơi tương tác bằng Python",
      "Hoàn thiện và trình bày dự án cuối khóa",
    ]),
  },
];

export const LEARN_MODES = [
  {
    value: "VIDEO",
    title: "Khóa video quay sẵn",
    desc: "Video ngắn, thực hành ngay trên web, học theo tốc độ của bé. Học phí tối ưu.",
  },
  {
    value: "ONE_ON_ONE",
    title: "Online kèm 1-1",
    desc: "Học qua Zoom/Google Meet, giáo viên sửa lỗi (debug) trực tiếp cho riêng bé.",
  },
  {
    value: "GROUP",
    title: "Lớp nhóm online (1-6 bạn)",
    desc: "Lớp nhỏ, tương tác trực tiếp, bé học và thi đua cùng bạn bè.",
  },
] as const;

export type LearnModeValue = (typeof LEARN_MODES)[number]["value"];

export const LEVELS = COURSES.map((course) => course.level);

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug) ?? LEGACY_COURSES.find((c) => c.slug === slug);
}

export function getLesson(slug: string, no: number): Lesson | undefined {
  return getCourse(slug)?.lessons.find((l) => l.no === no);
}

export const COURSE_COLORS: Record<CourseColor, { bg: string; text: string; ring: string; chip: string }> = {
  green: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", chip: "bg-emerald-100 text-emerald-800" },
  yellow: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", chip: "bg-amber-100 text-amber-800" },
  red: { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200", chip: "bg-rose-100 text-rose-800" },
  blue: { bg: "bg-scratch-50", text: "text-scratch-700", ring: "ring-scratch-100", chip: "bg-scratch-100 text-scratch-700" },
};

export const STARS_PER_LESSON = 10;

export const PYTHON_COURSE_SLUG = "python-thuc-hanh";
export const PYTHON_ENROLLMENT_COURSE_SLUG = "chuyen-tiep-scratch-sang-python";
export const PYTHON_LESSON_NO = 1;
export const PYTHON_LESSON_TITLE = "Bài thực hành Python";
