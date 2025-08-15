Awesome — here’s a clear, end-to-end setup guide for the backend you’ve got in canvas (Express + Passport/Google + Prisma/Postgres + Gemini + AWS LaTeX compiler).

---

# 0) Prereqs

* **Node 20+** (`node -v`)
* **npm** (or pnpm/yarn if you prefer)
* **PostgreSQL 15+**

  * Quick Docker option (recommended for dev):

    ```bash
    docker run --name coverletter-pg -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_DB=coverletterdb -p 5432:5432 -d postgres:16
    ```
* A **Google OAuth2** client (for Sign-in with Google)
* A **Gemini API key** (Google AI Studio)
* Your **AWS LaTeX compiler** base URL

---

# 1) Get the code + install deps

Copy the files from the canvas into `server/` (keep the structure as shown), then:

```bash
cd server
npm i
```

---

# 2) Create `.env`

Duplicate `.env.example` → `.env`, then fill values:

```dotenv
NODE_ENV=development
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=please-change-me

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/coverletterdb?schema=public

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

GEMINI_API_KEY=...

LATEX_COMPILER_API_URL=https://your-api-id.execute-api.region.amazonaws.com/prod
```

**Notes**

* `CLIENT_ORIGIN` should match your Vite URL.
* `GOOGLE_CALLBACK_URL` must exactly match what you add in Google Cloud Console.
* `LATEX_COMPILER_API_URL` = base URL **without** trailing slash.

---

# 3) Set up Google OAuth (one-time)

1. Go to **Google Cloud Console** → Credentials → “Create OAuth client ID”.
2. App type: **Web application**.
3. Authorized **JavaScript origins**: `http://localhost:4000` (and your frontend origin, if Google complains).
4. Authorized **redirect URIs**:
   `http://localhost:4000/auth/google/callback`
5. Copy **Client ID/Secret** into `.env`.

---

# 4) Get a Gemini API key (one-time)

* In **Google AI Studio**, create an API key and put it in `GEMINI_API_KEY`.

---

# 5) Initialize Prisma & the DB

```bash
npm run prisma:generate
npm run prisma:migrate
# (Give the migration a name when prompted, e.g., init)
```

Optional: open Prisma Studio to inspect:

```bash
npm run prisma:studio
```

---

# 6) Run the backend (dev)

```bash
npm run dev
# Starts http://localhost:4000 with ts-node-dev (no manual compile in dev)
```

Health check:

```bash
curl http://localhost:4000/health
# {"ok":true}
```

---

# 7) Test Google login locally

In a browser, hit:

```
http://localhost:4000/auth/google
```

* After consenting, you’ll be redirected to `CLIENT_ORIGIN`.
* Your session is cookie-based; subsequent requests from the browser (or from your frontend with `withCredentials: true`) will be authenticated.

**Tip for frontend axios**:

```ts
const api = axios.create({
  baseURL: "http://localhost:4000",
  withCredentials: true, // VERY IMPORTANT for session cookies
});
```

**Tip for curl (cookie jar)**:

```bash
# 1) Open auth URL in a browser to get the cookie… or do a manual cookie jar flow:
curl -c cookies.txt -L http://localhost:4000/auth/google
# (Complete login in browser; then subsequent requests can use cookies.txt)
curl -b cookies.txt http://localhost:4000/auth/me
```

---

# 8) Create & list cover letters (examples)

**Create**

```bash
curl -b cookies.txt -X POST http://localhost:4000/api/letters \
  -H "Content-Type: application/json" \
  -d '{
    "title":"SWE Intern",
    "company":"Acme",
    "position":"Software Engineer Intern",
    "date":"2025-08-13",
    "contentLatex":"\\documentclass{article}\\begin{document}Hi\\end{document}"
  }'
```

**List**

```bash
curl -b cookies.txt http://localhost:4000/api/letters
```

**Get one**

```bash
curl -b cookies.txt http://localhost:4000/api/letters/<LETTER_ID>
```

**Update**

```bash
curl -b cookies.txt -X PUT http://localhost:4000/api/letters/<LETTER_ID> \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'
```

**Delete**

```bash
curl -b cookies.txt -X DELETE http://localhost:4000/api/letters/<LETTER_ID>
```

---

# 9) Generate LaTeX with Gemini (example)

* Does **not** save unless `save: true`.

```bash
curl -b cookies.txt -X POST http://localhost:4000/api/letters/generate \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription":"Looking for a React+Node intern to build internal tools...",
    "applicantName":"Johnny Dong",
    "company":"Acme",
    "position":"SWE Intern",
    "save": true
  }'
```

Returns `{ latex, saved }` (with the created letter if `save: true`).

---

# 10) Compile a letter to PDF via AWS API

```bash
curl -b cookies.txt -X POST http://localhost:4000/api/letters/<LETTER_ID>/compile \
  -o cover-letter.pdf
```

* If your Lambda returns `pdf_base64`, the backend streams a PDF file.
* If it returns `pdf_url`, the backend returns `{ "pdfUrl": "..." }`.

---

# 11) Common pitfalls & quick fixes

* **401 Unauthorized**

  * You’re not logged in or cookies didn’t get sent. Ensure:

    * You completed `/auth/google` in the same client.
    * **CORS**: backend `origin` includes your frontend; frontend uses `withCredentials: true`.
* **CORS errors**

  * Check `CLIENT_ORIGIN` in `.env`.
* **Google auth redirect mismatch**

  * `GOOGLE_CALLBACK_URL` must match the Console **exactly**.
* **Prisma DB connection errors**

  * Ensure Postgres is running and `DATABASE_URL` is correct.
* **LaTeX compile errors**

  * Inspect your Lambda logs; confirm your request path is exactly `/latex-compiler`.

---

# 12) Production notes (quick)

* Build once, run compiled JS:

  ```bash
  npm run build
  npm start
  ```
* Use **HTTPS** and set `NODE_ENV=production` so cookies become `secure`.
* Set a strong `SESSION_SECRET`.
* Run `prisma migrate deploy` on your server/CI.
* Put Express behind a reverse proxy (Nginx/Caddy) and keep `app.set("trust proxy", 1)`.

---

That’s it. If you want, I can also generate a minimal **frontend API client** (TypeScript) that talks to these routes (auth + CRUD + generate + compile) so you can plug it straight into your Vite app.
