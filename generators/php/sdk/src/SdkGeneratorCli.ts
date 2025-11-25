import { File, GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractPhpGeneratorCli } from "@fern-api/php-base";
import { DynamicSnippetsGenerator } from "@fern-api/php-dynamic-snippets";
import { generateModels, generateTraits } from "@fern-api/php-model";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { Endpoint } from "@fern-fern/generator-exec-sdk/api";
import { HttpService, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { WrappedEndpointRequestGenerator } from "./endpoint/request/WrappedEndpointRequestGenerator";
import { EnvironmentGenerator } from "./environment/EnvironmentGenerator";
import { BaseApiExceptionGenerator } from "./error/BaseApiExceptionGenerator";
import { BaseExceptionGenerator } from "./error/BaseExceptionGenerator";
import { OauthTokenProviderGenerator } from "./oauth/OauthTokenProviderGenerator";
import { buildReference } from "./reference/buildReference";
import { RootClientGenerator } from "./root-client/RootClientGenerator";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { SubPackageClientGenerator } from "./subpackage-client/SubPackageClientGenerator";
import { convertDynamicEndpointSnippetRequest } from "./utils/convertEndpointSnippetRequest";
import { convertIr } from "./utils/convertIr";

export class SdkGeneratorCLI extends AbstractPhpGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
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
        generateModels(context);
        generateTraits(context);
        this.generateRootClient(context);
        this.generateSubpackages(context);
        this.generateEnvironment(context);
        this.generateErrors(context);
        this.generateOauthTokenProvider(context);

        if (context.config.output.snippetFilepath != null) {
            const snippets = await this.generateSnippets({ context });

            try {
                await this.generateReadme({
                    context,
                    endpointSnippets: snippets
                });
            } catch (e) {
                context.logger.warn(
                    `Failed to generate README.md: ${e instanceof Error ? e.message : "Unknown error"}. This is non-critical and generation will continue.`
                );
            }

            try {
                await context.snippetGenerator.populateSnippetsCache();
                await this.generateReference({ context });
            } catch (e) {
                context.logger.warn(
                    `Failed to generate reference.md: ${e instanceof Error ? e.message : "Unknown error"}. This is non-critical and generation will continue.`
                );
            }
        }

        await context.project.persist();
    }

    private generateRootClient(context: SdkGeneratorContext) {
        const rootClient = new RootClientGenerator(context);
        context.project.addSourceFiles(rootClient.generate());

        const rootServiceId = context.ir.rootPackage.service;
        if (rootServiceId != null) {
            const service = context.getHttpServiceOrThrow(rootServiceId);
            this.generateRequests(context, service, rootServiceId);
        }
    }

    private generateSubpackages(context: SdkGeneratorContext) {
        for (const subpackage of Object.values(context.ir.subpackages)) {
            if (!context.shouldGenerateSubpackageClient(subpackage)) {
                continue;
            }

            const service = subpackage.service != null ? context.getHttpServiceOrThrow(subpackage.service) : undefined;
            const subClient = new SubPackageClientGenerator({
                context,
                subpackage,
                serviceId: subpackage.service,
                service
            });
            context.project.addSourceFiles(subClient.generate());

            if (subpackage.service != null && service != null) {
                this.generateRequests(context, service, subpackage.service);
            }
        }
    }

    private generateRequests(context: SdkGeneratorContext, service: HttpService, serviceId: string) {
        for (const endpoint of service.endpoints) {
            if (endpoint.sdkRequest != null && endpoint.sdkRequest.shape.type === "wrapper") {
                if (context.shouldSkipWrappedRequest({ endpoint, wrapper: endpoint.sdkRequest.shape })) {
                    continue;
                }
                const generator = new WrappedEndpointRequestGenerator({
                    wrapper: endpoint.sdkRequest.shape,
                    context,
                    endpoint,
                    serviceId
                });
                const wrappedEndpointRequest = generator.generate();
                context.project.addSourceFiles(wrappedEndpointRequest);
            }
        }
    }

    private generateEnvironment(context: SdkGeneratorContext) {
        const environmentGenerator = new EnvironmentGenerator(context);
        environmentGenerator.generate();
    }

    private generateErrors(context: SdkGeneratorContext) {
        const baseException = new BaseExceptionGenerator(context);
        context.project.addSourceFiles(baseException.generate());

        const baseApiException = new BaseApiExceptionGenerator(context);
        context.project.addSourceFiles(baseApiException.generate());
    }

    private generateOauthTokenProvider(context: SdkGeneratorContext) {
        const oauth = context.getOauth();
        if (oauth != null) {
            const oauthTokenProvider = new OauthTokenProviderGenerator({
                context,
                scheme: oauth
            });
            context.project.addSourceFiles(oauthTokenProvider.generate());
        }
    }

    private async generateReadme({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: FernGeneratorExec.Endpoint[];
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

    private async generateReference({ context }: { context: SdkGeneratorContext }): Promise<void> {
        const builder = buildReference({ context });
        const content = await context.generatorAgent.generateReference(builder);
        context.project.addRawFiles(
            new File(context.generatorAgent.REFERENCE_FILENAME, RelativeFilePath.of("."), content)
        );
    }

    private async generateSnippets({ context }: { context: SdkGeneratorContext }): Promise<Endpoint[]> {
        const endpointSnippets: Endpoint[] = [];
        const dynamicIr = context.ir.dynamic;

        if (!dynamicIr) {
            throw new Error("Cannot generate dynamic snippets without dynamic IR");
        }

        const dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: convertIr(dynamicIr),
            config: context.config
        });

        for (const [endpointId, endpoint] of Object.entries(dynamicIr.endpoints)) {
            const method = endpoint.location.method;
            const path = FernGeneratorExec.EndpointPath(endpoint.location.path);

            for (const endpointExample of endpoint.examples ?? []) {
                const generatedSnippet = await dynamicSnippetsGenerator.generate(
                    convertDynamicEndpointSnippetRequest(endpointExample)
                );

                // TODO: We are shimming the PHP snippet into Java Generator Exec snippet as a short term hack
                const syncClient = generatedSnippet.snippet + "\n";
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
}
