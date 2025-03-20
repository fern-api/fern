import { File, GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractJavaGeneratorCli } from "@fern-api/java-base";
import { DynamicSnippetsGenerator } from "@fern-api/java-dynamic-snippets";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { Endpoint } from "@fern-fern/generator-exec-sdk/api";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "./utils/convertEndpointSnippetRequest";
import { convertIr } from "./utils/convertIr";

export class SdkGeneratorCLI extends AbstractJavaGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
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

    protected async publishPackage(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async generate(context: SdkGeneratorContext): Promise<void> {
        if (context.config.output.snippetFilepath != null) {
            try {
                const endpointSnippets = await this.generateSnippets({ context });
                await this.generateReadme({
                    context,
                    endpointSnippets
                });
            } catch (e) {
                context.logger.warn("Failed to generate README.md, this is OK.");
            }
        }

        await context.project.persist();
    }

    private async generateSnippets({ context }: { context: SdkGeneratorContext }): Promise<Endpoint[]> {
        const endpointSnippets: Endpoint[] = [];
        const dynamicIr = context.ir.dynamic;

        if (!dynamicIr) {
            throw new Error("Cannot generate dynamic snippets without dynamic IR");
        }

        const dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            // NOTE: This will eventually become a shared library. See the generators/go-v2/sdk/src/SdkGeneratorCli.ts
            ir: convertIr(dynamicIr),
            config: context.config
        });

        for (const [endpointId, endpoint] of Object.entries(dynamicIr.endpoints)) {
            const method = endpoint.location.method;
            const path = FernGeneratorExec.EndpointPath(endpoint.location.path);

            for (const endpointExample of endpoint.examples ?? []) {
                const syncClient =
                    (await dynamicSnippetsGenerator.generate(convertDynamicEndpointSnippetRequest(endpointExample)))
                        .snippet + "\n";

                const asyncClient =
                    (await dynamicSnippetsGenerator.generate(convertDynamicEndpointSnippetRequest(endpointExample)))
                        .snippet + "\n";

                endpointSnippets.push({
                    exampleIdentifier: endpointExample.id,
                    id: {
                        method,
                        path,
                        identifierOverride: endpointId
                    },
                    snippet: FernGeneratorExec.EndpointSnippet.java({
                        syncClient,
                        asyncClient
                    })
                });
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
}
