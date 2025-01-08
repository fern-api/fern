import { Auth } from "./auth/Auth";
import { BaseCoreUtilities } from "./base/BaseCoreUtilities";
import { CallbackQueue } from "./callback-queue/CallbackQueue";
import { Fetcher } from "./fetcher/Fetcher";
import { FormDataUtils } from "./form-data-utils/FormDataUtils";
import { Pagination } from "./pagination/Pagination";
import { PromiseUtils } from "./promise/PromiseUtils";
import { Runtime } from "./runtime/Runtime";
import { StreamUtils } from "./stream-utils/StreamUtils";
import { Utils } from "./utils/Utils";
import { Zurg } from "./zurg/Zurg";

export interface CoreUtilities {
    zurg: Zurg;
    fetcher: Fetcher;
    streamUtils: StreamUtils;
    callbackQueue: CallbackQueue;
    auth: Auth;
    base: BaseCoreUtilities;
    formDataUtils: FormDataUtils;
    runtime: Runtime;
    pagination: Pagination;
    utils: Utils;
    promiseUtils: PromiseUtils;
}
