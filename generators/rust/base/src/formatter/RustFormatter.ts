import { Logger } from "@fern-api/logger";
import { spawn, spawnSync } from "child_process";

export interface RustFormatterOptions {
    outputDir: string;
    logger: Logger;
}

export async function formatRustCode({ outputDir, logger }: RustFormatterOptions): Promise<void> {
    return new Promise((resolve) => {
        logger.debug(`Running rustfmt in directory: ${outputDir}`);

        // Run rustfmt with the configuration file on all Rust files
        const rustfmt = spawn("rustfmt", ["--edition=2021", "--config-path=rustfmt.toml", "**/*.rs"], {
            cwd: outputDir,
            shell: true,
            stdio: "pipe"
        });

        let stdout = "";
        let stderr = "";

        rustfmt.stdout?.on("data", (data: Buffer) => {
            stdout += data.toString();
        });

        rustfmt.stderr?.on("data", (data: Buffer) => {
            stderr += data.toString();
        });

        rustfmt.on("close", (code: number | null) => {
            if (code === 0) {
                logger.info("rustfmt completed successfully");
                if (stdout.trim()) {
                    logger.debug(`rustfmt stdout: ${stdout.trim()}`);
                }
            } else {
                logger.warn(`rustfmt exited with code ${code}`);
                if (stderr.trim()) {
                    logger.warn(`rustfmt stderr: ${stderr.trim()}`);
                }
            }
            // Always resolve - don't fail generation if formatting fails
            resolve();
        });

        rustfmt.on("error", (error: Error) => {
            logger.warn(`rustfmt error: ${error.message}`);
            logger.debug("rustfmt may not be installed or available in PATH");
            // Always resolve - don't fail generation if formatting fails
            resolve();
        });
    });
}

/**
 * Format a single Rust code snippet using rustfmt
 * @param code The Rust code to format
 * @param logger Optional logger for debug output
 * @returns The formatted code, or original code if formatting fails
 */
export function formatRustSnippet(code: string, logger?: Logger): string {
    try {
        const result = spawnSync("rustfmt", ["--edition=2021"], {
            input: code,
            encoding: "utf8",
            timeout: 5000 // 5 second timeout
        });

        if (result.status === 0 && result.stdout) {
            logger?.debug("rustfmt snippet formatting successful");
            return result.stdout;
        } else {
            logger?.debug(`rustfmt snippet formatting failed with status ${result.status}`);
        }
    } catch (error) {
        logger?.debug(`rustfmt snippet formatting error: ${error}`);
    }
    return code; // Fallback to original if formatting fails
}

/**
 * Format a single Rust code snippet asynchronously using rustfmt
 * @param code The Rust code to format
 * @param logger Optional logger for debug output
 * @returns Promise that resolves to formatted code, or original code if formatting fails
 */
export async function formatRustSnippetAsync(code: string, logger?: Logger): Promise<string> {
    return new Promise((resolve) => {
        const rustfmt = spawn("rustfmt", ["--edition=2021"], {
            stdio: "pipe"
        });

        rustfmt.stdin.write(code);
        rustfmt.stdin.end();

        let formatted = "";
        rustfmt.stdout.on("data", (data) => {
            formatted += data.toString();
        });

        rustfmt.on("close", (exitCode) => {
            if (exitCode === 0 && formatted) {
                logger?.debug("rustfmt async snippet formatting successful");
                resolve(formatted);
            } else {
                logger?.debug(`rustfmt async snippet formatting failed with exit code ${exitCode}`);
                resolve(code); // Fallback to original
            }
        });

        rustfmt.on("error", (error) => {
            logger?.debug(`rustfmt async snippet formatting error: ${error.message}`);
            resolve(code); // Fallback to original
        });
    });
}
