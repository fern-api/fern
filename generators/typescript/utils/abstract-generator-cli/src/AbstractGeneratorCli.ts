import {
    FernGeneratorExec,
    GeneratorError,
    GeneratorNotificationService,
    NopGeneratorNotificationService,
    parseGeneratorConfig,
    resolveErrorCode,
    SentryClient,
    shouldReportToSentry,
    shouldTrackLocalVariablesInSentry
} from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER, createLogger, Logger, LogLevel } from "@fern-api/logger";
import { FernIr } from "@fern-fern/ir-sdk";
import { fastParseIR } from "./fastParseIR.js";
import {
    constructNpmPackage,
    constructNpmPackageArgs,
    constructNpmPackageFromArgs,
    NpmPackage,
    PersistedTypescriptProject
} from "@fern-typescript/commons";
import { GeneratorContext } from "@fern-typescript/contexts";
import { execFile } from "child_process";
import { copyFile, readFile, writeFile } from "fs/promises";
import tmp from "tmp-promise";
import { publishPackage } from "./publishPackage.js";
import { writeGenerationMetadata } from "./writeGenerationMetadata.js";
import { writeGitHubWorkflows } from "./writeGitHubWorkflows.js";

const OUTPUT_ZIP_FILENAME = "output.zip";

const LOG_LEVEL_CONVERSIONS: Record<LogLevel, FernGeneratorExec.logging.LogLevel> = {
    [LogLevel.Trace]: FernGeneratorExec.logging.LogLevel.Debug,
    [LogLevel.Debug]: FernGeneratorExec.logging.LogLevel.Debug,
    [LogLevel.Info]: FernGeneratorExec.logging.LogLevel.Info,
    [LogLevel.Warn]: FernGeneratorExec.logging.LogLevel.Warn,
    [LogLevel.Error]: FernGeneratorExec.logging.LogLevel.Error
};

// TODO: consider moving these config options into the custom config
// SEE: /fern/generators/base/src/AbstractGeneratorCli.ts
export declare namespace AbstractGeneratorCli {
    interface Options {
        /* Whether to disable notifications service */
        disableNotifications?: boolean;
        /* The subdirectory to generate to (used by the MCP server generator) */
        outputSubDirectory?: string;
        /* Whether to immediately unzip the output (used by the MCP server generator) */
        unzipOutput?: boolean;
    }
}

export abstract class AbstractGeneratorCli<CustomConfig> {
    public async runCli(options?: AbstractGeneratorCli.Options): Promise<void> {
        const pathToConfig = process.argv[process.argv.length - 1];
        if (pathToConfig == null) {
            throw GeneratorError.environmentError("No argument for config filepath.");
        }
        await this.run(pathToConfig, options);
    }

