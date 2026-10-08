export declare function isCacheNoStoreSupported(): boolean;
/**
 * Reset the cached result of `isCacheNoStoreSupported`. Exposed for testing only.
 */
export declare function resetCacheNoStoreSupported(): void;
/**
 * Clears the timeout that `makeRequest` kept running (with `keepTimeoutUntilBodyRead`) so that it also
 * covered reading the response body.
 */
export declare function clearResponseTimeout(response: Response): void;
export declare const makeRequest: (fetchFn: (url: string, init: RequestInit) => Promise<Response>, url: string, method: string, headers: Headers | Record<string, string>, requestBody: BodyInit | undefined, timeoutMs?: number, abortSignal?: AbortSignal, withCredentials?: boolean, duplex?: "half", disableCache?: boolean, keepTimeoutUntilBodyRead?: boolean) => Promise<Response>;
