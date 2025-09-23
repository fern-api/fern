import { Logger } from "@fern-api/logger";
import { spawn, spawnSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

export interface RustFormatterOptions {
    outputDir: string;
    logger: Logger;
}

/**
 * Formats Rust code using rustfmt and cargo fix to remove unused imports.
 *
 * This function performs a multi-step formatting process:
 * 1. Runs rustfmt to ensure basic formatting
 * 2. Checks if the project compiles with cargo check
 * 3. If compilation succeeds, runs cargo fix to remove unused imports
 * 4. Runs rustfmt again for final formatting
 *
 * @param options - Configuration containing output directory and logger
 */
export async function formatRustCode({ outputDir, logger }: RustFormatterOptions): Promise<void> {
    logger.debug(`Running cargo fix and rustfmt in directory: ${outputDir}`);

    const cargoTomlPath = join(outputDir, "Cargo.toml");
    const hasCargoToml = existsSync(cargoTomlPath);

    if (!hasCargoToml) {
        logger.debug("No Cargo.toml found, running rustfmt only");
        await runRustfmt(outputDir, logger);
        return;
    }

    // Run rustfmt first to ensure basic formatting
    await runRustfmt(outputDir, logger);

    // Run cargo fix only if the project compiles successfully
    const canCompile = await runCargoCheck(outputDir, logger);
    if (canCompile) {
        await runCargoFix(outputDir, logger);
        await runRustfmt(outputDir, logger);
        logger.info("Removed unused imports with cargo fix");
    } else {
        logger.debug("Skipped cargo fix - compilation issues");
    }
}

/**
 * Runs rustfmt to format Rust code files
 */
async function runRustfmt(outputDir: string, logger: Logger): Promise<void> {
    return new Promise((resolve) => {
        const rustfmt = spawn("rustfmt", ["--edition=2021", "--config-path=rustfmt.toml", "**/*.rs"], {
            cwd: outputDir,
            shell: true,
            stdio: "pipe"
        });

        let stderr = "";
        rustfmt.stderr?.on("data", (data: Buffer) => {
            stderr += data.toString();
        });

        rustfmt.on("close", (code: number | null) => {
            if (code === 0) {
                logger.debug("rustfmt completed successfully");
            } else {
                logger.debug(`rustfmt exited with code ${code}`);
                if (stderr.trim()) {
                    logger.debug(`rustfmt stderr: ${stderr.trim()}`);
                }
            }
            resolve();
        });

        rustfmt.on("error", (error: Error) => {
            logger.debug(`rustfmt error: ${error.message}`);
            resolve(); // Don't fail generation due to formatting issues
        });
    });
}

/**
 * Checks if the Rust project compiles successfully using cargo check
 * @returns true if compilation succeeds, false otherwise
 */
async function runCargoCheck(outputDir: string, logger: Logger): Promise<boolean> {
    return new Promise((resolve) => {
        // Verify cargo is available before proceeding
        const cargoVersionCheck = spawnSync("cargo", ["--version"], {
            stdio: "pipe",
            cwd: outputDir
        });

        if (cargoVersionCheck.status !== 0) {
            logger.debug("cargo not available");
            resolve(false);
            return;
        }

        const cargoCheck = spawn("cargo", ["check"], {
            cwd: outputDir,
            stdio: "pipe"
        });

        let stderr = "";
        cargoCheck.stderr?.on("data", (data: Buffer) => {
            stderr += data.toString();
        });

        cargoCheck.on("close", (code: number | null) => {
            const success = code === 0;
            if (success) {
                logger.debug("cargo check passed - ready for cargo fix");
            } else {
                logger.debug(`cargo check failed with code ${code}`);
                if (stderr.trim()) {
                    logger.debug(`cargo check stderr: ${stderr.trim()}`);
                }
            }
            resolve(success);
        });

        cargoCheck.on("error", (error: Error) => {
            logger.debug(`cargo check error: ${error.message}`);
            resolve(false);
        });
    });
}

/**
 * Runs cargo fix to automatically fix compiler warnings including unused imports
 */
async function runCargoFix(outputDir: string, logger: Logger): Promise<void> {
    return new Promise((resolve) => {
        const cargoFix = spawn("cargo", ["fix", "--allow-dirty", "--allow-staged", "--allow-no-vcs"], {
            cwd: outputDir,
            stdio: "pipe"
        });

        let stdout = "";
        let stderr = "";

        cargoFix.stdout?.on("data", (data: Buffer) => {
            stdout += data.toString();
        });

        cargoFix.stderr?.on("data", (data: Buffer) => {
            stderr += data.toString();
        });

        // Timeout protection to prevent hanging
        const timeout = setTimeout(() => {
            cargoFix.kill();
            logger.debug("cargo fix timed out after 30 seconds");
            resolve();
        }, 30000);

        cargoFix.on("close", (code: number | null) => {
            clearTimeout(timeout);
            if (code === 0) {
                logger.debug("cargo fix completed successfully");
                if (stdout.includes("Fixed")) {
                    logger.debug("cargo fix made changes to remove unused imports");
                }
            } else {
                logger.debug(`cargo fix exited with code ${code}`);
                if (stderr.trim()) {
                    logger.debug(`cargo fix stderr: ${stderr.trim()}`);
                }
            }
            resolve();
        });

        cargoFix.on("error", (error: Error) => {
            clearTimeout(timeout);
            logger.debug(`cargo fix error: ${error.message}`);
            resolve();
        });
    });
}

/**
 * Format a single Rust code snippet using rustfmt
 */
export function formatRustSnippet(code: string, logger?: Logger): string {
    try {
        const result = spawnSync("rustfmt", ["--edition=2021"], {
            input: code,
            encoding: "utf8",
            timeout: 5000
        });

        if (result.status === 0 && result.stdout) {
            return result.stdout;
        }
    } catch (error) {
        logger?.debug(`rustfmt snippet error: ${error}`);
    }
    return code;
}

/**
 * Format a single Rust code snippet asynchronously using rustfmt
 */
export async function formatRustSnippetAsync(code: string, _logger?: Logger): Promise<string> {
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
                resolve(formatted);
            } else {
                resolve(code);
            }
        });

        rustfmt.on("error", () => {
            resolve(code);
        });
    });
}
