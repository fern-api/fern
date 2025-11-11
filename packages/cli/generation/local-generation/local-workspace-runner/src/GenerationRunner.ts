import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import {
    generatorsYml,
    RESOLVED_SNIPPET_TEMPLATES_MD,
    SNIPPET_JSON_FILENAME,
    SNIPPET_TEMPLATES_JSON_FILENAME
} from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { HttpEndpoint, IntermediateRepresentation } from "@fern-api/ir-sdk";
import { Fern, Template } from "@fern-api/sdk";
import { TaskContext } from "@fern-api/task-context";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import chalk from "chalk";
import { readFile, writeFile } from "fs/promises";
import * as prettier from "prettier2";
import { generateDynamicSnippetTests } from "./dynamic-snippets/generateDynamicSnippetTests";
import { ExecutionEnvironment } from "./ExecutionEnvironment";
import { writeFilesToDiskAndRunGenerator } from "./runGenerator";
import { getWorkspaceTempDir } from "./runLocalGenerationForWorkspace";

export declare namespace GenerationRunner {
    interface RunArgs {
        organization: string;
        workspace: FernWorkspace;
        absolutePathToFernConfig: AbsoluteFilePath | undefined;
        generatorGroup: generatorsYml.GeneratorGroup;
        context: TaskContext;
        irVersionOverride: string;
        outputVersionOverride: string | undefined;
        shouldGenerateDynamicSnippetTests: boolean | undefined;
        skipUnstableDynamicSnippetTests?: boolean;
        inspect: boolean;
    }
}

/**
 * Runs code generation using different execution environments.
 */
export class GenerationRunner {
    constructor(private readonly executionEnvironment: ExecutionEnvironment) {}

