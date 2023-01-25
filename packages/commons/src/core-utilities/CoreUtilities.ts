import { Auth } from "./auth/Auth";
import { BaseCoreUtilities } from "./base/BaseCoreUtilities";
import { Fetcher } from "./fetcher/Fetcher";
import { Zurg } from "./zurg/Zurg";

export interface CoreUtilities {
    zurg: Zurg;
    fetcher: Fetcher;
    auth: Auth;
    base: BaseCoreUtilities;
}
