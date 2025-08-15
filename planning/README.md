I am building a online cover letter organizer and editor. The cover letters are in latex.

Functionalities:
- upload and delete cover letters
- Edit cover letters in latex
- set a cover letter as template (among the existing cover letters) and generate a new cover letter based on the template and a pasted job description (with gemini api).
- compiling and downloading as pdf (aws)
- login with google and data presistence for all the latex cover letters

Planned tech stack and tools:  
Frontend:
- vite-react with typescript
- tailwind
- monaco-editor for LaTeX editing

Backend:
- express
- prisma with postgreSQL
- passport (authentication)
- gemini
- aws lambda for pdf compilation (custom deployed with a docker image)

UI:
- A header with "Cover Pepper" to the right and settings and the name of the loged in user to the right.
  - click the name to show a login info dropdown and logout option.
- A directory panel to the left with a list of cover letters. Inside the panel:
  - a "new letter" button on the top for generating a letter based on template.
  - an "upload" button below it
  - a list of cover letters titles sorted by date, and with a special icon shown beside the current template
  - right click on a title to delete or set as template
- An edit panel to the right
  - An title (editable) on top right
  - A finish button on top right to compile and download
  - the latex body below (with out border)

Help me plan for the frontend implementation. Do not provide code yet. Include a general structure. Feel free to suggest other appropriate tools. I already have a simple backend with the following endpoints:

```
// list cover letters for an authenticated user
router.get("/", async (req, res, next) => {
    try {
        const userId = req.user.id;
        const letters = await prisma.coverLetter.findMany({
            where: { userId },
            orderBy: { date: "desc" },
        });
        res.json(letters);
    } catch (err) {
        next(err);
    }
});

// get specific letter with id and user
router.get("/:id", async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const letter = await prisma.coverLetter.findFirst({ where: { id, userId } });
        if (!letter) return res.status(404).json({ error: "Not found!" });
        res.json(letter);
    } catch (err) {
        next(err);
    }
});

// create a letter from upload
router.post("/upload", async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { contentLatex } = req.body;

        const generatedMeta = await generateCoverLetterMeta(contentLatex);
        const { title, company, position, date } = generatedMeta;

        const created = await prisma.coverLetter.create({
            data: {
                title,
                company,
                position,
                date,
                contentLatex,
                userId,
            }
        });
        res.status(201).json(created);
    } catch (err) {
        next(err);
    }
});

// update a letter
router.put("/:id", async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title, company, position, date, contentLatex } = req.body;

        const existing = await prisma.coverLetter.findFirst({ where: { id, userId } });
        if (!existing) return res.status(404).json({ error: "Not found" });

        const updated = await prisma.coverLetter.update({
            where: { id },
            data: {
                title: title ?? existing.title,
                company: company ?? existing.company,
                position: position ?? existing.position,
                date: date ?? existing.date,
                contentLatex: contentLatex ?? existing.contentLatex
            }
        });
        res.json(updated);
    } catch (err) {
        next(err)
    }
});

// delete a letter
router.delete("/:id", async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const existing = await prisma.coverLetter.findFirst({ where: { id, userId } });
        if (!existing) return res.status(404).json({ error: "Not found" });

        await prisma.coverLetter.delete({ where: { id } });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

// generate a letter from a job description and another letter as template
router.post("/generate", async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { jobDescription, templateLatex } = req.body;

        if (!jobDescription || !templateLatex)
            return res.status(400).json({ error: "Missing jobDescription or template!" });

        const generatedLatex = await generateCoverLetterLatex({ jobDescription, templateLatex });
        const generatedMeta = await generateCoverLetterMeta({ generatedLatex });
        const { title, company, position, date } = generatedMeta;

        const created = await prisma.coverLetter.create({
            data: {
                title,
                company,
                position,
                date,
                contentLatex: generatedLatex,
                userId
            }
        });

        res.status(201).json(created);
    } catch (err) {
        next(err);
    }
});

router.post("/:id/compile", async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const letter = await prisma.coverLetter.findFirst({ where: { id, userId } });
        if (!letter) return res.status(404).json({ error: "Not found" });

        const pdfBuffer = await compileLatexToPdf(letter.contentLatex);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${letter.title}"`);
        res.send(pdfBuffer);
    } catch (err) {
        next(err);
    }
})


// entry point to google auth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth/failure" }),
    (req, res) => {
        // on success
        res.redirect(process.env.CLIENT_ORIGIN);
    }
);

router.get("/failure", (req, res) => {
    res.status(401).json({ error: "Google authentication failed!" });
});

router.post("/logout", (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.clearCookie("connect.sid");
        res.status(200).json({ message: "Logout sucessful!" });
    });
});

router.get("/me", (req, res) => {
    res.json({ user: req.user || null });
});
```

# Implement frontend prompt
Provide a full implementation for the frontend. Use very minimal, mostly back and white styling.

Use these frameworks and tools: vite-react, tailwind, 




# Full Version
I am building a online cover letter organizer and editor. There will be a directory panel on the left with a list of cover letters, and an edit panel on the right. The cover letters are in latex, but there is a toggle button that allows editing in both latex an plain text formats.

The project will have the following functionalities:
- add, delete, and group cover letters into folders
- Edit cover letters as both latex and a plain text representation
- generate a new cover letter from a template given a job description (with gemini api)
- compiling and downloading as pdf (with another api)
- login with google and data presistence
- a settings page

Planned tech stack and tools:  
Frontend:
- vite-react with typescript
- tailwind
- monaco-editor for LaTeX editing
- editor.js for plain text editing
- sonner or react-hot-toast for notifications
- tinykeys for keyboad shortcut
- react-resizable-panels

Backend:
- express
- prisma with postgreSQL
- passport (authentication)
- gemini
- aws lambda for pdf compilation (deployed with docker image)


# To-Dos
## Frontend
- JD cleaning: in the dialog, optional “Clean formatting” button (strip HTML) before sending to backend.
- Ensure withCredentials on all requests; configure server CORS and SameSite for cookies

## Backend
- Input Validation
The /upload and /generate routes create new cover letters based on req.body content. The /update route also takes request body input. There is currently no validation to ensure that the data (contentLatex, jobDescription, templateLatex, etc.) is of the expected type and format. This could lead to errors or unexpected behavior in the generateCoverLetterMeta, generateCoverLetterLatex, and database operations.
Recommendation:
Implement a validation library like express-validator or zod to sanitize and validate incoming data.

- Security: Cross-Site Request Forgery (CSRF)
Your routes that modify data (/upload, /:id (PUT), /:id (DELETE), /generate, /logout) are potentially vulnerable to CSRF attacks. A malicious website could make a request to these endpoints from a user's browser without their consent.
Recommendation:
Implement CSRF protection. A common method is to use a library like csurf to generate and validate CSRF tokens for state-changing requests.