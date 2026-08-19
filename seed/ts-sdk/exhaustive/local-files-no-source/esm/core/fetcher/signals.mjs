const TIMEOUT = "timeout";
export function getTimeoutSignal(timeoutMs) {
    const controller = new AbortController();
    const abortId = setTimeout(() => controller.abort(TIMEOUT), timeoutMs);
    return { signal: controller.signal, abortId };
}
export function anySignal(...args) {
    const signals = (args.length === 1 && Array.isArray(args[0]) ? args[0] : args);
    const controller = new AbortController();
    for (const signal of signals) {
        if (signal.aborted) {
            controller.abort(signal === null || signal === void 0 ? void 0 : signal.reason);
            return controller.signal;
        }
        signal.addEventListener("abort", () => controller.abort(signal === null || signal === void 0 ? void 0 : signal.reason), {
            signal: controller.signal,
        });
        // Re-check after adding listener: the signal may have aborted
        // between the initial `signal.aborted` check and the `addEventListener`
        // call above. If it did, the abort event was already dispatched and
        // the listener will never fire — we must manually abort.
        if (signal.aborted) {
            controller.abort(signal === null || signal === void 0 ? void 0 : signal.reason);
            return controller.signal;
        }
    }
    return controller.signal;
}
