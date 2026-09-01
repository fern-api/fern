/**
 * `fetch` for the hosted FAI endpoints, which are long-polling by nature: a multi-MB SDK
 * diff is fanned out server-side over dozens of sequential LLM calls plus a changelog
 * rollup, so one request legitimately runs for minutes.
 *
 * Node's global `fetch` (undici) gives up after its default 300s headers timeout. That is
 * shorter than the FAI load balancer's own idle timeout (900s), so on the slowest diffs the
 * client would abort before the server did — and an aborted request is indistinguishable
 * from a broken one, which is exactly the signal the caller needs to decide between trusting
 * the analysis and falling back to a PATCH bump.
 *
 * undici only honours a per-request `dispatcher` when called through its own `fetch` export
 * (Node's global `fetch` silently ignores the option), so the timeouts are raised by
 * installing a process-wide dispatcher instead, mirroring what the CLI does at startup in
 * `packages/cli/cli/src/cli.ts`. An `HTTP_PROXY` dispatcher, if the process installed one,
 * is left alone: replacing it would silently drop the proxy.
 */

/**
 * Sits above the 900s load balancer idle timeout so the server's timeout wins the race and
 * the caller gets an HTTP status it can log, rather than an opaque client-side abort.
 */
const LONG_RUNNING_TIMEOUT_MS = 960_000;

let dispatcherInstallation: Promise<void> | undefined;

async function installLongRunningDispatcher(): Promise<void> {
    if (process.env.HTTP_PROXY != null) {
        return;
    }
    try {
        const { setGlobalDispatcher, Agent } = await import("undici");
        setGlobalDispatcher(
            new Agent({
                headersTimeout: LONG_RUNNING_TIMEOUT_MS,
                bodyTimeout: LONG_RUNNING_TIMEOUT_MS
            })
        );
    } catch {
        // undici is unavailable (e.g. a runtime that only exposes global fetch). The request
        // still goes out; it just keeps the default 300s ceiling.
    }
}

/**
 * `fetch`, with undici's header/body timeouts raised far enough that a slow FAI analysis
 * is not mistaken for a failed one. Raises the timeouts once per process.
 */
export async function faiFetch(url: string, init: RequestInit): Promise<Response> {
    dispatcherInstallation ??= installLongRunningDispatcher();
    await dispatcherInstallation;
    return await fetch(url, init);
}
