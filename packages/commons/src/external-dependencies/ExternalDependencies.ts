import { Axios } from "./axios";
import { Express } from "./express";
import { FormData } from "./form-data";
import { Fs } from "./fs";
import { Stream } from "./stream";
import { UrlJoin } from "./url-join";
import { URLSearchParams } from "./url-search-params";

export interface ExternalDependencies {
    urlJoin: UrlJoin;
    express: Express;
    formData: FormData;
    fs: Fs;
    stream: Stream;
    URLSearchParams: URLSearchParams;
    axios: Axios;
}
