import { Auth } from "./Auth";
import { CallbackQueue } from "./CallbackQueue";
import { Fetcher } from "./Fetcher";
import { FileUtils } from "./FileUtils";
import { FormDataUtils } from "./FormDataUtils";
import { Logging } from "./Logging";
import { Pagination } from "./Pagination";
import { Runtime } from "./Runtime";
import { SerializationCodeGenerator } from "./schema-generator/SchemaGenerator";
import { Stream } from "./Stream";
import { UrlUtils } from "./UrlUtils";
import { Utils } from "./Utils";
import { Websocket } from "./Websocket";

export interface CoreUtilities {
    serializer: SerializationCodeGenerator;
    fetcher: Fetcher;
    stream: Stream;
    callbackQueue: CallbackQueue;
    auth: Auth;
    formDataUtils: FormDataUtils;
    runtime: Runtime;
    pagination: Pagination;
    utils: Utils;
    websocket: Websocket;
    fileUtils: FileUtils;
    urlUtils: UrlUtils;
    logging: Logging;
}
