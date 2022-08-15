import { Fetcher } from "./Fetcher";
import { Supplier } from "./Supplier";

export declare namespace Service {
    interface Init {
        origin: string;
        authHeader?: Supplier<string | undefined>;
        fetcher?: Fetcher;
    }
}
