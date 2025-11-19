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
        this.rootPackageName = this.context.getRootFolderName();
        this.rootPackageClientName = this.context.getRootModuleName();
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
            [FernGeneratorCli.StructuredFeatureId.Errors]: { renderer: this.renderErrorsSnippet.bind(this) },
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

    public buildReadmeAddendumsByFeatureId(): Record<FernGeneratorCli.FeatureId, string> {
        const addendums: Record<FernGeneratorCli.FeatureId, string | undefined> = {};
        addendums[this.getEnvironmentFeatureIDName()] = this.buildEnvironmentsAddendum();

        return Object.fromEntries(
            Object.entries(addendums).filter(([_, value]) => value != null) as [FernGeneratorCli.FeatureId, string][]
        );
    }

    public getEnvironmentFeatureIDName(): string {
        return ReadmeSnippetBuilder.ENVIRONMENTS_FEATURE_ID;
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

    private buildEnvironmentsAddendum(): string {
        let fullString: string = "";

        const openMardownRubySnippet = "```ruby\n";
        const closeMardownRubySnippet = "```\n";
        const hasEnvironments = this.getEnvironmentNameExample() !== undefined;

        // Description
        if (hasEnvironments === true) {
            fullString +=
                "This SDK allows you to configure different environments or custom URLs for API requests. You can either use the predefined environments or specify your own custom URL.";
        } else {
            fullString +=
                "This SDK allows you to configure different custom URLs for API requests. You can specify your own custom URL.";
        }

        fullString += "\n";

        // Add subsections
        // Not every SDK has environments configured, so we need to check for that.
        if (hasEnvironments === true) {
            fullString += "### Environments\n";
            fullString += this.writeCode(dedent`${openMardownRubySnippet}require "${this.rootPackageName}"

                ${this.rootPackageName} = ${this.rootPackageClientName}::Client.new(
                    base_url: ${this.getEnvironmentNameExample()}
                )
            ${closeMardownRubySnippet}`);
        }

        fullString += "\n### Custom URL\n";

        fullString += this.writeCode(dedent`${openMardownRubySnippet}require "${this.rootPackageName}"

            ${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME} = ${this.rootPackageClientName}::Client.new(
                base_url: ${this.getEnvironmentURLExample()}
            )
        ${closeMardownRubySnippet}`);

        return dedent`${fullString}`;
    }

    private renderErrorsSnippet(endpoint: EndpointWithFilepath): string {
        return this.writeCode(dedent`require "${this.rootPackageName}"

            ${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME} = ${this.rootPackageClientName}::Client.new(
                base_url: ${this.getEnvironmentURLExample()}
            )

            begin
                result = ${this.getMethodCall(endpoint)}
            rescue ${this.rootPackageClientName}::Errors::TimeoutError
                puts "API didn't respond before our timeout elapsed"
            rescue ${this.rootPackageClientName}::Errors::ServiceUnavailableError
                puts "API returned status 503, is probably overloaded, try again later"
            rescue ${this.rootPackageClientName}::Errors::ServerError
                puts "API returned some other 5xx status, this is probably a bug"
            rescue ${this.rootPackageClientName}::Errors::ResponseError => e
                puts "API returned an unexpected status other than 5xx: #{e.code} {e.message}"
            rescue ${this.rootPackageClientName}::Errors::ApiError => e
                puts "Some other error occurred when calling the API: {e.message}"
            end
        `);
    }

    private renderRequestOptionsSnippet(endpoint: EndpointWithFilepath): string {
        return this.writeCode(dedent`require "${this.rootPackageName}"

            # Specify default options applied on every request.
            ${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME} = ${this.rootPackageClientName}.new(
                token: "<YOUR_API_KEY>",
                http_client: HTTP::Client.new(
                    timeout: 5
                )
            )

            # Specify options for an individual request.
            response = ${this.getMethodCall(endpoint)}(
                ...,
                token: "<YOUR_API_KEY>"
            )
        `);
    }

    private renderWithRawResponseHeadersSnippet(endpoint: EndpointWithFilepath): string {
        return this.writeCode(dedent`require "${this.rootPackageName}"

            response = ${this.getWithRawResponseMethodCall(endpoint)}(...)
            rescue => error
                raise error
            end

            puts "Got response headers: #{response.headers}"

        `);
    }

    private renderTimeoutsSnippet(endpoint: EndpointWithFilepath): string {
        return this.writeCode(dedent`require "${this.rootPackageName}"

            response = ${this.getMethodCall(endpoint)}(
                ...,
                timeout: 30  # 30 second timeout
            )
        `);
    }

    private renderPaginationSnippet(endpoint: EndpointWithFilepath): string {
        return this.writeCode(dedent`require "${this.rootPackageName}"

            # Loop over the items using the provided iterator.
                page = ${this.rootPackageClientName}.${this.getMethodCall(endpoint)}(
                ...
            )
            page.each do |item|
                puts "Got item: #{item}"
            end

            # Alternatively, iterate page-by-page.
            current_page = page
            while current_page
                current_page.results.each do |item|
                    puts "Got item: #{item}"
                end
                current_page = current_page.next_page
                break if current_page.nil?
            end

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
            if (endpointSnippet.snippet.type !== "ruby") {
                throw new Error(`Internal error; expected ruby snippet but got: ${endpointSnippet.snippet.type}`);
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
        const clientAccessParts = fernFilepath.allParts.map((part) => part.snakeCase.safeName);
        return clientAccessParts.length > 0
            ? `${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME}.${clientAccessParts.join(".")}`
            : ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME;
    }

    private getEndpointMethodName(endpoint: HttpEndpoint): string {
        return endpoint.name.snakeCase.safeName;
    }

    private getDefaultEnvironmentId(): FernIr.dynamic.EnvironmentId | undefined {
        if (this.context.ir.environments == null) {
            return undefined;
        }

        return (
            this.context.ir.environments?.defaultEnvironment ??
            this.context.ir.environments.environments.environments[0]?.id
        );
    }

    private getEnvironmentURLExample(): string {
        return '"https://example.com"';
    }

    private getEnvironmentNameExample(): string | undefined {
        const defaultEnvironmentId = this.getDefaultEnvironmentId();

        if (defaultEnvironmentId == null || this.context.ir.environments == null) {
            return undefined;
        }

        const { environments } = this.context.ir.environments;
        const defaultEnvironment = environments.environments.find((env) => env.id === defaultEnvironmentId);

        if (!defaultEnvironment) {
            return undefined;
        }

        return `${this.rootPackageClientName}::Environment::${defaultEnvironment.name.pascalCase.unsafeName}`;
    }

    private getRootPackageClientName(): string {
        return this.context.getRootFolderName();
    }

    private writeCode(s: string): string {
        return s.trim() + "\n";
    }
}
