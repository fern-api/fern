import {
    FernGeneratorExec,
    GeneratorNotificationService,
    NopGeneratorNotificationService,
    parseGeneratorConfig
} from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER, createLogger, Logger, LogLevel } from "@fern-api/logger";
import { FernIr } from "@fern-fern/ir-sdk";
import { readFile } from "fs/promises";
import {
    constructNpmPackage,
    constructNpmPackageArgs,
    constructNpmPackageFromArgs,
    NpmPackage,
    PersistedTypescriptProject
} from "@fern-typescript/commons";
import { GeneratorContext } from "@fern-typescript/contexts";
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
            throw new Error("No argument for config filepath.");
        }
        await this.run(pathToConfig, options);
    }

    public async run(pathToConfig: string, options?: AbstractGeneratorCli.Options): Promise<void> {
        const config = await parseGeneratorConfig(pathToConfig);
        const generatorNotificationService = options?.disableNotifications
            ? new NopGeneratorNotificationService()
            : new GeneratorNotificationService(config.environment);

        try {
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

            const ir = await fastParseIR(config.irFilepath);

            let npmPackage: NpmPackage | undefined;
            if (ir.selfHosted) {
                // Try to construct package from publish config
                npmPackage = constructNpmPackageFromArgs(
                    npmPackageInfoFromPublishConfig(config, ir.publishConfig, this.isPackagePrivate(customConfig))
                );
                // Fall back to generator config if publish config doesn't have the necessary info
                if (npmPackage == null) {
                    npmPackage = constructNpmPackage({
                        generatorConfig: config,
                        isPackagePrivate: this.isPackagePrivate(customConfig)
                    });
                }
            } else {
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

            const version = config.output?.mode._visit({
                downloadFiles: () => undefined,
                github: (github) => github.version,
                publish: (publish) => publish.version,
                _other: () => undefined
            });

            const generatorContext = new GeneratorContextImpl(logger, version);
            const codeGenStartTime = Date.now();
            const typescriptProject = await this.generateTypescriptProject({
                config,
                customConfig,
                npmPackage,
                generatorContext,
                intermediateRepresentation: ir
            });
            logger.debug(`[TIMING] code generation took ${Date.now() - codeGenStartTime}ms`);
            if (!generatorContext.didSucceed()) {
                throw new Error("Failed to generate TypeScript project.");
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
                    // Run lockfile generation and check:fix in parallel — they
                    // operate on different files (pnpm-lock.yaml vs source files)
                    // so there's no conflict.
                    await Promise.all([
                        typescriptProject.generateLockfile(logger),
                        (async () => {
                            if (!(await typescriptProject.areCheckFixToolsAvailable(logger))) {
                                await typescriptProject.installCheckFixDependencies(logger);
                            }
                            await typescriptProject.checkFix(logger);
                        })()
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
                    throw new Error(`${type} mode is not implemented`);
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

// Property renames that Zurg serialization applies (raw JSON key → TypeScript key).
const PROPERTY_RENAMES: Record<string, string> = {
    "extra-properties": "extraProperties",
    "status-code": "statusCode",
    package_description: "packageDescription",
    publisher_email: "publisherEmail",
    reference_url: "referenceUrl",
    publisher_name: "publisherName",
    baseURL: "baseUrl"
};

// Discriminant values where the variant has only a "value" property but uses
// the spreading pattern (NOT wrapping). These are exceptions to the heuristic
// that "only type+value keys → wrapped". Found by exhaustive search of ir-sdk
// serialization schemas: ExampleTypeShape.enum, AuthValues.header, V2AuthValues.header.
const SPREAD_VALUE_ONLY_DISCRIMINANTS = new Set(["enum", "header"]);

/**
 * Fast IR parser that bypasses the Zurg serializer (~9.5s) with a direct
 * JSON.parse + tree walk (~0.5-1s). Zurg does four things beyond JSON.parse:
 * 1. Renames `_type` → `type` on 7 discriminated unions
 * 2. Adds `_visit` methods to all 69 discriminated union types
 * 3. Renames ~10 properties (kebab-case/snake_case → camelCase)
 * 4. Converts null → undefined for optional properties
 * We replicate all four in a single O(n) tree walk.
 */
async function fastParseIR(irFilepath: string): Promise<FernIr.IntermediateRepresentation> {
    const irString = await readFile(irFilepath, "utf-8");
    const raw = JSON.parse(irString);
    transformIRTree(raw);
    return raw as FernIr.IntermediateRepresentation;
}

function transformIRTree(node: unknown): void {
    if (node === null || typeof node !== "object") {
        return;
    }

    if (Array.isArray(node)) {
        for (let i = 0; i < node.length; i++) {
            transformIRTree(node[i]);
        }
        return;
    }

    const obj = node as Record<string, unknown>;

    // Convert null → undefined (Zurg's optional() does this)
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] === null) {
            obj[key] = undefined;
        }
    }

    // Handle _type → type rename (7 unions use "_type" as raw discriminant)
    if ("_type" in obj) {
        obj.type = obj._type;
        delete obj._type;
    }

    // Add _visit to any object with a string "type" field.
    // Detect wrapping: if the only data key is "value" AND the discriminant is
    // NOT in the known spread-value-only set, the visitor receives obj.value.
    if (typeof obj.type === "string") {
        const discriminant = obj.type as string;
        const dataKeys = Object.keys(obj).filter((k) => k !== "type");
        const isWrapped =
            dataKeys.length === 1 && dataKeys[0] === "value" && !SPREAD_VALUE_ONLY_DISCRIMINANTS.has(discriminant);
        obj._visit = function (visitor: Record<string, ((v: unknown) => unknown) | undefined>) {
            const handler = visitor[discriminant];
            if (handler) {
                return handler(isWrapped ? obj.value : obj);
            }
            return visitor._other!(obj);
        };
    }

    // Apply property renames
    for (const rawKey in PROPERTY_RENAMES) {
        if (rawKey in obj) {
            obj[PROPERTY_RENAMES[rawKey]!] = obj[rawKey];
            delete obj[rawKey];
        }
    }

    // Recurse into all values
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && key !== "_visit") {
            transformIRTree(obj[key]);
        }
    }
}
