Here’s the refactor with a reusable `Button` component and absolute imports via `@` alias. I added `tsconfig.json` and `vite.config.ts` to support the alias.

```
cover-pepper/
├─ index.html
├─ package.json
├─ tsconfig.json                  // NEW: path alias (@ -> src)
├─ vite.config.ts                 // NEW: path alias (@ -> src)
└─ src/
   ├─ index.css
   ├─ main.tsx
   ├─ app/
   │  ├─ layouts/
   │  │  └─ AppLayout.tsx
   │  └─ routes/
   │     └─ AppRouter.tsx
   ├─ components/
   │  ├─ Button.tsx              // NEW: reusable button
   │  ├─ ConfirmDialog.tsx
   │  ├─ Header.tsx
   │  └─ Modal.tsx
   ├─ features/
   │  ├─ auth/
   │  │  ├─ LoginPage.tsx
   │  │  └─ useAuth.ts
   │  ├─ letters/
   │  │  ├─ api.ts
   │  │  ├─ hooks.ts
   │  │  ├─ store.ts
   │  │  ├─ types.ts
   │  │  └─ components/
   │  │     ├─ ContextMenu.tsx
   │  │     ├─ DirectoryPanel.tsx
   │  │     ├─ EditorPanel.tsx
   │  │     ├─ LetterEditor.tsx
   │  │     ├─ LetterList.tsx
   │  │     ├─ LetterListItem.tsx
   │  │     ├─ LetterToolbar.tsx
   │  │     ├─ LettersPage.tsx
   │  │     └─ dialogs/
   │  │        └─ GenerateDialog.tsx
   │  └─ settings/
   │     └─ SettingsDialog.tsx
   └─ lib/
      └─ axios.ts
```

---

## tsconfig.json (NEW)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vite/client"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

---

## vite.config.ts (NEW)

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  }
});
```

---

## src/main.tsx (updated to absolute import)

```tsx
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "@/app/routes/AppRouter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 30_000 }
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

---

## src/app/routes/AppRouter.tsx (absolute imports)

```tsx
import { Route, Routes, Navigate } from "react-router-dom";
import AppLayout from "@/app/layouts/AppLayout";
import { useAuth } from "@/features/auth/useAuth";
import LettersPage from "@/features/letters/components/LettersPage";
import LoginPage from "@/features/auth/LoginPage";

export default function AppRouter() {
  const { isLoading, user } = useAuth();

  if (isLoading) return <div className="p-6 text-sm">Loading…</div>;

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route element={<AppLayout />}>
            <Route path="/app/letters/:id?" element={<LettersPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/app/letters" replace />} />
        </>
      )}
    </Routes>
  );
}
```

---

## src/app/layouts/AppLayout.tsx (absolute imports)

```tsx
import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import DirectoryPanel from "@/features/letters/components/DirectoryPanel";
import { useUI } from "@/features/letters/store";
import SettingsDialog from "@/features/settings/SettingsDialog";

export default function AppLayout() {
  const { isSettingsOpen, setSettingsOpen } = useUI();

  return (
    <div className="h-screen w-screen flex flex-col">
      <Header />
      <div className="flex-1 flex min-h-0">
        <DirectoryPanel />
        <div className="flex-1 min-h-0 border-l border-grayline">
          <Outlet />
        </div>
      </div>
      <SettingsDialog open={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
```

---

## src/components/Button.tsx (NEW)

```tsx
import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md";
  fullWidth?: boolean;
  square?: boolean; // ignores size and uses uniform padding
};

export default function Button({
  variant = "outline",
  size = "sm",
  fullWidth = false,
  square = false,
  className,
  ...rest
}: Props) {
  const base = "inline-flex items-center justify-center border transition disabled:opacity-60";
  const variants = {
    outline: "border-black bg-transparent text-black hover:bg-gray-100 active:bg-gray-200",
    solid: "border-black bg-black text-white hover:opacity-90 active:opacity-80",
    ghost: "border-grayline bg-white text-black hover:bg-gray-100 active:bg-gray-200"
  } as const;

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base"
  } as const;

  const squarePad = "p-2";
  const width = fullWidth ? "w-full" : "";

  return (
    <button
      className={clsx(base, variants[variant], square ? squarePad : sizes[size], width, className)}
      {...rest}
    />
  );
}
```

