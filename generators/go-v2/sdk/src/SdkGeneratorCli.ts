import { File, GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { defaultBaseGoCustomConfigSchema } from "@fern-api/go-ast";
import { AbstractGoGeneratorCli } from "@fern-api/go-base";
import { DynamicSnippetsGenerator } from "@fern-api/go-dynamic-snippets";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { Endpoint } from "@fern-fern/generator-exec-sdk/api";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { ClientGenerator } from "./client/ClientGenerator";
import { InternalFilesGenerator } from "./internal/InternalFilesGenerator";
import { RawClientGenerator } from "./raw-client/RawClientGenerator";
import { buildReference } from "./reference/buildReference";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "./utils/convertEndpointSnippetRequest";
import { convertIr } from "./utils/convertIr";
import { WireTestGenerator } from "./wire-tests/WireTestGenerator";

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
                ...defaultBaseGoCustomConfigSchema,
                ...parsed
            };
        }
        return defaultBaseGoCustomConfigSchema;
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
        this.generateClients(context);
        this.generateRawClients(context);
        this.generateInternalFiles(context);

        await context.snippetGenerator.populateSnippetsCache();

        await this.generateWireTestFiles(context);

        if (this.shouldGenerateReadme(context)) {
            try {
                const endpointSnippets = this.generateSnippets({ context });
                await this.generateReadme({
                    context,
                    endpointSnippets
                });
            } catch (e) {
                context.logger.error("Failed to generate README.md");
                if (e instanceof Error) {
                    context.logger.debug(e.message);
                    context.logger.debug(e.stack ?? "");
                }
            }
        }

        try {
            await this.generateReference({ context });
        } catch (error) {
            context.logger.warn("Failed to generate reference.md, this is OK.");
            if (error instanceof Error) {
                context.logger.warn((error as Error)?.message);
                context.logger.warn((error as Error)?.stack ?? "");
            }
        }

        await context.project.persist({ tidy: true });
    }

    private async generateWireTestFiles(context: SdkGeneratorContext) {
        if (!context.customConfig.enableWireTests) {
            return;
        }
        try {
            const wireTestGenerator = new WireTestGenerator(context);
            await wireTestGenerator.generate();
        } catch (e) {
            context.logger.error("Failed to generate Wiremock tests");
            if (e instanceof Error) {
                context.logger.debug(e.message);
                context.logger.debug(e.stack ?? "");
            }
        }
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

    private generateClients(context: SdkGeneratorContext) {
        this.generateRootClient(context);
        for (const subpackage of Object.values(context.ir.subpackages)) {
            if (!context.shouldGenerateSubpackageClient(subpackage)) {
                continue;
            }
            const client = new ClientGenerator({
                context,
                fernFilepath: subpackage.fernFilepath,
                subpackage,
                nestedSubpackages: subpackage.subpackages,
                serviceId: subpackage.service,
                service: subpackage.service != null ? context.getHttpServiceOrThrow(subpackage.service) : undefined
            });
            context.project.addGoFiles(client.generate());
        }
    }

    private generateRootClient(context: SdkGeneratorContext) {
        const client = new ClientGenerator({
            context,
            isRootClient: true,
            fernFilepath: context.ir.rootPackage.fernFilepath,
            subpackage: undefined,
            nestedSubpackages: context.ir.rootPackage.subpackages,
            serviceId: context.ir.rootPackage.service,
            service:
                context.ir.rootPackage.service != null
                    ? context.getHttpServiceOrThrow(context.ir.rootPackage.service)
                    : undefined
        });
        context.project.addGoFiles(client.generate());
    }

    private generateInternalFiles(context: SdkGeneratorContext) {
        const internalFiles = new InternalFilesGenerator({
            context
        });
        for (const file of internalFiles.generate()) {
            context.project.addGoFiles(file);
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

    private async generateReference({ context }: { context: SdkGeneratorContext }): Promise<void> {
        const builder = buildReference({ context });
        const content = await context.generatorAgent.generateReference(builder);

        context.project.addRawFiles(
            new File(context.generatorAgent.REFERENCE_FILENAME, RelativeFilePath.of("."), content)
        );
    }

    private async generateGitHub({ context }: { context: SdkGeneratorContext }): Promise<void> {
        await context.generatorAgent.pushToGitHub({ context });
    }
}
