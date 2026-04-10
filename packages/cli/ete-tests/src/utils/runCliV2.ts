import { CONSOLE_LOGGER } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { Options } from "execa";
import * as fs from "fs/promises";
import * as path from "path";
import stripAnsi from "strip-ansi";
import tmp from "tmp-promise";

export declare namespace CliV2 {
    export interface Options {
        /** Command arguments to pass to the CLI */
        args: string[];
        /** Working directory for the CLI command */
        cwd?: string;
        /** Environment variables to set */
        env?: Record<string, string>;
        /** Timeout in milliseconds (default: 120000) */
        timeout?: number;
        /** Fixture directory to copy to temp dir before running */
        fixture?: string;
        /** Don't throw on non-zero exit code */
        expectError?: boolean;
        /** Authentication token (set to null to explicitly remove FERN_TOKEN) */
        authToken?: string | null;
        /** AbortSignal from vitest test context for cleanup on timeout/bail/Ctrl+C */
        signal?: AbortSignal;
    }

    export interface Result {
        /** Standard output from the CLI */
        stdout: string;
        /** Standard error from the CLI */
        stderr: string;
        /** Exit code from the CLI */
        exitCode: number;
        /** Working directory where the command was run */
        workingDirectory: string;
        /** Duration of the command in milliseconds */
        duration: number;
        /** Standard output with ANSI codes stripped */
        stdoutPlain: string;
        /** Standard error with ANSI codes stripped */
        stderrPlain: string;
    }
}

/**
 * Convenience helpers for common CLI operations.
 */
export const cliV2 = {
    /**
     * Run the sdk generate command.
     */
    generate: (fixture: string, target: string, args: string[] = []) =>
        runCliV2({
            args: ["sdk", "generate", "--target", target, ...args],
            fixture,
            timeout: 180_000
        }),

    /**
     * Run the sdk generate command with local output.
     */
    generateLocal: (fixture: string, target: string) =>
        runCliV2({
            args: ["sdk", "generate", "--target", target, "--local"],
            fixture,
            timeout: 180_000
        }),

    /**
     * Run the version command.
     */
    version: () => runCliV2({ args: ["--version"] }),

    /**
     * Run the help command.
     */
    help: (command?: string) => runCliV2({ args: command ? [command, "--help"] : ["--help"] })
};

/**
 * Runs the cli-v2 command with the given options.
 */
export async function runCliV2(options: CliV2.Options): Promise<CliV2.Result> {
    const startTime = Date.now();
    let tempDir: tmp.DirectoryResult | undefined;
    let workingDirectory = options.cwd ?? process.cwd();

    try {
        // If a fixture is specified, copy it to a temp directory.
        if (options.fixture) {
            tempDir = await tmp.dir({ unsafeCleanup: true });
            workingDirectory = tempDir.path;

            const fixturePath = path.isAbsolute(options.fixture)
                ? options.fixture
                : path.resolve(__dirname, "../tests/v2/fixtures", options.fixture);

            await copyDirectory(fixturePath, workingDirectory);
        } else if (!options.cwd) {
            // Create a temp directory even without a fixture for isolation.
            tempDir = await tmp.dir({ unsafeCleanup: true });
            workingDirectory = tempDir.path;
        }

        // Build environment variables.
        const env: Record<string, string | undefined> = {
            ...process.env,
            ...options.env,

            // Disable color output for consistent test results.
            NO_COLOR: "1",
            FORCE_COLOR: "0"
        };

        if (options.authToken !== undefined) {
            if (options.authToken === null) {
                delete env.FERN_TOKEN;
            } else {
                env.FERN_TOKEN = options.authToken;
            }
        } else if (process.env.FERN_ORG_TOKEN_DEV) {
            // Use dev token by default if available.
            env.FERN_TOKEN = process.env.FERN_ORG_TOKEN_DEV;
        }

        const cliPath = getCliV2BinaryPath();
        const execaOptions: Options = {
            cwd: workingDirectory,
            env,
            timeout: options.timeout ?? 120_000,
            reject: false // Don't throw on non-zero exit.
        };

        const result = await loggingExeca(CONSOLE_LOGGER, "node", ["--enable-source-maps", cliPath, ...options.args], {
            ...execaOptions,
            doNotPipeOutput: options.expectError ?? false,
            signal: options.signal
        });

        const duration = Date.now() - startTime;

        const cliResult: CliV2.Result = {
            stdout: result.stdout ?? "",
            stderr: result.stderr ?? "",
            exitCode: result.exitCode ?? 0,
            workingDirectory,
            duration,
            stdoutPlain: stripAnsi(result.stdout ?? ""),
            stderrPlain: stripAnsi(result.stderr ?? "")
        };

        // Throw if we expected success but got an error
        if (!options.expectError && result.exitCode !== 0) {
            const error = new Error(
                `CLI command failed with exit code ${result.exitCode}\n` +
                    `Command: fern-v2 ${options.args.join(" ")}\n` +
                    `Stdout: ${cliResult.stdoutPlain}\n` +
                    `Stderr: ${cliResult.stderrPlain}`
            );
            (error as unknown as { cliResult: CliV2.Result }).cliResult = cliResult;
            throw error;
        }

        return cliResult;
    } finally {
        // Clean up temp directory if we created one and no fixture was specified.
        // When a fixture is specified, we keep the temp dir for debugging.
        if (tempDir && !options.fixture) {
            await tempDir.cleanup().catch(() => {
                // Ignore cleanup errors.
            });
        }
    }
}

/**
 * Recursively copies a directory.
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

/**
 * Gets the path to the cli-v2 binary.
 */
function getCliV2BinaryPath(): string {
    return path.join(__dirname, "../../../cli-v2/dist/dev/cli.cjs");
}