    public async run(pathToConfig: string, options?: AbstractGeneratorCli.Options): Promise<void> {
        let sentryClient: SentryClient | undefined;

        const config = await parseGeneratorConfig(pathToConfig);
        let generatorNotificationService: GeneratorNotificationService | NopGeneratorNotificationService =
            options?.disableNotifications
                ? new NopGeneratorNotificationService()
                : new GeneratorNotificationService(config.environment);
        try {
            sentryClient = new SentryClient({
                workspaceName: config.workspaceName,
                organization: config.organization,
                shouldTrackLocalVariables: shouldTrackLocalVariablesInSentry(config)
            });
            const logger = createLogger((level, ...message) => {
                CONSOLE_LOGGER.log(level, ...message);

                // kick off log, but don't wait for it
                generatorNotificationService.bufferUpdate(
                    FernGeneratorExec.GeneratorUpdate.log({
                        message: message.join(" "),
                        level: LOG_LEVEL_CONVERSIONS[level]
                    })
                );
            });
            const customConfig = this.parseCustomConfig(config.customConfig, logger);

            const ir = await fastParseIR<FernIr.IntermediateRepresentation>(
                AbsoluteFilePath.of(config.irFilepath)
            );

            // First try to construct the package from the IR's publishConfig. This is how
            // self-hosted setups thread package metadata through, and it also carries the
            // version + package name for local-file-system output (where the generator
            // exec output mode is `downloadFiles` and does not itself carry a version).
            let npmPackage: NpmPackage | undefined = constructNpmPackageFromArgs(
                npmPackageInfoFromPublishConfig(config, ir.publishConfig, this.isPackagePrivate(customConfig))
            );
            // Fall back to deriving the package from the generator exec config (github/publish modes).
            if (npmPackage == null) {
                npmPackage = constructNpmPackage({
                    generatorConfig: config,
                    isPackagePrivate: this.isPackagePrivate(customConfig)
                });
            }

            await generatorNotificationService.sendUpdate(
                FernGeneratorExec.GeneratorUpdate.initV2({
                    publishingToRegistry:
                        npmPackage?.publishInfo != null ? FernGeneratorExec.RegistryType.Npm : undefined
                })
            );

            const version =
                config.output?.mode._visit({
                    downloadFiles: () => undefined,
                    github: (github) => github.version,
                    publish: (publish) => publish.version,
                    _other: () => undefined
                }) ?? npmPackage?.version;

            const generatorContext = new GeneratorContextImpl(logger, version);

            // Start lockfile generation early for GitHub mode to overlap with code generation.
            // The lockfile only depends on dependency specifiers, which are deterministic
            // from the generator config. By starting it before generate(), we overlap
            // ~1.5s of pnpm resolution with ~1.5s of code generation.
            let earlyLockfilePromise: Promise<string | undefined> | undefined;
            if (config.output.mode.type === "github") {
                const lockfileConfig = this.getEarlyLockfileConfig(customConfig);
                if (lockfileConfig) {
                    earlyLockfilePromise = (async () => {
                        try {
                            const tmpDir = (await tmp.dir()).path;
                            const minimalPkg = {
                                name: "lockfile-gen",
                                version: "0.0.0",
                                private: true,
                                ...(lockfileConfig.dependencies != null &&
                                Object.keys(lockfileConfig.dependencies).length > 0
                                    ? { dependencies: lockfileConfig.dependencies }
                                    : {}),
                                devDependencies: lockfileConfig.devDependencies,
                                packageManager: lockfileConfig.packageManager
                            };
                            await writeFile(`${tmpDir}/package.json`, JSON.stringify(minimalPkg, null, 2));
                            await writeFile(`${tmpDir}/pnpm-workspace.yaml`, "packages: ['.']");

                            const pm = lockfileConfig.packageManager.split("@")[0] ?? "pnpm";
                            await new Promise<void>((resolve, reject) => {
                                execFile(
                                    pm,
                                    ["install", "--lockfile-only", "--ignore-scripts", "--prefer-offline", "--no-optional"],
                                    {
                                        cwd: tmpDir,
                                        env: { ...process.env, PNPM_FROZEN_LOCKFILE: "false" }
                                    },
                                    (error) => (error ? reject(error) : resolve())
                                );
                            });
                            return `${tmpDir}/pnpm-lock.yaml`;
                        } catch (e) {
                            logger.debug(`Early lockfile generation failed: ${e}`);
                            return undefined;
                        }
                    })();
                }
            }

            const codeGenStartTime = Date.now();
            const typescriptProject = await this.generateTypescriptProject({
                config,
                customConfig,
                npmPackage,
                generatorContext,
                intermediateRepresentation: ir
            });
            logger.debug(`[TIMING] code generation took ${Date.now() - codeGenStartTime}ms`);

            // Try to use the early-generated lockfile
            let lockfileReady = false;
            if (earlyLockfilePromise) {
                const lockfilePath = await earlyLockfilePromise;
                if (lockfilePath) {
                    try {
                        // Verify the actual deps match our prediction by comparing
                        // the dependency specifiers from the generated package.json
                        const actualPkg = JSON.parse(
                            await readFile(`${typescriptProject.getRootDirectory()}/package.json`, "utf-8")
                        );
                        const expectedConfig = this.getEarlyLockfileConfig(customConfig);
                        if (
                            expectedConfig &&
                            depsMatch(actualPkg.dependencies ?? {}, expectedConfig.dependencies ?? {}) &&
                            depsMatch(actualPkg.devDependencies ?? {}, expectedConfig.devDependencies)
                        ) {
                            await copyFile(
                                lockfilePath,
                                `${typescriptProject.getRootDirectory()}/pnpm-lock.yaml`
                            );
                            lockfileReady = true;
                            logger.debug("[TIMING] early lockfile used successfully");
                        } else {
                            logger.debug("[TIMING] early lockfile deps mismatch, will regenerate");
                        }
                    } catch (e) {
                        logger.debug(`Early lockfile copy failed: ${e}`);
                    }
                }
            }
            if (!generatorContext.didSucceed()) {
                throw GeneratorError.internalError("Failed to generate TypeScript project.");
            }

            const destinationPath = join(
                AbsoluteFilePath.of(config.output.path),
                RelativeFilePath.of(options?.outputSubDirectory ?? "")
            );

            await typescriptProject.writeArbitraryFiles(async (pathToProject) => {
                if (ir.generationMetadata) {
                    await writeGenerationMetadata({
                        generationMetadata: ir.generationMetadata,
                        pathToProject,
                        sdkVersion: version
                    });
                }
            });

            // Run npm pkg fix to normalize package.json (enabled by default)
            if (!this.shouldSkipNpmPkgFix(customConfig)) {
                await typescriptProject.fixPackageJson(logger);
            }

            await config.output.mode._visit<void | Promise<void>>({
                publish: async () => {
                    await typescriptProject.installDependencies(logger);
                    await typescriptProject.checkFix(logger);
                    await typescriptProject.build(logger);
                    await publishPackage({
                        logger,
                        npmPackage,
                        dryRun: config.dryRun,
                        generatorNotificationService: generatorNotificationService as GeneratorNotificationService,
                        typescriptProject,
                        shouldTolerateRepublish: this.shouldTolerateRepublish(customConfig)
                    });
                    if (this.outputSrcOnly(customConfig)) {
                        await typescriptProject.copySrcContentsTo({
                            destinationPath,
                            zipFilename: OUTPUT_ZIP_FILENAME,
                            unzipOutput: options?.unzipOutput,
                            logger
                        });
                    } else {
                        await typescriptProject.npmPackTo({
                            logger,
                            destinationPath,
                            zipFilename: OUTPUT_ZIP_FILENAME,
                            unzipOutput: options?.unzipOutput
                        });
                    }
                },
                github: async (githubOutputMode) => {
                    await typescriptProject.writeArbitraryFiles(async (pathToProject) => {
                        await writeGitHubWorkflows({
                            githubOutputMode,
                            isPackagePrivate: npmPackage != null && npmPackage.private,
                            pathToProject,
                            config,
                            publishToJsr: this.publishToJsr(customConfig),
                            packageManager: this.getPackageManager(customConfig)
                        });
                    });
                    // Run lockfile generation and check:fix in parallel.
                    // When tools are on PATH, invoke them directly (bypasses
                    // pnpm script runner overhead).  Otherwise use pnpm dlx.
                    const toolsAvailable = await typescriptProject.areCheckFixToolsAvailable(logger);
                    await Promise.all([
                        lockfileReady
                            ? Promise.resolve()
                            : typescriptProject.generateLockfile(logger),
                        toolsAvailable
                            ? typescriptProject.checkFixDirect(logger)
                            : typescriptProject.checkFixViaDlx(logger)
                    ]);
                    await typescriptProject.deleteGitIgnoredFiles(logger);
                    if (this.outputSrcOnly(customConfig)) {
                        await typescriptProject.copySrcContentsTo({
                            destinationPath,
                            zipFilename: OUTPUT_ZIP_FILENAME,
                            unzipOutput: options?.unzipOutput,
                            logger
                        });
                    } else {
                        await typescriptProject.copyProjectTo({
                            logger,
                            destinationPath,
                            zipFilename: OUTPUT_ZIP_FILENAME,
                            unzipOutput: options?.unzipOutput
                        });
                    }
                },
                downloadFiles: async () => {
                    // Determine the output strategy to avoid installing all
                    // dependencies unnecessarily. Source-only output paths only
                    // need devDependencies (formatters, linters) — the build
                    // path requires a full install of production deps too.
                    const needsBuild = !this.outputSrcOnly(customConfig) && !this.outputSourceFiles(customConfig);

                    if (needsBuild) {
                        await typescriptProject.installDependencies(logger);
                    } else if (!(await typescriptProject.areCheckFixToolsAvailable(logger))) {
                        await typescriptProject.installCheckFixDependencies(logger);
                    }
                    await typescriptProject.checkFix(logger);

                    if (this.outputSrcOnly(customConfig)) {
                        await typescriptProject.copySrcContentsTo({
                            destinationPath,
                            zipFilename: OUTPUT_ZIP_FILENAME,
                            unzipOutput: options?.unzipOutput,
                            logger
                        });
                        return;
                    }
                    if (this.shouldGenerateFullProject(ir)) {
                        await typescriptProject.copyProjectTo({
                            destinationPath,
                            zipFilename: OUTPUT_ZIP_FILENAME,
                            unzipOutput: options?.unzipOutput,
                            logger
                        });
                        return;
                    }
                    if (this.outputSourceFiles(customConfig)) {
                        await typescriptProject.copySrcTo({
                            destinationPath,
                            zipFilename: OUTPUT_ZIP_FILENAME,
                            unzipOutput: options?.unzipOutput,
                            logger
                        });
                        return;
                    }
                    await typescriptProject.build(logger);
                    await typescriptProject.copyDistTo({
                        destinationPath,
                        zipFilename: OUTPUT_ZIP_FILENAME,
                        unzipOutput: options?.unzipOutput,
                        logger
                    });
                },
                _other: ({ type }) => {
                    throw GeneratorError.internalError(`${type} mode is not implemented`);
                }
            });

            await generatorNotificationService.sendUpdate(
                FernGeneratorExec.GeneratorUpdate.exitStatusUpdate(
                    FernGeneratorExec.ExitStatusUpdate.successful({
                        zipFilename: OUTPUT_ZIP_FILENAME
                    })
                )
            );
            // biome-ignore lint/suspicious/noConsole: allow console
            console.log("Sent success event to coordinator");
        } catch (e) {
            const errorCode = resolveErrorCode(e);
            if (shouldReportToSentry(e)) {
                await sentryClient?.captureException(e, { errorCode });
            }

            // This call tears down generator service
            // TODO: if using in conjunction with MCP server generator, MCP server generator to tear down the service?
            // SEE: go-v2
            await generatorNotificationService.sendUpdate(
                FernGeneratorExec.GeneratorUpdate.exitStatusUpdate(
                    FernGeneratorExec.ExitStatusUpdate.error({
                        message: e instanceof Error ? e.message : "Encountered error"
                    })
                )
            );
            // biome-ignore lint/suspicious/noConsole: allow console
            console.log("Sent error event to coordinator");
            throw e;
        } finally {
            await sentryClient?.flush();
        }
    }

