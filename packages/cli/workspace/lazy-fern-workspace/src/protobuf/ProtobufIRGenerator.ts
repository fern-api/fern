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

export class ProtobufIRGenerator {
    private context: TaskContext;

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
                    this.context.failAndThrow(result.stderr);
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
                // Check if buf.lock already exists (e.g., pre-cached in air-gapped environments)
                let bufLockExists = false;
                this.context.logger.debug(`Checking for buf.lock at: ${bufLockPath}`);
                try {
                    await access(bufLockPath);
                    bufLockExists = true;
                    this.context.logger.debug(`Found pre-cached buf.lock file`);
                } catch (err) {
                    bufLockExists = false;
                    this.context.logger.debug(`No buf.lock found: ${err}`);
                }

                // Always try buf dep update to populate the cache (needed at build time)
                // If it fails with a network error and buf.lock exists, continue (air-gapped mode)
                // Note: execa throws an exception when the command fails, so we need to catch it
                try {
                    await buf(["dep", "update"]);
                } catch (bufDepUpdateError: unknown) {
                    // execa throws an exception when the command fails with non-zero exit code
                    const errorMessage =
                        bufDepUpdateError instanceof Error ? bufDepUpdateError.message : String(bufDepUpdateError);
                    const isNetworkError =
                        errorMessage.includes("server hosted at that remote is unavailable") ||
                        errorMessage.includes("failed to connect") ||
                        errorMessage.includes("network") ||
                        errorMessage.includes("ENOTFOUND") ||
                        errorMessage.includes("ETIMEDOUT");

                    this.context.logger.debug(
                        `buf dep update failed. isNetworkError=${isNetworkError}, bufLockExists=${bufLockExists}, error=${errorMessage.substring(0, 200)}`
                    );

                    if (isNetworkError && bufLockExists) {
                        // Air-gapped environment with pre-cached buf.lock - continue without updating
                        this.context.logger.debug(
                            "buf dep update failed due to network error, but buf.lock exists. Continuing in air-gapped mode."
                        );
                    } else {
                        this.context.failAndThrow(errorMessage);
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
