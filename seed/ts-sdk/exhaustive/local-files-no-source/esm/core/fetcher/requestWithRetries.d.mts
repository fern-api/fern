export declare function requestWithRetries(requestFn: () => Promise<Response>, maxRetries?: number, abortSignal?: AbortSignal): Promise<Response>;
