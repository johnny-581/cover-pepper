# Project structure

```
server/
├─ prisma/
│  └─ schema.prisma
├─ src/
│  ├─ config/
│  │  ├─ env.ts
│  │  ├─ passport.ts
│  │  └─ prisma.ts
│  ├─ middleware/
│  │  ├─ auth.ts
│  │  └─ errorHandler.ts
│  ├─ services/
│  │  ├─ geminiService.ts
│  │  └─ latexCompilerService.ts
│  ├─ routes/
│  │  ├─ auth.ts
│  │  └─ letters.ts
│  ├─ types/
│  │  └─ express-session.d.ts
│  └─ index.ts
├─ .env.example
├─ package.json
└─ tsconfig.json
```

---

## prisma/schema.prisma
```prisma
// Prisma + PostgreSQL schema

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String        @id @default(uuid())
  email     String        @unique
  name      String?
  googleId  String?       @unique
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  letters   CoverLetter[]
}

model CoverLetter {
  id           String   @id @default(uuid())
  title        String
  company      String
  position     String
  date         DateTime
  contentLatex String
  user         User     @relation(fields: [userId], references: [id])
  userId       String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

---

## src/config/prisma.ts
```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export default prisma;
```

---

## src/config/env.ts
```ts
import "dotenv/config";

const required = (key: string): string => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
};

export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.PORT || "4000", 10),
  DATABASE_URL: required("DATABASE_URL"),
  SESSION_SECRET: required("SESSION_SECRET"),
  CLIENT_ORIGIN: required("CLIENT_ORIGIN"),
  GOOGLE_CLIENT_ID: required("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: required("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: required("GOOGLE_CALLBACK_URL"),
  GEMINI_API_KEY: required("GEMINI_API_KEY"),
  LATEX_COMPILER_API_URL: required("LATEX_COMPILER_API_URL"),
};
```

---

## src/config/passport.ts
```ts
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import prisma from "./prisma";
import { ENV } from "./env";

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      callbackURL: ENV.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Google account has no email"));

        let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
        if (!user) {
          // Upsert by email to avoid duplicate accounts if same email logs in later with Google
          user = await prisma.user.upsert({
            where: { email },
            update: { googleId: profile.id, name: profile.displayName },
            create: { email, googleId: profile.id, name: profile.displayName },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

export default passport;
```

---

## src/middleware/auth.ts
```ts
import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Unauthorized" });
}
```

---

## src/middleware/errorHandler.ts
```ts
import { NextFunction, Request, Response } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
}
```

---

## src/services/geminiService.ts
```ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../config/env";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

/**
 * Generate a LaTeX cover letter using a default or supplied LaTeX template and a job description.
 * The prompt asks the model to only return compilable LaTeX between \begin{letter} ... \end{letter}.
 */
export async function generateCoverLetterLatex(params: {
  jobDescription: string;
  applicantName: string;
  applicantEmail?: string;
  applicantPhone?: string;
  company?: string;
  position?: string;
  templateLatex?: string; // optional custom template; if omitted, a basic article/letter environment is used
}) {
  const {
    jobDescription,
    applicantName,
    applicantEmail,
    applicantPhone,
    company,
    position,
    templateLatex,
  } = params;

  const defaultTemplate = String.raw`\documentclass[11pt]{letter}
\usepackage[margin=1in]{geometry}
\usepackage{hyperref}
\signature{${applicantName}}
\address{${applicantEmail ?? ""} \\ ${applicantPhone ?? ""}}
\begin{document}
\begin{letter}{${company ?? "Hiring Manager"}\\}
\opening{Dear ${company ? "Hiring Team" : "Hiring Manager"},}

% BODY_START
% Write a concise, tailored cover letter that references the role ${position ?? "the role"}.
% Use 3 paragraphs: intro, impact + skills, and closing call-to-action.
% Keep it professional, specific, and 250-350 words.

\closing{Sincerely,}
\end{letter}
\end{document}`;

  const systemDirective = `You are an assistant that writes *compilable LaTeX* cover letters. Do not include Markdown fences. Avoid unsupported packages. Keep to 250-350 words.`;

  const prompt = [
    systemDirective,
    `JOB DESCRIPTION:\n${jobDescription}`,
    company ? `Company: ${company}` : "",
    position ? `Position: ${position}` : "",
    `TEMPLATE (if provided):\n${templateLatex ?? "<use the default template>"}`,
    `Return only LaTeX. Ensure it compiles with pdflatex.`,
  ].filter(Boolean).join("\n\n");

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // If model returned only the body, inject into default template
  const latex = templateLatex ? text : text.includes("\\documentclass") ? text : defaultTemplate.replace("% BODY_START", text);

  return latex;
}
```

---

## src/services/latexCompilerService.ts
```ts
import axios from "axios";
import { ENV } from "../config/env";

const api = axios.create({ baseURL: ENV.LATEX_COMPILER_API_URL, timeout: 60000 });

/**
 * Calls your AWS Lambda (or any HTTP service) that accepts { latex_source } and
 * returns a PDF as base64 in { pdf_base64 } OR a signed URL in { pdf_url }.
 */
export async function compileLatexToPdf(latex_source: string): Promise<{ buffer?: Buffer; pdfUrl?: string; }> {
  const { data } = await api.post("/latex-compiler", { latex_source });

  if (data?.pdf_base64) {
    const buffer = Buffer.from(data.pdf_base64, "base64");
    return { buffer };
  }
  if (data?.pdf_url) {
    return { pdfUrl: data.pdf_url as string };
  }
  throw new Error("Unexpected response from LaTeX compiler API. Expected pdf_base64 or pdf_url.");
}
```

---

## src/routes/auth.ts
```ts
import { Router } from "express";
import passport from "passport";

const router = Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failure" }),
  (_req, res) => {
    // On success, redirect back to your client app
    res.redirect(process.env.CLIENT_ORIGIN || "/");
  }
);

