export interface RequestWithRetriesOptions {
    /**
     * Called before retrying a request that failed with 401 or 403.
     * When omitted, auth failures are not retried.
     */
    refreshAuth?: () => Promise<void>;
}
export declare function requestWithRetries(requestFn: () => Promise<Response>, maxRetries?: number, { refreshAuth }?: RequestWithRetriesOptions): Promise<Response>;
