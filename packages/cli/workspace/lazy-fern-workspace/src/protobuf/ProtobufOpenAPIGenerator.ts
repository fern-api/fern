import { cp, readFile, readdir, unlink, writeFile } from "fs/promises";
import tmp from "tmp-promise";

import { AbsoluteFilePath, RelativeFilePath, join, relative } from "@fern-api/fs-utils";
import { createLoggingExecutable, runExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { getProtobufYamlV1, getProtobufYamlV2 } from "./utils";

const PROTOBUF_GENERATOR_CONFIG_FILENAME = "buf.gen.yaml";
const PROTOBUF_GENERATOR_OUTPUT_PATH = "output";
const PROTOBUF_GENERATOR_OUTPUT_FILEPATH = `${PROTOBUF_GENERATOR_OUTPUT_PATH}/openapi.yaml`;

export class ProtobufOpenAPIGenerator {
    private context: TaskContext;

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
                const bufDepUpdateResult = await buf(["dep", "update"]);
                try {
                    bufLockContents = await readFile(bufLockPath, "utf-8");
                } catch (err) {
                    bufLockContents = undefined;
                }
                if (bufDepUpdateResult.exitCode !== 0) {
                    this.context.failAndThrow(bufDepUpdateResult.stderr);
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
