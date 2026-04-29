import { File, GeneratorError, GeneratorNotificationService } from "@fern-api/base-generator";
import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { extractErrorMessage } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractPythonGeneratorCli } from "@fern-api/python-base";
import { DynamicSnippetsGenerator } from "@fern-api/python-dynamic-snippets";

import { Endpoint } from "@fern-fern/generator-exec-sdk/api";
import { FernIr } from "@fern-fern/ir-sdk";
import { buildReference } from "./reference/buildReference.js";
import { SdkCustomConfigSchema } from "./SdkCustomConfig.js";
import { SdkGeneratorContext } from "./SdkGeneratorContext.js";
import { WireTestGenerator } from "./wire-tests/WireTestGenerator.js";

export class SdkGeneratorCli extends AbstractPythonGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: FernIr.IntermediateRepresentation;
        customConfig: SdkCustomConfigSchema;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): SdkGeneratorContext {
        return new SdkGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): SdkCustomConfigSchema {
        const parsed = customConfig != null ? SdkCustomConfigSchema.parse(customConfig) : undefined;
        if (parsed != null) {
            return parsed;
        }
        return {};
    }

    protected publishPackage(context: SdkGeneratorContext): Promise<void> {
        return this.generate(context);
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        return await this.generate(context);
    }

    protected async generate(context: SdkGeneratorContext): Promise<void> {
        await this.generateWireTestFiles(context);

        // Generate snippets once, used by both README and reference
        let endpointSnippets: Endpoint[] = [];
        try {
            endpointSnippets = this.generateSnippets({ context });
        } catch (error) {
            context.logger.debug(`Failed to generate snippets: ${extractErrorMessage(error)}`);
        }

        // Generate README.md
        if (this.shouldGenerateReadme(context) && endpointSnippets.length > 0) {
            try {
                await this.generateReadme({ context, endpointSnippets });
            } catch (error) {
                throw GeneratorError.internalError(`Failed to generate README.md: ${extractErrorMessage(error)}`);
            }
        }

        // Generate reference.md
        try {
            await this.generateReference({ context, endpointSnippets });
        } catch (error) {
            throw GeneratorError.internalError(`Failed to generate reference.md: ${extractErrorMessage(error)}`);
        }

        await context.project.persist();
    }

    private async generateWireTestFiles(context: SdkGeneratorContext): Promise<void> {
        const wireTestsEnabled = context.customConfig.wire_tests?.enabled ?? context.customConfig.enable_wire_tests;
        if (!wireTestsEnabled) {
            return;
        }

        try {
            context.logger.debug("Generating WireMock integration tests...");
            const wireTestGenerator = new WireTestGenerator(context, context.ir);
            await wireTestGenerator.generate();
            context.logger.debug("WireMock test generation complete");
        } catch (error) {
            context.logger.error("Failed to generate WireMock tests");
            if (error instanceof Error) {
                context.logger.debug(error.message);
                context.logger.debug(error.stack ?? "");
            }
        }
    }

    private generateSnippets({ context }: { context: SdkGeneratorContext }): Endpoint[] {
        const endpointSnippets: Endpoint[] = [];

        const dynamicIr = context.ir.dynamic;
        if (dynamicIr == null) {
            throw GeneratorError.internalError("Cannot generate dynamic snippets without dynamic IR");
        }

        const dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: dynamicIr,
            config: {
                organization: context.config.organization,
                workspaceName: context.config.workspaceName,
                // Pass the raw customConfig (not the parsed SdkCustomConfigSchema) so that
                // fields consumed by the dynamic snippets generator (e.g. pydantic_config)
                // are preserved. SdkCustomConfigSchema.parse() strips unknown keys.
                customConfig: context.config.customConfig
            } as FernGeneratorExec.GeneratorConfig
        });

        for (const [endpointId, endpoint] of Object.entries(dynamicIr.endpoints)) {
            const path = FernGeneratorExec.EndpointPath(endpoint.location.path);
            for (const endpointExample of endpoint.examples ?? []) {
                try {
                    const response = dynamicSnippetsGenerator.generateSync(endpointExample);
                    endpointSnippets.push({
                        exampleIdentifier: endpointExample.id,
                        id: {
                            method: endpoint.location.method,
                            path,
                            identifierOverride: endpointId
                        },
                        snippet: FernGeneratorExec.EndpointSnippet.python({
                            syncClient: response.snippet,
                            asyncClient: ""
                        })
                    });
                } catch (error) {
                    context.logger.debug(
                        `Failed to generate snippet for endpoint ${endpointId}: ${extractErrorMessage(error)}`
                    );
                }
            }
        }

        return endpointSnippets;
    }

    private async generateReadme({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: Endpoint[];
    }): Promise<void> {
        if (endpointSnippets.length === 0) {
            context.logger.debug("No snippets were produced; skipping README.md generation.");
            return;
        }
        const content = await context.generatorAgent.generateReadme({ context, endpointSnippets });
        context.project.addRawFiles(
            new File(context.generatorAgent.README_FILENAME, RelativeFilePath.of("."), content)
        );
    }

    private shouldGenerateReadme(context: SdkGeneratorContext): boolean {
        const hasSnippetFilepath = context.config.output.snippetFilepath != null;
        const publishConfig = context.ir.publishConfig;
        switch (publishConfig?.type) {
            case "filesystem":
                return publishConfig.generateFullProject || hasSnippetFilepath;
            case "github":
            case "direct":
            default:
                return hasSnippetFilepath;
        }
    }

    private async generateReference({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: Endpoint[];
    }): Promise<void> {
        const builder = buildReference({ context, endpointSnippets });
        const content = await context.generatorAgent.generateReference(builder);

        context.project.addRawFiles(
            new File(context.generatorAgent.REFERENCE_FILENAME, RelativeFilePath.of("."), content)
        );
    }

    private async generateGitHub({ context }: { context: SdkGeneratorContext }): Promise<void> {
        await context.generatorAgent.pushToGitHub({ context });
    }
}
