import CourseCard from "./CourseCard";
import type { Course } from "@/lib/courses";

export default function CourseExplorer({ courses }: { courses: Course[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {courses.map((course) => (
        <CourseCard key={course.slug} course={course} />
      ))}
    </div>
  );
}
