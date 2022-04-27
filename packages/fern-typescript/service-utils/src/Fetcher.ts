export type Fetcher = (args: Fetcher.Args) => Promise<Fetcher.Response>;

export declare namespace Fetcher {
    export interface Args {
        url: string;
        method: string;
        headers?: Record<string, string>;
        token?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        request?: any;
    }

    export interface Response {
        statusCode: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: any;
    }
}
