import { Auth } from "./auth/Auth";
import { BaseCoreUtilities } from "./base-core-utilities/BaseCoreUtilities";
import { CallbackQueue } from "./callback-queue/CallbackQueue";
import { Fetcher } from "./fetcher/Fetcher";
import { FormDataUtils } from "./form-data-utils/FormDataUtils";
import { Pagination } from "./pagination/Pagination";
import { Runtime } from "./runtime/Runtime";
import { StreamingFetcher } from "./streaming-fetcher/StreamingFetcher";
import { Utils } from "./utils/Utils";
import { Websocket } from "./websocket/Websocket";
import { Zurg } from "./zurg/Zurg";

export interface CoreUtilities {
    zurg: Zurg;
    fetcher: Fetcher;
    streamingFetcher: StreamingFetcher;
    callbackQueue: CallbackQueue;
    auth: Auth;
    baseCoreUtilities: BaseCoreUtilities;
    formDataUtils: FormDataUtils;
    runtime: Runtime;
    pagination: Pagination;
    utils: Utils;
    websocket: Websocket;
}
