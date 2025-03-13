import { Blob_ } from "./blob";
import { Express } from "./express/Express";
import { Fs } from "./fs";
import { qs } from "./qs";
import { Stream } from "./stream";
import { UrlJoin } from "./url-join/UrlJoin";

export interface ExternalDependencies {
    urlJoin: UrlJoin;
    express: Express;
    fs: Fs;
    blob: Blob_;
    stream: Stream;
    qs: qs;
}