---

## src/components/Header.tsx (unchanged)

```tsx
export default function Header() {
  return (
    <header className="h-12 border-b border-grayline flex items-center px-4">
      <div className="font-semibold tracking-wide">Cover Pepper</div>
    </header>
  );
}
```

---

## src/features/auth/useAuth.ts (absolute import)

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

type MeResponse = { user: null | { id: string; name?: string; email?: string } };

export function useAuth() {
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async (): Promise<MeResponse["user"]> => {
      const res = await axios.get<MeResponse>("/auth/me");
      return res.data.user;
    }
  });

  const qc = useQueryClient();
  const logout = useMutation({
    mutationFn: async () => {
      await axios.post("/auth/logout");
    },
    onSuccess: () => {
      qc.clear();
    }
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    logout: logout.mutate
  };
}
```

---

## src/lib/axios.ts (unchanged)

```ts
import Axios from "axios";

const axios = Axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

export default axios;
```

---

## src/features/letters/types.ts (unchanged)

```ts
export type Letter = {
  id: string;
  title: string;
  company: string;
  position: string;
  date: string;
  contentLatex: string;
  createdAt: string;
  updatedAt: string;
};
```

---

## src/features/letters/store.ts (unchanged)

```ts
import { create } from "zustand";

type UIState = {
  selectedLetterId: string | null;
  setSelectedLetterId: (id: string | null) => void;

  templateLetterId: string | null;
  setTemplateLetterId: (id: string) => void;

  isGenerateOpen: boolean;
  setGenerateOpen: (v: boolean) => void;

  isSettingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
};

const LOCAL_KEY = "coverpepper_template_id";

export const useUI = create<UIState>((set) => ({
  selectedLetterId: null,
  setSelectedLetterId: (id) => set({ selectedLetterId: id }),

  templateLetterId: localStorage.getItem(LOCAL_KEY),
  setTemplateLetterId: (id) => {
    localStorage.setItem(LOCAL_KEY, id);
    set({ templateLetterId: id });
  },

  isGenerateOpen: false,
  setGenerateOpen: (v) => set({ isGenerateOpen: v }),

  isSettingsOpen: false,
  setSettingsOpen: (v) => set({ isSettingsOpen: v })
}));
```

---

## src/features/letters/api.ts (absolute import)

```ts
import axios from "@/lib/axios";
import { Letter } from "@/features/letters/types";

export async function listLetters(): Promise<Letter[]> {
  const { data } = await axios.get<Letter[]>("/letters");
  return data;
}

export async function getLetter(id: string): Promise<Letter> {
  const { data } = await axios.get<Letter>(`/letters/${id}`);
  return data;
}

export async function uploadLetter(contentLatex: string): Promise<Letter> {
  const { data } = await axios.post<Letter>("/letters/upload", { contentLatex });
  return data;
}

export async function updateLetter(
  id: string,
  partial: Partial<Pick<Letter, "title" | "company" | "position" | "date" | "contentLatex">>
): Promise<Letter> {
  const { data } = await axios.put<Letter>(`/letters/${id}`, partial);
  return data;
}

export async function deleteLetter(id: string): Promise<void> {
  await axios.delete(`/letters/${id}`);
}

export async function generateLetter(jobDescription: string, templateLatex: string): Promise<Letter> {
  const { data } = await axios.post<Letter>("/letters/generate", {
    jobDescription,
    templateLatex
  });
  return data;
}

