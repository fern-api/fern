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

    const url =
        Object.keys(args.queryParameters ?? {}).length > 0
            ? `${args.url}?${qs.stringify(args.queryParameters, { arrayFormat: "repeat" })}`
            : args.url;

    const makeRequest = async (): Promise<Response> => {
        const controller = new AbortController();
        let abortId = undefined;
        if (args.timeoutMs != null) {
            abortId = setTimeout(() => controller.abort(), args.timeoutMs);
        }
        const response = await fetch(url, {
            method: args.method,
            headers,
            body: args.body === undefined ? undefined : JSON.stringify(args.body),
            signal: controller.signal,
            credentials: args.withCredentials ? "same-origin" : undefined,
        });
        if (abortId != null) {
            clearTimeout(abortId);
        }
        return response;
    };

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
                await new Promise((resolve) => setTimeout(resolve, delay));
                response = await makeRequest();
            } else {
                break;
            }
        }

        let body: unknown;
        if (response.body != null && args.responseType === "blob") {
            body = await response.blob();
        } else if (response.body != null) {
            try {
                body = await response.json();
            } catch {
                return {
                    ok: false,
                    error: {
                        reason: "non-json",
                        statusCode: response.status,
                        rawBody: await response.text(),
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
        if (error instanceof Error && error.name === "AbortError") {
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
                errorMessage: JSON.stringify(error),
            },
        };
    }
}

export const fetcher: FetchFunction = fetcherImpl;
