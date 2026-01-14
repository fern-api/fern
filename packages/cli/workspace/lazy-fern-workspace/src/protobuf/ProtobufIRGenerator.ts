import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createLoggingExecutable, runExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { access, chmod, cp, unlink, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

import {
    getProtobufYamlV1,
    PROTOBUF_EXPORT_CONFIG_V1,
    PROTOBUF_EXPORT_CONFIG_V2,
    PROTOBUF_GEN_CONFIG,
    PROTOBUF_GENERATOR_CONFIG_FILENAME,
    PROTOBUF_GENERATOR_OUTPUT_FILEPATH,
    PROTOBUF_MODULE_PACKAGE_JSON,
    PROTOBUF_SHELL_PROXY,
    PROTOBUF_SHELL_PROXY_FILENAME
} from "./utils";

// Network error detection helper
function isNetworkError(errorMessage: string): boolean {
    return (
        errorMessage.includes("server hosted at that remote is unavailable") ||
        errorMessage.includes("failed to connect") ||
        errorMessage.includes("network") ||
        errorMessage.includes("ENOTFOUND") ||
        errorMessage.includes("ETIMEDOUT") ||
        errorMessage.includes("TIMEDOUT") ||
        errorMessage.includes("timed out")
    );
}

export class ProtobufIRGenerator {
    private context: TaskContext;
    private isAirGapped: boolean | undefined;

    constructor({ context }: { context: TaskContext }) {
        this.context = context;
    }

    public async generate({
        absoluteFilepathToProtobufRoot,
        absoluteFilepathToProtobufTarget,
        local,
        deps
    }: {
        absoluteFilepathToProtobufRoot: AbsoluteFilePath;
        absoluteFilepathToProtobufTarget: AbsoluteFilePath | undefined;
        local: boolean;
        deps: string[];
    }): Promise<AbsoluteFilePath> {
        if (local) {
            return this.generateLocal({
                absoluteFilepathToProtobufRoot,
                absoluteFilepathToProtobufTarget,
                deps
            });
        }
        return this.generateRemote();
    }

    private async generateLocal({
        absoluteFilepathToProtobufRoot,
        absoluteFilepathToProtobufTarget,
        deps
    }: {
        absoluteFilepathToProtobufRoot: AbsoluteFilePath;
        absoluteFilepathToProtobufTarget: AbsoluteFilePath | undefined;
        deps: string[];
    }): Promise<AbsoluteFilePath> {
        // Detect air-gapped mode once at the start if we have dependencies
        if (deps.length > 0 && this.isAirGapped === undefined) {
            await this.detectAirGappedMode(absoluteFilepathToProtobufRoot);
        }

        const protobufGeneratorConfigPath = await this.setupProtobufGeneratorConfig({
            absoluteFilepathToProtobufRoot,
            absoluteFilepathToProtobufTarget
        });
        return this.doGenerateLocal({
            cwd: protobufGeneratorConfigPath,
            deps
        });
    }

    /**
     * Detect if we're in an air-gapped environment by trying buf dep update once.
     * This sets the isAirGapped flag which is used by subsequent operations.
     */
    private async detectAirGappedMode(absoluteFilepathToProtobufRoot: AbsoluteFilePath): Promise<void> {
        const bufLockPath = join(absoluteFilepathToProtobufRoot, RelativeFilePath.of("buf.lock"));

        // Check if buf.lock exists (required for air-gapped mode)
        let bufLockExists = false;
        try {
            await access(bufLockPath);
            bufLockExists = true;
            this.context.logger.debug(`Found buf.lock at: ${bufLockPath}`);
        } catch {
            this.context.logger.debug(`No buf.lock found at: ${bufLockPath}`);
        }

        if (!bufLockExists) {
            // No buf.lock means we need network access - not air-gapped
            this.isAirGapped = false;
            return;
        }

        // Try a quick network check with buf dep update using a short timeout
        const tmpDir = AbsoluteFilePath.of((await tmp.dir()).path);
        try {
            // Copy buf.yaml and buf.lock to temp dir for the test
            const bufYamlPath = join(absoluteFilepathToProtobufRoot, RelativeFilePath.of("buf.yaml"));
            try {
                await cp(bufYamlPath, join(tmpDir, RelativeFilePath.of("buf.yaml")));
                await cp(bufLockPath, join(tmpDir, RelativeFilePath.of("buf.lock")));
            } catch {
                // If we can't copy the files, assume not air-gapped
                this.isAirGapped = false;
                return;
            }

            // Try buf dep update with a short timeout (5 seconds)
            try {
                await runExeca(this.context.logger, "buf", ["dep", "update"], {
                    cwd: tmpDir,
                    stdio: "pipe",
                    timeout: 5000 // 5 second timeout for quick detection
                });
                // Network works - not air-gapped
                this.isAirGapped = false;
                this.context.logger.debug("Network check succeeded - not in air-gapped mode");
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (isNetworkError(errorMessage)) {
                    this.isAirGapped = true;
                    this.context.logger.debug(
                        `Network check failed - entering air-gapped mode: ${errorMessage.substring(0, 100)}`
                    );
                } else {
                    // Non-network error - assume not air-gapped
                    this.isAirGapped = false;
                }
            }
        } finally {
            // Cleanup temp dir
            try {
                await unlink(join(tmpDir, RelativeFilePath.of("buf.yaml")));
                await unlink(join(tmpDir, RelativeFilePath.of("buf.lock")));
            } catch {
                // Ignore cleanup errors
            }
        }
    }

    private async setupProtobufGeneratorConfig({
        absoluteFilepathToProtobufRoot,
        absoluteFilepathToProtobufTarget
    }: {
        absoluteFilepathToProtobufRoot: AbsoluteFilePath;
        absoluteFilepathToProtobufTarget: AbsoluteFilePath | undefined;
    }): Promise<AbsoluteFilePath> {
        const protobufGeneratorConfigPath = AbsoluteFilePath.of((await tmp.dir()).path);

        if (absoluteFilepathToProtobufTarget !== undefined) {
            await this.exportProtobufFilesForTarget({
                protobufGeneratorConfigPath,
                absoluteFilepathToProtobufRoot,
                absoluteFilepathToProtobufTarget
            });
        } else {
            await this.copyProtobufFilesFromRoot({
                protobufGeneratorConfigPath,
                absoluteFilepathToProtobufRoot
            });
        }

        await this.setupRemainingProtobufConfig({
            protobufGeneratorConfigPath
        });

        return protobufGeneratorConfigPath;
    }

    private async exportProtobufFilesForTarget({
        protobufGeneratorConfigPath,
        absoluteFilepathToProtobufRoot,
        absoluteFilepathToProtobufTarget
    }: {
        protobufGeneratorConfigPath: AbsoluteFilePath;
        absoluteFilepathToProtobufRoot: AbsoluteFilePath;
        absoluteFilepathToProtobufTarget: AbsoluteFilePath;
    }): Promise<void> {
        // If we're in air-gapped mode, skip buf export and copy files directly
        if (this.isAirGapped) {
            this.context.logger.debug("Air-gapped mode: skipping buf export, copying proto files directly");
            await this.copyProtobufFilesFromRoot({
                protobufGeneratorConfigPath,
                absoluteFilepathToProtobufRoot
            });
            return;
        }

        // Use buf export to get all relevant .proto files
        const which = createLoggingExecutable("which", {
            cwd: protobufGeneratorConfigPath,
            logger: undefined,
            doNotPipeOutput: true
        });

        try {
            await which(["buf"]);
        } catch (err) {
            this.context.failAndThrow(
                "Missing required dependency; please install 'buf' to continue (e.g. 'brew install buf')."
            );
        }

        // Create a temporary buf config file to prevent conflicts
        // Try buf export with v1 first, then fall back to v2 if it fails
        // If buf export fails due to network issues, fall back to copying files directly (backup)
        let bufExportSucceeded = false;

        for (const version of ["v1", "v2"]) {
            this.context.logger.info(`Using buf export with version: ${version}`);

            const tmpBufConfigFile = await tmp.file({ postfix: ".yaml" });
            const configContent = version === "v1" ? PROTOBUF_EXPORT_CONFIG_V1 : PROTOBUF_EXPORT_CONFIG_V2;
            await writeFile(tmpBufConfigFile.path, configContent, "utf8");

            try {
                const result = await runExeca(
                    this.context.logger,
                    "buf",
                    [
                        "export",
                        "--path",
                        absoluteFilepathToProtobufTarget,
                        "--config",
                        AbsoluteFilePath.of(tmpBufConfigFile.path),
                        "--output",
                        protobufGeneratorConfigPath
                    ],
                    {
                        cwd: absoluteFilepathToProtobufRoot,
                        stdio: "pipe"
                    }
                );

                if (result.exitCode !== 0) {
                    await tmpBufConfigFile.cleanup();
                    continue;
                }

                await tmpBufConfigFile.cleanup();
                bufExportSucceeded = true;
                return;
            } catch (error) {
                await tmpBufConfigFile.cleanup();
                if (version === "v2") {
                    // Backup: Check if this is a network error - if so, fall back to copying files
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    if (isNetworkError(errorMessage)) {
                        this.context.logger.debug(
                            `buf export failed due to network error (backup fallback): ${errorMessage.substring(0, 200)}`
                        );
                        break; // Fall through to copy fallback
                    }
                    throw error;
                }
            }
        }

        // Backup fallback: If buf export failed due to network issues, copy files directly
        if (!bufExportSucceeded) {
            this.context.logger.debug("buf export failed, falling back to copying proto files directly (backup)");
            await this.copyProtobufFilesFromRoot({
                protobufGeneratorConfigPath,
                absoluteFilepathToProtobufRoot
            });
        }
    }

    private async copyProtobufFilesFromRoot({
        protobufGeneratorConfigPath,
        absoluteFilepathToProtobufRoot
    }: {
        protobufGeneratorConfigPath: AbsoluteFilePath;
        absoluteFilepathToProtobufRoot: AbsoluteFilePath;
    }): Promise<void> {
        // Copy the entire protobuf root, excluding buf.yaml and buf.gen.yaml, to a temp directory
        // Note: buf.lock is intentionally included to allow pre-cached dependencies to be used
        // in air-gapped environments (e.g., self-hosted deployments)
        await cp(absoluteFilepathToProtobufRoot, protobufGeneratorConfigPath, {
            recursive: true,
            filter: (src) => {
                const basename = path.basename(src);
                return basename !== "buf.yaml" && !(basename.startsWith("buf.gen.") && basename.endsWith(".yaml"));
            }
        });
    }

    private async setupRemainingProtobufConfig({
        protobufGeneratorConfigPath
    }: {
        protobufGeneratorConfigPath: AbsoluteFilePath;
    }): Promise<void> {
        // Initialize package.json
        await writeFile(
            join(protobufGeneratorConfigPath, RelativeFilePath.of("package.json")),
            PROTOBUF_MODULE_PACKAGE_JSON
        );

        await runExeca(undefined, "npm", ["install"], {
            cwd: protobufGeneratorConfigPath,
            stdout: "ignore",
            stderr: "pipe"
        });

        await runExeca(undefined, "npm", ["install", "-g", "fern-api"], {
            cwd: protobufGeneratorConfigPath,
            stdout: "ignore",
            stderr: "pipe"
        });

        // Write buf config
        await writeFile(
            join(protobufGeneratorConfigPath, RelativeFilePath.of(PROTOBUF_GENERATOR_CONFIG_FILENAME)),
            PROTOBUF_GEN_CONFIG
        );

        // Write and make executable the protoc plugin
        const shellProxyPath = join(protobufGeneratorConfigPath, RelativeFilePath.of(PROTOBUF_SHELL_PROXY_FILENAME));
        await writeFile(shellProxyPath, PROTOBUF_SHELL_PROXY);
        await chmod(shellProxyPath, 0o755);
    }

    private async doGenerateLocal({ cwd, deps }: { cwd: AbsoluteFilePath; deps: string[] }): Promise<AbsoluteFilePath> {
        const which = createLoggingExecutable("which", {
            cwd,
            logger: undefined,
            doNotPipeOutput: true
        });

        try {
            await which(["buf"]);
        } catch (err) {
            this.context.failAndThrow(
                "Missing required dependency; please install 'buf' to continue (e.g. 'brew install buf')."
            );
        }

        const bufYamlPath = join(cwd, RelativeFilePath.of("buf.yaml"));

        const configContent = getProtobufYamlV1(deps);

        const buf = createLoggingExecutable("buf", {
            cwd,
            logger: undefined,
            stdout: "ignore",
            stderr: "pipe"
        });

        const bufLockPath = join(cwd, RelativeFilePath.of("buf.lock"));

        try {
            await writeFile(bufYamlPath, configContent);

            if (deps.length > 0) {
                // If we're in air-gapped mode, skip buf dep update entirely
                if (this.isAirGapped) {
                    this.context.logger.debug("Air-gapped mode: skipping buf dep update");
                } else {
                    // Try buf dep update to populate the cache (needed at build time)
                    // Backup: If it fails with a network error and buf.lock exists, continue
                    try {
                        await buf(["dep", "update"]);
                    } catch (bufDepUpdateError: unknown) {
                        const errorMessage =
                            bufDepUpdateError instanceof Error ? bufDepUpdateError.message : String(bufDepUpdateError);

                        // Check if buf.lock exists for backup fallback
                        let bufLockExists = false;
                        try {
                            await access(bufLockPath);
                            bufLockExists = true;
                        } catch {
                            bufLockExists = false;
                        }

                        this.context.logger.debug(
                            `buf dep update failed. isNetworkError=${isNetworkError(errorMessage)}, bufLockExists=${bufLockExists}, error=${errorMessage.substring(0, 200)}`
                        );

                        if (isNetworkError(errorMessage) && bufLockExists) {
                            // Backup: Air-gapped environment with pre-cached buf.lock - continue
                            this.context.logger.debug(
                                "buf dep update failed due to network error, but buf.lock exists. Continuing (backup)."
                            );
                        } else {
                            this.context.failAndThrow(errorMessage);
                        }
                    }
                }
            }

            const bufGenerateResult = await buf(["generate"]);
            if (bufGenerateResult.exitCode !== 0) {
                this.context.failAndThrow(bufGenerateResult.stderr);
            }
            await unlink(bufYamlPath);
        } catch (error) {
            await unlink(bufYamlPath);
            throw error;
        }

        return join(cwd, RelativeFilePath.of(PROTOBUF_GENERATOR_OUTPUT_FILEPATH));
    }

    private async generateRemote(): Promise<AbsoluteFilePath> {
        this.context.failAndThrow("Remote Protobuf generation is unimplemented.");
    }
}