export async function compileLetter(id: string): Promise<Blob> {
  const { data } = await axios.post(`/letters/${id}/compile`, null, {
    responseType: "blob"
  });
  return data as Blob;
}
```

---

## src/features/letters/hooks.ts (unchanged API, kept relative inside feature or absolute? stays local)

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Letter } from "@/features/letters/types";
import {
  listLetters,
  getLetter,
  uploadLetter,
  updateLetter,
  deleteLetter,
  generateLetter,
  compileLetter
} from "@/features/letters/api";

export function useLetters() {
  return useQuery({ queryKey: ["letters"], queryFn: listLetters });
}

export function useLetter(id?: string) {
  return useQuery({
    queryKey: ["letter", id],
    queryFn: () => getLetter(id!),
    enabled: !!id
  });
}

export function useUploadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadLetter,
    onSuccess: (created: Letter) => {
      qc.invalidateQueries({ queryKey: ["letters"] });
      qc.setQueryData(["letter", created.id], created);
    }
  });
}

export function useUpdateMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (partial: Partial<Letter>) => updateLetter(id, partial),
    onMutate: async (partial) => {
      await qc.cancelQueries({ queryKey: ["letter", id] });
      const prev = qc.getQueryData<Letter>(["letter", id]);
      if (prev) {
        const next = { ...prev, ...partial, updatedAt: new Date().toISOString() };
        qc.setQueryData(["letter", id], next);
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["letter", id], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["letters"] });
      qc.invalidateQueries({ queryKey: ["letter", id] });
    }
  });
}

export function useDeleteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLetter,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["letters"] })
  });
}

export function useGenerateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobDescription, templateLatex }: { jobDescription: string; templateLatex: string }) =>
      generateLetter(jobDescription, templateLatex),
    onSuccess: (created: Letter) => {
      qc.invalidateQueries({ queryKey: ["letters"] });
      qc.setQueryData(["letter", created.id], created);
    }
  });
}

export function useCompileMutation() {
  return useMutation({
    mutationFn: (id: string) => compileLetter(id)
  });
}
```

---

## src/features/letters/components/ContextMenu.tsx (unchanged)

```tsx
import { PropsWithChildren, useEffect, useRef, useState } from "react";

type Item = { label: string; onClick: () => void; disabled?: boolean };

export default function ContextMenu({
  items,
  children
}: PropsWithChildren<{ items: Item[] }>) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc() {
      setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div
      ref={ref}
      onContextMenu={(e) => {
        e.preventDefault();
        setPos({ x: e.pageX, y: e.pageY });
        setOpen(true);
      }}
    >
      {children}
      {open && (
        <ul
          className="fixed z-50 border border-grayline bg-paper text-sm"
          style={{ left: pos.x, top: pos.y }}
        >
          {items.map((it, i) => (
            <li key={i}>
              <button
                className="px-3 py-1 text-left w-full hover:bg-gray-100 disabled:opacity-50"
                onClick={() => {
                  if (!it.disabled) it.onClick();
                  setOpen(false);
                }}
                disabled={it.disabled}
              >
                {it.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## src/features/letters/components/DirectoryPanel.tsx (uses Button + absolute imports)

```tsx
import { useLetters } from "@/features/letters/hooks";
import LetterList from "@/features/letters/components/LetterList";
import { useUI } from "@/features/letters/store";
import { Settings, User } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import Button from "@/components/Button";

export default function DirectoryPanel() {
  const { data } = useLetters();
  const { setGenerateOpen, setSettingsOpen } = useUI();
  const { user, logout } = useAuth();

  return (
    <aside className="w-[280px] min-w-[240px] max-w-[320px] border-r border-grayline flex flex-col">
      <div className="p-3 border-b border-grayline">
        <div className="flex gap-2">
          <Button fullWidth onClick={() => setGenerateOpen(true)}>
            New letter
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <LetterList letters={data ?? []} />
      </div>

      <div className="border-t border-grayline p-3 flex items-center justify-between">
        <Button
          title="Settings"
          variant="ghost"
          square
          onClick={() => setSettingsOpen(true)}
        >
          <Settings size={16} />
        </Button>
        <div className="text-xs text-right flex-1 px-2 truncate">
          {user?.name ?? user?.email ?? "Account"}
        </div>
        <Button
          title="Account"
          variant="ghost"
          square
          onClick={() => {
            if (confirm("Log out?")) logout();
          }}
        >
          <User size={16} />
        </Button>
      </div>
    </aside>
  );
}
```

---

## src/features/letters/components/LetterList.tsx (unchanged)

```tsx
import { Letter } from "@/features/letters/types";
import LetterListItem from "@/features/letters/components/LetterListItem";

