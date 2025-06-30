import { Blob_ } from "./blob";
import { Express } from "./express/Express";
import { Fs } from "./fs";
import { qs } from "./qs";
import { Stream } from "./stream";

export interface ExternalDependencies {
    express: Express;
    fs: Fs;
    blob: Blob_;
    stream: Stream;
    qs: qs;
}
