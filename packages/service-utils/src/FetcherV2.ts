export type FetcherV2 = (args: FetcherV2.Args) => Promise<FetcherV2.Response>;

export declare namespace FetcherV2 {
    export interface Args {
        url: string;
        method: string;
        headers?: Record<string, string | null | undefined>;
        authHeader?: string | undefined;
        queryParameters?: URLSearchParams;
        body?: unknown;
    }

    export type Response = ServerResponse | NetworkError;

    export interface ServerResponse {
        type: "server";
        ok: boolean;
        statusCode: number;
        body: unknown;
    }

    export interface NetworkError {
        type: "networkError";
        ok: false;
        body: void;
    }
}
