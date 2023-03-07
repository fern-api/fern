import { Auth } from "./auth/Auth";
import { BaseCoreUtilities } from "./base/BaseCoreUtilities";
import { Fetcher } from "./fetcher/Fetcher";
import { StreamingFetcher } from "./fetcher/StreamingFetcher";
import { Zurg } from "./zurg/Zurg";

export interface CoreUtilities {
    zurg: Zurg;
    fetcher: Fetcher;
    streamingFetcher: StreamingFetcher;
    auth: Auth;
    base: BaseCoreUtilities;
}
