import { File, GeneratorNotificationService } from "@fern-api/base-generator";
import { extractErrorMessage } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractJavaGeneratorCli } from "@fern-api/java-base";
import { DynamicSnippetsGenerator } from "@fern-api/java-dynamic-snippets";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { Endpoint } from "@fern-fern/generator-exec-sdk/api";
import * as FernGeneratorExecSerializers from "@fern-fern/generator-exec-sdk/serialization";
import { FernIr } from "@fern-fern/ir-sdk";
import { writeFile } from "fs/promises";
import { buildReference } from "./reference/buildReference.js";
import { SdkCustomConfigSchema } from "./SdkCustomConfig.js";
import { SdkGeneratorContext } from "./SdkGeneratorContext.js";
import { SdkWireTestGenerator } from "./sdk-wire-tests/SdkWireTestGenerator.js";
import { convertDynamicEndpointSnippetRequest } from "./utils/convertEndpointSnippetRequest.js";
import { convertIr } from "./utils/convertIr.js";

export class SdkGeneratorCLI extends AbstractJavaGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
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
            const dynamicIr = context.ir.dynamic;
            if (!dynamicIr) {
                throw new Error("Cannot generate dynamic snippets without dynamic IR");
            }

            // Single IR conversion and generator instance shared across all snippet consumers.
            // Previously, populateSnippetsCache() and generateSnippets() each created their own
            // DynamicSnippetsGenerator (duplicating convertIr() and constructor work).
            // Type cast needed: java-v2/sdk uses ir-sdk@65.4.0, dynamic-snippets uses dynamic-ir-sdk@61.7.0.
            // Runtime data shapes are compatible; only TS types diverge across SDK versions.
            // biome-ignore lint/suspicious/noExplicitAny: version boundary cast
            const convertedIr: any = convertIr(dynamicIr);
            const sharedSnippetsGenerator = new DynamicSnippetsGenerator({
                ir: convertedIr,
                config: context.config
            });

            // Pre-populate snippets cache with the shared generator (used by reference.md)
            await context.snippetGenerator.populateSnippetsCache(sharedSnippetsGenerator);

            const snippetFilepath = context.config.output.snippetFilepath;
            let endpointSnippets: Endpoint[] = [];
            try {
                endpointSnippets = await this.generateSnippets({
                    context,
                    dynamicIr,
                    dynamicSnippetsGenerator: sharedSnippetsGenerator
                });
            } catch (e) {
                context.logger.warn("Failed to generate snippets, this is OK.");
            }

            // Run README and reference generation in parallel
            context.logger.debug("Starting README.md and reference.md generation...");
            const [readmeResult, referenceResult] = await Promise.allSettled([
                this.generateReadme({ context, endpointSnippets }),
                this.generateReference({ context })
            ]);

            const docErrors: string[] = [];
            if (readmeResult.status === "rejected") {
                docErrors.push(`README.md: ${extractErrorMessage(readmeResult.reason)}`);
            }
            if (referenceResult.status === "rejected") {
                docErrors.push(`reference.md: ${extractErrorMessage(referenceResult.reason)}`);
            }
            if (docErrors.length > 0) {
                throw new Error(`Failed to generate documentation:\n${docErrors.join("\n")}`);
            }
            context.logger.debug("Successfully generated README.md and reference.md");

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

    private async generateSnippets({
        context,
        dynamicIr,
        dynamicSnippetsGenerator
    }: {
        context: SdkGeneratorContext;
        dynamicIr: FernIr.dynamic.DynamicIntermediateRepresentation;
        dynamicSnippetsGenerator: DynamicSnippetsGenerator;
    }): Promise<Endpoint[]> {
        const endpointSnippets: Endpoint[] = [];

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
        const dynamicEndpoints = context.ir.dynamic?.endpoints;
        if (!dynamicEndpoints || Object.keys(dynamicEndpoints).length === 0) {
            context.logger.debug("No endpoints found; skipping README.md generation.");
            return;
        }
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