    protected abstract parseCustomConfig(customConfig: unknown, logger: Logger): CustomConfig;
    protected abstract generateTypescriptProject(args: {
        config: FernGeneratorExec.GeneratorConfig;
        customConfig: CustomConfig;
        npmPackage: NpmPackage | undefined;
        generatorContext: GeneratorContext;
        intermediateRepresentation: FernIr.IntermediateRepresentation;
    }): Promise<PersistedTypescriptProject>;
    protected abstract isPackagePrivate(customConfig: CustomConfig): boolean;
    protected abstract publishToJsr(customConfig: CustomConfig): boolean;
    protected abstract getPackageManager(customConfig: CustomConfig): "pnpm" | "yarn";
    protected abstract outputSourceFiles(customConfig: CustomConfig): boolean;
    protected abstract outputSrcOnly(customConfig: CustomConfig): boolean;
    protected abstract shouldTolerateRepublish(customConfig: CustomConfig): boolean;
    protected abstract shouldSkipNpmPkgFix(customConfig: CustomConfig): boolean;

    /**
     * Override to return the expected dependencies for early lockfile generation.
     * When provided, lockfile generation starts in parallel with code generation
     * for GitHub mode, saving ~1-2s of wall clock time.
     */
    protected getEarlyLockfileConfig(
        _customConfig: CustomConfig
    ): { devDependencies: Record<string, string>; dependencies?: Record<string, string>; packageManager: string } | undefined {
        return undefined;
    }

