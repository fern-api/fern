import { Auth } from "./Auth";
import { CallbackQueue } from "./CallbackQueue";
import { Fetcher } from "./Fetcher";
import { FormDataUtils } from "./FormDataUtils";
import { Pagination } from "./Pagination";
import { Runtime } from "./Runtime";
import { Stream } from "./Stream";
import { Utils } from "./Utils";
import { Websocket } from "./Websocket";
import { Zurg } from "./Zurg";

export interface CoreUtilities {
    zurg: Zurg;
    fetcher: Fetcher;
    stream: Stream;
    callbackQueue: CallbackQueue;
    auth: Auth;
    formDataUtils: FormDataUtils;
    runtime: Runtime;
    pagination: Pagination;
    utils: Utils;
    websocket: Websocket;
}
