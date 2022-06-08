import { Fetcher } from "./Fetcher";
import { Token } from "./Token";

export declare namespace Service {
    interface Init {
        origin: string;
        token?: Token;
        fetcher?: Fetcher;
    }
}
