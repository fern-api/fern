import { File, GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractCsharpGeneratorCli, TestFileGenerator } from "@fern-api/csharp-base";
import {
    generateModels,
    generateTests as generateModelTests,
    generateVersion,
    generateWellKnownProtobufFiles
} from "@fern-api/fern-csharp-model";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import * as FernGeneratorExecSerializers from "@fern-fern/generator-exec-sdk/serialization";
import { HttpService, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { writeFile } from "fs/promises";
import { SnippetJsonGenerator } from "./endpoint/snippets/SnippetJsonGenerator";
import { MultiUrlEnvironmentGenerator } from "./environment/MultiUrlEnvironmentGenerator";
import { SingleUrlEnvironmentGenerator } from "./environment/SingleUrlEnvironmentGenerator";
import { BaseApiExceptionGenerator } from "./error/BaseApiExceptionGenerator";
import { BaseExceptionGenerator } from "./error/BaseExceptionGenerator";
import { ErrorGenerator } from "./error/ErrorGenerator";
import { generateSdkTests } from "./generateSdkTests";
import { OauthTokenProviderGenerator } from "./oauth/OauthTokenProviderGenerator";
import { BaseOptionsGenerator } from "./options/BaseOptionsGenerator";
import { ClientOptionsGenerator } from "./options/ClientOptionsGenerator";
import { IdempotentRequestOptionsGenerator } from "./options/IdempotentRequestOptionsGenerator";
import { IdempotentRequestOptionsInterfaceGenerator } from "./options/IdempotentRequestOptionsInterfaceGenerator";
import { RequestOptionsGenerator } from "./options/RequestOptionsGenerator";
import { RequestOptionsInterfaceGenerator } from "./options/RequestOptionsInterfaceGenerator";
import { buildReference } from "./reference/buildReference";
import { RootClientGenerator } from "./root-client/RootClientGenerator";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { SubPackageClientGenerator } from "./subpackage-client/SubPackageClientGenerator";
import { WebSocketClientGenerator } from "./websocket/WebsocketClientGenerator";
import { WrappedRequestGenerator } from "./wrapped-request/WrappedRequestGenerator";

export class SdkGeneratorCLI extends AbstractCsharpGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
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
            return this.validateCustomConfig(parsed);
        }
        return {};
    }

    private validateCustomConfig(customConfig: SdkCustomConfigSchema): SdkCustomConfigSchema {
        const baseExceptionClassName = customConfig["base-exception-class-name"];
        const baseApiExceptionClassName = customConfig["base-api-exception-class-name"];

        if (
            baseExceptionClassName &&
            baseApiExceptionClassName &&
            baseExceptionClassName === baseApiExceptionClassName
        ) {
            throw new Error("The 'base-api-exception-class-name' and 'base-exception-class-name' cannot be the same.");
        }
        return customConfig;
    }

    protected async publishPackage(context: SdkGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
        if (context.isSelfHosted()) {
            await this.generateGitHub({ context });
        }
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
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
                context.project.addSourceFiles(wrappedRequest);
            }
        });
    }

    protected async generate(context: SdkGeneratorContext): Promise<void> {
        // generate names for everything up front.
        context.common.precalculate();

        // before generating anything, generate the models first so that we
        // can identify collisions or ambiguities in the generated code.
        const models = generateModels({ context });

        await context.snippetGenerator.populateSnippetsCache();

        for (const file of models) {
            context.project.addSourceFiles(file);
        }

        context.project.addSourceFiles(generateVersion({ context }));

        if (context.config.writeUnitTests) {
            const modelTests = generateModelTests({ context });
            for (const file of modelTests) {
                context.project.addTestFiles(file);
            }
            const sdkTests = generateSdkTests({ context });
            for (const file of sdkTests) {
                context.project.addTestFiles(file);
            }
        }

        const subpackages = context.getSubpackages(Object.keys(context.ir.subpackages));
        for (const subpackage of subpackages) {
            const service =
                subpackage.service != null ? context.common.getHttpServiceOrThrow(subpackage.service) : undefined;
            // skip subpackages that have no endpoints (recursively)
            if (context.subPackageHasEndpointsRecursively(subpackage)) {
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

            if (context.subPackageHasWebsocketEndpointsRecursively(subpackage)) {
                const websocketChannel = context.common.getWebsocketChannel(subpackage.websocket);
                if (websocketChannel) {
                    const websocketApi = new WebSocketClientGenerator({
                        context,
                        subpackage,
                        websocketChannel
                    });
                    context.project.addSourceFiles(websocketApi.generate());
                }
            }
        }

        const baseOptionsGenerator = new BaseOptionsGenerator(context);

        const clientOptions = new ClientOptionsGenerator(context, baseOptionsGenerator);
        context.project.addSourceFiles(clientOptions.generate());

        const requestOptionsInterace = new RequestOptionsInterfaceGenerator(context, baseOptionsGenerator);
        context.project.addSourceFiles(requestOptionsInterace.generate());

        const requestOptions = new RequestOptionsGenerator(context, baseOptionsGenerator);
        context.project.addSourceFiles(requestOptions.generate());

        if (context.common.hasIdempotencyHeaders()) {
            const idempotentRequestOptionsInterface = new IdempotentRequestOptionsInterfaceGenerator(
                context,
                baseOptionsGenerator
            );
            context.project.addSourceFiles(idempotentRequestOptionsInterface.generate());

            const idempotentRequestOptions = new IdempotentRequestOptionsGenerator(context, baseOptionsGenerator);
            context.project.addSourceFiles(idempotentRequestOptions.generate());
        }

        const baseException = new BaseExceptionGenerator(context);
        context.project.addSourceFiles(baseException.generate());

        const baseApiException = new BaseApiExceptionGenerator(context);
        context.project.addSourceFiles(baseApiException.generate());

        const oauth = context.getOauth();
        if (oauth != null) {
            const oauthTokenProvider = new OauthTokenProviderGenerator({
                context,
                scheme: oauth
            });
            context.project.addSourceFiles(oauthTokenProvider.generate());
        }

        if (context.settings.generateErrorTypes) {
            for (const _error of Object.values(context.ir.errors)) {
                const errorGenerator = new ErrorGenerator(context, _error);
                context.project.addSourceFiles(errorGenerator.generate());
            }
        }

        const rootClient = new RootClientGenerator(context);
        context.project.addSourceFiles(rootClient.generate());

        const rootServiceId = context.ir.rootPackage.service;
        if (rootServiceId != null) {
            const service = context.common.getHttpServiceOrThrow(rootServiceId);
            this.generateRequests(context, service, rootServiceId);
        }

        context.ir.environments?.environments._visit({
            singleBaseUrl: (value) => {
                const environments = new SingleUrlEnvironmentGenerator({
                    context,
                    singleUrlEnvironments: value
                });
                context.project.addSourceFiles(environments.generate());
            },
            multipleBaseUrls: (value) => {
                const environments = new MultiUrlEnvironmentGenerator({
                    context,
                    multiUrlEnvironments: value
                });
                context.project.addSourceFiles(environments.generate());
            },
            _other: () => undefined
        });

        const wellKnownProtobufFiles = generateWellKnownProtobufFiles(context);
        if (wellKnownProtobufFiles != null) {
            for (const file of wellKnownProtobufFiles) {
                context.project.addSourceFiles(file);
            }
        }

        const testGenerator = new TestFileGenerator(context);
        const test = testGenerator.generate();
        context.project.addTestFiles(test);

        if (context.config.output.snippetFilepath != null) {
            const snippets = await new SnippetJsonGenerator({ context }).generate();
            await writeFile(
                context.config.output.snippetFilepath,
                JSON.stringify(await FernGeneratorExecSerializers.Snippets.jsonOrThrow(snippets), undefined, 4)
            );

            try {
                await this.generateReadme({
                    context,
                    endpointSnippets: snippets.endpoints
                });
            } catch (e) {
                context.logger.warn("Failed to generate README.md, this is OK.");
            }

            try {
                await this.generateReference({ context });
            } catch (e) {
                context.logger.warn("Failed to generate reference.md, this is OK.");
            }
        }
        await context.project.persist();
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

    private async generateGitHub({ context }: { context: SdkGeneratorContext }): Promise<void> {
        await context.generatorAgent.pushToGitHub({ context });
    }
}
