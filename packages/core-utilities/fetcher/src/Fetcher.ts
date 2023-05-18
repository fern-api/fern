import { default as URLSearchParams } from "@ungap/url-search-params";
import axios, { AxiosAdapter, AxiosError } from "axios";
import { APIResponse } from "./APIResponse";

export interface FetchFunction {
    (args: Fetcher.Args & { responseType?: "json" }): Promise<APIResponse<unknown, Fetcher.Error>>;
    (args: Fetcher.Args & { responseType: "blob" }): Promise<APIResponse<Blob, Fetcher.Error>>;
}

export declare namespace Fetcher {
    export interface Args {
        url: string;
        method: string;
        contentType?: string;
        headers?: Record<string, string | undefined>;
        queryParameters?: URLSearchParams;
        body?: unknown;
        timeoutMs?: number;
        withCredentials?: boolean;
        responseType?: "json" | "blob";
        adapter?: AxiosAdapter;
        onUploadProgress?: (event: ProgressEvent) => void;
    }

    export type Error = FailedStatusCodeError | NonJsonError | TimeoutError | UnknownError;

    export interface FailedStatusCodeError {
        reason: "status-code";
        statusCode: number;
        body: unknown;
    }

    export interface NonJsonError {
        reason: "non-json";
        statusCode: number;
        rawBody: string;
    }

    export interface TimeoutError {
        reason: "timeout";
    }

    export interface UnknownError {
        reason: "unknown";
        errorMessage: string;
    }
}

function fetcherImpl(args: Fetcher.Args & { responseType?: "json" }): Promise<APIResponse<unknown, Fetcher.Error>>;
function fetcherImpl(args: Fetcher.Args & { responseType: "blob" }): Promise<APIResponse<Blob, Fetcher.Error>>;
async function fetcherImpl(args: Fetcher.Args): Promise<APIResponse<unknown, Fetcher.Error>> {
    const headers: Record<string, string> = {};
    if (args.body !== undefined && args.contentType != null) {
        headers["Content-Type"] = args.contentType;
    }

    if (args.headers != null) {
        for (const [key, value] of Object.entries(args.headers)) {
            if (value != null) {
                headers[key] = value;
            }
        }
    }

    try {
        const response = await axios({
            url: args.url,
            params: args.queryParameters,
            method: args.method,
            headers,
            data: args.body,
            validateStatus: () => true,
            transformResponse: (response) => response,
            timeout: args.timeoutMs,
            transitional: {
                clarifyTimeoutError: true,
            },
            withCredentials: args.withCredentials,
            adapter: args.adapter,
            onUploadProgress: args.onUploadProgress,
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            responseType: args.responseType ?? "json",
        });

        let body: unknown;
        if (response.data != null && response.data.length > 0) {
            try {
                body = JSON.parse(response.data) ?? undefined;
            } catch {
                return {
                    ok: false,
                    error: {
                        reason: "non-json",
                        statusCode: response.status,
                        rawBody: response.data,
                    },
                };
            }
        }

        if (response.status >= 200 && response.status < 400) {
            return {
                ok: true,
                body,
            };
        } else {
            return {
                ok: false,
                error: {
                    reason: "status-code",
                    statusCode: response.status,
                    body,
                },
            };
        }
    } catch (error) {
        if ((error as AxiosError).code === "ETIMEDOUT") {
            return {
                ok: false,
                error: {
                    reason: "timeout",
                },
            };
        }

        return {
            ok: false,
            error: {
                reason: "unknown",
                errorMessage: (error as AxiosError).message,
            },
        };
    }
}

export const fetcher: FetchFunction = fetcherImpl;
