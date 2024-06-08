import qs from "qs";
import { RUNTIME } from "../runtime";
import { APIResponse } from "./APIResponse";

export type FetchFunction = <R = unknown>(args: Fetcher.Args) => Promise<APIResponse<R, Fetcher.Error>>;

export declare namespace Fetcher {
    export interface Args {
        url: string;
        method: string;
        contentType?: string;
        headers?: Record<string, string | undefined>;
        queryParameters?: Record<string, string | string[] | object | object[]>;
        body?: unknown;
        timeoutMs?: number;
        maxRetries?: number;
        withCredentials?: boolean;
        abortSignal?: AbortSignal;
        responseType?: "json" | "blob" | "streaming" | "text";
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

    let body: BodyInit | undefined = undefined;
    const maybeStringifyBody = (body: any) => {
        if (body instanceof Uint8Array) {
            return body;
        } else if (args.contentType === "application/x-www-form-urlencoded" && typeof args.body === "string") {
            return args.body;
        } else {
            return JSON.stringify(body);
        }
    };

    if (RUNTIME.type === "node") {
        if (args.body instanceof (await import("formdata-node")).FormData) {
            // @ts-expect-error
            body = args.body;
        } else {
            body = maybeStringifyBody(args.body);
        }
    } else {
        if (args.body instanceof (await import("form-data")).default) {
            // @ts-expect-error
            body = args.body;
        } else {
            body = maybeStringifyBody(args.body);
        }
    }

    const fetchFn = await getFetchFn();

    const makeRequest = async (): Promise<Response> => {
        const signals: AbortSignal[] = [];

        // Add timeout signal
        let timeoutAbortId: NodeJS.Timeout | undefined = undefined;
        if (args.timeoutMs != null) {
            const { signal, abortId } = getTimeoutSignal(args.timeoutMs);
            timeoutAbortId = abortId;
            signals.push(signal);
        }

        // Add arbitrary signal
        if (args.abortSignal != null) {
            signals.push(args.abortSignal);
        }

        const response = await fetchFn(url, {
            method: args.method,
            headers,
            body,
            signal: anySignal(signals),
            credentials: args.withCredentials ? "include" : undefined,
        });

        if (timeoutAbortId != null) {
            clearTimeout(timeoutAbortId);
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
        } else if (response.body != null && args.responseType === "streaming") {
            body = response.body;
        } else if (response.body != null && args.responseType === "text") {
            body = await response.text();
        } else {
            const text = await response.text();
            if (text.length > 0) {
                try {
                    body = JSON.parse(text);
                } catch (err) {
                    return {
                        ok: false,
                        error: {
                            reason: "non-json",
                            statusCode: response.status,
                            rawBody: text,
                        },
                    };
                }
            }
        }

        if (response.status >= 200 && response.status < 400) {
            return {
                ok: true,
                body: body as R,
                headers: response.headers,
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
        if (args.abortSignal != null && args.abortSignal.aborted) {
            return {
                ok: false,
                error: {
                    reason: "unknown",
                    errorMessage: "The user aborted a request",
                },
            };
        } else if (error instanceof Error && error.name === "AbortError") {
            return {
                ok: false,
                error: {
                    reason: "timeout",
                },
            };
        } else if (error instanceof Error) {
            return {
                ok: false,
                error: {
                    reason: "unknown",
                    errorMessage: error.message,
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

const TIMEOUT = "timeout";

function getTimeoutSignal(timeoutMs: number): { signal: AbortSignal; abortId: NodeJS.Timeout } {
    const controller = new AbortController();
    const abortId = setTimeout(() => controller.abort(TIMEOUT), timeoutMs);
    return { signal: controller.signal, abortId };
}

/**
 * Returns an abort signal that is getting aborted when
 * at least one of the specified abort signals is aborted.
 *
 * Requires at least node.js 18.
 */
function anySignal(...args: AbortSignal[] | [AbortSignal[]]): AbortSignal {
    // Allowing signals to be passed either as array
    // of signals or as multiple arguments.
    const signals = <AbortSignal[]>(args.length === 1 && Array.isArray(args[0]) ? args[0] : args);

    const controller = new AbortController();

    for (const signal of signals) {
        if (signal.aborted) {
            // Exiting early if one of the signals
            // is already aborted.
            controller.abort((signal as any)?.reason);
            break;
        }

        // Listening for signals and removing the listeners
        // when at least one symbol is aborted.
        signal.addEventListener("abort", () => controller.abort((signal as any)?.reason), {
            signal: controller.signal,
        });
    }

    return controller.signal;
}

/**
 * Returns a fetch function based on the runtime
 */
async function getFetchFn(): Promise<any> {
    // In Node.js environments, the SDK always uses`node-fetch`.
    if (RUNTIME.type === "node") {
        return (await import("node-fetch")).default as any;
    }

    // Otherwise the SDK uses global fetch if available,
    // and falls back to node-fetch.
    if (typeof fetch == "function") {
        return fetch;
    }

    // Defaults to node `node-fetch` if global fetch isn't available
    return (await import("node-fetch")).default as any;
}

export const fetcher: FetchFunction = fetcherImpl;
