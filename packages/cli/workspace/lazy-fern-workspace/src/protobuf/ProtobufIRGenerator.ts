import { cp, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

import { AbsoluteFilePath, RelativeFilePath, join, relative } from "@fern-api/fs-utils";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";

import "../../../../generation/protoc-gen-fern/bin/protoc-gen-fern";

const PROTOBUF_GENERATOR_CONFIG_FILENAME = "buf.gen.yaml";
const PROTOBUF_GENERATOR_OUTPUT_PATH = "output";
const PROTOBUF_GENERATOR_OUTPUT_FILEPATH = `${PROTOBUF_GENERATOR_OUTPUT_PATH}/ir.json`;
const PROTOC_GEN_FERN_PLUGIN_PATH = path.resolve(
    __dirname,
    "../../../../generation/protoc-gen-fern/bin/protoc-gen-fern"
);

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
        return Promise.resolve(AbsoluteFilePath.of("/dummy/path"));
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
            getProtobufGeneratorConfig()
        );
        return protobufGeneratorConfigPath;
    }

    // private async doGenerateLocal({
    //     cwd,
    //     target
    // }: {
    //     cwd: AbsoluteFilePath;
    //     target: RelativeFilePath;
    // }): Promise<AbsoluteFilePath> {
    //     console.error("HERE3");
    //     const which = createLoggingExecutable("which", {
    //         cwd,
    //         logger: this.context.logger
    //     });

    //     console.error("HERE4");
    //     try {
    //         await which(["buf"]);
    //     } catch (err) {
    //         this.context.failAndThrow(
    //             "Missing required dependency; please install 'buf' to continue (e.g. 'brew install buf')."
    //         );
    //     }
    //     console.error("HERE5");
    //     const buf = createLoggingExecutable("buf", {
    //         cwd,
    //         logger: this.context.logger
    //     });
    //     console.error("HERE");
    //     await buf(["config", "init"]);
    //     console.error("HERE2");
    //     await buf(["generate", target]);
    //     return join(cwd, RelativeFilePath.of(PROTOBUF_GENERATOR_OUTPUT_FILEPATH));
    // }

    private async generateRemote(): Promise<AbsoluteFilePath> {
        this.context.failAndThrow("Remote Protobuf generation is unimplemented.");
    }
}

const PROTOBUF_GEN_CONFIG = `version: v2
plugins:
  - local: ["tsx", "${PROTOC_GEN_FERN_PLUGIN_PATH}"]
    out: output
    strategy: all`;

function getProtobufGeneratorConfig(): string {
    return PROTOBUF_GEN_CONFIG;
}