    public async run({
        organization,
        absolutePathToFernConfig,
        workspace,
        generatorGroup,
        context,
        irVersionOverride,
        outputVersionOverride,
        shouldGenerateDynamicSnippetTests,
        skipUnstableDynamicSnippetTests,
        inspect
    }: GenerationRunner.RunArgs): Promise<void> {
        const results = await Promise.all(
            generatorGroup.generators.map(async (generatorInvocation) => {
                return context.runInteractiveTask(
                    { name: generatorInvocation.name },
                    async (interactiveTaskContext) => {
                        if (generatorInvocation.absolutePathToLocalOutput == null) {
                            interactiveTaskContext.failWithoutThrowing(
                                "Cannot generate because output location is not local-file-system"
                            );
                            return;
                        }

                        try {
                            const { ir, generatorConfig } = await this.executeGenerator({
                                generatorGroup,
                                generatorInvocation,
                                context: interactiveTaskContext,
                                workspace,
                                organization,
                                irVersionOverride,
                                outputVersionOverride,
                                absolutePathToFernConfig,
                                inspect
                            });
                            const absolutePathToLocalSnippetTemplateJSON = generatorInvocation.absolutePathToLocalOutput
                                ? AbsoluteFilePath.of(
                                      join(
                                          generatorInvocation.absolutePathToLocalOutput,
                                          RelativeFilePath.of(SNIPPET_TEMPLATES_JSON_FILENAME)
                                      )
                                  )
                                : undefined;
                            const absolutePathToResolvedSnippetTemplates = generatorInvocation.absolutePathToLocalOutput
                                ? AbsoluteFilePath.of(
                                      join(
                                          generatorInvocation.absolutePathToLocalOutput,
                                          RelativeFilePath.of(RESOLVED_SNIPPET_TEMPLATES_MD)
                                      )
                                  )
                                : undefined;

                            if (
                                absolutePathToLocalSnippetTemplateJSON != null &&
                                absolutePathToResolvedSnippetTemplates != null
                            ) {
                                await this.writeResolvedSnippetsJson({
                                    absolutePathToLocalSnippetTemplateJSON,
                                    absolutePathToResolvedSnippetTemplates,
                                    ir,
                                    generatorInvocation
                                });
                            }

                            interactiveTaskContext.logger.info(
                                chalk.green("Wrote files to " + generatorInvocation.absolutePathToLocalOutput)
                            );

                            if (shouldGenerateDynamicSnippetTests && generatorInvocation.language != null) {
                                interactiveTaskContext.logger.info(
                                    `Generating dynamic snippet tests for ${generatorInvocation.language}...`
                                );
                                await generateDynamicSnippetTests({
                                    context: interactiveTaskContext,
                                    ir,
                                    config: generatorConfig,
                                    language: generatorInvocation.language,
                                    outputDir: generatorInvocation.absolutePathToLocalOutput,
                                    skipUnstable: skipUnstableDynamicSnippetTests
                                });
                            } else {
                                interactiveTaskContext.logger.info(
                                    `Skipping dynamic snippet tests; shouldGenerateDynamicSnippetTests: ${shouldGenerateDynamicSnippetTests}, language: ${generatorInvocation.language}`
                                );
                            }
                        } catch (error) {
                            interactiveTaskContext.failWithoutThrowing(
                                `Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
                            );
                        }
                    }
                );
            })
        );
    }

    private async executeGenerator({
        generatorGroup,
        generatorInvocation,
        context,
        workspace,
        organization,
        irVersionOverride,
        outputVersionOverride,
        absolutePathToFernConfig,
        inspect
    }: {
        generatorGroup: generatorsYml.GeneratorGroup;
        generatorInvocation: generatorsYml.GeneratorInvocation;
        context: TaskContext;
        workspace: FernWorkspace;
        organization: string;
        irVersionOverride: string;
        outputVersionOverride: string | undefined;
        absolutePathToFernConfig: AbsoluteFilePath | undefined;
        inspect: boolean;
    }): Promise<{ ir: IntermediateRepresentation; generatorConfig: FernGeneratorExec.GeneratorConfig }> {
        context.logger.info(`Starting generation for ${generatorInvocation.name}`);

        if (generatorInvocation.absolutePathToLocalOutput == null) {
            throw new Error("Output path is required for generation");
        }

        // Generate IR once here
        const rawIr = generateIntermediateRepresentation({
            workspace,
            audiences: generatorGroup.audiences,
            generationLanguage: generatorInvocation.language,
            keywords: generatorInvocation.keywords,
            smartCasing: generatorInvocation.smartCasing,
            exampleGeneration: {
                includeOptionalRequestPropertyExamples: true,
                disabled: generatorInvocation.disableExamples
            },
            readme: generatorInvocation.readme,
            version: outputVersionOverride,
            packageName: generatorsYml.getPackageName({ generatorInvocation }),
            context,
            sourceResolver: new SourceResolverImpl(context, workspace),
            generationMetadata: {
                cliVersion: workspace.cliVersion,
                generatorName: generatorInvocation.name,
                generatorVersion: generatorInvocation.version,
                generatorConfig: generatorInvocation.config
            }
        });

        const workspaceTempDir = await getWorkspaceTempDir();

        // Pass the generated IR to writeFilesToDiskAndRunGenerator
        const { ir, generatorConfig } = await writeFilesToDiskAndRunGenerator({
            organization,
            absolutePathToFernConfig,
            workspace,
            generatorInvocation,
            absolutePathToLocalOutput: generatorInvocation.absolutePathToLocalOutput,
            absolutePathToLocalSnippetJSON: generatorInvocation.absolutePathToLocalOutput
                ? AbsoluteFilePath.of(
                      join(generatorInvocation.absolutePathToLocalOutput, RelativeFilePath.of(SNIPPET_JSON_FILENAME))
                  )
                : undefined,
            absolutePathToLocalSnippetTemplateJSON: undefined,
            audiences: generatorGroup.audiences,
            workspaceTempDir,
            version: outputVersionOverride,
            keepDocker: false,
            context,
            irVersionOverride,
            outputVersionOverride,
            writeUnitTests: true,
            generateOauthClients: true,
            generatePaginatedClients: true,
            includeOptionalRequestPropertyExamples: true,
            inspect,
            executionEnvironment: this.executionEnvironment,
            ir: rawIr,
            runner: undefined
        });

        return { ir, generatorConfig };
    }

    private async writeResolvedSnippetsJson({
        absolutePathToResolvedSnippetTemplates,
        absolutePathToLocalSnippetTemplateJSON,
        ir,
        generatorInvocation
    }: {
        absolutePathToResolvedSnippetTemplates: AbsoluteFilePath;
        absolutePathToLocalSnippetTemplateJSON: AbsoluteFilePath;
        ir: IntermediateRepresentation;
        generatorInvocation: generatorsYml.GeneratorInvocation;
    }): Promise<void> {
        const endpointSnippetTemplates: Record<string, Fern.SnippetRegistryEntry> = {};
        if (absolutePathToLocalSnippetTemplateJSON != null) {
            const contents = (await readFile(absolutePathToLocalSnippetTemplateJSON)).toString();
            if (contents.length <= 0) {
                return;
            }
            const parsed = JSON.parse(contents);
            if (Array.isArray(parsed)) {
                for (const template of parsed) {
                    const entry: Fern.SnippetRegistryEntry = template;
                    if (entry.endpointId.identifierOverride != null) {
                        endpointSnippetTemplates[entry.endpointId.identifierOverride] = entry;
                    }
                }
            }
        }

        const irEndpoints: Record<string, HttpEndpoint> = Object.fromEntries(
            Object.entries(ir.services)
                .flatMap(([_, service]) => service.endpoints)
                .map((endpoint) => [endpoint.id, endpoint])
        );

        const snippets: string[] = [];
        for (const [endpointId, snippetTemplate] of Object.entries(endpointSnippetTemplates)) {
            const template = Template.from(snippetTemplate);
            const irEndpoint = irEndpoints[endpointId];
            if (irEndpoint == null) {
                continue;
            }
            for (const example of [...irEndpoint.userSpecifiedExamples, ...irEndpoint.autogeneratedExamples]) {
                try {
                    const snippet = template.resolve({
                        headers: [
                            ...(example.example?.serviceHeaders ?? []),
                            ...(example.example?.endpointHeaders ?? [])
                        ].map((header) => {
                            return {
                                name: header.name.wireValue,
                                value: header.value.jsonExample
                            };
                        }),
                        pathParameters: [
                            ...(example.example?.rootPathParameters ?? []),
                            ...(example.example?.servicePathParameters ?? []),
                            ...(example.example?.endpointPathParameters ?? [])
                        ].map((parameter) => {
                            return {
                                name: parameter.name.originalName,
                                value: parameter.value.jsonExample
                            };
                        }),
                        queryParameters: [...(example.example?.queryParameters ?? [])].map((parameter) => {
                            return {
                                name: parameter.name.wireValue,
                                value: parameter.value.jsonExample
                            };
                        }),
                        requestBody: example.example?.request?.jsonExample
                    });
                    switch (snippet.type) {
                        case "typescript":
                            try {
                                snippets.push(prettier.format(snippet.client, { parser: "babel" }));
                            } catch {
                                snippets.push(snippet.client);
                            }
                            break;
                        case "python":
                            snippets.push(snippet.sync_client);
                            break;
                    }
                    // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
                } catch (err) {}
            }
        }
        let resolvedMd = "";
        for (const snippet of snippets) {
            resolvedMd += `\`\`\`${generatorInvocation.language}
${snippet}
\`\`\`
\n\n`;
        }
        if (resolvedMd.length > 0) {
            await writeFile(absolutePathToResolvedSnippetTemplates, resolvedMd);
        }
    }
}
