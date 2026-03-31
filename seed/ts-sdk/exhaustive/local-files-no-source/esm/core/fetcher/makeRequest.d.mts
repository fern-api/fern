export declare function isCacheNoStoreSupported(): boolean;
/**
 * Reset the cached result of `isCacheNoStoreSupported`. Exposed for testing only.
 */
export declare function resetCacheNoStoreSupported(): void;
export declare const makeRequest: (fetchFn: (url: string, init: RequestInit) => Promise<Response>, url: string, method: string, headers: Headers | Record<string, string>, requestBody: BodyInit | undefined, timeoutMs?: number, abortSignal?: AbortSignal, withCredentials?: boolean, duplex?: "half", disableCache?: boolean) => Promise<Response>;
