export type FetcherV2 = (args: FetcherV2.Args) => Promise<FetcherV2.Response>;

export declare namespace FetcherV2 {
    export interface Args {
        url: string;
        method: string;
        headers?: Record<string, string | null | undefined>;
        authHeader?: string | undefined;
        queryParameters?: URLSearchParams;
        body?: {
            content: unknown;
            contentType: string;
        };
    }

    export interface Response {
        ok: boolean;
        body: unknown;
    }
}
