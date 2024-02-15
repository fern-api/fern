import axios, { AxiosAdapter, AxiosError, AxiosResponse } from "axios";
import qs from "qs";
import { APIResponse } from "./APIResponse";

export type FetchFunction = <R = unknown>(args: Fetcher.Args) => Promise<APIResponse<R, Fetcher.Error>>;

export declare namespace Fetcher {
    export interface Args {
        url: string;
        method: string;
        contentType?: string;
        headers?: Record<string, string | undefined>;
        queryParameters?: Record<string, string | string[]>;
        body?: unknown;
        timeoutMs?: number;
        maxRetries?: number;
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

const INITIAL_RETRY_DELAY = 1;
const MAX_RETRY_DELAY = 60;
const DEFAULT_MAX_RETRIES = 2;

async function fetcherImpl<R = unknown>(args: Fetcher.Args): Promise<APIResponse<R, Fetcher.Error>> {
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

    const makeRequest = async (): Promise<AxiosResponse> =>
        await axios({
            url: args.url,
            params: args.queryParameters,
            paramsSerializer: (params) => {
                return qs.stringify(params, { arrayFormat: "repeat" });
            },
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

    try {
        let response = await makeRequest();

        for (let i = 0; i < (args.maxRetries ?? DEFAULT_MAX_RETRIES); ++i) {
            if (
                response.status === 408 ||
                response.status === 409 ||
                response.status === 429 ||
                response.status >= 500
            ) {
                const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(i, 2), MAX_RETRY_DELAY);
                response = await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                break;
            }
        }

        let body: unknown;
        if (args.responseType === "blob") {
            body = response.data;
        } else if (response.data != null && response.data.length > 0) {
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
                body: body as R,
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
