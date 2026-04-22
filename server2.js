import { WebSocketServer } from 'ws';
import { dg } from './DGclient.js';

function getRMS(buffer) {
    let sum = 0;
    for (let i = 0; i < buffer.length; i += 2) {
        const sample = buffer.readInt16LE(i);
        sum += sample * sample;
    }
    return Math.sqrt(sum / (buffer.length / 2));
}

const SILENCE_THRESHOLD = 500; // tune this
function isSpeech(buffer) {
    return getRMS(buffer) > SILENCE_THRESHOLD;
}

function safeSend(socket, chunk) {
    const MAX_BUFFER = 1e6;
    const buffered = socket.bufferedAmount || 0;
    console.log(socket.readyState, buffered, MAX_BUFFER);
    if (socket.readyState === 1 && buffered < MAX_BUFFER) {
        console.log('Sending Chunk', buffered)
        socket.send(chunk);
        return true;
    }
    console.log('No chunk sent', socket.bufferedAmount)
    return false;
}

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', async (ws) => {
    console.log('Client connected');

    const connection = await dg.listen.v1.connect({
        model: "nova-3",
        language: "en",
        punctuate: "true",
        interim_results: "true",

        encoding: "linear16",
        sample_rate: 16000,
    });
    connection.connect()
    await connection.waitForOpen()
    console.log('Deepgram Socket', connection.socket.readyState)

    let isSpeaking = false;
    let silenceFrames = 0;


    connection.on("open", () => {
        console.log("Connected to Deepgram");
    });

    connection.on("message", (data) => {
        if (data.type === "Results") {
            const transcript =
                data.channel?.alternatives?.[0]?.transcript;

            if (transcript) {
                ws.send(JSON.stringify({
                    type: 'transcript',
                    text: transcript,
                    isFinal: data.is_final,
                }));
            }
        }
    });

    ws.on('message', (data, isBinary) => {
        if (!isBinary) return;

        const buffer = Buffer.from(data);

        if (isSpeech(buffer)) {
            isSpeaking = true;
            silenceFrames = 0;

            safeSend(connection.socket, buffer);
        } else {
            silenceFrames++;
            // allow small silence gaps (natural speech)
            if (isSpeaking && silenceFrames < 10) {
                safeSend(connection.socket, buffer);
            }

            // long silence → reset speech state
            if (silenceFrames >= 10) {
                isSpeaking = false;
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        setTimeout(() => {
            connection.socket.send(JSON.stringify({ type: "CloseStream" }));
            connection.socket.close();
        }, 5000)
    });
});

console.log('WebSocket server running on ws://localhost:3000');