export default function LetterList({ letters }: { letters: Letter[] }) {
  if (!letters?.length) {
    return (
      <div className="p-3 text-sm text-gray-600">
        No letters yet. Use Settings → Upload or Generate one.
      </div>
    );
  }

  return (
    <ul>
      {letters.map((l) => (
        <LetterListItem key={l.id} letter={l} />
      ))}
    </ul>
  );
}
```

---

## src/features/letters/components/LetterListItem.tsx (unchanged logic; absolute imports)

```tsx
import { useNavigate, useParams } from "react-router-dom";
import { Letter } from "@/features/letters/types";
import ContextMenu from "@/features/letters/components/ContextMenu";
import { useDeleteMutation, useLetters } from "@/features/letters/hooks";
import { useUI } from "@/features/letters/store";
import clsx from "clsx";

export default function LetterListItem({ letter }: { letter: Letter }) {
  const navigate = useNavigate();
  const params = useParams();
  const { templateLetterId, setTemplateLetterId } = useUI();
  const del = useDeleteMutation();
  const { data: letters } = useLetters();

  const selected = params.id === letter.id;

  const items = [
    { label: "Open", onClick: () => navigate(`/app/letters/${letter.id}`) },
    { label: "Set as template", onClick: () => setTemplateLetterId(letter.id) },
    {
      label: "Delete",
      onClick: async () => {
        if (!confirm(`Delete "${letter.title}"?`)) return;
        await del.mutateAsync(letter.id);
        if (selected) {
          const next = letters?.find((l) => l.id !== letter.id);
          navigate(next ? `/app/letters/${next.id}` : `/app/letters`);
        }
      }
    }
  ];

  return (
    <ContextMenu items={items}>
      <li
        className={clsx(
          "px-3 py-2 border-b border-grayline cursor-pointer flex items-center justify-between",
          selected && "bg-gray-100"
        )}
        onClick={() => navigate(`/app/letters/${letter.id}`)}
      >
        <div className="truncate">
          <div className="text-sm">{letter.title}</div>
          <div className="text-[11px] text-gray-600 truncate">
            {letter.company} · {letter.position}
          </div>
        </div>
        {templateLetterId === letter.id && <span title="Template">★</span>}
      </li>
    </ContextMenu>
  );
}
```

---

## src/features/letters/components/LettersPage.tsx (absolute imports)

```tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useLetter, useLetters } from "@/features/letters/hooks";
import EditorPanel from "@/features/letters/components/EditorPanel";
import GenerateDialog from "@/features/letters/components/dialogs/GenerateDialog";
import { useUI } from "@/features/letters/store";

export default function LettersPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: letters } = useLetters();
  const { data: letter } = useLetter(id);
  const { isGenerateOpen, setGenerateOpen } = useUI();

  useEffect(() => {
    if (!id && letters && letters.length > 0) {
      navigate(`/app/letters/${letters[0].id}`, { replace: true });
    }
  }, [id, letters, navigate]);

  return (
    <>
      {!id ? (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-sm text-gray-700">Select or create a letter.</div>
        </div>
      ) : (
        <EditorPanel letterId={id} letter={letter ?? null} />
      )}

      <GenerateDialog open={isGenerateOpen} onClose={() => setGenerateOpen(false)} />
    </>
  );
}
```

---

## src/features/letters/components/EditorPanel.tsx (absolute imports)

```tsx
import { Letter } from "@/features/letters/types";
import LetterToolbar from "@/features/letters/components/LetterToolbar";
import LetterEditor from "@/features/letters/components/LetterEditor";

