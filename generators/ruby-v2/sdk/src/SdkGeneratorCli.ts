import { File, GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { AbstractRubyGeneratorCli } from "@fern-api/ruby-base";
import { DynamicSnippetsGenerator } from "@fern-api/ruby-dynamic-snippets";
import { generateModels } from "@fern-api/ruby-model";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { Endpoint } from "@fern-fern/generator-exec-sdk/api";
import { HttpService, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { MultiUrlEnvironmentGenerator } from "./environment/MultiUrlEnvironmentGenerator";
import { SingleUrlEnvironmentGenerator } from "./environment/SingleUrlEnvironmentGenerator";
import { InferredAuthProviderGenerator } from "./inferred-auth/InferredAuthProviderGenerator";
import { buildReference } from "./reference/buildReference";
import { RootClientGenerator } from "./root-client/RootClientGenerator";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { SubPackageClientGenerator } from "./subpackage-client/SubPackageClientGenerator";
import { convertDynamicEndpointSnippetRequest } from "./utils/convertEndpointSnippetRequest";
import { convertIr } from "./utils/convertIr";
import { WrappedRequestGenerator } from "./wrapped-request/WrappedRequestGenerator";

export class SdkGeneratorCLI extends AbstractRubyGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
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
        const models = generateModels({ context });
        for (const file of models) {
            context.project.addRawFiles(file);
        }

        Object.entries(context.ir.subpackages).forEach(([subpackageId, subpackage]) => {
            const service = subpackage.service != null ? context.getHttpServiceOrThrow(subpackage.service) : undefined;
            // skip subpackages that have no endpoints (recursively)
            if (!context.subPackageHasEndpoints(subpackage)) {
                return;
            }

            const rootClient = new RootClientGenerator(context);
            context.project.addRawFiles(rootClient.generate());

            const subClient = new SubPackageClientGenerator({
                subpackageId,
                context,
                subpackage
            });
            context.project.addRawFiles(subClient.generate());

            if (subpackage.service != null && service != null) {
                this.generateRequests(context, service, subpackage.service);
            }
        });

        context.ir.environments?.environments._visit({
            singleBaseUrl: (value) => {
                context.logger.info("Visiting singleBaseUrl environment case.");
                const environments = new SingleUrlEnvironmentGenerator({
                    context,
                    singleUrlEnvironments: value
                });
                context.project.addRawFiles(environments.generate());
            },
            multipleBaseUrls: (value) => {
                context.logger.info("Visiting multipleBaseUrls environment case.");
                const environments = new MultiUrlEnvironmentGenerator({
                    context,
                    multiUrlEnvironments: value
                });
                context.project.addRawFiles(environments.generate());
            },
            _other: () => undefined
        });

        this.generateInferredAuthProvider(context);

        await context.snippetGenerator.populateSnippetsCache();

        if (this.shouldGenerateReadme(context)) {
            try {
                const endpointSnippets = this.generateSnippets({ context });

                await this.generateReadme({
                    context,
                    endpointSnippets
                });
                context.logger.debug("Generated readme!");
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

        await context.project.persist();

        try {
            await loggingExeca(context.logger, "rubocop", ["-A"], {
                cwd: context.project.absolutePathToOutputDirectory,
                doNotPipeOutput: true
            });
        } catch (_) {
            // It's okay if rubocop fails to run.
        }

        await loggingExeca(context.logger, "bundle", ["install"], {
            cwd: context.project.absolutePathToOutputDirectory,
            doNotPipeOutput: true
        });
    }

    private generateRequests(context: SdkGeneratorContext, service: HttpService, serviceId: string) {
        service.endpoints.forEach((endpoint) => {
            if (endpoint.sdkRequest != null && endpoint.sdkRequest.shape.type === "wrapper") {
                const wrappedRequestGenerator = new WrappedRequestGenerator({
                    wrapper: endpoint.sdkRequest.shape,
                    context,
                    endpoint,
                    serviceId
                });
                const wrappedRequest = wrappedRequestGenerator.generate();
                context.project.addRawFiles(wrappedRequest);
            }
        });
    }

    private generateInferredAuthProvider(context: SdkGeneratorContext): void {
        const inferredAuth = context.getInferredAuth();
        if (inferredAuth != null) {
            const inferredAuthProvider = new InferredAuthProviderGenerator({
                context,
                scheme: inferredAuth
            });
            context.project.addSourceFiles(inferredAuthProvider.generate());
        }
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

        context.logger.debug("Has snippets length: ", endpointSnippets.length.toString());
        const content = await context.generatorAgent.generateReadme({ context, endpointSnippets });
        context.project.addRawFiles(
            new File(context.generatorAgent.README_FILENAME, RelativeFilePath.of("."), content)
        );
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
                    snippet: FernGeneratorExec.EndpointSnippet.ruby({
                        client: dynamicSnippetsGenerator.generateSync(
                            convertDynamicEndpointSnippetRequest(endpointExample)
                        ).snippet
                    })
                });
            }
        }

        return endpointSnippets;
    }

    private async generateReference({ context }: { context: SdkGeneratorContext }): Promise<void> {
        const builder = buildReference({ context });
        const content = await context.generatorAgent.generateReference(builder);

        context.project.addRawFiles(
            new File(context.generatorAgent.REFERENCE_FILENAME, RelativeFilePath.of("."), content)
        );
    }
}
