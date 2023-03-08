import { Express } from "./express/Express";
import { FormData } from "./form-data/FormData";
import { Fs } from "./fs";
import { UrlJoin } from "./url-join/UrlJoin";

export interface ExternalDependencies {
    urlJoin: UrlJoin;
    express: Express;
    formData: FormData;
    fs: Fs;
}