    private shouldGenerateFullProject(ir: FernIr.IntermediateRepresentation): boolean {
        const publishConfig = ir.publishConfig;
        if (publishConfig == null) {
            return false;
        }
        switch (publishConfig.type) {
            case "filesystem":
                return publishConfig.generateFullProject;
            case "github":
            case "direct":
                return false;
            default:
                assertNever(publishConfig);
        }
    }
}

function npmPackageInfoFromPublishConfig(
    config: FernGeneratorExec.GeneratorConfig,
    publishConfig: FernIr.PublishingConfig | undefined,
    isPackagePrivate: boolean
): constructNpmPackageArgs {
    let args: Partial<constructNpmPackageArgs> = {};

    if (publishConfig != null) {
        switch (publishConfig.type) {
            case "github":
                if (publishConfig.target?.type === "npm") {
                    const repoUrl =
                        publishConfig.repo != null && publishConfig.owner != null
                            ? `https://github.com/${publishConfig.owner}/${publishConfig.repo}`
                            : publishConfig.uri;
                    args = {
                        packageName: publishConfig.target.packageName,
                        version: publishConfig.target.version,
                        repoUrl,
                        publishInfo: undefined,
                        licenseConfig: config.license
                    };
                }
                break;
            case "direct":
                if (publishConfig.target?.type === "npm") {
                    args = {
                        packageName: publishConfig.target.packageName,
                        version: publishConfig.target.version,
                        repoUrl: undefined,
                        publishInfo: undefined,
                        licenseConfig: config.license
                    };
                }
                break;
            case "filesystem":
                if (publishConfig.publishTarget?.type === "npm") {
                    args = {
                        packageName: publishConfig.publishTarget.packageName,
                        version: publishConfig.publishTarget.version,
                        repoUrl: undefined,
                        publishInfo: undefined,
                        licenseConfig: config.license
                    };
                }
                break;
        }
    }

    return {
        ...args,
        isPackagePrivate
    };
}

function depsMatch(actual: Record<string, string>, expected: Record<string, string>): boolean {
    const actualKeys = Object.keys(actual).sort();
    const expectedKeys = Object.keys(expected).sort();
    if (actualKeys.length !== expectedKeys.length) {
        return false;
    }
    for (let i = 0; i < actualKeys.length; i++) {
        if (actualKeys[i] !== expectedKeys[i] || actual[actualKeys[i]!] !== expected[expectedKeys[i]!]) {
            return false;
        }
    }
    return true;
}

class GeneratorContextImpl implements GeneratorContext {
    private isSuccess = true;

    constructor(
        public readonly logger: Logger,
        public readonly version: string | undefined
    ) {}

    public fail(): void {
        this.isSuccess = false;
    }

    public didSucceed(): boolean {
        return this.isSuccess;
    }
}
