import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { java } from "@fern-api/java-ast";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { EndpointId, FeatureId, FernFilepath, HttpEndpoint, Name } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

interface EndpointWithFilepath {
    endpoint: HttpEndpoint;
    fernFilepath: FernFilepath;
}

export class ReadmeSnippetBuilder extends AbstractReadmeSnippetBuilder {
    private static CLIENT_VARIABLE_NAME = "client";
    private static ENVIRONMENTS_FEATURE_ID: FernGeneratorCli.FeatureId = "ENVIRONMENTS";
    private static BASE_URL_FEATURE_ID: FernGeneratorCli.FeatureId = "BASE_URL";
    private static SNIPPET_PACKAGE_NAME = "com.example.usage";
    private static ELLIPSES = java.codeblock("...");

    private readonly context: SdkGeneratorContext;
    private readonly endpointsById: Record<EndpointId, EndpointWithFilepath> = {};
    private readonly prerenderedSnippetsByEndpointId: Record<EndpointId, string> = {};
    private readonly defaultEndpointId: EndpointId;
    private readonly rootPackageClientName: string;
    private readonly isPaginationEnabled: boolean;

    constructor({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: FernGeneratorExec.Endpoint[];
    }) {
        super({ endpointSnippets });
        this.context = context;

        this.isPaginationEnabled = context.config.generatePaginatedClients ?? false;
        this.endpointsById = this.buildEndpointsById();
        this.prerenderedSnippetsByEndpointId = this.buildPrerenderedSnippetsByEndpointId(endpointSnippets);
        this.defaultEndpointId =
            this.context.ir.readmeConfig?.defaultEndpoint != null
                ? this.context.ir.readmeConfig.defaultEndpoint
                : this.getDefaultEndpointId();
        this.rootPackageClientName = this.getRootPackageClientName();
    }

    public buildReadmeSnippetsByFeatureId(): Record<FernGeneratorCli.FeatureId, string[]> {
        const prerenderedSnippetsConfig: Record<
            FernGeneratorCli.FeatureId,
            {
                predicate?: (endpoint: EndpointWithFilepath) => boolean;
            }
        > = {
            [FernGeneratorCli.StructuredFeatureId.Usage]: {}
        };

        const templatedSnippetsConfig: Record<
            FernGeneratorCli.FeatureId,
            {
                renderer: (endpoint: EndpointWithFilepath) => string;
                predicate?: (endpoint: EndpointWithFilepath) => boolean;
            }
        > = {
            [FernGeneratorCli.StructuredFeatureId.Authentication]: {
                renderer: this.renderAuthenticationSnippet.bind(this)
            },
            [ReadmeSnippetBuilder.ENVIRONMENTS_FEATURE_ID]: {
                renderer: this.renderEnvironmentsSnippet.bind(this),
                predicate: (_endpoint: EndpointWithFilepath) => this.getDefaultEnvironmentId() != null
            },
            [ReadmeSnippetBuilder.BASE_URL_FEATURE_ID]: {
                renderer: this.renderBaseUrlSnippet.bind(this)
            },
            [FernGeneratorCli.StructuredFeatureId.Errors]: { renderer: this.renderErrorsSnippet.bind(this) },
            [FernGeneratorCli.StructuredFeatureId.CustomClient]: {
                renderer: this.renderCustomClientSnippet.bind(this)
            },
            [FernGeneratorCli.StructuredFeatureId.Retries]: { renderer: this.renderRetriesSnippet.bind(this) },
            [FernGeneratorCli.StructuredFeatureId.Timeouts]: { renderer: this.renderTimeoutsSnippet.bind(this) },
            ...(this.isPaginationEnabled
                ? {
                      [FernGeneratorCli.StructuredFeatureId.Pagination]: {
                          renderer: this.renderPaginationSnippet.bind(this),
                          predicate: (endpoint: EndpointWithFilepath) => endpoint.endpoint.pagination != null
                      }
                  }
                : undefined)
        };

        const snippetsByFeatureId: Record<FernGeneratorCli.FeatureId, string[]> = {};

        for (const [featureId, { predicate }] of Object.entries(prerenderedSnippetsConfig)) {
            snippetsByFeatureId[featureId] = this.getPrerenderedSnippetsForFeature(featureId, predicate);
        }

        for (const [featureId, { renderer, predicate }] of Object.entries(templatedSnippetsConfig)) {
            snippetsByFeatureId[featureId] = this.renderSnippetsTemplateForFeature(featureId, renderer, predicate);
        }

        return snippetsByFeatureId;
    }

    private getPrerenderedSnippetsForFeature(
        featureId: FernGeneratorCli.FeatureId,
        predicate: (endpoint: EndpointWithFilepath) => boolean = () => true
    ): string[] {
        return this.getEndpointsForFeature(featureId)
            .filter(predicate)
            .map((endpoint) => {
                const endpointId = endpoint.endpoint.id;
                const snippet = this.prerenderedSnippetsByEndpointId[endpoint.endpoint.id];
                if (snippet == null) {
                    throw new Error(`Internal error; missing snippet for endpoint ${endpointId}`);
                }
                return snippet;
            });
    }

