import { cp, writeFile } from "fs/promises";
import tmp from "tmp-promise";

import { AbsoluteFilePath, RelativeFilePath, join, relative } from "@fern-api/fs-utils";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";

const PROTOBUF_GENERATOR_CONFIG_FILENAME = "buf.gen.yaml";
const PROTOBUF_GENERATOR_OUTPUT_PATH = "output";
const PROTOBUF_GENERATOR_OUTPUT_FILEPATH = `${PROTOBUF_GENERATOR_OUTPUT_PATH}/openapi.yaml`;
const PROTOBUF_GENERATOR_CONFIG = `
version: v1
plugins:
  - plugin: openapi
    out: ${PROTOBUF_GENERATOR_OUTPUT_PATH}
    opt:
      - title=""
      - enum_type=string
      - default_response=false
`;

export class ProtobufOpenAPIGenerator {
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
        absoluteFilepathToProtobufTarget: AbsoluteFilePath;
        local: boolean;
    }): Promise<AbsoluteFilePath> {
        if (local) {
            return this.generateLocal({ absoluteFilepathToProtobufRoot, absoluteFilepathToProtobufTarget });
        }
        return this.generateRemote();
    }

    private async generateLocal({
        absoluteFilepathToProtobufRoot,
        absoluteFilepathToProtobufTarget
    }: {
        absoluteFilepathToProtobufRoot: AbsoluteFilePath;
        absoluteFilepathToProtobufTarget: AbsoluteFilePath;
    }): Promise<AbsoluteFilePath> {
        const protobufGeneratorConfigPath = await this.setupProtobufGeneratorConfig({
            absoluteFilepathToProtobufRoot
        });
        const protoTargetRelativeFilePath = relative(absoluteFilepathToProtobufRoot, absoluteFilepathToProtobufTarget);
        return this.doGenerateLocal({
            cwd: protobufGeneratorConfigPath,
            target: protoTargetRelativeFilePath
        });
    }

    private async setupProtobufGeneratorConfig({
        absoluteFilepathToProtobufRoot
    }: {
        absoluteFilepathToProtobufRoot: AbsoluteFilePath;
    }): Promise<AbsoluteFilePath> {
        const protobufGeneratorConfigPath = AbsoluteFilePath.of((await tmp.dir()).path);
        await cp(absoluteFilepathToProtobufRoot, protobufGeneratorConfigPath, { recursive: true });
        await writeFile(
            join(protobufGeneratorConfigPath, RelativeFilePath.of(PROTOBUF_GENERATOR_CONFIG_FILENAME)),
            PROTOBUF_GENERATOR_CONFIG
        );
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

        try {
            await which(["protoc-gen-openapi"]);
        } catch (err) {
            this.context.failAndThrow(
                "Missing required dependency; please install 'protoc-gen-openapi' to continue (e.g. 'brew install go && go install github.com/google/gnostic/cmd/protoc-gen-openapi@latest')."
            );
        }

        const buf = createLoggingExecutable("buf", {
            cwd,
            logger: this.context.logger
        });
        await buf(["config", "init"]);
        await buf(["generate", target]);
        return join(cwd, RelativeFilePath.of(PROTOBUF_GENERATOR_OUTPUT_FILEPATH));
    }

    private async generateRemote(): Promise<AbsoluteFilePath> {
        this.context.failAndThrow("Remote Protobuf generation is unimplemented.");
    }
}
