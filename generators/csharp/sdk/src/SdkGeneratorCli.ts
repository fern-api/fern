import { File, GeneratorNotificationService } from "@fern-api/base-generator";
import { extractErrorMessage } from "@fern-api/core-utils";
import { AbstractCsharpGeneratorCli, CsharpConfigSchema, TestFileGenerator } from "@fern-api/csharp-base";
import {
    generateModels,
    generateTests as generateModelTests,
    generateVersion,
    generateWellKnownProtobufFiles
} from "@fern-api/fern-csharp-model";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import * as FernGeneratorExecSerializers from "@fern-fern/generator-exec-sdk/serialization";
import { FernIr } from "@fern-fern/ir-sdk";
import { fail } from "assert";
import { writeFile } from "fs/promises";
import { SnippetJsonGenerator } from "./endpoint/snippets/SnippetJsonGenerator.js";
import { MultiUrlEnvironmentGenerator } from "./environment/MultiUrlEnvironmentGenerator.js";
import { SingleUrlEnvironmentGenerator } from "./environment/SingleUrlEnvironmentGenerator.js";
import { BaseApiExceptionGenerator } from "./error/BaseApiExceptionGenerator.js";
import { BaseExceptionGenerator } from "./error/BaseExceptionGenerator.js";
import { CustomExceptionInterceptorGenerator } from "./error/CustomExceptionInterceptorGenerator.js";
import { ErrorGenerator } from "./error/ErrorGenerator.js";
import { generateSdkTests } from "./generateSdkTests.js";
import { InferredAuthTokenProviderGenerator } from "./inferred-auth/InferredAuthTokenProviderGenerator.js";
import { OauthTokenProviderGenerator } from "./oauth/OauthTokenProviderGenerator.js";
import { BaseOptionsGenerator } from "./options/BaseOptionsGenerator.js";
import { ClientOptionsGenerator } from "./options/ClientOptionsGenerator.js";
import { IdempotentRequestOptionsGenerator } from "./options/IdempotentRequestOptionsGenerator.js";
import { IdempotentRequestOptionsInterfaceGenerator } from "./options/IdempotentRequestOptionsInterfaceGenerator.js";
import { RequestOptionsGenerator } from "./options/RequestOptionsGenerator.js";
import { RequestOptionsInterfaceGenerator } from "./options/RequestOptionsInterfaceGenerator.js";
import { buildReference } from "./reference/buildReference.js";
import { RootClientGenerator } from "./root-client/RootClientGenerator.js";
import { RootClientInterfaceGenerator } from "./root-client/RootClientInterfaceGenerator.js";
import { SdkGeneratorContext } from "./SdkGeneratorContext.js";
import { SubPackageClientGenerator } from "./subpackage-client/SubPackageClientGenerator.js";
import { SubPackageClientInterfaceGenerator } from "./subpackage-client/SubPackageClientInterfaceGenerator.js";
import { WebSocketClientGenerator } from "./websocket/WebsocketClientGenerator.js";
import { WrappedRequestGenerator } from "./wrapped-request/WrappedRequestGenerator.js";

