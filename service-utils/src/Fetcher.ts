export interface Fetcher {
    fetch: (args: Fetcher.Args) => Promise<Fetcher.Response>;
}

export declare namespace Fetcher {
    export interface Args {
        url: string;
        method: string;
        headers?: Record<string, string>;
    }

    export interface Response {
        text: string;
        statusCode: number;
    }
}
