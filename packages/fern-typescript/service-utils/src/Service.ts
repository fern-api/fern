import { Fetcher } from "./Fetcher";
import { MaybeGetter } from "./MaybeGetter";
import { Token } from "./Token";

export declare namespace Service {
    interface Init {
        origin: string;
        token?: MaybeGetter<Token | undefined>;
        fetcher?: Fetcher;
    }
}
