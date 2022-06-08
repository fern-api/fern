import { Fetcher } from "./Fetcher";

export declare namespace Service {
    interface Init {
        origin: string;
        token?: Fetcher.Args["token"];
        fetcher?: Fetcher;
    }
}