export default function EditorPanel({ letterId, letter }: { letterId: string; letter: Letter | null }) {
  if (!letter) return <div className="p-4 text-sm">Loading letter…</div>;
  return (
    <div className="h-full w-full flex flex-col">
      <LetterToolbar letter={letter} />
      <div className="flex-1 min-h-0">
        <LetterEditor letter={letter} />
      </div>
    </div>
  );
}
```

---

## src/features/letters/components/LetterToolbar.tsx (uses Button + absolute imports)

```tsx
import { useState, useEffect, useRef } from "react";
import { useUpdateMutation, useCompileMutation } from "@/features/letters/hooks";
import { Letter } from "@/features/letters/types";
import Button from "@/components/Button";

function downloadBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function LetterToolbar({ letter }: { letter: Letter }) {
  const [title, setTitle] = useState(letter.title);
  const update = useUpdateMutation(letter.id);
  const compile = useCompileMutation();
  const savingRef = useRef<NodeJS.Timeout | null>(null);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    setTitle(letter.title);
  }, [letter.id, letter.title]);

  useEffect(() => {
    if (title === letter.title) return;
    setSaving("saving");
    if (savingRef.current) clearTimeout(savingRef.current);
    savingRef.current = setTimeout(async () => {
      await update.mutateAsync({ title });
      setSaving("saved");
      setTimeout(() => setSaving("idle"), 800);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const handleCompile = async () => {
    if (savingRef.current) {
      clearTimeout(savingRef.current);
      await update.mutateAsync({ title });
      setSaving("saved");
      setTimeout(() => setSaving("idle"), 800);
    }
    const blob = await compile.mutateAsync(letter.id);
    downloadBlob(blob, letter.title);
  };

  return (
    <div className="h-12 border-b border-grayline flex items-center justify-between px-3">
      <input
        className="text-base font-medium outline-none bg-transparent"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <div className="text-xs text-gray-600">
          {saving === "saving" && "Saving…"}
          {saving === "saved" && "Saved"}
        </div>
        <Button onClick={handleCompile} disabled={compile.isPending}>
          {compile.isPending ? "Compiling…" : "Finish (PDF)"}
        </Button>
      </div>
    </div>
  );
}
```

---

## src/features/letters/components/LetterEditor.tsx (absolute imports)

```tsx
import Editor, { OnChange, OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { useUpdateMutation } from "@/features/letters/hooks";
import { Letter } from "@/features/letters/types";

export default function LetterEditor({ letter }: { letter: Letter }) {
  const update = useUpdateMutation(letter.id);
  const [value, setValue] = useState(letter.contentLatex);
  const pendingSave = useRef<NodeJS.Timeout | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    setValue(letter.contentLatex);
    dirty.current = false;
  }, [letter.id, letter.contentLatex]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const onChange: OnChange = (v) => {
    setValue(v ?? "");
    dirty.current = true;
    if (pendingSave.current) clearTimeout(pendingSave.current);
    pendingSave.current = setTimeout(async () => {
      await update.mutateAsync({ contentLatex: v ?? "" });
      dirty.current = false;
    }, 800);
  };

  const onMount: OnMount = (editor, monaco) => {
    if (!monaco.languages.getLanguages().some((l) => l.id === "latex")) {
      monaco.languages.register({ id: "latex" });
      monaco.languages.setMonarchTokensProvider("latex", {
        tokenizer: {
          root: [
            [/%.*/, "comment"],
            [/\\[a-zA-Z]+/, "keyword"],
            [/[{}\[\]\(\)]/, "@brackets"],
            [/\$[^$]*\$/, "string"]
          ]
        }
      });
    }

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
      if (pendingSave.current) {
        clearTimeout(pendingSave.current);
        pendingSave.current = null;
      }
      await update.mutateAsync({ contentLatex: editor.getValue() });
      dirty.current = false;
    });
  };

  return (
    <Editor
      height="100%"
      language="latex"
      theme="vs"
      value={value}
      onChange={onChange}
      onMount={onMount}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        wordWrap: "on",
        scrollBeyondLastLine: false,
        padding: { top: 8 }
      }}
    />
  );
}
```

---

## src/features/letters/components/dialogs/GenerateDialog.tsx (uses Button + absolute imports)

```tsx
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { useGenerateMutation, useLetter } from "@/features/letters/hooks";
import { useNavigate, useParams } from "react-router-dom";
import { useUI } from "@/features/letters/store";
import { getLetter } from "@/features/letters/api";
import Button from "@/components/Button";

