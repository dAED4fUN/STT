import { createReadStream } from "fs";
import { dg } from "./DGclient.js";

const response = await dg.listen.v1.media.transcribeFile(
    createReadStream("harvard.wav"),
    { model: "nova-3" }
);
console.log(response.results.channels[0].alternatives[0].transcript);