    private renderSnippetsTemplateForFeature(
        featureId: FernGeneratorCli.FeatureId,
        templateRenderer: (endpoint: EndpointWithFilepath) => string,
        predicate: (endpoint: EndpointWithFilepath) => boolean = () => true
    ): string[] {
        return this.getEndpointsForFeature(featureId).filter(predicate).map(templateRenderer);
    }

    private renderAuthenticationSnippet(endpoint: EndpointWithFilepath): string {
        return "";
    }

    private renderEnvironmentsSnippet(_endpoint: EndpointWithFilepath): string {
        const clientClassReference = this.context.getRootClientClassReference();

        const builderMethodInvocation = java.invokeMethod({
            on: clientClassReference,
            method: "builder",
            arguments_: []
        });

        // This is safe because it's validated in the predicate
        const productionEnvironmentName = this.getDefaultEnvironmentId()!;
        const productionEnvironment = java.codeblock((writer) => {
            writer.writeNode(this.context.getEnvironmentClassReference());
            writer.write(".");
            writer.write(productionEnvironmentName);
        });
        const environmentMethodInvocation = java.invokeMethod({
            on: builderMethodInvocation,
            method: "environment",
            arguments_: [productionEnvironment]
        });
        const buildWithEnvironmentMethodInvocation = java.invokeMethod({
            on: environmentMethodInvocation,
            method: "build",
            arguments_: []
        });

        const withEnvironment = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(` ${this.rootPackageClientName} = `);
            writer.writeNode(buildWithEnvironmentMethodInvocation);
        });

        const snippet = java.codeblock((writer) => {
            writer.writeLine("// Using environment");
            writer.writeNodeStatement(withEnvironment);
        });

        return snippet.toString({
            packageName: ReadmeSnippetBuilder.SNIPPET_PACKAGE_NAME,
            customConfig: this.context.customConfig
        });
    }

    private renderBaseUrlSnippet(_endpoint: EndpointWithFilepath): string {
        const clientClassReference = this.context.getRootClientClassReference();

        const builderMethodInvocation = java.invokeMethod({
            on: clientClassReference,
            method: "builder",
            arguments_: []
        });

        const baseUrl = java.codeblock((writer) => writer.write('"https://example.com"'));
        const customUrlMethodInvocation = java.invokeMethod({
            on: builderMethodInvocation,
            method: "url",
            arguments_: [baseUrl]
        });

        const buildWithCustomUrlMethodInvocation = java.invokeMethod({
            on: customUrlMethodInvocation,
            method: "build",
            arguments_: []
        });
        const withCustomUrl = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(` ${this.rootPackageClientName} = `);
            writer.writeNode(buildWithCustomUrlMethodInvocation);
        });

        const snippet = java.codeblock((writer) => {
            writer.writeNodeStatement(withCustomUrl);
        });

        return snippet.toString({
            packageName: ReadmeSnippetBuilder.SNIPPET_PACKAGE_NAME,
            customConfig: this.context.customConfig
        });
    }

    private renderErrorsSnippet(endpoint: EndpointWithFilepath): string {
        const endpointMethodInvocation = this.getMethodCall(endpoint, [ReadmeSnippetBuilder.ELLIPSES]);

        const apiExceptionClassReference = this.context.getApiExceptionClassReference();
        const exceptionDeclarationBlock = java.codeblock((writer) => {
            writer.writeNode(apiExceptionClassReference);
            writer.write(" e");
        });

        const snippet = java.codeblock((writer) => {
            writer.controlFlowWithoutStatement("try");
            writer.writeNodeStatement(endpointMethodInvocation);
            writer.contiguousControlFlow("catch", exceptionDeclarationBlock);
            writer.writeLine("// Do something with the API exception...");
            writer.endControlFlow();
        });

        return snippet.toString({
            packageName: ReadmeSnippetBuilder.SNIPPET_PACKAGE_NAME,
            customConfig: this.context.customConfig
        });
    }

    private renderCustomClientSnippet(endpoint: EndpointWithFilepath): string {
        return "";
    }

    private renderRetriesSnippet(endpoint: EndpointWithFilepath): string {
        const requestOptionsClassReference = this.context.getRequestOptionsClassReference();
        const builderMethodInvocation = java.invokeMethod({
            on: requestOptionsClassReference,
            method: "builder",
            arguments_: []
        });
        const maxRetriesMethodInvocation = java.invokeMethod({
            on: builderMethodInvocation,
            method: "maxRetries",
            arguments_: [java.codeblock("1")]
        });
        const buildMethodInvocation = java.invokeMethod({
            on: maxRetriesMethodInvocation,
            method: "build",
            arguments_: []
        });

        const endpointMethodInvocation = this.getMethodCall(endpoint, [
            ReadmeSnippetBuilder.ELLIPSES,
            buildMethodInvocation
        ]);

        const snippet = java.codeblock((writer) => writer.writeNodeStatement(endpointMethodInvocation));

        return snippet.toString({
            packageName: ReadmeSnippetBuilder.SNIPPET_PACKAGE_NAME,
            customConfig: this.context.customConfig
        });
    }

    private renderTimeoutsSnippet(endpoint: EndpointWithFilepath): string {
        const requestOptionsClassReference = this.context.getRequestOptionsClassReference();
        const builderMethodInvocation = java.invokeMethod({
            on: requestOptionsClassReference,
            method: "builder",
            arguments_: []
        });
        const maxRetriesMethodInvocation = java.invokeMethod({
            on: builderMethodInvocation,
            method: "timeout",
            arguments_: [java.codeblock("10")]
        });
        const buildMethodInvocation = java.invokeMethod({
            on: maxRetriesMethodInvocation,
            method: "build",
            arguments_: []
        });

        const endpointMethodInvocation = this.getMethodCall(endpoint, [
            ReadmeSnippetBuilder.ELLIPSES,
            buildMethodInvocation
        ]);

        const snippet = java.codeblock((writer) => writer.writeNodeStatement(endpointMethodInvocation));

        return snippet.toString({
            packageName: ReadmeSnippetBuilder.SNIPPET_PACKAGE_NAME,
            customConfig: this.context.customConfig
        });
    }

    private renderPaginationSnippet(endpoint: EndpointWithFilepath): string {
        return "";
    }

    private buildEndpointsById(): Record<EndpointId, EndpointWithFilepath> {
        const endpoints: Record<EndpointId, EndpointWithFilepath> = {};
        for (const service of Object.values(this.context.ir.services)) {
            for (const endpoint of service.endpoints) {
                endpoints[endpoint.id] = {
                    endpoint,
                    fernFilepath: service.name.fernFilepath
                };
            }
        }
        return endpoints;
    }

    private buildPrerenderedSnippetsByEndpointId(
        endpointSnippets: FernGeneratorExec.Endpoint[]
    ): Record<EndpointId, string> {
        const snippets: Record<EndpointId, string> = {};
        for (const endpointSnippet of Object.values(endpointSnippets)) {
            if (endpointSnippet.id.identifierOverride == null) {
                throw new Error("Internal error; snippets must define the endpoint id to generate README.md");
            }
            if (endpointSnippet.snippet.type !== "java") {
                throw new Error(`Internal error; expected java snippet but got: ${endpointSnippet.snippet.type}`);
            }
            snippets[endpointSnippet.id.identifierOverride] = endpointSnippet.snippet.syncClient;
        }
        return snippets;
    }

    private getEndpointsForFeature(featureId: FeatureId): EndpointWithFilepath[] {
        const endpointIds = this.getConfiguredEndpointIdsForFeature(featureId) ?? [this.defaultEndpointId];
        return endpointIds.map(this.lookupEndpointById.bind(this));
    }

    private getConfiguredEndpointIdsForFeature(featureId: FeatureId): EndpointId[] | undefined {
        return this.context.ir.readmeConfig?.features?.[this.getFeatureKey(featureId)];
    }

    private lookupEndpointById(endpointId: EndpointId): EndpointWithFilepath {
        const endpoint = this.endpointsById[endpointId];
        if (endpoint == null) {
            throw new Error(`Internal error; missing endpoint ${endpointId}`);
        }
        return endpoint;
    }

    private getMethodCall(endpoint: EndpointWithFilepath, arguments_: java.AstNode[]): java.MethodInvocation {
        return java.invokeMethod({
            on: this.getAccessFromRootClient(endpoint.fernFilepath),
            method: this.getEndpointMethodName(endpoint.endpoint),
            arguments_
        });
    }

    private getAccessFromRootClient(fernFilepath: FernFilepath): java.AstNode {
        const clientAccessParts = fernFilepath.allParts.map((part) => part.camelCase.safeName + "()");
        return clientAccessParts.length > 0
            ? java.codeblock(`${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME}.${clientAccessParts.join(".")}`)
            : java.codeblock(ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME);
    }

    private getEndpointMethodName(endpoint: HttpEndpoint): string {
        return endpoint.name.camelCase.unsafeName;
    }

    private getDefaultEnvironmentId(): FernIr.EnvironmentId | undefined {
        if (this.context.ir.environments == null) {
            return undefined;
        }

        return (
            this.context.ir.environments?.defaultEnvironment ??
            this.context.ir.environments.environments.environments[0]?.id
        );
    }

    private getRootPackageClientName(): string {
        return "client";
    }
}
