import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, relative, RelativeFilePath } from "@fern-api/fs-utils";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { cp, writeFile } from "fs/promises";
import tmp from "tmp-promise";

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
    private absolutePathToWorkspace: AbsoluteFilePath;

    constructor({
        context,
        absolutePathToWorkspace
    }: {
        context: TaskContext;
        absolutePathToWorkspace: AbsoluteFilePath;
    }) {
        this.context = context;
        this.absolutePathToWorkspace = absolutePathToWorkspace;
    }

    public async generate({
        apiDefinition,
        local
    }: {
        apiDefinition: generatorsYml.ProtoAPIDefinitionSchema;
        local: boolean;
    }): Promise<AbsoluteFilePath> {
        if (local) {
            return this.generateLocal({ apiDefinition });
        }
        return this.generateRemote();
    }

    private async generateLocal({
        apiDefinition
    }: {
        apiDefinition: generatorsYml.ProtoAPIDefinitionSchema;
    }): Promise<AbsoluteFilePath> {
        const protoRootAbsoluteFilePath = join(this.absolutePathToWorkspace, RelativeFilePath.of(apiDefinition.root));
        const protoTargetAbsoluteFilePath = join(
            this.absolutePathToWorkspace,
            RelativeFilePath.of(apiDefinition.target)
        );
        const protobufGeneratorConfigPath = await this.setupProtobufGeneratorConfig({
            protoRootAbsoluteFilePath
        });
        const protoTargetRelativeFilePath = relative(protoRootAbsoluteFilePath, protoTargetAbsoluteFilePath);
        return this.doGenerateLocal({
            cwd: protobufGeneratorConfigPath,
            target: protoTargetRelativeFilePath
        });
    }

    private async setupProtobufGeneratorConfig({
        protoRootAbsoluteFilePath
    }: {
        protoRootAbsoluteFilePath: AbsoluteFilePath;
    }): Promise<AbsoluteFilePath> {
        const protobufGeneratorConfigPath = AbsoluteFilePath.of((await tmp.dir()).path);
        await cp(protoRootAbsoluteFilePath, protobufGeneratorConfigPath, { recursive: true });
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
        const buf = createLoggingExecutable("buf", {
            cwd,
            logger: this.context.logger
        });
        await buf(["config", "init"]);
        await buf(["generate", target]);
        return join(cwd, RelativeFilePath.of(PROTOBUF_GENERATOR_OUTPUT_FILEPATH));
    }

    private async generateRemote(): Promise<AbsoluteFilePath> {
        throw new Error("Remote Protobuf generation is unimplemented.");
    }
}
