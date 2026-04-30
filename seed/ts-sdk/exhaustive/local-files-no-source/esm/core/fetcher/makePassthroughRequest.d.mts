import { type LogConfig, type Logger } from "../logging/logger.mjs";
import { Supplier } from "./Supplier.mjs";
export declare namespace PassthroughRequest {
    /**
     * Per-request options that can override the SDK client defaults.
     */
    interface RequestOptions {
        /** Override the default timeout for this request (in seconds). */
        timeoutInSeconds?: number;
        /** Override the default number of retries for this request. */
        maxRetries?: number;
        /** Additional headers to include in this request. */
        headers?: Record<string, string>;
        /** Abort signal for this request. */
        abortSignal?: AbortSignal;
    }
    /**
     * SDK client configuration used by the passthrough fetch method.
     */
    interface ClientOptions {
        /** The base URL or environment for the client. */
        environment?: Supplier<string>;
        /** Override the base URL. */
        baseUrl?: Supplier<string>;
        /** Default headers to include in requests. */
        headers?: Record<string, unknown>;
        /** Default maximum time to wait for a response in seconds. */
        timeoutInSeconds?: number;
        /** Default number of times to retry the request. Defaults to 2. */
        maxRetries?: number;
        /** A custom fetch function. */
        fetch?: typeof fetch;
        /** Logging configuration. */
        logging?: LogConfig | Logger;
        /** A function that returns auth headers. */
        getAuthHeaders?: () => Promise<Record<string, string>>;
    }
}
/**
 * Makes a passthrough HTTP request using the SDK's configuration (auth, retry, logging, etc.)
 * while mimicking the standard `fetch` API.
 *
 * @param input - The URL, path, or Request object. If a relative path, it will be resolved against the configured base URL.
 * @param init - Standard RequestInit options (method, headers, body, signal, etc.)
 * @param clientOptions - SDK client options (auth, default headers, logging, etc.)
 * @param requestOptions - Per-request overrides (timeout, retries, extra headers, abort signal).
 * @returns A standard Response object.
 */
export declare function makePassthroughRequest(input: Request | string | URL, init: RequestInit | undefined, clientOptions: PassthroughRequest.ClientOptions, requestOptions?: PassthroughRequest.RequestOptions): Promise<Response>;