export class SdkGeneratorCLI extends AbstractCsharpGeneratorCli {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: FernIr.IntermediateRepresentation;
        customConfig: CsharpConfigSchema;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): SdkGeneratorContext {
        return new SdkGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): CsharpConfigSchema {
        const parsed = customConfig != null ? CsharpConfigSchema.parse(customConfig) : undefined;
        if (parsed != null) {
            return this.validateCustomConfig(parsed);
        }
        return {};
    }

    private validateCustomConfig(customConfig: CsharpConfigSchema): CsharpConfigSchema {
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
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    private generateRequests(context: SdkGeneratorContext, service: FernIr.HttpService, serviceId: string) {
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
        const generateStartTime = Date.now();
        // generate names for everything up front.
        const precalculateStartTime = Date.now();
        context.precalculate();
        context.logger.debug(`[TIMING] precalculate took ${Date.now() - precalculateStartTime}ms`);

        // before generating anything, generate the models first so that we
        // can identify collisions or ambiguities in the generated code.
        const modelsStartTime = Date.now();
        const { files: models, literalTypeFiles } = generateModels({ context });
        context.logger.debug(`[TIMING] generateModels took ${Date.now() - modelsStartTime}ms`);

        await context.snippetGenerator.populateSnippetsCache();

        for (const file of models) {
            context.project.addSourceFiles(file);
        }
        for (const file of literalTypeFiles) {
            context.project.addSourceRawFile(file);
        }

        context.project.addSourceFiles(generateVersion({ context }));

        if (context.settings.shouldGenerateMockServerTests) {
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
            const service = subpackage.service != null ? context.getHttpService(subpackage.service) : undefined;
            // skip subpackages that have no endpoints (recursively)
            if (context.subPackageHasEndpointsRecursively(subpackage)) {
                const subClientInterface = new SubPackageClientInterfaceGenerator({
                    context,
                    subpackage,
                    serviceId: subpackage.service,
                    service
                });
                context.project.addSourceFiles(subClientInterface.generate());

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
                const websocketChannel = context.getWebsocketChannel(subpackage.websocket);
                if (websocketChannel) {
                    const websocketApi = new WebSocketClientGenerator({
                        context,
                        subpackage,
                        websocketChannel
                    });
                    context.project.addSourceFiles(websocketApi.generateInterface());
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

        if (context.hasIdempotencyHeaders()) {
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

        if (context.settings.generateErrorTypes) {
            for (const _error of Object.values(context.ir.errors)) {
                const errorGenerator = new ErrorGenerator(context, _error);
                context.project.addSourceFiles(errorGenerator.generate());
            }
        }

        if (context.settings.includeExceptionHandler) {
            const customExceptionInterceptor = new CustomExceptionInterceptorGenerator(context);
            context.project.addSourceFiles(customExceptionInterceptor.generate());
        }

        const rootClientInterface = new RootClientInterfaceGenerator(context);
        context.project.addSourceFiles(rootClientInterface.generate());

        const rootClient = new RootClientGenerator(context);
        context.project.addSourceFiles(rootClient.generate());

        const rootServiceId = context.ir.rootPackage.service;
        if (rootServiceId != null) {
            const service = context.getHttpService(rootServiceId);
            this.generateRequests(
                context,
                service ?? fail(`Service with id ${rootServiceId} not found`),
                rootServiceId
            );
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
        const oauth = context.getOauth();
        if (oauth != null) {
            const oauthTokenProvider = new OauthTokenProviderGenerator({
                context,
                scheme: oauth
            });
            context.project.addSourceFiles(oauthTokenProvider.generate());
        }

        const inferred = context.getInferredAuth();
        if (inferred != null) {
            const inferredAuthTokenProvider = new InferredAuthTokenProviderGenerator({
                context,
                scheme: inferred
            });
            context.project.addSourceFiles(inferredAuthTokenProvider.generate());
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
                throw new Error(`Failed to generate README.md: ${extractErrorMessage(e)}`);
            }

            try {
                await this.generateReference({ context });
            } catch (e) {
                throw new Error(`Failed to generate reference.md: ${extractErrorMessage(e)}`);
            }
        }
        context.logger.debug(`[TIMING] code generation took ${Date.now() - generateStartTime}ms`);
        await context.project.persist();
        context.formatter.dispose();
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
        const content = await context.generatorAgent.generateReadme({
            context,
            endpointSnippets
        });
        const otherPath = context.settings.outputPath.other;
        context.project.addRawFiles(
            new File(context.generatorAgent.README_FILENAME, RelativeFilePath.of(otherPath), content)
        );
    }

    private async generateReference({ context }: { context: SdkGeneratorContext }): Promise<void> {
        const builder = buildReference({ context });
        if (builder == null) {
            context.logger.debug("No endpoint references found; skipping reference.md generation.");
            return;
        }
        const content = await context.generatorAgent.generateReference(builder);
        const otherPath = context.settings.outputPath.other;
        context.project.addRawFiles(
            new File(context.generatorAgent.REFERENCE_FILENAME, RelativeFilePath.of(otherPath), content)
        );
    }

    private async generateGitHub({ context }: { context: SdkGeneratorContext }): Promise<void> {
        await context.generatorAgent.pushToGitHub({ context });
    }
}
