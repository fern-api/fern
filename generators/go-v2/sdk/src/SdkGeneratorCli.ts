import urlJoin from "url-join";

import { File, GeneratorNotificationService } from "@fern-api/base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { AbstractGoGeneratorCli } from "@fern-api/go-base";
import { DynamicSnippetsGenerator } from "@fern-api/go-dynamic-snippets";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { Endpoint } from "@fern-fern/generator-exec-sdk/api";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "./utils/convertEndpointSnippetRequest";
import { convertIr } from "./utils/convertIr";
import { WireTestGenerator } from "./wiretest/WireTestGenerator";

export class SdkGeneratorCLI extends AbstractGoGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
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
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async generate(context: SdkGeneratorContext): Promise<void> {
        // TODO: Enable wire tests, when available.
        // this.generateWireTests(context);

        if (context.config.output.snippetFilepath != null) {
            try {
                const endpointSnippets = this.generateSnippets({ context });
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

    private generateSnippets({ context }: { context: SdkGeneratorContext }): Endpoint[] {
        const endpointSnippets: Endpoint[] = [];
        const dynamicIr = context.ir.dynamic;

        if (!dynamicIr) {
            throw new Error("Cannot generate dynamic snippets without dynamic IR");
        }

        const dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            // TEMPORARY HACK: As of 11-Mar-25, convertIr is not a shared library, but ideally
            // it should be. If you're reading this and considering copying convertIr and
            // related helpers into another generator, first confirm whether now is a good time
            // to invest in making this a shared library instead.
            ir: convertIr(dynamicIr),
            config: context.config
        });

        for (const [endpointId, endpoint] of Object.entries(dynamicIr.endpoints)) {
            const method = endpoint.location.method;
            const path = FernGeneratorExec.EndpointPath(endpoint.location.path);

            for (const endpointExample of endpoint.examples ?? []) {
                endpointSnippets.push({
                    exampleIdentifier: endpointExample.id,
                    id: {
                        method,
                        path,
                        identifierOverride: endpointId
                    },
                    snippet: FernGeneratorExec.EndpointSnippet.go({
                        client: dynamicSnippetsGenerator.generateSync(
                            convertDynamicEndpointSnippetRequest(endpointExample)
                        ).snippet
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

    private generateWireTests(context: SdkGeneratorContext) {
        const wireTestGenerator = new WireTestGenerator(context);
        for (const subpackage of Object.values(context.ir.subpackages)) {
            const serviceId = subpackage.service != null ? subpackage.service : undefined;
            if (serviceId == null) {
                continue;
            }
            const service = context.getHttpServiceOrThrow(serviceId);
            context.project.addGoFiles(wireTestGenerator.generate({ serviceId, endpoints: service.endpoints }));
        }
    }
}
