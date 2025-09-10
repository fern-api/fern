import { Logger } from "@fern-api/logger";
import { spawn } from "child_process";

export interface RustFormatterOptions {
    outputDir: string;
    logger: Logger;
}

export class RustFormatter {
    public static async format({ outputDir, logger }: RustFormatterOptions): Promise<void> {
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
}
