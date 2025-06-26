import { execSync } from "child_process";
import { chmod, cp, readFile, writeFile } from "fs/promises";
import path, { resolve } from "path";
import tmp from "tmp-promise";

import { AbsoluteFilePath, RelativeFilePath, join, listFiles, relative } from "@fern-api/fs-utils";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";

const PROTOBUF_GENERATOR_CONFIG_FILENAME = "buf.gen.yaml";
const PROTOBUF_GENERATOR_OUTPUT_PATH = "output";
const PROTOBUF_GENERATOR_OUTPUT_FILEPATH = `${PROTOBUF_GENERATOR_OUTPUT_PATH}/ir.json`;
const PROTOC_GEN_FERN_PLUGIN_PATH =
    "/Users/sahil/Fern/fern/packages/cli/generation/protoc-gen-fern/lib/protoc-gen-fern.js";

const PROTOBUF_SHELL_PROXY_FILENAME = "protoc-gen-fern";

export class ProtobufIRGenerator {
    private context: TaskContext;

    constructor({ context }: { context: TaskContext }) {
        this.context = context;
    }

    public async generate({
        absoluteFilepathToProtobufRoot,
        absoluteFilepathToProtobufTarget,
        relativeFilepathToProtobufRoot,
        local
    }: {
        absoluteFilepathToProtobufRoot: AbsoluteFilePath;
        absoluteFilepathToProtobufTarget: AbsoluteFilePath;
        relativeFilepathToProtobufRoot: RelativeFilePath;
        local: boolean;
    }): Promise<AbsoluteFilePath> {
        if (local) {
            return this.generateLocal({
                absoluteFilepathToProtobufRoot,
                absoluteFilepathToProtobufTarget,
                relativeFilepathToProtobufRoot
            });
        }
        return this.generateRemote();
    }

    private async generateLocal({
        absoluteFilepathToProtobufRoot,
        absoluteFilepathToProtobufTarget,
        relativeFilepathToProtobufRoot
    }: {
        absoluteFilepathToProtobufRoot: AbsoluteFilePath;
        absoluteFilepathToProtobufTarget: AbsoluteFilePath;
        relativeFilepathToProtobufRoot: RelativeFilePath;
    }): Promise<AbsoluteFilePath> {
        const protobufGeneratorConfigPath = await this.setupProtobufGeneratorConfig({
            absoluteFilepathToProtobufRoot,
            relativeFilepathToProtobufRoot
        });
        const protoTargetRelativeFilePath = relative(absoluteFilepathToProtobufRoot, absoluteFilepathToProtobufTarget);
        return this.doGenerateLocal({
            cwd: protobufGeneratorConfigPath,
            target: protoTargetRelativeFilePath
        });
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

        // Initialize package.json
        await writeFile(
            join(protobufGeneratorConfigPath, RelativeFilePath.of("package.json")),
            JSON.stringify(
                {
                    name: "temp-protoc-gen-fern",
                    version: "1.0.0",
                    type: "module",
                    dependencies: {
                        "@bufbuild/protobuf": "^2.2.5",
                        "@bufbuild/protoplugin": "2.2.5"
                    }
                },
                null,
                2
            )
        );

        // Install dependencies
        execSync("npm install", {
            cwd: protobufGeneratorConfigPath,
            stdio: "inherit" // This will show npm output
        });

        // Write buf config
        await writeFile(
            join(protobufGeneratorConfigPath, RelativeFilePath.of(PROTOBUF_GENERATOR_CONFIG_FILENAME)),
            getProtobufGeneratorConfig()
        );

        // Write and make executable the protoc plugin
        const shellProxyPath = join(protobufGeneratorConfigPath, RelativeFilePath.of(PROTOBUF_SHELL_PROXY_FILENAME));
        await writeFile(shellProxyPath, getProtobufShellProxy());
        await chmod(shellProxyPath, 0o755);

        return protobufGeneratorConfigPath;
    }

    private async doGenerateLocal({
        cwd,
        target
    }: {
        cwd: AbsoluteFilePath;
        target: RelativeFilePath;
    }): Promise<AbsoluteFilePath> {
        const which = createLoggingExecutable("which", {
            cwd,
            logger: this.context.logger
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
            logger: this.context.logger
        });

        await buf(["config", "init"]);
        await buf(["generate"]);

        return join(cwd, RelativeFilePath.of(PROTOBUF_GENERATOR_OUTPUT_FILEPATH));
    }

    private async generateRemote(): Promise<AbsoluteFilePath> {
        this.context.failAndThrow("Remote Protobuf generation is unimplemented.");
    }
}

const PROTOBUF_GEN_CONFIG = `version: v2
plugins:
  - local: ["tsx", "protoc-gen-fern"]
    out: output`;

function getProtobufGeneratorConfig(): string {
    return PROTOBUF_GEN_CONFIG;
}

function getProtobufShellProxy(): string {
    return `#!/usr/bin/env node
    import { runNodeJs } from "@bufbuild/protoplugin";

    import { protocGenFern } from "${PROTOC_GEN_FERN_PLUGIN_PATH}";

    runNodeJs(protocGenFern);`;
}
