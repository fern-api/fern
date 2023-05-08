import URLSearchParams from "@ungap/url-search-params";
import axios, { AxiosAdapter, AxiosResponse } from "axios";
import { Readable } from "stream";

export type StreamingFetchFunction = (args: StreamingFetcher.Args) => Promise<Readable>;

export declare namespace StreamingFetcher {
    export interface Args {
        url: string;
        method: string;
        headers?: Record<string, string | undefined>;
        queryParameters?: URLSearchParams;
        body?: unknown;
        timeoutMs?: number;
        withCredentials?: boolean;
        adapter?: AxiosAdapter;

        onData?: (data: unknown) => void;
        onError?: (err: unknown) => void;
        onFinish?: () => void;
        abortController?: AbortController;
        responseChunkPrefix?: string;
        terminator?: string;
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

    let response: AxiosResponse;
    try {
        response = await axios({
            url: args.url,
            params: args.queryParameters,
            method: args.method,
            headers,
            data: args.body,
            timeout: args.timeoutMs,
            transitional: {
                clarifyTimeoutError: true,
            },
            withCredentials: args.withCredentials,
            signal: args.abortController?.signal,
            responseType: "stream",
            adapter: args.adapter,
        });
    } catch (error) {
        args.onError?.(error);
        return;
    }

    if (args.onData != null) {
        const { onData } = args;
        response.data.on("data", (data: Buffer) => {
            for (const line of data.toString().split("\n")) {
                let data = line;
                if (args.responseChunkPrefix != null) {
                    if (!data.startsWith(args.responseChunkPrefix)) {
                        continue;
                    }
                    data = data.substring(args.responseChunkPrefix.length);
                }

                try {
                    const parsed = JSON.parse(data);
                    onData(parsed);
                } catch (error) {
                    args.onError?.(error);
                }
            }
        });
    }

    if (args.onFinish != null) {
        response.data.on("end", args.onFinish);
    }

    return response.data;
};
