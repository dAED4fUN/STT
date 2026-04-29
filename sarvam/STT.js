import { sarvam } from "./sarvamClient.js";
import fs from "fs";

const response = await sarvam.speechToText.transcribe({
    file: fs.readFileSync("harvard.wav"),
    input_audio_codec: "wav",
    language_code: "en-IN"
});

console.log(response);