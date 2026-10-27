import { delay, extractErrorMessage } from "@fern-api/core-utils";
import {
    DOCS_DEV_CONTROL_HEADER,
    DOCS_DEV_CONTROL_HEADER_VALUE,
    DOCS_DEV_SERVER_INFO_PATH,
    DOCS_DEV_SHUTDOWN_PATH,
    isDocsDevServerInfo
} from "@fern-api/docs-preview";
import { CliError } from "@fern-api/task-context";
import net from "net";

import { CliContext } from "../../cli-context/CliContext.js";

/** The first port `fern docs dev` tries. */
export const DEFAULT_DOCS_DEV_PORT = 3000;
const REQUEST_TIMEOUT_MS = 5_000;
const PORT_PROBE_TIMEOUT_MS = 1_000;
const PORT_CLOSE_TIMEOUT_MS = 10_000;
const PORT_POLL_INTERVAL_MS = 100;

export type DocsDevStopResult =
    | { stopped: true; port: number; url: string; pid: number; fernDirectory: string }
    | { stopped: false; port: number; reason: "no-server" | "not-fern-docs-dev" };

/**
 * `fern docs dev stop`: asks the `fern docs dev` server on `port` to shut down through its local
 * `POST /__fern/shutdown` route, then waits for the port to stop accepting connections.
 * Finding nothing to stop is not an error, so agents and CI can always run it as a cleanup step.
 */
export async function runDocsDevStop({ cliContext, port }: { cliContext: CliContext; port: number }): Promise<void> {
    let result: DocsDevStopResult;
    try {
        result = await stopDocsDevServer({ port });
    } catch (error) {
        if (cliContext.isJsonMode) {
            cliContext.writeJsonToStdout({ stopped: false, port, error: extractErrorMessage(error) });
        }
        throw error;
    }
    if (result.stopped) {
        cliContext.logger.info(`Stopped fern docs dev on ${result.url} (${result.fernDirectory}).`);
    } else if (result.reason === "no-server") {
        cliContext.logger.info(`No fern docs dev server running on port ${port}; nothing to stop.`);
    } else {
        cliContext.logger.info(`Port ${port} is in use, but not by a fern docs dev server; nothing to stop.`);
    }
    if (cliContext.isJsonMode) {
        cliContext.writeJsonToStdout(result);
    }
}

export async function stopDocsDevServer({
    port,
    portCloseTimeoutMs = PORT_CLOSE_TIMEOUT_MS
}: {
    port: number;
    portCloseTimeoutMs?: number;
}): Promise<DocsDevStopResult> {
    if (!(await isPortOpen(port))) {
        return { stopped: false, port, reason: "no-server" };
    }
    const baseUrl = `http://127.0.0.1:${port}`;
    const headers = { [DOCS_DEV_CONTROL_HEADER]: DOCS_DEV_CONTROL_HEADER_VALUE };

    let info: unknown;
    try {
        const response = await fetch(`${baseUrl}${DOCS_DEV_SERVER_INFO_PATH}`, {
            headers,
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });
        info = response.ok ? await response.json() : undefined;
    } catch {
        // Something is listening but didn't answer like a `fern docs dev` server (wrong protocol, hung, not JSON).
        info = undefined;
    }
    if (!isDocsDevServerInfo(info)) {
        return { stopped: false, port, reason: "not-fern-docs-dev" };
    }

    let response: Response;
    try {
        response = await fetch(`${baseUrl}${DOCS_DEV_SHUTDOWN_PATH}`, {
            method: "POST",
            headers,
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });
        await response.body?.cancel();
    } catch (error) {
        throw new CliError({
            message: `Failed to send the shutdown request to fern docs dev on port ${port}: ${extractErrorMessage(error)}`,
            code: CliError.Code.EnvironmentError
        });
    }
    if (response.status !== 202) {
        throw new CliError({
            message: `fern docs dev on port ${port} refused the shutdown request (HTTP ${response.status}).`,
            code: CliError.Code.EnvironmentError
        });
    }

    const deadline = Date.now() + portCloseTimeoutMs;
    while (await isPortOpen(port)) {
        if (Date.now() > deadline) {
            throw new CliError({
                message: `fern docs dev on port ${port} accepted the shutdown request but was still running after ${Math.round(portCloseTimeoutMs / 1000)}s.`,
                code: CliError.Code.EnvironmentError
            });
        }
        await delay(PORT_POLL_INTERVAL_MS);
    }
    return { stopped: true, port, url: info.url, pid: info.pid, fernDirectory: info.fernDirectory };
}

function isPortOpen(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = net.connect({ host: "127.0.0.1", port });
        socket.setTimeout(PORT_PROBE_TIMEOUT_MS);
        socket.once("connect", () => {
            socket.destroy();
            resolve(true);
        });
        socket.once("timeout", () => {
            socket.destroy();
            resolve(true);
        });
        socket.once("error", () => resolve(false));
    });
}
