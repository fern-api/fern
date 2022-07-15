import { Fetcher } from "./Fetcher";
import { MaybeGetter } from "./MaybeGetter";

export declare namespace Service {
    interface Init {
        origin: string;
        authHeader?: MaybeGetter<string | undefined>;
        fetcher?: Fetcher;
    }
}
