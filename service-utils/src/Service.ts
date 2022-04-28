import { Fetcher } from "./Fetcher";

export declare namespace Service {
    interface Init {
        serverUrl: string;
        serviceBaseUrl?: string;
        fetcher?: Fetcher;
    }
}
