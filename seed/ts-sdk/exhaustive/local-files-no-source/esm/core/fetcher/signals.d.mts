export declare function getTimeoutSignal(timeoutMs: number): {
    signal: AbortSignal;
    abortId: NodeJS.Timeout;
};
export declare function anySignal(...args: AbortSignal[] | [AbortSignal[]]): AbortSignal;
