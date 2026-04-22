import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { createLoggingExecutable, runExeca } from "@fern-api/logging-execa";
import { CliError, TaskContext } from "@fern-api/task-context";
import { access, chmod, cp, unlink, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

import {
    detectAirGappedModeForProtobuf,
    ensureBufCommand,
    getProtobufYamlV1,
    PROTOBUF_EXPORT_CONFIG_V1,
    PROTOBUF_EXPORT_CONFIG_V2,
    PROTOBUF_GEN_CONFIG,
    PROTOBUF_GENERATOR_CONFIG_FILENAME,
    PROTOBUF_GENERATOR_OUTPUT_FILEPATH,
    PROTOBUF_MODULE_PACKAGE_JSON,
    PROTOBUF_SHELL_PROXY,
    PROTOBUF_SHELL_PROXY_FILENAME
} from "./utils.js";

// Coalesces concurrent `npm install -g fern-api` calls into a single execution.
// Multiple ProtobufIRGenerator instances may call ensureFernGloballyInstalled()
// concurrently (e.g. during `fern docs dev` with multiple protobuf-sourced API tabs).
// Without this, parallel npm global installs race on the same node_modules/fern-api
// directory rename and produce ENOTEMPTY errors. The first caller creates the promise;
// subsequent callers await the same one. On failure the promise is cleared to allow retry.
// Safety: the check-and-assign after `await isFernOnPath()` is synchronous within a
// single tick, so Node's single-threaded event loop guarantees no two callers can both
// create the install promise.
let fernGlobalInstallPromise: Promise<void> | undefined;

async function isFernOnPath(logger: Logger): Promise<boolean> {
    try {
        await runExeca(undefined, "fern", ["--version"], {
            stdout: "ignore",
            stderr: "ignore"
        });
        return true;
    } catch (error) {
        const isNotFound = error != null && typeof error === "object" && "code" in error && error.code === "ENOENT";
        if (!isNotFound) {
            logger.debug(
                `Unexpected error checking for fern on PATH: ${error instanceof Error ? error.message : String(error)}`
            );
        }
        return false;
    }
}

async function ensureFernGloballyInstalled(cwd: AbsoluteFilePath, logger: Logger): Promise<void> {
    if (await isFernOnPath(logger)) {
        return;
    }
    if (fernGlobalInstallPromise) {
        return fernGlobalInstallPromise;
    }
    fernGlobalInstallPromise = (async () => {
        try {
            await runExeca(undefined, "npm", ["install", "-g", "fern-api"], {
                cwd,
                stdout: "ignore",
                stderr: "pipe"
            });
        } catch (err) {
            fernGlobalInstallPromise = undefined; // allow retry on transient failure
            throw err;
        }
    })();
    return fernGlobalInstallPromise;
}

export class ProtobufIRGenerator {
    private context: TaskContext;
    private isAirGapped: boolean | undefined;
    private resolvedBufCommand: string | undefined;

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
        // Resolve buf once at the start: check PATH first, then auto-download
        await this.ensureBufResolved();

        // Detect air-gapped mode once at the start if we have dependencies
        if (deps.length > 0 && this.isAirGapped === undefined) {
            this.isAirGapped = await detectAirGappedModeForProtobuf(
                absoluteFilepathToProtobufRoot,
                this.context.logger,
                this.resolvedBufCommand
            );
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

        const bufCommand = this.resolvedBufCommand ?? "buf";

        // Create a temporary buf config file to prevent conflicts
        // Try buf export with v1 first, then fall back to v2 if it fails
        for (const version of ["v1", "v2"]) {
            this.context.logger.info(`Using buf export with version: ${version}`);

            const tmpBufConfigFile = await tmp.file({ postfix: ".yaml" });
            const configContent = version === "v1" ? PROTOBUF_EXPORT_CONFIG_V1 : PROTOBUF_EXPORT_CONFIG_V2;
            await writeFile(tmpBufConfigFile.path, configContent, "utf8");

            try {
                const result = await runExeca(
                    this.context.logger,
                    bufCommand,
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
                return;
            } catch (error) {
                await tmpBufConfigFile.cleanup();
                if (version === "v2") {
                    throw error;
                }
            }
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

        await ensureFernGloballyInstalled(protobufGeneratorConfigPath, this.context.logger);

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
        const bufYamlPath = join(cwd, RelativeFilePath.of("buf.yaml"));

        const configContent = getProtobufYamlV1(deps);

        const bufCommand = this.resolvedBufCommand ?? "buf";
        const buf = createLoggingExecutable(bufCommand, {
            cwd,
            logger: undefined,
            stdout: "ignore",
            stderr: "pipe"
        });

        try {
            await writeFile(bufYamlPath, configContent);

            if (deps.length > 0) {
                // If we're in air-gapped mode, skip buf dep update entirely
                if (this.isAirGapped) {
                    this.context.logger.debug("Air-gapped mode: skipping buf dep update");
                    // Verify buf.lock exists in the working directory (should have been copied from source)
                    const bufLockPath = join(cwd, RelativeFilePath.of("buf.lock"));
                    try {
                        await access(bufLockPath);
                    } catch {
                        this.context.failAndThrow(
                            "Air-gapped mode requires a pre-cached buf.lock file. Please run 'buf dep update' at build time to cache dependencies.",
                            undefined,
                            { code: CliError.Code.InternalError }
                        );
                    }
                } else {
                    // Run buf dep update to populate the cache (needed at build time)
                    await buf(["dep", "update"]);
                }
            }

            const bufGenerateResult = await buf(["generate"]);
            if (bufGenerateResult.exitCode !== 0) {
                this.context.failAndThrow(bufGenerateResult.stderr, undefined, {
                    code: CliError.Code.IrConversionError
                });
            }
            await unlink(bufYamlPath);
        } catch (error) {
            await unlink(bufYamlPath);
            throw error;
        }

        return join(cwd, RelativeFilePath.of(PROTOBUF_GENERATOR_OUTPUT_FILEPATH));
    }

    private async ensureBufResolved(): Promise<void> {
        if (this.resolvedBufCommand != null) {
            return;
        }

        try {
            this.resolvedBufCommand = await ensureBufCommand(this.context.logger);
        } catch (error) {
            this.context.failAndThrow(error instanceof Error ? error.message : String(error), undefined, {
                code: CliError.Code.EnvironmentError
            });
        }
    }

    private async generateRemote(): Promise<AbsoluteFilePath> {
        this.context.failAndThrow("Remote Protobuf generation is unimplemented.", undefined, {
            code: CliError.Code.InternalError
        });
    }
}
