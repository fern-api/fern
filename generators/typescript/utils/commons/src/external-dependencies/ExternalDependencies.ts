import { Express } from "./express/Express";
import { Fs } from "./fs";
import { Stream } from "./stream";
import { UrlJoin } from "./url-join/UrlJoin";

export interface ExternalDependencies {
    urlJoin: UrlJoin;
    express: Express;
    fs: Fs;
    stream: Stream;
}
