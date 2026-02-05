export declare function getTimeoutSignal(timeoutMs: number): {
    signal: AbortSignal;
    abortId: ReturnType<typeof setTimeout>;
};
export declare function anySignal(...args: AbortSignal[] | [AbortSignal[]]): AbortSignal;
