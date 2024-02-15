import { Auth } from "./auth/Auth";
import { BaseCoreUtilities } from "./base/BaseCoreUtilities";
import { CallbackQueue } from "./callback-queue/CallbackQueue";
import { Fetcher } from "./fetcher/Fetcher";
import { FormDataUtils } from "./form-data-utils/FormDataUtils";
import { StreamUtils } from "./stream-utils/StreamUtils";
import { Zurg } from "./zurg/Zurg";

export interface CoreUtilities {
    zurg: Zurg;
    fetcher: Fetcher;
    streamUtils: StreamUtils;
    callbackQueue: CallbackQueue;
    auth: Auth;
    base: BaseCoreUtilities;
    formDataUtils: FormDataUtils;
}
