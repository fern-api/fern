import { AbstractReadmeSnippetBuilder, CaseConverter, GeneratorError } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import dedent from "dedent";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

interface EndpointWithFilepath {
    endpoint: FernIr.HttpEndpoint;
    fernFilepath: FernIr.FernFilepath;
}

export class ReadmeSnippetBuilder extends AbstractReadmeSnippetBuilder {
    private static CLIENT_VARIABLE_NAME = "client";

    private static ENVIRONMENTS_FEATURE_ID: FernGeneratorCli.FeatureId = "ENVIRONMENTS";
    private static DEFAULT_AUTH_PLACEHOLDER = "<YOUR_API_KEY>";

    private readonly context: SdkGeneratorContext;
    private readonly case: CaseConverter;
    private readonly endpointsById: Record<FernIr.EndpointId, EndpointWithFilepath> = {};
    private readonly prerenderedSnippetsByEndpointId: Record<FernIr.EndpointId, string> = {};
    private readonly defaultEndpointId: FernIr.EndpointId;
    private readonly rootPackageName: string;
    private readonly rootPackageClientName: string;
    private readonly rootClientClassName: string;
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
        this.case = context.caseConverter;

        this.isPaginationEnabled = context.config.generatePaginatedClients ?? false;
        this.endpointsById = this.buildEndpointsById();
        this.prerenderedSnippetsByEndpointId = this.buildPrerenderedSnippetsByEndpointId(endpointSnippets);
        this.defaultEndpointId =
            this.context.ir.readmeConfig?.defaultEndpoint != null
                ? this.context.ir.readmeConfig.defaultEndpoint
                : this.getDefaultEndpointId();
        this.rootPackageName = this.context.getRootFolderName();
        this.rootPackageClientName = this.context.getRootModuleName();
        this.rootClientClassName = this.context.getRootClientClassName();
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
            [FernGeneratorCli.StructuredFeatureId.Retries]: { renderer: this.renderRetriesSnippet.bind(this) },
            [FernGeneratorCli.StructuredFeatureId.Timeouts]: { renderer: this.renderTimeoutsSnippet.bind(this) },
            ADDITIONAL_HEADERS: { renderer: this.renderAdditionalHeadersSnippet.bind(this) },
            ADDITIONAL_QUERY_PARAMETERS: { renderer: this.renderAdditionalQueryParametersSnippet.bind(this) },
            ...(this.isPaginationEnabled
                ? {
                      [FernGeneratorCli.StructuredFeatureId.Pagination]: {
                          renderer: this.renderPaginationSnippet.bind(this),
                          predicate: (endpoint: EndpointWithFilepath) => {
                              const pagination = endpoint.endpoint.pagination;
                              return pagination != null && pagination.type !== "uri" && pagination.type !== "path";
                          }
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
                    throw GeneratorError.internalError(`Internal error; missing snippet for endpoint ${endpointId}`);
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

                ${this.rootPackageName} = ${this.rootPackageClientName}::${this.rootClientClassName}.new(
                    base_url: ${this.getEnvironmentNameExample()}
                )
            ${closeMardownRubySnippet}`);
        }

        fullString += "\n### Custom URL\n";

        fullString += this.writeCode(dedent`${openMardownRubySnippet}require "${this.rootPackageName}"

            ${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME} = ${this.rootPackageClientName}::${this.rootClientClassName}.new(
                base_url: ${this.getEnvironmentURLExample()}
            )
        ${closeMardownRubySnippet}`);

        return dedent`${fullString}`;
    }

    private renderErrorsSnippet(endpoint: EndpointWithFilepath): string {
        return this.writeCode(dedent`require "${this.rootPackageName}"

            ${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME} = ${this.rootPackageClientName}::${this.rootClientClassName}.new(
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
                puts "API returned an unexpected status other than 5xx: #{e.code} #{e.message}"
            rescue ${this.rootPackageClientName}::Errors::ApiError => e
                puts "Some other error occurred when calling the API: #{e.message}"
            end
        `);
    }

    private renderRequestOptionsSnippet(endpoint: EndpointWithFilepath): string {
        const placeholder = this.getAuthPlaceholder();
        return this.writeCode(dedent`require "${this.rootPackageName}"

            # Specify default options applied on every request.
            ${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME} = ${this.rootPackageClientName}.new(
                token: "${placeholder}",
                http_client: HTTP::Client.new(
                    timeout: 5
                )
            )

            # Specify options for an individual request.
            response = ${this.getMethodCall(endpoint)}(
                ...,
                token: "${placeholder}"
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

    private renderRetriesSnippet(endpoint: EndpointWithFilepath): string {
        return this.writeCode(dedent`require "${this.rootPackageName}"

            ${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME} = ${this.rootPackageClientName}::${this.rootClientClassName}.new(
                base_url: ${this.getEnvironmentURLExample()},
                max_retries: 3  # Configure max retries (default is ${this.context.customConfig.maxRetries ?? 2})
            )
        `);
    }

    private renderAdditionalHeadersSnippet(endpoint: EndpointWithFilepath): string {
        return this.writeCode(dedent`require "${this.rootPackageName}"

            response = ${this.getMethodCall(endpoint)}(
                ...,
                request_options: {
                    additional_headers: {
                        "X-Custom-Header" => "custom-value"
                    }
                }
            )
        `);
    }

    private renderAdditionalQueryParametersSnippet(endpoint: EndpointWithFilepath): string {
        return this.writeCode(dedent`require "${this.rootPackageName}"

            response = ${this.getMethodCall(endpoint)}(
                ...,
                request_options: {
                    additional_query_parameters: {
                        "custom_param" => "custom-value"
                    }
                }
            )
        `);
    }

    private renderPaginationSnippet(endpoint: EndpointWithFilepath): string {
        if (endpoint.endpoint.pagination?.type === "custom") {
            return this.renderCustomPaginationSnippet(endpoint);
        }
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

    private renderCustomPaginationSnippet(endpoint: EndpointWithFilepath): string {
        const pagerClassName = this.context.customConfig.customPagerName ?? "CustomPager";
        return this.writeCode(dedent`require "${this.rootPackageName}"

            # For custom pagination, the response is returned directly.
            response = ${this.getMethodCall(endpoint)}(
                ...
            )

            pager = ${this.rootPackageClientName}::Internal::${pagerClassName}.new(
                response,
                has_next_proc: ->(page) { page.has_more },
                get_next_proc: ->(page) { ${this.getMethodCall(endpoint)}(cursor: page.next_cursor) }
            )

            # Iterate over pages
            pager.each_page do |page|
                puts "Got page: #{page}"
            end

        `);
    }

    private buildEndpointsById(): Record<FernIr.EndpointId, EndpointWithFilepath> {
        const endpoints: Record<FernIr.EndpointId, EndpointWithFilepath> = {};
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
    ): Record<FernIr.EndpointId, string> {
        const snippets: Record<FernIr.EndpointId, string> = {};
        for (const endpointSnippet of Object.values(endpointSnippets)) {
            if (endpointSnippet.id.identifierOverride == null) {
                throw GeneratorError.internalError(
                    "Internal error; snippets must define the endpoint id to generate README.md"
                );
            }
            if (endpointSnippet.snippet.type !== "ruby") {
                throw GeneratorError.internalError(
                    `Internal error; expected ruby snippet but got: ${endpointSnippet.snippet.type}`
                );
            }
            if (snippets[endpointSnippet.id.identifierOverride] != null) {
                continue;
            }
            snippets[endpointSnippet.id.identifierOverride] = endpointSnippet.snippet.client;
        }
        return snippets;
    }

    private getSnippetForEndpointId(endpointId: FernIr.EndpointId): string {
        const snippet = this.prerenderedSnippetsByEndpointId[endpointId];
        if (snippet == null) {
            throw GeneratorError.internalError(`Internal error; missing snippet for endpoint ${endpointId}`);
        }
        return snippet;
    }

    private getEndpointsForFeature(featureId: FernIr.FeatureId): EndpointWithFilepath[] {
        const endpointIds = this.getConfiguredEndpointIdsForFeature(featureId) ?? [this.defaultEndpointId];
        return endpointIds.map(this.lookupEndpointById.bind(this));
    }

    private getConfiguredEndpointIdsForFeature(featureId: FernIr.FeatureId): FernIr.EndpointId[] | undefined {
        return this.context.ir.readmeConfig?.features?.[this.getFeatureKey(featureId)];
    }

    private lookupEndpointById(endpointId: FernIr.EndpointId): EndpointWithFilepath {
        const endpoint = this.endpointsById[endpointId];
        if (endpoint == null) {
            throw GeneratorError.internalError(`Internal error; missing endpoint ${endpointId}`);
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

    private getAccessFromRootClient(fernFilepath: FernIr.FernFilepath): string {
        const clientAccessParts = fernFilepath.allParts.map((part) => this.case.snakeSafe(part));
        return clientAccessParts.length > 0
            ? `${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME}.${clientAccessParts.join(".")}`
            : ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME;
    }

    private getEndpointMethodName(endpoint: FernIr.HttpEndpoint): string {
        return this.case.snakeSafe(endpoint.name);
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

        return `${this.rootPackageClientName}::Environment::${this.case.screamingSnakeSafe(defaultEnvironment.name)}`;
    }

    private getRootPackageClientName(): string {
        return this.context.getRootFolderName();
    }

    private getAuthPlaceholder(): string {
        for (const scheme of this.context.ir.auth.schemes) {
            switch (scheme.type) {
                case "bearer":
                    if (scheme.tokenPlaceholder != null) {
                        return scheme.tokenPlaceholder;
                    }
                    break;
                case "basic":
                    if (scheme.usernamePlaceholder != null) {
                        return scheme.usernamePlaceholder;
                    }
                    break;
                case "header":
                    if (scheme.headerPlaceholder != null) {
                        return scheme.headerPlaceholder;
                    }
                    break;
                case "oauth":
                case "inferred":
                    break;
                default:
                    assertNever(scheme);
            }
        }
        return ReadmeSnippetBuilder.DEFAULT_AUTH_PLACEHOLDER;
    }

    private writeCode(s: string): string {
        return s.trim() + "\n";
    }
}
