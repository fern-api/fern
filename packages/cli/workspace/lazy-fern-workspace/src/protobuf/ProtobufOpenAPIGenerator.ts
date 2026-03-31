import { AbsoluteFilePath, join, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { access, cp, readFile, rename, unlink, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { resolveProtocGenOpenAPI } from "./ProtocGenOpenAPIDownloader.js";
import { detectAirGappedModeForProtobuf, ensureBufCommand, getProtobufYamlV1 } from "./utils.js";

const PROTOBUF_GENERATOR_CONFIG_FILENAME = "buf.gen.yaml";
const PROTOBUF_GENERATOR_OUTPUT_PATH = "output";
const PROTOBUF_GENERATOR_OUTPUT_FILEPATH = `${PROTOBUF_GENERATOR_OUTPUT_PATH}/openapi.yaml`;

/**
 * Prepared working directory for running buf generate multiple times
 * without repeating setup (copy, which checks, dep resolution).
 */
interface PreparedWorkingDir {
    cwd: AbsoluteFilePath;
    envOverride: Record<string, string> | undefined;
}

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

    /**
     * Prepares a reusable working directory: copies the proto root once,
     * writes buf config files, checks for required binaries, and resolves
     * dependencies. Returns a handle that can be passed to generateFromPrepared()
     * for each target file — no repeated setup.
     */
    public async prepare({
        absoluteFilepathToProtobufRoot,
        relativeFilepathToProtobufRoot,
        local,
        deps
    }: {
        absoluteFilepathToProtobufRoot: AbsoluteFilePath;
        relativeFilepathToProtobufRoot: RelativeFilePath;
        local: boolean;
        deps: string[];
    }): Promise<PreparedWorkingDir> {
        if (!local) {
            this.context.failAndThrow("Remote Protobuf generation is unimplemented.");
        }

        // Resolve buf and protoc-gen-openapi binaries once
        await this.ensureBufResolved();
        await this.ensureProtocGenOpenAPIResolved();

        if (deps.length > 0 && this.isAirGapped === undefined) {
            this.isAirGapped = await detectAirGappedModeForProtobuf(
                absoluteFilepathToProtobufRoot,
                this.context.logger,
                this.resolvedBufCommand
            );
        }

        const cwd = AbsoluteFilePath.of((await tmp.dir()).path);
        await cp(absoluteFilepathToProtobufRoot, cwd, { recursive: true });
        await writeFile(
            join(cwd, RelativeFilePath.of(PROTOBUF_GENERATOR_CONFIG_FILENAME)),
            getProtobufGeneratorConfig({ relativeFilepathToProtobufRoot })
        );

        // If we downloaded protoc-gen-openapi, prepend its directory to PATH so buf can find it
        const envOverride =
            this.protocGenOpenAPIBinDir != null
                ? { PATH: `${this.protocGenOpenAPIBinDir}${path.delimiter}${process.env.PATH ?? ""}` }
                : undefined;

        // Write buf.yaml and resolve dependencies once
        const bufYamlPath = join(cwd, RelativeFilePath.of("buf.yaml"));
        const bufLockPath = join(cwd, RelativeFilePath.of("buf.lock"));
        await writeFile(bufYamlPath, getProtobufYamlV1(deps));

        if (deps.length > 0) {
            if (this.isAirGapped) {
                this.context.logger.debug("Air-gapped mode: skipping buf dep update");
                try {
                    await access(bufLockPath);
                } catch {
                    this.context.failAndThrow(
                        "Air-gapped mode requires a pre-cached buf.lock file. Please run 'buf dep update' at build time to cache dependencies."
                    );
                }
            } else {
                const bufCommand = this.resolvedBufCommand ?? "buf";
                const buf = createLoggingExecutable(bufCommand, {
                    cwd,
                    logger: this.context.logger,
                    stdout: "ignore",
                    stderr: "pipe",
                    ...(envOverride != null ? { env: { ...process.env, ...envOverride } } : {})
                });
                await buf(["dep", "update"]);
            }
        }

        return { cwd, envOverride };
    }

    /**
     * Generates OpenAPI output for a single proto target using a previously
     * prepared working directory. Each call only runs `buf generate <target>`
     * — all heavy setup was done once in prepare().
     *
     * Because protoc-gen-openapi writes to a fixed output path, each call
     * renames the output to a unique temp file to avoid conflicts when called
     * sequentially for multiple targets.
     */
    public async generateFromPrepared({
        preparedDir,
        absoluteFilepathToProtobufRoot,
        absoluteFilepathToProtobufTarget
    }: {
        preparedDir: PreparedWorkingDir;
        absoluteFilepathToProtobufRoot: AbsoluteFilePath;
        absoluteFilepathToProtobufTarget: AbsoluteFilePath;
    }): Promise<{ absoluteFilepath: AbsoluteFilePath }> {
        const target = relative(absoluteFilepathToProtobufRoot, absoluteFilepathToProtobufTarget);
        const bufCommand = this.resolvedBufCommand ?? "buf";
        const buf = createLoggingExecutable(bufCommand, {
            cwd: preparedDir.cwd,
            logger: this.context.logger,
            stdout: "ignore",
            stderr: "pipe",
            ...(preparedDir.envOverride != null ? { env: { ...process.env, ...preparedDir.envOverride } } : {})
        });

        const bufGenerateResult = await buf(["generate", target.toString()]);
        if (bufGenerateResult.exitCode !== 0) {
            this.context.failAndThrow(bufGenerateResult.stderr);
        }

        // Move output to a unique temp file so the next call doesn't overwrite it
        const outputPath = join(preparedDir.cwd, RelativeFilePath.of(PROTOBUF_GENERATOR_OUTPUT_FILEPATH));
        const uniqueOutput = AbsoluteFilePath.of((await tmp.file({ postfix: ".yaml" })).path);
        await rename(outputPath, uniqueOutput);

        return { absoluteFilepath: uniqueOutput };
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

        // Allow users to force the local PATH version (e.g. for testing a custom build).
        if (process.env.FERN_USE_LOCAL_PROTOC_GEN_OPENAPI === "true") {
            this.context.logger.debug("FERN_USE_LOCAL_PROTOC_GEN_OPENAPI is set, using protoc-gen-openapi from PATH");
            const which = createLoggingExecutable("which", {
                cwd: AbsoluteFilePath.of(process.cwd()),
                logger: undefined,
                doNotPipeOutput: true
            });
            try {
                const result = await which(["protoc-gen-openapi"]);
                const resolvedPath = result.stdout?.trim();
                if (resolvedPath) {
                    this.context.logger.debug(`Found protoc-gen-openapi on PATH: ${resolvedPath}`);
                }
                this.protocGenOpenAPIResolved = true;
                return;
            } catch {
                this.context.failAndThrow(
                    "FERN_USE_LOCAL_PROTOC_GEN_OPENAPI is set but protoc-gen-openapi was not found on PATH."
                );
            }
        }

        // Always prefer the auto-downloaded fern fork of protoc-gen-openapi.
        // A user may have the original Google/gnostic protoc-gen-openapi on
        // PATH, which does not support fern-specific flags like flatten_oneofs.
        this.context.logger.debug("Resolving protoc-gen-openapi (preferring auto-downloaded fern fork)");
        this.protocGenOpenAPIBinDir = await resolveProtocGenOpenAPI(this.context.logger);

        if (this.protocGenOpenAPIBinDir != null) {
            this.protocGenOpenAPIResolved = true;
            return;
        }

        // Auto-download failed — fall back to whatever is on PATH.
        this.context.logger.debug("Auto-download failed, checking PATH for protoc-gen-openapi");
        const which = createLoggingExecutable("which", {
            cwd: AbsoluteFilePath.of(process.cwd()),
            logger: undefined,
            doNotPipeOutput: true
        });

        try {
            const result = await which(["protoc-gen-openapi"]);
            const resolvedPath = result.stdout?.trim();
            if (resolvedPath) {
                this.context.logger.debug(`Falling back to protoc-gen-openapi on PATH: ${resolvedPath}`);
            } else {
                this.context.logger.debug("Falling back to protoc-gen-openapi on PATH");
            }
            this.protocGenOpenAPIResolved = true;
        } catch {
            this.context.failAndThrow(
                "Missing required dependency; please install 'protoc-gen-openapi' to continue (e.g. 'brew install go && go install github.com/fern-api/protoc-gen-openapi/cmd/protoc-gen-openapi@latest')."
            );
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
