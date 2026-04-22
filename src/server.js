import { WebSocketServer } from 'ws';
import fs from 'fs';

fs.mkdirSync('recordings', { recursive: true });

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    let fileStream = null;
    let filename = '';

    ws.on('message', (data, isBinary) => {
        if (isBinary) {
            if (fileStream) {
                fileStream.write(data);
            }
        } else {
            const msg = JSON.parse(data.toString());

            if (msg.type === 'start') {
                console.log('Stream started');

                filename = `recordings/audio-${Date.now()}.pcm`;
                fileStream = fs.createWriteStream(filename);
            }

            if (msg.type === 'stop') {
                console.log('Stream stopped');

                fileStream?.end();
                fileStream = null;

                console.log('Saved:', filename);
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        fileStream?.end();
    });
});

console.log('WebSocket server running on ws://localhost:3000');