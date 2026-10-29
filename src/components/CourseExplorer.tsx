"use client";

import { useMemo, useState } from "react";
import CourseCard from "./CourseCard";
import { LEVELS, type Course } from "@/lib/courses";

export default function CourseExplorer({ courses }: { courses: Course[] }) {
  const [age, setAge] = useState("");
  const [level, setLevel] = useState("");

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const okAge = !age || (Number(age) >= c.ageMin && Number(age) <= c.ageMax);
      const okLevel = !level || c.level === level;
      return okAge && okLevel;
    });
  }, [courses, age, level]);

  return (
    <div>
      <div className="card mb-8 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="age" className="label">Bé nhà bạn mấy tuổi?</label>
          <select id="age" className="input" value={age} onChange={(e) => setAge(e.target.value)}>
            <option value="">Tất cả độ tuổi</option>
            {Array.from({ length: 10 }, (_, i) => i + 6).map((a) => (
              <option key={a} value={a}>{a} tuổi</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="level" className="label">Trình độ</label>
          <select id="level" className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">Tất cả trình độ</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn-ghost" onClick={() => { setAge(""); setLevel(""); }}>
          Xóa lọc
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="card text-center">Chưa có khóa học phù hợp với bộ lọc này. Hãy thử thay đổi độ tuổi hoặc trình độ.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filtered.map((c) => (
            <CourseCard key={c.slug} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
