const DEFAULT_SITE_URL = "https://www.learningscratchkids.com";
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const parsedSiteUrl = configuredSiteUrl ? new URL(configuredSiteUrl) : null;
const isLocalSiteUrl =
  parsedSiteUrl?.hostname === "localhost" ||
  parsedSiteUrl?.hostname === "127.0.0.1" ||
  parsedSiteUrl?.hostname === "0.0.0.0" ||
  parsedSiteUrl?.hostname.endsWith(".localhost");

export const SITE = {
  name: "ScratchKids",
  slogan: "Sáng tạo trò chơi - Khơi nguồn tư duy",
  description:
    "ScratchKids dạy lập trình Scratch cho trẻ 6-15 tuổi: tự tạo game, phát triển tư duy logic và sáng tạo. Học video hoặc online kèm 1-1.",
  url:
    process.env.NODE_ENV === "production" && isLocalSiteUrl
      ? DEFAULT_SITE_URL
      : parsedSiteUrl?.origin ?? DEFAULT_SITE_URL,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  zalo: process.env.NEXT_PUBLIC_ZALO ?? "",
  heroVideoEmbed: process.env.NEXT_PUBLIC_HERO_VIDEO_EMBED ?? "",
};

export const VALUE_PROPS = [
  {
    emoji: "🧠",
    title: "Tư duy logic & giải quyết vấn đề",
    desc: "Bé học cách chia nhỏ vấn đề, tìm lỗi và sửa lỗi qua từng dự án game.",
  },
  {
    emoji: "🌈",
    title: "Kiên nhẫn & sáng tạo",
    desc: "Tự thiết kế nhân vật, màn chơi và luật chơi - mỗi sản phẩm là một ý tưởng của riêng bé.",
  },
  {
    emoji: "🎮",
    title: "Từ người chơi thành người tạo game",
    desc: "Thay vì chỉ chơi game và xem TV, bé dành thời gian để tự tạo ra game của mình.",
  },
];

export const ROADMAP = [
  { step: 1, title: "Scratch Cơ bản", age: "Beginner", emoji: "🎨" },
  { step: 2, title: "Scratch nâng cao", age: "Advanced", emoji: "🎮" },
  { step: 3, title: "Luyện thi Tin học trẻ", age: "Scratch", emoji: "🏅" },
  { step: 4, title: "Lập trình Python", age: "Viết mã lệnh", emoji: "🐍" },
];

// NỘI DUNG MẪU - hãy thay bằng phản hồi thật của phụ huynh/học viên trước khi chạy chính thức.
export const TESTIMONIALS_ARE_SAMPLE = true;
export const TESTIMONIALS = [
  {
    name: "Phụ huynh bé 9 tuổi",
    text: "Con mình mê tự làm game đến mức giờ cuối tuần chủ động mở máy ra làm bài thay vì xin xem TV.",
  },
  {
    name: "Phụ huynh bé 7 tuổi",
    text: "Các bài học ngắn, dễ hiểu. Báo cáo hằng tuần giúp mình biết con đã học được gì.",
  },
  {
    name: "Học viên 12 tuổi",
    text: "Em thích nhất lúc game chạy được sau khi tự sửa lỗi. Giờ em đang muốn học Python.",
  },
];

// Dự án mẫu khi chưa có sản phẩm thật trong database
export const SAMPLE_SHOWCASE = [
  { title: "Hứng táo", emoji: "🍎", tag: "Cơ bản" },
  { title: "Bắn máy bay", emoji: "✈️", tag: "Nâng cao" },
  { title: "Flappy Bird", emoji: "🐦", tag: "Nâng cao" },
  { title: "Né vật cản", emoji: "🚧", tag: "Cơ bản" },
  { title: "Thi chạy", emoji: "🏃", tag: "Mầm chồi" },
  { title: "Mê cung", emoji: "🧩", tag: "Nâng cao" },
];
