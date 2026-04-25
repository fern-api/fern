import { Style } from "@fern-api/browser-compatible-base-generator";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { dynamic } from "@fern-api/ir-sdk";
import { Config, DynamicSnippetsGenerator } from "@fern-api/java-dynamic-snippets";
import { loggingExeca } from "@fern-api/logging-execa";
import { CliError, TaskContext } from "@fern-api/task-context";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { cp, mkdir, writeFile } from "fs/promises";
import path from "path";

import { DynamicSnippetsTestRequest } from "../DynamicSnippetsTestSuite.js";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest.js";
import { convertIr } from "../utils/convertIr.js";

export class DynamicSnippetsJavaTestGenerator {
    private dynamicSnippetsGenerator: DynamicSnippetsGenerator;

    constructor(
        private readonly context: TaskContext,
        private readonly ir: dynamic.DynamicIntermediateRepresentation,
        private readonly generatorConfig: FernGeneratorExec.GeneratorConfig
    ) {
        // Note: the local-workspace-runner uses convertIr which always returns a DynamicIntermediateRepresentation
        //       that is actually of the latest version in the workspace.
        //       (regardless of version that the dynamic IR is being asked for in the language-specific generator)
        //       This appears to have been always an additive change, so this hasn't broken anything
        //       In v61 we're adding support for more types for the response, which is a mutation of the interface.
        //       This really shouldn't break the language-specific dynamic code generator, because there was never
        //       a need to check the `type` of the response.
        //       In order to not force a version bump of the language-specific dynamic code generator,
        //       we're casting the IR to `as unknown as any` until the individual generators have updated
        //
        //       This doesn't really fix the underlying problem, where the local-workspace-runner is providing
        //       the latest IR to the language-specific dynamic code generator regardless.
        this.dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            // biome-ignore lint/suspicious/noExplicitAny: workaround for version incompatibility - see note above
            ir: convertIr(this.ir) as unknown as any,
            config: this.generatorConfig
        });
    }

    public async generateTests({
        outputDir,
        requests
    }: {
        outputDir: AbsoluteFilePath;
        requests: DynamicSnippetsTestRequest[];
    }): Promise<void> {
        this.context.logger.debug("Generating dynamic snippet tests...");
        const absolutePathToOutputDir = await this.initializeProject(outputDir);
        for (const [idx, { endpointId, request }] of requests.entries()) {
            try {
                const convertedRequest = convertDynamicEndpointSnippetRequest(request);
                if (convertedRequest == null) {
                    continue;
                }
                const response = await this.dynamicSnippetsGenerator.generate(convertedRequest, {
                    config: {
                        fullStyleClassName: `Example${idx}`,
                        fullStylePackageName: "com.snippets"
                    } as Config,
                    style: Style.Full,
                    endpointId
                });
                const dynamicSnippetFilePath = this.getTestFilePath({ absolutePathToOutputDir, idx });
                await mkdir(path.dirname(dynamicSnippetFilePath), { recursive: true });
                await writeFile(dynamicSnippetFilePath, response.snippet);
            } catch (error) {
                this.context.logger.error(
                    `Failed to generate dynamic snippet for endpoint ${JSON.stringify(request.endpoint)}: ${error}`
                );
            }
        }
        await DynamicSnippetsJavaTestGenerator.runSpotlessApply({
            context: this.context,
            outputDir,
            generatorConfig: this.generatorConfig
        });
        this.context.logger.debug("Done generating dynamic snippet tests");
    }

    /**
     * EXP-042: Generate snippet test files in memory without writing to disk.
     * Returns file data for later writing (after copyGeneratedFiles completes).
     */
    public async generateSnippetsInMemory({
        outputDir,
        requests
    }: {
        outputDir: AbsoluteFilePath;
        requests: DynamicSnippetsTestRequest[];
    }): Promise<Array<{ absolutePath: string; content: string }>> {
        this.context.logger.debug("Pre-generating dynamic snippet tests in memory...");
        const absolutePathToOutputDir = join(outputDir, RelativeFilePath.of("src/main/java/com/snippets"));
        const files: Array<{ absolutePath: string; content: string }> = [];
        for (const [idx, { endpointId, request }] of requests.entries()) {
            try {
                const convertedRequest = convertDynamicEndpointSnippetRequest(request);
                if (convertedRequest == null) {
                    continue;
                }
                const response = await this.dynamicSnippetsGenerator.generate(convertedRequest, {
                    config: {
                        fullStyleClassName: `Example${idx}`,
                        fullStylePackageName: "com.snippets"
                    } as Config,
                    style: Style.Full,
                    endpointId
                });
                files.push({
                    absolutePath: join(absolutePathToOutputDir, RelativeFilePath.of(`Example${idx}.java`)),
                    content: response.snippet
                });
            } catch (error) {
                this.context.logger.error(
                    `Failed to generate dynamic snippet for endpoint ${JSON.stringify(request.endpoint)}: ${error}`
                );
            }
        }
        this.context.logger.debug(`Pre-generated ${files.length} dynamic snippet tests`);
        return files;
    }

    /**
     * Runs spotlessApply on the output directory to format generated snippet test files.
     * Can be called after pre-generated files are written to disk.
     */
    public static async runSpotlessApply({
        context,
        outputDir,
        generatorConfig
    }: {
        context: TaskContext;
        outputDir: AbsoluteFilePath;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
    }): Promise<void> {
        const gradlewPath = join(outputDir, RelativeFilePath.of("gradlew"));
        const gradlewExists = await doesPathExist(gradlewPath, "file");
        if (gradlewExists) {
            try {
                context.logger.debug("Running spotlessApply on snippet test files...");
                const customConfig = generatorConfig.customConfig as Record<string, unknown> | undefined;
                const enableProfiling = customConfig?.["enable-gradle-profiling"] === true;
                const gradleArgs = [":spotlessApply"];
                if (enableProfiling) {
                    gradleArgs.push("--profile");
                    context.logger.info("Running spotlessApply with profiling enabled");
                }
                await loggingExeca(context.logger, "./gradlew", gradleArgs, {
                    doNotPipeOutput: false,
                    cwd: outputDir
                });
                context.logger.debug("Successfully ran spotlessApply");
                if (enableProfiling) {
                    const buildReportsPath = join(outputDir, RelativeFilePath.of("build/reports"));
                    const reportsPath = join(outputDir, RelativeFilePath.of("reports"));
                    const buildReportsExists = await doesPathExist(buildReportsPath, "directory");
                    if (buildReportsExists) {
                        await cp(buildReportsPath, reportsPath, { recursive: true });
                        context.logger.info("Gradle profiling report copied to reports/");
                    }
                }
            } catch (error) {
                context.failAndThrow("Failed to run spotlessApply", error, { code: CliError.Code.InternalError });
            }
        }
    }

    private async initializeProject(outputDir: AbsoluteFilePath): Promise<AbsoluteFilePath> {
        const absolutePathToOutputDir = join(outputDir, RelativeFilePath.of("src/main/java/com/snippets"));
        await mkdir(absolutePathToOutputDir, { recursive: true });
        return absolutePathToOutputDir;
    }

    private getTestFilePath({
        absolutePathToOutputDir,
        idx
    }: {
        absolutePathToOutputDir: AbsoluteFilePath;
        idx: number;
    }): AbsoluteFilePath {
        return join(absolutePathToOutputDir, RelativeFilePath.of(`Example${idx}.java`));
    }
}
