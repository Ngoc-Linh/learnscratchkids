// Nguồn dữ liệu khóa học (theo bản đề án). Sửa nội dung tại đây, không cần database.
// Tên bài học là bản nháp - hãy chỉnh theo giáo án thật của bạn.

export type CourseColor = "green" | "yellow" | "red" | "blue";

export type Lesson = { no: number; title: string };

export type Course = {
  slug: string;
  title: string;
  level: "Mầm chồi" | "Cơ bản" | "Nâng cao" | "Chuyển tiếp";
  emoji: string;
  color: CourseColor;
  ageMin: number;
  ageMax: number;
  summary: string;
  goals: string[];
  outputs: string[];
  lessons: Lesson[];
  // Dán link nhúng YouTube (https://www.youtube.com/embed/...) để hiện video học thử
  trialVideoEmbed?: string;
};

const L = (titles: string[]): Lesson[] => titles.map((title, i) => ({ no: i + 1, title }));

export const COURSES: Course[] = [
  {
    slug: "scratch-mam-choi",
    title: "Scratch Mầm Chồi",
    level: "Mầm chồi",
    emoji: "🌱",
    color: "green",
    ageMin: 6,
    ageMax: 8,
    summary:
      "Làm quen với máy tính, thao tác chuột và tư duy thuật toán trực quan qua hình ảnh, nhân vật đơn giản.",
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
  {
    slug: "scratch-sang-tao-co-ban",
    title: "Scratch Sáng Tạo - Cơ Bản",
    level: "Cơ bản",
    emoji: "🎨",
    color: "yellow",
    ageMin: 8,
    ageMax: 11,
    summary:
      "Nắm vững các khối lệnh cơ bản: di chuyển, sự kiện, vòng lặp, điều kiện, âm thanh, hình ảnh và làm game đầu tay.",
    goals: [
      "Nắm vững khối lệnh Di chuyển, Sự kiện, Vòng lặp, Điều kiện",
      "Sử dụng Âm thanh và Hình ảnh để làm sản phẩm sinh động",
      "Tự lên ý tưởng và hoàn thiện một game nhỏ",
    ],
    outputs: ['Game "Hứng trái cây"', 'Game "Né vật cản"', "Câu chuyện hoạt hình tương tác 2 nhân vật"],
    lessons: L([
      "Giao diện Scratch và các nhóm khối lệnh",
      "Di chuyển và hệ tọa độ",
      "Sự kiện: bấm phím, bấm chuột",
      "Vòng lặp",
      "Điều kiện nếu - thì",
      "Âm thanh và hình ảnh",
      'Game "Hứng trái cây" (phần 1)',
      'Game "Hứng trái cây" (phần 2: tính điểm)',
      'Game "Né vật cản"',
      "Nhân vật nói chuyện với nhau (truyền tin)",
      "Câu chuyện hoạt hình 2 nhân vật",
      "Dự án cuối khóa",
    ]),
  },
  {
    slug: "scratch-nang-cao-game-master",
    title: "Scratch Nâng Cao - Game Master",
    level: "Nâng cao",
    emoji: "🎮",
    color: "red",
    ageMin: 10,
    ageMax: 15,
    summary:
      "Làm chủ biến số, danh sách, hàm tự tạo, thuật toán va chạm, tính điểm, lưu kỷ lục và vật lý cơ bản để làm game hoàn chỉnh.",
    goals: [
      "Làm chủ Biến số (Variables) và Danh sách (Lists)",
      "Tự tạo khối lệnh (Custom Blocks), xử lý va chạm",
      "Tính điểm, lưu kỷ lục, mô phỏng trọng lực và nhảy",
    ],
    outputs: ['Game "Flappy Bird"', 'Game "Bắn máy bay 2D"', 'Game "Đột kích / Mê cung đa cấp độ"'],
    lessons: L([
      "Biến số (Variables)",
      "Danh sách (Lists)",
      "Khối lệnh tự tạo (Custom Blocks)",
      "Thuật toán va chạm",
      "Tính điểm và mạng sống",
      "Lưu điểm kỷ lục",
      "Trọng lực và nhảy",
      'Game "Flappy Bird" (phần 1)',
      'Game "Flappy Bird" (phần 2)',
      'Game "Bắn máy bay 2D"',
      'Game "Đột kích / Mê cung đa cấp độ"',
      "Dự án cuối khóa",
    ]),
  },
  {
    slug: "chuyen-tiep-scratch-sang-python",
    title: "Chuyển Tiếp: Từ Scratch sang Python",
    level: "Chuyển tiếp",
    emoji: "🐍",
    color: "blue",
    ageMin: 10,
    ageMax: 15,
    summary:
      "Cầu nối giúp học sinh đã thành thạo Scratch chuyển sang tư duy gõ mã nguồn (text-based coding) bằng Python.",
    goals: [
      "Đối chiếu khối lệnh Scratch với câu lệnh Python",
      "Làm quen cú pháp, biến, điều kiện, vòng lặp, hàm",
      "Viết chương trình Python đầu tiên",
    ],
    outputs: ["Các chương trình Python nhỏ", "Game đoán số bằng Python"],
    lessons: L([
      "Vì sao cần gõ lệnh? Từ khối lệnh sang câu lệnh",
      "Lệnh print đầu tiên",
      "Biến và kiểu dữ liệu",
      "Nhận dữ liệu từ bàn phím",
      "Điều kiện if - else",
      "Vòng lặp for và while",
      "Danh sách (list)",
      "Hàm (function)",
      "Game đoán số",
      "Dự án nhỏ cuối khóa",
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

export const LEVELS = ["Mầm chồi", "Cơ bản", "Nâng cao", "Chuyển tiếp"] as const;

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
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
