import { Zurg } from "@fern-typescript/commons";
import { Auth } from "./implementations/Auth";
import { BaseCoreUtilities } from "./implementations/BaseCoreUtilities";
import { Fetcher } from "./implementations/Fetcher";

export interface CoreUtilities {
    zurg: Zurg;
    fetcher: Fetcher;
    auth: Auth;
    base: BaseCoreUtilities;
}
