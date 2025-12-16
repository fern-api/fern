import { File, GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractJavaGeneratorCli } from "@fern-api/java-base";
import { DynamicSnippetsGenerator } from "@fern-api/java-dynamic-snippets";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { Endpoint } from "@fern-fern/generator-exec-sdk/api";
import * as FernGeneratorExecSerializers from "@fern-fern/generator-exec-sdk/serialization";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { writeFile } from "fs/promises";
import { buildReference } from "./reference/buildReference";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { SdkWireTestGenerator } from "./sdk-wire-tests/SdkWireTestGenerator";
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
        return SdkCustomConfigSchema.parse(customConfig ?? {});
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
            // Pre-populate snippets cache following C# approach
            await context.snippetGenerator.populateSnippetsCache();

            const snippetFilepath = context.config.output.snippetFilepath;
            let endpointSnippets: Endpoint[] = [];
            try {
                endpointSnippets = await this.generateSnippets({ context });
            } catch (e) {
                context.logger.warn("Failed to generate snippets, this is OK.");
            }

            try {
                await this.generateReadme({
                    context,
                    endpointSnippets
                });
            } catch (e) {
                context.logger.warn("Failed to generate README.md, this is OK.");
            }

            try {
                await this.generateReference({ context });
            } catch (e) {
                context.logger.warn("Failed to generate reference.md, this is OK.");
            }

            try {
                await this.generateSnippetsJson({
                    context,
                    endpointSnippets,
                    snippetFilepath
                });
            } catch (e) {
                context.logger.warn("Failed to generate snippets.json, this is OK");
            }
        }

        const wireTestGenerator = new SdkWireTestGenerator(context);
        await wireTestGenerator.generate();

        await context.project.persist();
    }

    private async generateSnippets({ context }: { context: SdkGeneratorContext }): Promise<Endpoint[]> {
        const endpointSnippets: Endpoint[] = [];
        const dynamicIr = context.ir.dynamic;

        if (!dynamicIr) {
            throw new Error("Cannot generate dynamic snippets without dynamic IR");
        }

        const convertedIr = convertIr(dynamicIr);
        const dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            // NOTE: This will eventually become a shared library. See the generators/go-v2/sdk/src/SdkGeneratorCli.ts
            ir: convertedIr,
            config: context.config
        });

        for (const [endpointId, endpoint] of Object.entries(dynamicIr.endpoints)) {
            const method = endpoint.location.method;
            const path = FernGeneratorExec.EndpointPath(endpoint.location.path);

            for (const endpointExample of endpoint.examples ?? []) {
                const generatedSnippet = await dynamicSnippetsGenerator.generate(
                    convertDynamicEndpointSnippetRequest(endpointExample)
                );

                const syncClient = generatedSnippet.snippet + "\n";
                // TODO: Properly generate async client; this is a placeholder for now.
                const asyncClient = generatedSnippet.snippet + "\n";

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
        const content = await context.generatorAgent.generateReadme({ context, endpointSnippets });
        context.project.addRawFiles(
            new File(context.generatorAgent.README_FILENAME, RelativeFilePath.of("."), content)
        );
    }

    private async generateReference({ context }: { context: SdkGeneratorContext }): Promise<void> {
        const builder = buildReference({ context });
        const content = await context.generatorAgent.generateReference(builder);
        context.project.addRawFiles(
            new File(context.generatorAgent.REFERENCE_FILENAME, RelativeFilePath.of("."), content)
        );
    }

    private async generateSnippetsJson({
        context,
        endpointSnippets,
        snippetFilepath
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: Endpoint[];
        snippetFilepath: string;
    }): Promise<void> {
        if (endpointSnippets.length === 0) {
            context.logger.debug("No snippets were produced; skipping snippets.json generation.");
            return;
        }

        const snippets: FernGeneratorExec.Snippets = {
            endpoints: endpointSnippets,
            // TODO: Add types
            types: {}
        };

        await writeFile(
            snippetFilepath,
            JSON.stringify(await FernGeneratorExecSerializers.Snippets.jsonOrThrow(snippets), undefined, 4)
        );
    }

    private async generateGitHub({ context }: { context: SdkGeneratorContext }): Promise<void> {
        await context.generatorAgent.pushToGitHub({ context });
    }
}
