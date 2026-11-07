"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendJson } from "@/lib/client";
import { PYTHON_COURSE_SLUG, PYTHON_LESSON_NO } from "@/lib/courses";

const STARTER_CODE = 'name = "ScratchKids"\nprint(f"Xin chào {name}!")\n';
const MAX_OUTPUT_LENGTH = 20000;

export default function PythonSubmission({
  loggedIn,
  userName,
  canSubmit,
  initialCode,
  initialNote,
}: {
  loggedIn: boolean;
  userName?: string;
  canSubmit: boolean;
  initialCode: string;
  initialNote: string;
}) {
  const router = useRouter();
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);
  const outputRef = useRef("");
  const [code, setCode] = useState(initialCode || STARTER_CODE);
  const [inputPrompt, setInputPrompt] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [note, setNote] = useState(initialNote);
  const [authorName, setAuthorName] = useState("");
  const [output, setOutput] = useState("");
  const [problem, setProblem] = useState("");
  const [outputTab, setOutputTab] = useState<"terminal" | "problems">("terminal");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const lineCount = code.split("\n").length;

  useEffect(() => () => {
    workerRef.current?.terminate();
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  function stopWorker() {
    workerRef.current?.terminate();
    workerRef.current = null;
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function appendOutput(text: string) {
    const remaining = MAX_OUTPUT_LENGTH - outputRef.current.length;
    if (remaining <= 0) return;
    const next = outputRef.current + text.slice(0, remaining);
    outputRef.current = next;
    setOutput(next);
  }

  function runCode() {
    stopWorker();
    outputRef.current = "";
    setOutput("");
    setProblem("");
    setInputPrompt(null);
    setInputValue("");
    setOutputTab("terminal");
    setError("");
    setMessage("");
    setRunning(true);

    let worker: Worker;
    try {
      worker = new Worker("/python-worker.js");
    } catch {
      setRunning(false);
      setProblem("Trình duyệt không hỗ trợ Web Worker nên không thể chạy Python.");
      setOutputTab("problems");
      return;
    }
    workerRef.current = worker;
    timeoutRef.current = window.setTimeout(() => {
      stopWorker();
      setRunning(false);
      setProblem("Đã dừng chương trình vì khởi tạo quá lâu. Kiểm tra kết nối mạng rồi thử lại.");
      setOutputTab("problems");
    }, 30000);

    worker.onmessage = (event: MessageEvent<{ type: string; text?: string; prompt?: string }>) => {
      if (event.data.type === "output") {
        appendOutput(event.data.text ?? "");
      } else if (event.data.type === "input") {
        setInputPrompt(event.data.prompt ?? "");
        setInputValue("");
      } else if (event.data.type === "done") {
        stopWorker();
        setInputPrompt(null);
        if (outputRef.current.length >= MAX_OUTPUT_LENGTH) {
          setOutput((current) => `${current}\n\n(Đã giới hạn phần kết quả hiển thị.)`);
        }
        setRunning(false);
        if (!outputRef.current) setOutput("(Chương trình chạy xong, không có kết quả.)");
      } else if (event.data.type === "problem") {
        stopWorker();
        setRunning(false);
        setProblem(event.data.text ?? "Không thể chạy chương trình Python.");
        setOutputTab("problems");
      }
    };
    worker.onerror = () => {
      stopWorker();
      setRunning(false);
      setProblem("Không thể tải trình chạy Python. Hãy kiểm tra kết nối mạng rồi thử lại.");
      setOutputTab("problems");
    };
    worker.postMessage({ type: "run", code });
  }

  function stopCode() {
    stopWorker();
    setRunning(false);
    setInputPrompt(null);
    setOutput((current) => current ? `${current}\n\n[Đã dừng chương trình]` : "[Đã dừng chương trình]");
  }

  function sendInput(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inputPrompt === null || !workerRef.current) return;
    appendOutput(`${inputPrompt}${inputValue}\n`);
    workerRef.current.postMessage({ type: "stdin", value: inputValue });
    setInputPrompt(null);
    setInputValue("");
  }

  function editIndentation(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      runCode();
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      const textarea = event.currentTarget;
      textarea.setRangeText("    ", textarea.selectionStart, textarea.selectionEnd, "end");
      setCode(textarea.value);
    }
  }

  async function submitCode() {
    setError("");
    setMessage("");
    setSubmitting(true);
    const res = await sendJson("/api/submissions", "POST", {
      courseSlug: PYTHON_COURSE_SLUG,
      lessonNo: PYTHON_LESSON_NO,
      pythonCode: code,
      note: note || undefined,
      ...(!loggedIn ? { authorName } : {}),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.data?.error ?? "Không thể nộp bài. Vui lòng thử lại.");
      return;
    }
    setMessage(res.data.starsEarned > 0
      ? `Đã nộp bài! Bạn nhận được ${res.data.starsEarned} ⭐`
      : res.data.created ? `Đã nộp bài với tên ${res.data.authorName}.`
        : "Đã cập nhật bài nộp.");
    router.refresh();
  }

  return (
    <div className="card !p-4 sm:!p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold">Trình soạn thảo Python</p>
          <p className="text-sm text-ink/60">Python chạy trong trình duyệt · Ctrl + Enter để chạy</p>
        </div>
        <div className="flex gap-2">
          {running ? (
            <button type="button" onClick={stopCode} className="btn-ghost btn-sm !border-rose-200 !text-rose-700 hover:!border-rose-400">
              ■ Dừng
            </button>
          ) : (
            <button type="button" onClick={runCode} className="btn-secondary btn-sm">▶ Chạy</button>
          )}
          <button
            type="button"
            onClick={() => { outputRef.current = ""; setOutput(""); setProblem(""); setInputPrompt(null); }}
            className="btn-ghost btn-sm"
          >
            Xóa
          </button>
        </div>
      </div>

      <label htmlFor="python-code" className="sr-only">Mã Python</label>
      <div className="flex min-h-72 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 focus-within:border-scratch-400 focus-within:ring-4 focus-within:ring-scratch-400/30">
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="w-12 shrink-0 overflow-hidden border-r border-white/10 py-4 pr-3 text-right font-mono text-sm leading-6 text-slate-500"
        >
          {Array.from({ length: lineCount }, (_, index) => <div key={index}>{index + 1}</div>)}
        </div>
        <textarea
          id="python-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          onKeyDown={editIndentation}
          onScroll={(event) => {
            if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop;
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          maxLength={20000}
          wrap="off"
          className="min-h-72 min-w-0 flex-1 resize-y overflow-auto bg-transparent p-4 font-mono text-sm leading-6 text-emerald-100 caret-amber-300 focus:outline-none"
          aria-describedby="python-editor-help"
        />
      </div>
      <p id="python-editor-help" className="mt-1 text-right text-xs text-ink/50">{code.length}/20.000 ký tự</p>

      <div className="mt-4 overflow-hidden rounded-2xl bg-slate-900 text-slate-100">
        <div className="flex border-b border-white/10" role="tablist" aria-label="Kết quả chạy Python">
          <button
            type="button"
            role="tab"
            aria-selected={outputTab === "terminal"}
            onClick={() => setOutputTab("terminal")}
            className={`px-4 py-2 text-sm font-bold ${outputTab === "terminal" ? "bg-white/10 text-white" : "text-white/60"}`}
          >
            Terminal
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={outputTab === "problems"}
            onClick={() => setOutputTab("problems")}
            className={`px-4 py-2 text-sm font-bold ${outputTab === "problems" ? "bg-white/10 text-white" : "text-white/60"}`}
          >
            Problems{problem ? " (1)" : ""}
          </button>
          {running && <span className="ml-auto self-center px-4 text-xs text-emerald-300">Đang chạy...</span>}
        </div>
        {outputTab === "terminal" ? (
          <>
            <pre className="min-h-32 max-h-72 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-sm" aria-live="polite">
              {output || (running ? "Đang khởi tạo trình chạy Python..." : "Kết quả sẽ hiển thị tại đây.")}
            </pre>
            {inputPrompt !== null && (
              <form onSubmit={sendInput} className="border-t border-white/10 p-4">
                <label htmlFor="python-stdin" className="mb-2 block text-xs font-bold text-emerald-300">
                  {inputPrompt || "Chương trình đang chờ input()"}
                </label>
                <div className="flex gap-2">
                  <input
                    id="python-stdin"
                    autoFocus
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-white/15 bg-slate-950 p-3 font-mono text-sm text-white placeholder:text-white/35 focus:border-scratch-400 focus:outline-none"
                    placeholder="Nhập dữ liệu rồi nhấn Enter"
                  />
                  <button type="submit" className="btn-secondary btn-sm">Gửi</button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="min-h-32 p-4 font-mono text-sm" aria-live="polite">
            {problem ? (
              <pre className="whitespace-pre-wrap break-words text-rose-300">{problem}</pre>
            ) : (
              <p className="text-white/50">Không có vấn đề nào được phát hiện.</p>
            )}
          </div>
        )}
      </div>
      {error && <p className="alert-error mt-4" role="alert">{error}</p>}
      {message && <p className="alert-ok mt-4" role="status">{message}</p>}

      <div className="mt-5 border-t border-ink/10 pt-5">
        {loggedIn && canSubmit ? (
          <p className="mb-4 text-sm text-ink/70">
            Bài sẽ được nộp với tên <strong className="text-ink">{userName}</strong>.
          </p>
        ) : !loggedIn ? (
          <div className="mb-4">
            <label htmlFor="python-author-name" className="label">Tên hiển thị</label>
            <input
              id="python-author-name"
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              maxLength={60}
              autoComplete="nickname"
              className="input"
              placeholder="Khách"
            />
            <p className="mt-1 text-sm text-ink/60">Để trống để nộp bài với tên Khách.</p>
          </div>
        ) : (
          <p className="mb-4 text-sm text-ink/70">
            Bạn cần hoàn tất đăng ký khóa học Python để nộp bài.{" "}
            <a href="/dang-ky-hoc?khoa=chuyen-tiep-scratch-sang-python&hoc-thu=0" className="font-bold text-scratch-700 underline">
              Đăng ký khóa học
            </a>
          </p>
        )}
        {(!loggedIn || canSubmit) && (
          <>
            <label htmlFor="python-note" className="label">Ghi chú cho giáo viên (không bắt buộc)</label>
            <textarea
              id="python-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={300}
              rows={2}
              className="input"
              placeholder="Con muốn hỏi hoặc chia sẻ điều gì về bài làm?"
            />
            <button
              type="button"
              onClick={submitCode}
              disabled={submitting || code.trim().length === 0}
              className="btn-primary mt-4"
            >
              {submitting ? "Đang nộp..." : "Nộp bài Python"}
            </button>
          </>
        )}
        {!loggedIn && (
          <p className="mt-3 text-sm text-ink/60">
            <a href="/dang-nhap?next=/san-pham#python" className="font-bold text-scratch-700 underline">Đăng nhập</a>
            {" "}để lưu bài trong tài khoản và nhận sao.
          </p>
        )}
      </div>
    </div>
  );
}
