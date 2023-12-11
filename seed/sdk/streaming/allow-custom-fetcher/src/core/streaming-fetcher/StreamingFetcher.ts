import axios, { AxiosAdapter } from "axios";
import qs from "qs";
import { Readable } from "stream";

export type StreamingFetchFunction = (args: StreamingFetcher.Args) => Promise<StreamingFetcher.Response>;

export declare namespace StreamingFetcher {
    export interface Args {
        url: string;
        method: string;
        headers?: Record<string, string | undefined>;
        queryParameters?: Record<string, string | string[]>;
        body?: unknown;
        timeoutMs?: number;
        withCredentials?: boolean;
        adapter?: AxiosAdapter;

        abortController?: AbortController;
    }

    export interface Response {
        data: Readable;
        headers: Record<string, any>;
    }
}

export const streamingFetcher: StreamingFetchFunction = async (args) => {
    const headers: Record<string, string> = {};
    if (args.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }
    if (args.headers != null) {
        for (const [key, value] of Object.entries(args.headers)) {
            if (value != null) {
                headers[key] = value;
            }
        }
    }

    const response = await axios({
        url: args.url,
        params: args.queryParameters,
        paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: "repeat" });
        },
        method: args.method,
        headers,
        data: args.body,
        timeout: args.timeoutMs,
        transitional: {
            clarifyTimeoutError: true,
        },
        withCredentials: args.withCredentials,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        signal: args.abortController?.signal,
        responseType: "stream",
        adapter: args.adapter,
    });

    return {
        data: response.data,
        headers: response.headers,
    };
};
