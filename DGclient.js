import { DeepgramClient } from "@deepgram/sdk";
import dotenv from "dotenv";
dotenv.config();

export const dg = new DeepgramClient(process.env.DG_API_KEY);

const connection = await dg.listen.v1.connect({
    model: "nova-3",
    language: "en",
    punctuate: "true",
    interim_results: "true",
});

connection.on("open", () => {
    console.log("Connected to Deepgram");
});

connection.on("message", (data) => {
    console.log(data);
});

connection.on("error", (error) => {
    console.log(error);
});

connection.on("close", () => {
    console.log("Disconnected from Deepgram");
});