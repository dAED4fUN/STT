import fs from "fs";

const buffer = fs.readFileSync("recordings/audio-1776852296774.pcm");

const CHUNK_SIZE = 3200; // ~100ms (16000 samples/sec * 2 bytes * 0.1)

let offset = 0;

export default function sendChunk() {
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