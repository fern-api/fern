import { Fetcher } from "./Fetcher";

export declare namespace Service {
    interface Init {
        serverUrl: string;
        token?: Fetcher.Args["token"];
        fetcher?: Fetcher;
    }
}
