import { SarvamAIClient } from "sarvamai";
import dotenv from "dotenv";
dotenv.config();

export const sarvam = new SarvamAIClient({
    apiKey: process.env.SARVAM_API_KEY
});

const response = await sarvam.text.translate({
    input: "Hi, My Name is Vinayak.",
    source_language_code: "auto",
    target_language_code: "hi-IN",
    speaker_gender: "Male"
});