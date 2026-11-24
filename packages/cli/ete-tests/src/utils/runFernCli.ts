import { CONSOLE_LOGGER } from "@fern-api/logger";
import { loggingExeca, runExeca } from "@fern-api/logging-execa";
import type { Options as ExecaOptions } from "execa";
import path from "path";

interface RunFernCliOptions extends ExecaOptions {
    /** Include the FERN_ORG_TOKEN_DEV auth token (default: true) */
    includeAuthToken?: boolean;
    /** AbortSignal from vitest test context for cleanup on timeout/bail/Ctrl+C */
    signal?: AbortSignal;
}

export async function runFernCli(
    args: string[],
    { includeAuthToken = true, signal, ...execaOptions }: RunFernCliOptions = {}
): Promise<loggingExeca.ReturnValue> {
    const env = {
        // When the test runner itself runs in GitHub Actions, `GITHUB_ACTIONS=true` would be
        // inherited by the spawned CLI and trigger the GHA annotation hook, polluting stdout
        // with `::error::` / `::warning::` lines that break exact-match assertions in ete tests.
        // Tests that want to exercise annotation behavior can override this via the `env` arg.
        GITHUB_ACTIONS: "",
        ...execaOptions?.env,
        ...(includeAuthToken ? { FERN_TOKEN: process.env.FERN_ORG_TOKEN_DEV } : {})
    };

    // DIAGNOSTIC (do not merge): a CLI still running after 90s writes a Node diagnostic report on SIGUSR2,
    // so a hung `fern init` / `fern generator upgrade` shows its JS stack and open handles.
    const reportDirectory = "/tmp/fern-hang-reports";
    const childPromise = runExeca(
        CONSOLE_LOGGER,
        "node",
        [
            "--enable-source-maps",
            "--report-on-signal",
            `--report-directory=${reportDirectory}`,
            path.join(__dirname, "../../../cli/dist/dev/cli.cjs"),
            ...args
        ],
        {
            ...execaOptions,
            env,
            doNotPipeOutput: execaOptions?.reject === false,
            signal
        }
    );
    const watchdog = setTimeout(() => {
        if (childPromise.pid != null) {
            try {
                process.kill(childPromise.pid, "SIGUSR2");
            } catch {
                // The process exited between the check and the signal; nothing to report.
            }
        }
    }, 90_000);
    if (execaOptions?.reject !== false) {
        childPromise.stdout?.pipe(process.stdout);
        childPromise.stderr?.pipe(process.stderr);
    }
    try {
        const result = await childPromise;
        result.stdout ??= "";
        result.stderr ??= "";
        return result;
    } finally {
        clearTimeout(watchdog);
    }
}

interface CaptureFernCliOptions extends ExecaOptions {
    /** AbortSignal from vitest test context for cleanup on timeout/bail/Ctrl+C */
    signal?: AbortSignal;
}

export function captureFernCli(
    args: string[],
    { signal, ...execaOptions }: CaptureFernCliOptions = {}
): ReturnType<typeof runExeca> {
    return runExeca(
        CONSOLE_LOGGER,
        "node",
        ["--enable-source-maps", path.join(__dirname, "../../../cli/dist/dev/cli.cjs"), ...args],
        {
            ...execaOptions,
            env: {
                // See `runFernCli` for the rationale — suppress inherited `GITHUB_ACTIONS=true`
                // so the CLI doesn't emit annotation workflow commands on stdout under CI.
                GITHUB_ACTIONS: "",
                ...execaOptions?.env,
                FERN_TOKEN: process.env.FERN_ORG_TOKEN_DEV
            },
            doNotPipeOutput: execaOptions?.reject === false,
            signal
        }
    );
}
