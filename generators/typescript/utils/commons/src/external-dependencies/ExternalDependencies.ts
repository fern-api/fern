import { Blob_ } from "./blob/index.js";
import { Express } from "./express/Express.js";
import { Fs } from "./fs/index.js";
import { Stream } from "./stream/index.js";

export interface ExternalDependencies {
    express: Express;
    fs: Fs;
    blob: Blob_;
    stream: Stream;
}
