import { Auth } from "./auth/Auth";
import { BaseCoreUtilities } from "./base/BaseCoreUtilities";
import { CallbackQueue } from "./callback-queue/CallbackQueue";
import { Fetcher } from "./fetcher/Fetcher";
import { StreamingFetcher } from "./streaming-fetcher/StreamingFetcher";
import { Zurg } from "./zurg/Zurg";

export interface CoreUtilities {
    zurg: Zurg;
    fetcher: Fetcher;
    streamingFetcher: StreamingFetcher;
    callbackQueue: CallbackQueue;
    auth: Auth;
    base: BaseCoreUtilities;
}
