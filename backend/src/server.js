import express from 'express';
import session from "express-session";
import cors from "cors";
import morgan from "morgan";
import passport from 'passport';
import { ENV } from './config/env.js';
import authRoutes from "./routes/auth.js";
import letterRoutes from "./routes/letters.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(morgan("dev")); // change to "combined in production"

app.use(express.json({ limit: "2mb" }))
app.use(
    cors({
        origin: ENV.CLIENT_ORIGIN,
        credentials: true
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

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/auth", authRoutes);
app.use("/api/letters", letterRoutes);

app.use(errorHandler);

app.listen(ENV.PORT, () => {
    console.log(`Server listening on http://localhost:${ENV.PORT}`);
});