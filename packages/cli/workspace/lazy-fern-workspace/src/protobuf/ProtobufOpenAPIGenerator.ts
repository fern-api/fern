import { AbsoluteFilePath, join, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { access, cp, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { resolveProtocGenOpenAPI } from "./ProtocGenOpenAPIDownloader.js";
import { detectAirGappedModeForProtobuf, ensureBufCommand, getProtobufYamlV1 } from "./utils.js";

const PROTOBUF_GENERATOR_CONFIG_FILENAME = "buf.gen.yaml";
const PROTOBUF_GENERATOR_OUTPUT_PATH = "output";
const PROTOBUF_GENERATOR_OUTPUT_FILEPATH = `${PROTOBUF_GENERATOR_OUTPUT_PATH}/openapi.yaml`;

export class ProtobufOpenAPIGenerator {
    private context: TaskContext;
    private isAirGapped: boolean | undefined;
    private protocGenOpenAPIBinDir: AbsoluteFilePath | undefined;
    private protocGenOpenAPIResolved = false;
    private resolvedBufCommand: string | undefined;

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
        // Resolve buf and protoc-gen-openapi once at the start
        await this.ensureBufResolved();
        await this.ensureProtocGenOpenAPIResolved();

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

        const bufYamlPath = join(cwd, RelativeFilePath.of("buf.yaml"));
        const bufLockPath = join(cwd, RelativeFilePath.of("buf.lock"));
        let cleanupBufLock = false;

        const configContent = getProtobufYamlV1(deps);

        // If we downloaded protoc-gen-openapi, prepend its directory to PATH so buf can find it
        const envOverride =
            this.protocGenOpenAPIBinDir != null
                ? { PATH: `${this.protocGenOpenAPIBinDir}${path.delimiter}${process.env.PATH ?? ""}` }
                : undefined;

        const bufCommand = this.resolvedBufCommand ?? "buf";
        const buf = createLoggingExecutable(bufCommand, {
            cwd,
            logger: this.context.logger,
            stdout: "ignore",
            stderr: "pipe",
            ...(envOverride != null ? { env: { ...process.env, ...envOverride } } : {})
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
                    // Verify buf.lock exists in the working directory (should have been copied from source)
                    try {
                        await access(bufLockPath);
                    } catch {
                        this.context.failAndThrow(
                            "Air-gapped mode requires a pre-cached buf.lock file. Please run 'buf dep update' at build time to cache dependencies."
                        );
                    }
                } else {
                    // Run buf dep update to populate the cache (needed at build time)
                    await buf(["dep", "update"]);
                }
                // Read buf.lock contents for caching
                try {
                    bufLockContents = await readFile(bufLockPath, "utf-8");
                } catch {
                    bufLockContents = undefined;
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

    private async ensureProtocGenOpenAPIResolved(): Promise<void> {
        if (this.protocGenOpenAPIResolved) {
            return;
        }

        const which = createLoggingExecutable("which", {
            cwd: AbsoluteFilePath.of(process.cwd()),
            logger: undefined,
            doNotPipeOutput: true
        });

        try {
            await which(["protoc-gen-openapi"]);
            this.protocGenOpenAPIResolved = true;
        } catch {
            this.context.logger.debug("protoc-gen-openapi not found on PATH, attempting auto-download");
            this.protocGenOpenAPIBinDir = await resolveProtocGenOpenAPI(this.context.logger);
            if (this.protocGenOpenAPIBinDir == null) {
                this.context.failAndThrow(
                    "Missing required dependency; please install 'protoc-gen-openapi' to continue (e.g. 'brew install go && go install github.com/fern-api/protoc-gen-openapi/cmd/protoc-gen-openapi@latest')."
                );
            }
            this.protocGenOpenAPIResolved = true;
        }
    }

    private async ensureBufResolved(): Promise<void> {
        if (this.resolvedBufCommand != null) {
            return;
        }

        try {
            this.resolvedBufCommand = await ensureBufCommand(this.context.logger);
        } catch (error) {
            this.context.failAndThrow(error instanceof Error ? error.message : String(error));
        }
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
      - flatten_oneofs=true
      - include_all_methods=true
      - source_root=${relativeFilepathToProtobufRoot}
`;
}
