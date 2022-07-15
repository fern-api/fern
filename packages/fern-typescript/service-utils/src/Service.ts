import { Token } from "./BearerToken";
import { Fetcher } from "./Fetcher";
import { MaybeGetter } from "./MaybeGetter";

export declare namespace Service {
    interface Init {
        origin: string;
        token?: MaybeGetter<Token | undefined>;
        fetcher?: Fetcher;
    }
}
