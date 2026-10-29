import Link from "next/link";
import { COURSE_COLORS, type Course } from "@/lib/courses";

export default function CourseCard({ course }: { course: Course }) {
  const c = COURSE_COLORS[course.color];
  return (
    <article className={`card group flex flex-col ring-2 ${c.ring}`}>
      <div className={`mb-4 grid h-20 w-20 place-items-center rounded-3xl text-5xl ${c.bg}`}>{course.emoji}</div>
      <div className="mb-2 flex flex-wrap gap-2">
        <span className={`chip ${c.chip}`}>{course.level}</span>
        <span className="chip bg-ink/5 text-ink/70">
          {course.ageMin}-{course.ageMax} tuổi
        </span>
      </div>
      <h3 className="text-2xl">{course.title}</h3>
      <p className="mt-2 flex-1 text-base text-ink/70">{course.summary}</p>
      <p className="mt-3 text-sm font-bold text-ink/60">{course.lessons.length} buổi học</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/khoa-hoc/${course.slug}`} className="btn-ghost btn-sm">
          Xem chi tiết
        </Link>
        <Link href={`/dang-ky-hoc?khoa=${course.slug}&hoc-thu=1`} className="btn-primary btn-sm">
          Học thử 0đ
        </Link>
      </div>
    </article>
  );
}
