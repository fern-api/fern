import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { java } from "@fern-api/java-ast";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { EndpointId, FeatureId, FernFilepath, HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

interface EndpointWithFilepath {
    endpoint: HttpEndpoint;
    fernFilepath: FernFilepath;
}

export class ReadmeSnippetBuilder extends AbstractReadmeSnippetBuilder {
    private static CLIENT_VARIABLE_NAME = "client";
    private static ENVIRONMENTS_FEATURE_ID: FernGeneratorCli.FeatureId = "ENVIRONMENTS";
    private static SNIPPET_PACKAGE_NAME = "com.example.usage";

    private readonly context: SdkGeneratorContext;
    private readonly endpointsById: Record<EndpointId, EndpointWithFilepath> = {};
    private readonly prerenderedSnippetsByEndpointId: Record<EndpointId, string> = {};
    private readonly defaultEndpointId: EndpointId;
    private readonly rootPackageName: string;
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
        this.rootPackageName = this.getRootPackageName();
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
            [ReadmeSnippetBuilder.ENVIRONMENTS_FEATURE_ID]: { renderer: this.renderEnvironmentsSnippet.bind(this) },
            [FernGeneratorCli.StructuredFeatureId.RequestOptions]: {
                renderer: this.renderRequestOptionsSnippet.bind(this)
            },
            [FernGeneratorCli.StructuredFeatureId.Errors]: { renderer: this.renderErrorsSnippet.bind(this) },
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

    private renderEnvironmentsSnippet(endpoint: EndpointWithFilepath): string {
        const clientClassReference = this.context.getRootClientClassReference();

        const builderMethodInvocation = java.invokeMethod({
            on: clientClassReference,
            method: "builder",
            arguments_: []
        });

        const productionEnvironmentName = "PRODUCTION";
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
            writer.write(` ${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME} = `);
            writer.writeNode(buildWithEnvironmentMethodInvocation);
        });

        const baseUrl = java.codeblock((writer) => writer.write(this.getBaseUrlOptionValue()));
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
            writer.write(` ${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME} = `);
            writer.writeNode(buildWithCustomUrlMethodInvocation);
        });

        const snippet = java.codeblock((writer) => {
            writer.writeLine("// Using environment");
            writer.writeNodeStatement(withEnvironment);
            writer.writeLine("\n");
            writer.writeLine("// Using custom base URL");
            writer.writeNodeStatement(withCustomUrl);
        });

        return snippet.toString({
            packageName: ReadmeSnippetBuilder.SNIPPET_PACKAGE_NAME,
            customConfig: this.context.customConfig
        });
    }

    private renderRequestOptionsSnippet(endpoint: EndpointWithFilepath): string {
        return "";
    }

    private renderErrorsSnippet(endpoint: EndpointWithFilepath): string {
        return "";
    }

    private renderRetriesSnippet(endpoint: EndpointWithFilepath): string {
        return "";
    }

    private renderTimeoutsSnippet(endpoint: EndpointWithFilepath): string {
        return "";
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

    private getSnippetForEndpointId(endpointId: EndpointId): string {
        const snippet = this.prerenderedSnippetsByEndpointId[endpointId];
        if (snippet == null) {
            throw new Error(`Internal error; missing snippet for endpoint ${endpointId}`);
        }
        return snippet;
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

    private getMethodCall(endpoint: EndpointWithFilepath): string {
        return `${this.getAccessFromRootClient(endpoint.fernFilepath)}.${this.getEndpointMethodName(
            endpoint.endpoint
        )}`;
    }

    private getAccessFromRootClient(fernFilepath: FernFilepath): string {
        const clientAccessParts = fernFilepath.allParts.map((part) => part.pascalCase.unsafeName);
        return clientAccessParts.length > 0
            ? `${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME}.${clientAccessParts.join(".")}`
            : ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME;
    }

    private getEndpointMethodName(endpoint: HttpEndpoint): string {
        return endpoint.name.pascalCase.unsafeName;
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

    private getBaseUrlOptionValue(): string {
        return this.getEnvironmentBaseUrlReference() ?? '"https://example.com"';
    }

    private getEnvironmentBaseUrlReference(): string | undefined {
        const defaultEnvironmentId = this.getDefaultEnvironmentId();

        if (defaultEnvironmentId == null || this.context.ir.environments == null) {
            return undefined;
        }

        const { environments } = this.context.ir.environments;
        const defaultEnvironment = environments.environments.find((env) => env.id === defaultEnvironmentId);

        if (!defaultEnvironment) {
            return undefined;
        }

        return `${this.rootPackageName}.Environments.${defaultEnvironment.name.pascalCase.unsafeName}`;
    }

    private getRootPackageName(): string {
        return this.context.config.organization;
    }

    private getRootPackageClientName(): string {
        return "client";
    }
}
