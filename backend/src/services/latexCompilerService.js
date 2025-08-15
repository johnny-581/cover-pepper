import axios from "axios";
import { ENV } from "../config/env.js";

const api = axios.create({ baseURL: ENV.LATEX_COMPILER_API_URL });

export async function compileLatexToPdf(latexSource) {
    const response = await api.post("/latex-compiler", { latex_source: latexSource });
    const base64 = response.data;

    return Buffer.from(base64, "base64");
}