import { chmod, cp, unlink, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { createLoggingExecutable, runExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";

import {
    PROTOBUF_EXPORT_CONFIG_V1,
    PROTOBUF_EXPORT_CONFIG_V2,
    PROTOBUF_GENERATOR_CONFIG_FILENAME,
    PROTOBUF_GENERATOR_OUTPUT_FILEPATH,
    PROTOBUF_GEN_CONFIG,
    PROTOBUF_MODULE_PACKAGE_JSON,
    PROTOBUF_SHELL_PROXY,
    PROTOBUF_SHELL_PROXY_FILENAME,
    PROTOBUF_YAML_V1,
    PROTOBUF_YAML_V2,
    createEmptyProtobufLogger
} from "./utils";

export class ProtobufIRGenerator {
    private context: TaskContext;

    constructor({ context }: { context: TaskContext }) {
        this.context = context;
    }

    public async generate({
        absoluteFilepathToProtobufRoot,
        absoluteFilepathToProtobufTarget,
        local
    }: {
        absoluteFilepathToProtobufRoot: AbsoluteFilePath;
        absoluteFilepathToProtobufTarget: AbsoluteFilePath | undefined;
        local: boolean;
    }): Promise<AbsoluteFilePath> {
        if (local) {
            return this.generateLocal({
                absoluteFilepathToProtobufRoot,
                absoluteFilepathToProtobufTarget
            });
        }
        return this.generateRemote();
    }

    private async generateLocal({
        absoluteFilepathToProtobufRoot,
        absoluteFilepathToProtobufTarget
    }: {
        absoluteFilepathToProtobufRoot: AbsoluteFilePath;
        absoluteFilepathToProtobufTarget: AbsoluteFilePath | undefined;
    }): Promise<AbsoluteFilePath> {
        const protobufGeneratorConfigPath = await this.setupProtobufGeneratorConfig({
            absoluteFilepathToProtobufRoot,
            absoluteFilepathToProtobufTarget
        });
        return this.doGenerateLocal({
            cwd: protobufGeneratorConfigPath
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
            logger: createEmptyProtobufLogger(),
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
        await cp(absoluteFilepathToProtobufRoot, protobufGeneratorConfigPath, {
            recursive: true,
            filter: (src) => {
                const basename = path.basename(src);
                return (
                    basename !== "buf.lock" &&
                    basename !== "buf.yaml" &&
                    !(basename.startsWith("buf.gen.") && basename.endsWith(".yaml"))
                );
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

        await runExeca(this.context.logger, "npm", ["install"], {
            cwd: protobufGeneratorConfigPath,
            stdio: "ignore"
        });

        await runExeca(this.context.logger, "npm", ["install", "-g", "fern-api"], {
            cwd: protobufGeneratorConfigPath,
            stdio: "ignore"
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

    private async doGenerateLocal({ cwd }: { cwd: AbsoluteFilePath }): Promise<AbsoluteFilePath> {
        const which = createLoggingExecutable("which", {
            cwd,
            logger: createEmptyProtobufLogger()
        });

        try {
            await which(["buf"]);
        } catch (err) {
            this.context.failAndThrow(
                "Missing required dependency; please install 'buf' to continue (e.g. 'brew install buf')."
            );
        }

        const buf = createLoggingExecutable("buf", {
            cwd,
            logger: createEmptyProtobufLogger()
        });

        await buf(["config", "init"]);
        await buf(["generate"]);

        return join(cwd, RelativeFilePath.of(PROTOBUF_GENERATOR_OUTPUT_FILEPATH));
    }

    private async generateRemote(): Promise<AbsoluteFilePath> {
        this.context.failAndThrow("Remote Protobuf generation is unimplemented.");
    }
}
