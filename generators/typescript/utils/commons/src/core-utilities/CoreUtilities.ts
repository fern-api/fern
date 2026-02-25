import { Auth } from "./Auth.js";
import { CallbackQueue } from "./CallbackQueue.js";
import { CustomPagination } from "./CustomPagination.js";
import { Fetcher } from "./Fetcher.js";
import { FileUtils } from "./FileUtils.js";
import { FormDataUtils } from "./FormDataUtils.js";
import { Logging } from "./Logging.js";
import { Pagination } from "./Pagination.js";
import { Runtime } from "./Runtime.js";
import { Stream } from "./Stream.js";
import { UrlUtils } from "./UrlUtils.js";
import { Utils } from "./Utils.js";
import { WebhookCrypto } from "./WebhookCrypto.js";
import { Websocket } from "./Websocket.js";
import { Zurg } from "./Zurg.js";

export interface CoreUtilities {
    zurg: Zurg;
    fetcher: Fetcher;
    stream: Stream;
    callbackQueue: CallbackQueue;
    auth: Auth;
    formDataUtils: FormDataUtils;
    runtime: Runtime;
    pagination: Pagination;
    customPagination: CustomPagination;
    utils: Utils;
    websocket: Websocket;
    fileUtils: FileUtils;
    urlUtils: UrlUtils;
    logging: Logging;
    webhookCrypto: WebhookCrypto;
}