type Props = { open: boolean; onClose: () => void };

export default function GenerateDialog({ open, onClose }: Props) {
  const [jobDescription, setJD] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { templateLetterId } = useUI();
  const gen = useGenerateMutation();
  const { id } = useParams();
  const { data: _current } = useLetter(id);

  useEffect(() => {
    if (!open) {
      setJD("");
      setError(null);
    }
  }, [open]);

  const canGenerate = Boolean(templateLetterId);

  const handleSubmit = async () => {
    if (!canGenerate) {
      setError("Please set a template first (right-click a letter → Set as template).");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Job description is required.");
      return;
    }
    setError(null);

    const template = await getLetter(templateLetterId!);
    const created = await gen.mutateAsync({
      jobDescription,
      templateLatex: template.contentLatex
    });
    onClose();
    navigate(`/app/letters/${created.id}`);
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate from Template">
      {!canGenerate && (
        <div className="mb-3 text-xs text-gray-700">
          No template set. Right-click a letter in the list and choose “Set as template”.
        </div>
      )}
      <label className="block text-sm mb-1">Job description</label>
      <textarea
        className="w-full border border-grayline p-2 h-40 text-sm"
        value={jobDescription}
        onChange={(e) => setJD(e.target.value)}
        placeholder="Paste the job description here…"
      />
      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}

      <div className="mt-3 flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="solid"
          onClick={handleSubmit}
          disabled={!canGenerate || gen.isPending}
        >
          {gen.isPending ? "Generating…" : "Generate"}
        </Button>
      </div>
    </Modal>
  );
}
```

---

## src/features/settings/SettingsDialog.tsx (uses Button + absolute imports)

```tsx
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { useUploadMutation } from "@/features/letters/hooks";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";

type Props = { open: boolean; onClose: () => void };

export default function SettingsDialog({ open, onClose }: Props) {
  // Upload-only settings for now
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const up = useUploadMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setContent("");
      setError(null);
    }
  }, [open]);

  const onFile = async (f: File) => {
    const text = await f.text();
    setContent(text);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Include LaTeX content.");
      return;
    }
    const created = await up.mutateAsync(content);
    onClose();
    navigate(`/app/letters/${created.id}`);
  };

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="mb-3">
        <div className="text-sm font-medium mb-2">Upload LaTeX Letter</div>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="file"
            accept=".tex,text/plain"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
          <span className="text-xs text-gray-600">or paste below</span>
        </div>
        <textarea
          className="w-full border border-grayline p-2 h-48 text-sm"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste raw LaTeX here…"
        />
        {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <Button onClick={onClose}>Close</Button>
        <Button variant="solid" onClick={handleSubmit} disabled={up.isPending}>
          {up.isPending ? "Uploading…" : "Upload"}
        </Button>
      </div>
    </Modal>
  );
}
```

---

## Remaining files (unchanged)

* `src/components/Modal.tsx` (unchanged)
* `src/components/ConfirmDialog.tsx` (unchanged)
* `src/features/auth/LoginPage.tsx` (unchanged)

These continue to work without modification.

---