router.get("/failure", (_req, res) => {
  res.status(401).json({ error: "Google authentication failed" });
});

router.post("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session?.destroy(() => {
      res.clearCookie("connect.sid");
      res.status(200).json({ ok: true });
    });
  });
});

router.get("/me", (req, res) => {
  res.json({ user: req.user || null });
});

export default router;
```

---

## src/routes/letters.ts
```ts
import { Router } from "express";
import prisma from "../config/prisma";
import { requireAuth } from "../middleware/auth";
import { generateCoverLetterLatex } from "../services/geminiService";
import { compileLatexToPdf } from "../services/latexCompilerService";

const router = Router();

// All routes require login
router.use(requireAuth);

// List cover letters for the authenticated user
router.get("/", async (req, res, next) => {
  try {
    const userId = (req.user as any).id as string;
    const letters = await prisma.coverLetter.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    res.json(letters);
  } catch (err) {
    next(err);
  }
});

// Get one
router.get("/:id", async (req, res, next) => {
  try {
    const userId = (req.user as any).id as string;
    const { id } = req.params;

    const letter = await prisma.coverLetter.findFirst({ where: { id, userId } });
    if (!letter) return res.status(404).json({ error: "Not found" });
    res.json(letter);
  } catch (err) {
    next(err);
  }
});

