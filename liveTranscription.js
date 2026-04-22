import { dg } from "./DGclient.js";
import fs from "fs";

const connection = await dg.listen.v1.connect({
    model: "nova-3",
    language: "en",
    punctuate: "true",
    interim_results: "true",

    encoding: "linear16",
    sample_rate: 16000,
});

const buffer = fs.readFileSync("recordings/audio-1776852296774.pcm");
const CHUNK_SIZE = 3200; // ~100ms (16000 samples/sec * 2 bytes * 0.1)
let offset = 0;

function sendChunk() {
    if (offset >= buffer.length) {
        console.log("Finished sending");

        connection.socket.send(JSON.stringify({ type: "CloseStream" }));
        return;
    }

    const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
    offset += CHUNK_SIZE;

    connection.socket.send(chunk);

    setTimeout(sendChunk, 100);
}


connection.on("open", () => {
    console.log("Connection opened");
    sendChunk();
});

connection.on("message", (data) => {
    if (data.type === "Results") {
        const transcript =
            data.channel?.alternatives?.[0]?.transcript;

        if (transcript) {
            console.log("Transcript:", transcript);
        }
    }
});

connection.connect();
await connection.waitForOpen();