Short version: Monaco doesn’t have built-in spellcheck and the browser’s native spellcheck can’t see Monaco’s content. You’ll need a small plugin that (a) extracts human text from LaTeX (skipping commands/math), (b) checks words in a Web Worker, and (c) draws squiggles via Monaco decorations.

Here are two practical setups.

# 1) Quick + lightweight (CSpell in a worker)

**Install**

```bash
npm i cspell-lib @cspell/dict-en_us --save
```

**worker.ts**

```ts
// /workers/spell.worker.ts
import { createSpellerFromSettings } from 'cspell-lib';
import { getDictionary } from '@cspell/dict-en_us';

let speller: any;

async function init() {
  const dict = await getDictionary();
  speller = await createSpellerFromSettings({
    language: 'en',
    dictionaries: [{ name: 'en_US', path: 'in-mem', addWords: [], dictionary: dict }],
    caseSensitive: false,
  });
}
const ready = init();

const LATEX_FILTER = [
  /\$[^$]*\$/g,                 // $...$
  /\\\[([\s\S]*?)\\\]/g,        // \[...\]
  /\\\(([\s\S]*?)\\\)/g,        // \(...\)
  /\\begin{[^}]+}[\s\S]*?\\end{[^}]+}/g, // environments
  /%.*$/gm,                     // comments
  /\\[a-zA-Z@]+(\s*\*)?/g,      // commands (keep their arguments text)
];

function stripLatex(src: string) {
  let s = src;
  for (const r of LATEX_FILTER) s = s.replace(r, ' ');
  // remove braces-only structure to avoid gluing words
  s = s.replace(/[{}]/g, ' ');
  return s;
}

self.onmessage = async (e: MessageEvent) => {
  await ready;
  const { text, uri } = e.data as { text: string; uri: string };
  const clean = stripLatex(text);
  const issues = speller.checkText(clean, { languageId: 'latex', uri }).issues;

  // Return misspelled words with positions by re-finding in the *clean* text and mapping back.
  // Simple approach: find word occurrences in original text (works well since we kept arguments).
  const results = [];
  for (const i of issues) {
    const w = i.text;
    // find all occurrences of the word in original text to decorate (naive but fast)
    const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    let m;
    while ((m = re.exec(text))) results.push({ start: m.index, end: m.index + w.length, word: w });
  }
  (self as any).postMessage({ decorations: results });
};
```

**editor mount (apply squiggles)**

```ts
const worker = new Worker(new URL('/workers/spell.worker.ts', import.meta.url), { type: 'module' });
let decoIds: string[] = [];

const scheduleCheck = (model: monaco.editor.ITextModel) => {
  worker.postMessage({ text: model.getValue(), uri: model.uri.toString() });
};

worker.onmessage = (e) => {
  const { decorations } = e.data as { decorations: { start:number; end:number; word:string }[] };
  const model = editor.getModel();
  if (!model) return;

  const newDecos = decorations.map(d => {
    const start = model.getPositionAt(d.start);
    const end = model.getPositionAt(d.end);
    return {
      range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
      options: { inlineClassName: 'spell-error', description: `Spelling: ${d.word}` }
    };
  });
  decoIds = editor.deltaDecorations(decoIds, newDecos);
};

editor.onDidChangeModelContent(() => {
  // debounce ~300ms
  if (pending) clearTimeout(pending);
  pending = setTimeout(() => scheduleCheck(editor.getModel()!), 300);
});
scheduleCheck(editor.getModel()!);
```

**styles**

```css
/* red wavy underline */
.monaco-editor .view-overlays .current-line ~ .decorationsOverviewRuler {}
.spell-error { text-decoration: underline wavy; text-decoration-thickness: 1px; }
```

**Suggestions (optional)**
Add a hover or right-click action:

```ts
monaco.languages.registerHoverProvider('latex', {
  provideHover(model, position) {
    // if position intersects a spell-error decoration, compute suggestions in worker (extend worker to return suggestions via speller.suggest)
    return { range, contents: [{ value: 'Suggestions: foo, bar, baz' }] };
  }
});
```

# 2) Higher fidelity (parse LaTeX AST, then spell only text nodes)

If you want fewer false positives (e.g., inside `\includegraphics{...}`), parse LaTeX:

```bash
npm i latex-utensils cspell-lib @cspell/dict-en_us
```

In the **worker**, use `latex-utensils` to parse, walk the AST, collect only **PlainText** nodes (and maybe `arg` of `\text{}`, `\caption{}`, etc.), and build a mapping from node offsets → original text positions. Then run CSpell on that text. This gives excellent LaTeX awareness (skips math, commands, labels, refs) with slightly more code.

# Tuning tips

* **Keep math off-limits:** already filtered via `$...$`, `\(...\)`, `\[...\]`, `\begin{equation}` etc. Add more env names (e.g., `align`, `equation*`).
* **Check comments too?** Remove `%.*$` if you want to spellcheck comments.
* **Per-word minimum length:** ignore 1–2 letter “words”.
* **Performance:** always run the checker in a **Web Worker** and debounce.
* **Theme:** use a subtle underline; avoid intrusive markers in a writing app.

# Minimal example (API-only “invisible line numbers” kept)

```tsx
<Editor
  /* … */
  options={{
    lineNumbers: () => " ",
    selectOnLineNumbers: true,
    lineNumbersMinChars: 2,
    glyphMargin: false,
    folding: false,
    lineDecorationsWidth: 0,
    renderIndentGuides: false,
    guides: { indentation: false },
  }}
/>
```

If you’d like, I can tailor the worker to your exact LaTeX usage (e.g., allow words inside `\textbf{}` and `\caption{}`, but ignore `\label{}`, `\cite{}`, `\ref{}`).
