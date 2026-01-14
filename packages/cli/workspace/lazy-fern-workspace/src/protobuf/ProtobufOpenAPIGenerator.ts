import { AbsoluteFilePath, join, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { createLoggingExecutable, runExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { access, cp, readFile, unlink, writeFile } from "fs/promises";
import tmp from "tmp-promise";
import { getProtobufYamlV1 } from "./utils";

const PROTOBUF_GENERATOR_CONFIG_FILENAME = "buf.gen.yaml";
const PROTOBUF_GENERATOR_OUTPUT_PATH = "output";
const PROTOBUF_GENERATOR_OUTPUT_FILEPATH = `${PROTOBUF_GENERATOR_OUTPUT_PATH}/openapi.yaml`;

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

export class ProtobufOpenAPIGenerator {
    private context: TaskContext;
    private isAirGapped: boolean | undefined;

    constructor({ context }: { context: TaskContext }) {
        this.context = context;
    }

    public async generate({
        absoluteFilepathToProtobufRoot,
        absoluteFilepathToProtobufTarget,
        relativeFilepathToProtobufRoot,
        local,
        deps,
        existingBufLockContents
    }: {
        absoluteFilepathToProtobufRoot: AbsoluteFilePath;
        absoluteFilepathToProtobufTarget: AbsoluteFilePath;
        relativeFilepathToProtobufRoot: RelativeFilePath;
        local: boolean;
        deps: string[];
        existingBufLockContents?: string;
    }): Promise<{ absoluteFilepath: AbsoluteFilePath; bufLockContents: string | undefined }> {
        if (local) {
            return this.generateLocal({
                absoluteFilepathToProtobufRoot,
                absoluteFilepathToProtobufTarget,
                relativeFilepathToProtobufRoot,
                deps,
                existingBufLockContents
            });
        }
        return this.generateRemote();
    }

    private async generateLocal({
        absoluteFilepathToProtobufRoot,
        absoluteFilepathToProtobufTarget,
        relativeFilepathToProtobufRoot,
        deps,
        existingBufLockContents
    }: {
        absoluteFilepathToProtobufRoot: AbsoluteFilePath;
        absoluteFilepathToProtobufTarget: AbsoluteFilePath;
        relativeFilepathToProtobufRoot: RelativeFilePath;
        deps: string[];
        existingBufLockContents?: string;
    }): Promise<{ absoluteFilepath: AbsoluteFilePath; bufLockContents: string | undefined }> {
        // Detect air-gapped mode once at the start if we have dependencies
        if (deps.length > 0 && this.isAirGapped === undefined) {
            await this.detectAirGappedMode(absoluteFilepathToProtobufRoot);
        }

        const protobufGeneratorConfigPath = await this.setupProtobufGeneratorConfig({
            absoluteFilepathToProtobufRoot,
            relativeFilepathToProtobufRoot
        });
        const protoTargetRelativeFilePath = relative(absoluteFilepathToProtobufRoot, absoluteFilepathToProtobufTarget);
        return this.doGenerateLocal({
            cwd: protobufGeneratorConfigPath,
            target: protoTargetRelativeFilePath,
            deps,
            existingBufLockContents
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
        relativeFilepathToProtobufRoot
    }: {
        absoluteFilepathToProtobufRoot: AbsoluteFilePath;
        relativeFilepathToProtobufRoot: RelativeFilePath;
    }): Promise<AbsoluteFilePath> {
        const protobufGeneratorConfigPath = AbsoluteFilePath.of((await tmp.dir()).path);
        await cp(absoluteFilepathToProtobufRoot, protobufGeneratorConfigPath, { recursive: true });
        await writeFile(
            join(protobufGeneratorConfigPath, RelativeFilePath.of(PROTOBUF_GENERATOR_CONFIG_FILENAME)),
            getProtobufGeneratorConfig({ relativeFilepathToProtobufRoot })
        );
        return protobufGeneratorConfigPath;
    }

    private async doGenerateLocal({
        cwd,
        target,
        deps,
        existingBufLockContents
    }: {
        cwd: AbsoluteFilePath;
        target: RelativeFilePath;
        deps: string[];
        existingBufLockContents?: string;
    }): Promise<{ absoluteFilepath: AbsoluteFilePath; bufLockContents: string | undefined }> {
        let bufLockContents: string | undefined = existingBufLockContents;

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

        try {
            await which(["protoc-gen-openapi"]);
        } catch (err) {
            this.context.failAndThrow(
                "Missing required dependency; please install 'protoc-gen-openapi' to continue (e.g. 'brew install go && go install github.com/fern-api/protoc-gen-openapi/cmd/protoc-gen-openapi@latest')."
            );
        }

        const bufYamlPath = join(cwd, RelativeFilePath.of("buf.yaml"));
        const bufLockPath = join(cwd, RelativeFilePath.of("buf.lock"));
        let cleanupBufLock = false;

        const configContent = getProtobufYamlV1(deps);

        const buf = createLoggingExecutable("buf", {
            cwd,
            logger: this.context.logger,
            stdout: "ignore",
            stderr: "pipe"
        });

        try {
            await writeFile(bufYamlPath, configContent);

            if (existingBufLockContents != null) {
                await writeFile(bufLockPath, existingBufLockContents);
                cleanupBufLock = true;
            } else if (deps.length > 0) {
                // If we're in air-gapped mode, skip buf dep update entirely
                if (this.isAirGapped) {
                    this.context.logger.debug("Air-gapped mode: skipping buf dep update");
                    // Read existing buf.lock contents for caching
                    try {
                        bufLockContents = await readFile(bufLockPath, "utf-8");
                    } catch {
                        bufLockContents = undefined;
                    }
                } else {
                    // Try buf dep update to populate the cache (needed at build time)
                    // Backup: If it fails with a network error and buf.lock exists, continue
                    try {
                        await buf(["dep", "update"]);
                        // buf dep update succeeded, read the updated buf.lock
                        try {
                            bufLockContents = await readFile(bufLockPath, "utf-8");
                        } catch {
                            bufLockContents = undefined;
                        }
                    } catch (bufDepUpdateError: unknown) {
                        const errorMessage =
                            bufDepUpdateError instanceof Error ? bufDepUpdateError.message : String(bufDepUpdateError);

                        // Check if buf.lock exists for backup fallback
                        let bufLockExistsInCopiedDir = false;
                        try {
                            await access(bufLockPath);
                            bufLockExistsInCopiedDir = true;
                            bufLockContents = await readFile(bufLockPath, "utf-8");
                        } catch {
                            bufLockExistsInCopiedDir = false;
                        }

                        this.context.logger.debug(
                            `buf dep update failed. isNetworkError=${isNetworkError(errorMessage)}, bufLockExists=${bufLockExistsInCopiedDir}, error=${errorMessage.substring(0, 200)}`
                        );

                        if (isNetworkError(errorMessage) && bufLockExistsInCopiedDir) {
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

            const bufGenerateResult = await buf(["generate", target.toString()]);
            if (bufGenerateResult.exitCode !== 0) {
                this.context.failAndThrow(bufGenerateResult.stderr);
            }
            if (cleanupBufLock) {
                await unlink(bufLockPath);
            }
            await unlink(bufYamlPath);
        } catch (error) {
            if (cleanupBufLock) {
                await unlink(bufLockPath);
            }
            await unlink(bufYamlPath);
            throw error;
        }
        return {
            absoluteFilepath: join(cwd, RelativeFilePath.of(PROTOBUF_GENERATOR_OUTPUT_FILEPATH)),
            bufLockContents
        };
    }

    private async generateRemote(): Promise<{
        absoluteFilepath: AbsoluteFilePath;
        bufLockContents: string | undefined;
    }> {
        this.context.failAndThrow("Remote Protobuf generation is unimplemented.");
    }
}

function getProtobufGeneratorConfig({
    relativeFilepathToProtobufRoot
}: {
    relativeFilepathToProtobufRoot: RelativeFilePath;
}): string {
    return `
version: v1
plugins:
  - plugin: openapi
    out: ${PROTOBUF_GENERATOR_OUTPUT_PATH}
    opt:
      - title=""
      - enum_type=string
      - default_response=false
      - source_root=${relativeFilepathToProtobufRoot}
`;
}
