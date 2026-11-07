importScripts(
  "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js",
  "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js",
);

let inputResolver;

self.onmessage = async (event) => {
  if (event.data.type === "stdin") {
    inputResolver?.(event.data.value);
    inputResolver = undefined;
    return;
  }

  if (event.data.type !== "run") return;
  try {
    Sk.configure({
      output: (text) => self.postMessage({ type: "output", text }),
      inputfunTakesPrompt: true,
      inputfun: (prompt) => new Promise((resolve) => {
        inputResolver = resolve;
        self.postMessage({ type: "input", prompt });
      }),
      read: (path) => {
        const file = Sk.builtinFiles.files[path];
        if (file === undefined) throw new Error(`Không tìm thấy thư viện Python: ${path}`);
        return file;
      },
    });

    await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, event.data.code, true));
    self.postMessage({ type: "done" });
  } catch (error) {
    self.postMessage({
      type: "problem",
      text: error instanceof Error ? error.toString() : String(error),
    });
  }
};
