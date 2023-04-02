import URLSearchParams from "@ungap/url-search-params";
import axios, { AxiosAdapter, AxiosResponse } from "axios";

export type StreamingFetchFunction = (args: StreamingFetcher.Args) => Promise<void>;

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

        onData: (data: unknown) => void;
        onError?: (err: unknown) => void;
        onFinish?: () => void;
        abortController?: AbortController;
        terminator?: string;
    }
}

const DATA_EVENT_REGEX = /data: (.*)/;

export const streamingFetcher: StreamingFetchFunction = async (args) => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

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
            timeout: args.timeoutMs ?? 60_000,
            withCredentials: args.withCredentials,
            signal: args.abortController?.signal,
            responseType: "stream",
            adapter: args.adapter,
        });
    } catch (error) {
        args.onError?.(error);
        return;
    }

    response.data.on("data", (data: Buffer) => {
        for (const line of data.toString().split("\n")) {
            const data = line.match(DATA_EVENT_REGEX)?.[1];
            if (data == null || data === args.terminator) {
                continue;
            }

            try {
                const parsed = JSON.parse(data);
                args.onData(parsed);
            } catch (error) {
                args.onError?.(error);
            }
        }
    });

    if (args.onFinish != null) {
        response.data.on("end", args.onFinish);
    }
};
