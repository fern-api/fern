import { File, GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { DefaultBaseGoCustomConfigSchema } from "@fern-api/go-ast";
import { AbstractGoGeneratorCli } from "@fern-api/go-base";
import { DynamicSnippetsGenerator } from "@fern-api/go-dynamic-snippets";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { Endpoint } from "@fern-fern/generator-exec-sdk/api";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { ModuleConfigWriter } from "./module/ModuleConfigWriter";
import { RawClientGenerator } from "./raw-client/RawClientGenerator";
import { convertDynamicEndpointSnippetRequest } from "./utils/convertEndpointSnippetRequest";
import { convertIr } from "./utils/convertIr";

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
            return {
                ...DefaultBaseGoCustomConfigSchema,
                ...parsed
            };
        }
        return DefaultBaseGoCustomConfigSchema;
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
        this.writeGoMod(context);
        this.generateRawClients(context);

        if (this.shouldGenerateReadme(context)) {
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

    private writeGoMod(context: SdkGeneratorContext) {
        const moduleConfig = context.getModuleConfig({ outputMode: context.config.output.mode });
        if (moduleConfig == null) {
            return;
        }
        // We write the go.mod file to disk upfront so that 'go fmt' can be run on the project.
        const moduleConfigWriter = new ModuleConfigWriter({ context, moduleConfig });
        context.project.writeRawFile(moduleConfigWriter.generate());
    }

    private generateRawClients(context: SdkGeneratorContext) {
        if (context.ir.rootPackage.service != null) {
            const rawClient = new RawClientGenerator({
                context,
                serviceId: context.ir.rootPackage.service,
                service: context.getHttpServiceOrThrow(context.ir.rootPackage.service),
                subpackage: undefined
            });
            context.project.addGoFiles(rawClient.generate());
        }
        for (const subpackage of Object.values(context.ir.subpackages)) {
            if (subpackage.service == null) {
                continue;
            }
            const rawClient = new RawClientGenerator({
                context,
                subpackage,
                serviceId: subpackage.service,
                service: context.getHttpServiceOrThrow(subpackage.service)
            });
            context.project.addGoFiles(rawClient.generate());
        }
    }

    private generateSnippets({ context }: { context: SdkGeneratorContext }): Endpoint[] {
        const endpointSnippets: Endpoint[] = [];

        const dynamicIr = context.ir.dynamic;
        if (dynamicIr == null) {
            throw new Error("Cannot generate dynamic snippets without dynamic IR");
        }

        const dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: convertIr(dynamicIr),
            config: context.config
        });

        for (const [endpointId, endpoint] of Object.entries(dynamicIr.endpoints)) {
            const path = FernGeneratorExec.EndpointPath(endpoint.location.path);
            for (const endpointExample of endpoint.examples ?? []) {
                endpointSnippets.push({
                    exampleIdentifier: endpointExample.id,
                    id: {
                        method: endpoint.location.method,
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
}