// Create
router.post("/", async (req, res, next) => {
  try {
    const userId = (req.user as any).id as string;
    const { title, company, position, date, contentLatex } = req.body as {
      title: string; company: string; position: string; date: string | Date; contentLatex: string;
    };

    const created = await prisma.coverLetter.create({
      data: {
        title,
        company,
        position,
        date: new Date(date),
        contentLatex,
        userId,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// Update
router.put("/:id", async (req, res, next) => {
  try {
    const userId = (req.user as any).id as string;
    const { id } = req.params;
    const { title, company, position, date, contentLatex } = req.body as any;

    const existing = await prisma.coverLetter.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    const updated = await prisma.coverLetter.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        company: company ?? existing.company,
        position: position ?? existing.position,
        date: date ? new Date(date) : existing.date,
        contentLatex: contentLatex ?? existing.contentLatex,
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete
router.delete("/:id", async (req, res, next) => {
  try {
    const userId = (req.user as any).id as string;
    const { id } = req.params;

    const existing = await prisma.coverLetter.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    await prisma.coverLetter.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Generate from Gemini (does NOT save unless you pass save=true)
router.post("/generate", async (req, res, next) => {
  try {
    const userId = (req.user as any).id as string;
    const { jobDescription, applicantName, applicantEmail, applicantPhone, company, position, templateLatex, save } = req.body as any;

    if (!jobDescription || !applicantName) return res.status(400).json({ error: "jobDescription and applicantName are required" });

    const latex = await generateCoverLetterLatex({
      jobDescription,
      applicantName,
      applicantEmail,
      applicantPhone,
      company,
      position,
      templateLatex,
    });

    if (save) {
      const created = await prisma.coverLetter.create({
        data: {
          title: `${position ?? "Cover Letter"} – ${company ?? "Company"}`.slice(0, 255),
          company: company ?? "",
          position: position ?? "",
          date: new Date(),
          contentLatex: latex,
          userId,
        },
      });
      return res.status(201).json({ latex, saved: created });
    }

    res.json({ latex });
  } catch (err) {
    next(err);
  }
});

// Compile a letter by ID and stream the PDF back
router.post("/:id/compile", async (req, res, next) => {
  try {
    const userId = (req.user as any).id as string;
    const { id } = req.params;

    const letter = await prisma.coverLetter.findFirst({ where: { id, userId } });
    if (!letter) return res.status(404).json({ error: "Not found" });

    const compiled = await compileLatexToPdf(letter.contentLatex);

    if (compiled.buffer) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=cover-letter-${id}.pdf`);
      return res.send(compiled.buffer);
    }
    if (compiled.pdfUrl) {
      return res.json({ pdfUrl: compiled.pdfUrl });
    }
    throw new Error("Unexpected compiler response");
  } catch (err) {
    next(err);
  }
});

export default router;
```

---

## src/types/express-session.d.ts
```ts
import "express-session";

declare module "express-session" {
  interface SessionData {
    passport?: {
      user?: string;
    };
  }
}
```

---

## src/index.ts
```ts
import express from "express";
import session from "express-session";
import cors from "cors";
import morgan from "morgan";
import passport from "./config/passport";
import { ENV } from "./config/env";
import authRoutes from "./routes/auth";
import letterRoutes from "./routes/letters";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(
  cors({
    origin: ENV.CLIENT_ORIGIN,
    credentials: true,
  })
);

app.set("trust proxy", 1);
app.use(
  session({
    name: "sid",
    secret: ENV.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: ENV.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRoutes);
app.use("/api/letters", letterRoutes);

app.use(errorHandler);

app.listen(ENV.PORT, () => {
  console.log(`Server listening on http://localhost:${ENV.PORT}`);
});
```

---

## .env.example
```dotenv
# Server
NODE_ENV=development
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=please-change-me

# Postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/coverletterdb?schema=public

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Gemini
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# AWS LaTeX Compiler API (base URL, no trailing slash)
LATEX_COMPILER_API_URL=https://your-api-id.execute-api.region.amazonaws.com/prod
```

---

## package.json
```json
{
  "name": "coverletter-backend",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev --name init",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "@prisma/client": "^5.18.0",
    "axios": "^1.7.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-session": "^1.17.3",
    "morgan": "^1.10.0",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "prisma": "^5.18.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/express-session": "^1.17.8",
    "@types/node": "^20.14.10",
    "@types/passport-google-oauth20": "^2.0.12",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.5.4"
  }
}
```

---

## tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "Node",
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

---

# Quick start

```bash
cd server
cp .env.example .env
npm i
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

**Example requests**

- List letters: `GET /api/letters` (cookie session required)
- Create letter:
```http
POST /api/letters
Content-Type: application/json
{
  "title": "SWE Intern",
  "company": "Acme",
  "position": "Software Engineer Intern",
  "date": "2025-08-13",
  "contentLatex": "\\documentclass{article}\\begin{document}Hi\\end{document}"
}
```
- Generate (don’t save):
```http
POST /api/letters/generate
{
  "jobDescription": "Looking for a React + Node intern...",
  "applicantName": "Johnny Dong",
  "company": "Acme",
  "position": "SWE Intern"
}
```
- Compile to PDF download: `POST /api/letters/:id/compile` → returns a PDF file stream or `{ pdfUrl }` if your Lambda returns a URL.

Here’s a complete, working backend (TypeScript, Express, Passport/Google, Prisma/Postgres, Gemini, and the AWS LaTeX compiler integration). I put all files in a single canvas so you can copy the project as-is, run migrations, and start the server.

Quick start:

create DB + .env from the example,

npm i,

npm run prisma:generate && npm run prisma:migrate,

npm run dev.

If your Lambda returns a signed pdf_url instead of base64, the /api/letters/:id/compile route already handles that.

Want me to add a minimal REST client for your React app (auth + letters CRUD + compile + generate) next?