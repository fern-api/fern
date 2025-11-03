import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { EndpointId, FeatureId, FernFilepath, HttpEndpoint } from "@fern-fern/ir-sdk/api";
import dedent from "dedent";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

interface EndpointWithFilepath {
    endpoint: HttpEndpoint;
    fernFilepath: FernFilepath;
}

export class ReadmeSnippetBuilder extends AbstractReadmeSnippetBuilder {
    private static CLIENT_VARIABLE_NAME = "client";

    private static ENVIRONMENTS_FEATURE_ID: FernGeneratorCli.FeatureId = "ENVIRONMENTS";
    private static RESPONSE_HEADERS_FEATURE_ID: FernGeneratorCli.FeatureId = "RESPONSE_HEADERS";
    private static EXPLICIT_NULL_FEATURE_ID: FernGeneratorCli.FeatureId = "EXPLICIT_NULL";

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
        this.rootPackageName = this.context.getRootPackageName();
        this.rootPackageClientName = this.getRootPackageClientName();
    }

    public buildReadmeSnippetsByFeatureId(): Record<FernGeneratorCli.FeatureId, string[]> {
        // These feature sections are populated using the provided, prerendered endpoint snippets.
        const prerenderedSnippetsConfig: Record<
            FernGeneratorCli.FeatureId,
            {
                predicate?: (endpoint: EndpointWithFilepath) => boolean;
            }
        > = {
            [FernGeneratorCli.StructuredFeatureId.Usage]: {}
        };

        // These feature sections are rendered using endpoint data interpolated into templates.
        const templatedSnippetsConfig: Record<
            FernGeneratorCli.FeatureId,
            {
                renderer: (endpoint: EndpointWithFilepath) => string;
                predicate?: (endpoint: EndpointWithFilepath) => boolean;
            }
        > = {
            [ReadmeSnippetBuilder.ENVIRONMENTS_FEATURE_ID]: { renderer: this.renderEnvironmentsSnippet.bind(this) },
            [ReadmeSnippetBuilder.RESPONSE_HEADERS_FEATURE_ID]: {
                renderer: this.renderWithRawResponseHeadersSnippet.bind(this)
            },
            [ReadmeSnippetBuilder.EXPLICIT_NULL_FEATURE_ID]: { renderer: this.renderExplicitNullSnippet.bind(this) },
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
        return this.writeCode(dedent`
            ${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME} := ${this.rootPackageClientName}.NewClient(
                option.WithBaseURL(${this.getBaseUrlOptionValue()}),
            )
        `);
    }

    private renderWithRawResponseHeadersSnippet(endpoint: EndpointWithFilepath): string {
        return this.writeCode(dedent`
            response, err := ${this.getWithRawResponseMethodCall(endpoint)}(...)
            if err != nil {
                return err
            }
            fmt.Printf("Got response headers: %v", response.Header)
        `);
    }

    private renderRequestOptionsSnippet(endpoint: EndpointWithFilepath): string {
        return this.writeCode(dedent`
            // Specify default options applied on every request.
            ${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME} := ${this.rootPackageClientName}.NewClient(
                option.WithToken("<YOUR_API_KEY>"),
                option.WithHTTPClient(
                    &http.Client{
                        Timeout: 5 * time.Second,
                    },
                ),
            )

            // Specify options for an individual request.
            response, err := ${this.getMethodCall(endpoint)}(
                ...,
                option.WithToken("<YOUR_API_KEY>"),
            )
        `);
    }

    private renderErrorsSnippet(endpoint: EndpointWithFilepath): string {
        return this.writeCode(dedent`
            response, err := ${this.getMethodCall(endpoint)}(...)
            if err != nil {
                var apiError *core.APIError
                if errors.As(err, apiError) {
                    // Do something with the API error ...
                }
                return err
            }
        `);
    }

    private renderRetriesSnippet(endpoint: EndpointWithFilepath): string {
        return this.writeCode(dedent`
            ${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME} := ${this.rootPackageClientName}.NewClient(
                option.WithMaxAttempts(1),
            )

            response, err := ${this.getMethodCall(endpoint)}(
                ...,
                option.WithMaxAttempts(1),
            )
        `);
    }

    private renderTimeoutsSnippet(endpoint: EndpointWithFilepath): string {
        return this.writeCode(dedent`
            ctx, cancel := context.WithTimeout(ctx, time.Second)
            defer cancel()

            response, err := ${this.getMethodCall(endpoint)}(ctx, ...)
        `);
    }

    private renderExplicitNullSnippet(endpoint: EndpointWithFilepath): string {
        return this.writeCode(dedent`
            type ExampleRequest struct {
                // An optional string parameter.
                Name *string \`json:"name,omitempty" url:"-"\`

                // Private bitmask of fields set to an explicit value and therefore not to be omitted
                explicitFields *big.Int \`json:"-" url:"-"\`
            }

            request := &ExampleRequest{}
            request.SetName(nil)

            response, err := ${this.getMethodCall(endpoint)}(ctx, request, ...)
        `);
    }

    private renderPaginationSnippet(endpoint: EndpointWithFilepath): string {
        return this.writeCode(dedent`
            // Loop over the items using the provided iterator.
            ctx := context.TODO()
            page, err := ${this.getMethodCall(endpoint)}(
                ctx,
                ...
            )
            if err != nil {
                return err
            }
            iter := page.Iterator()
            for iter.Next(ctx) {
                item := iter.Current()
                fmt.Printf("Got item: %v", *item)
            }
            if err := iter.Err(); err != nil {
                return err
            }

            // Alternatively, iterate page-by-page.
            for page != nil {
                for _, item := range page.Results {
                    fmt.Printf("Got item: %v", *item)
                }
                page, err = page.GetNextPage(ctx)
                if errors.Is(err, core.ErrNoPages) {
                    break
                }
                if err != nil {
                    return err
                }
            }

            // Alternatively, access the next cursor directly from the raw response.
            ctx := context.TODO()
            page, err := ${this.getMethodCall(endpoint)}(
                ctx,
                ...
            )
            if err != nil {
                return err
            }
            nextCursor := page.RawResponse.Next
        `);
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
            if (endpointSnippet.snippet.type !== "go") {
                throw new Error(`Internal error; expected go snippet but got: ${endpointSnippet.snippet.type}`);
            }
            if (snippets[endpointSnippet.id.identifierOverride] != null) {
                continue;
            }
            snippets[endpointSnippet.id.identifierOverride] = endpointSnippet.snippet.client;
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
        return `${this.getAccessFromRootClient(endpoint.fernFilepath)}.${this.getEndpointMethodName(endpoint.endpoint)}`;
    }

    private getWithRawResponseMethodCall(endpoint: EndpointWithFilepath): string {
        return `${this.getAccessFromRootClient(endpoint.fernFilepath)}.WithRawResponse.${this.getEndpointMethodName(
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

    private getDefaultEnvironmentId(): FernIr.environment.EnvironmentId | undefined {
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

    private getRootPackageClientName(): string {
        return "client";
    }

    private writeCode(s: string): string {
        return s.trim() + "\n";
    }
}
