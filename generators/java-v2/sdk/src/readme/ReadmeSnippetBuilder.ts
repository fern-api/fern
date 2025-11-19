import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";
import { java } from "@fern-api/java-ast";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { EndpointId, FeatureId, FernFilepath, HttpEndpoint, WebSocketChannel } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

interface EndpointWithFilepath {
    endpoint: HttpEndpoint;
    fernFilepath: FernFilepath;
}

export class ReadmeSnippetBuilder extends AbstractReadmeSnippetBuilder {
    private static CLIENT_VARIABLE_NAME = "client";
    private static ENVIRONMENTS_FEATURE_ID: FernGeneratorCli.FeatureId = "ENVIRONMENTS";
    private static EXCEPTION_HANDLING_FEATURE_ID: FernGeneratorCli.FeatureId = "EXCEPTION_HANDLING";
    private static BASE_URL_FEATURE_ID: FernGeneratorCli.FeatureId = "BASE_URL";
    private static CUSTOM_HEADERS_FEATURE_ID: FernGeneratorCli.FeatureId = "CUSTOM_HEADERS";
    private static RAW_RESPONSE_FEATURE_ID: FernGeneratorCli.FeatureId = "ACCESS_RAW_RESPONSE_DATA";
    private static WEBSOCKET_FEATURE_ID: FernGeneratorCli.FeatureId = "WEBSOCKET";
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
        this.defaultEndpointId = this.getDefaultEndpointIdWithMaybeEmptySnippets(endpointSnippets);
        this.rootPackageClientName = this.getRootPackageClientName();
    }

    public buildReadmeSnippetsByFeatureId(): Record<FernGeneratorCli.FeatureId, string[]> {
        const prerenderedSnippetsConfig: Record<
            FernGeneratorCli.FeatureId,
            {
                backupRenderer: (endpoint: EndpointWithFilepath) => string;
                predicate?: (endpoint: EndpointWithFilepath) => boolean;
            }
        > = {
            [FernGeneratorCli.StructuredFeatureId.Usage]: {
                backupRenderer: this.renderUsageSnippet.bind(this)
            }
        };

        const templatedSnippetsConfig: Record<
            FernGeneratorCli.FeatureId,
            {
                renderer: (endpoint: EndpointWithFilepath) => string;
                predicate?: (endpoint: EndpointWithFilepath) => boolean;
            }
        > = {
            [ReadmeSnippetBuilder.ENVIRONMENTS_FEATURE_ID]: {
                renderer: this.renderEnvironmentsSnippet.bind(this),
                predicate: (_endpoint: EndpointWithFilepath) => this.getDefaultEnvironmentId() != null
            },
            [ReadmeSnippetBuilder.BASE_URL_FEATURE_ID]: {
                renderer: this.renderBaseUrlSnippet.bind(this)
            },
            [ReadmeSnippetBuilder.EXCEPTION_HANDLING_FEATURE_ID]: {
                renderer: this.renderExceptionHandlingSnippet.bind(this)
            },
            [FernGeneratorCli.StructuredFeatureId.CustomClient]: {
                renderer: this.renderCustomClientSnippet.bind(this)
            },
            [FernGeneratorCli.StructuredFeatureId.Retries]: { renderer: this.renderRetriesSnippet.bind(this) },
            [FernGeneratorCli.StructuredFeatureId.Timeouts]: { renderer: this.renderTimeoutsSnippet.bind(this) },
            [ReadmeSnippetBuilder.CUSTOM_HEADERS_FEATURE_ID]: { renderer: this.renderCustomHeadersSnippet.bind(this) },
            [ReadmeSnippetBuilder.RAW_RESPONSE_FEATURE_ID]: { renderer: this.renderRawResponseSnippet.bind(this) },
            [ReadmeSnippetBuilder.WEBSOCKET_FEATURE_ID]: {
                renderer: this.renderWebSocketSnippet.bind(this),
                predicate: (_endpoint: EndpointWithFilepath) => this.hasWebSocketChannels()
            },
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

        for (const [featureId, { predicate, backupRenderer }] of Object.entries(prerenderedSnippetsConfig)) {
            snippetsByFeatureId[featureId] = this.getPrerenderedSnippetsForFeature(
                featureId,
                predicate,
                backupRenderer
            );
        }

        for (const [featureId, { renderer, predicate }] of Object.entries(templatedSnippetsConfig)) {
            // Special case for WebSocket feature: render even without HTTP endpoints
            if (featureId === ReadmeSnippetBuilder.WEBSOCKET_FEATURE_ID && this.hasWebSocketChannels()) {
                const snippet = this.renderWebSocketSnippet({} as EndpointWithFilepath);
                if (snippet) {
                    snippetsByFeatureId[featureId] = [snippet];
                }
            } else {
                snippetsByFeatureId[featureId] = this.renderSnippetsTemplateForFeature(featureId, renderer, predicate);
            }
        }

        return snippetsByFeatureId;
    }

    public buildReadmeAddendumsByFeatureId(): Record<FernGeneratorCli.FeatureId, string> {
        const addendumsByFeatureId: Record<FernGeneratorCli.FeatureId, string> = {};

        // Check if collapse-optional-nullable flag is enabled
        const customConfig = this.context.customConfig;
        if (customConfig != null && customConfig["collapse-optional-nullable"] === true) {
            // Add OptionalNullable documentation to Usage section
            addendumsByFeatureId[FernGeneratorCli.StructuredFeatureId.Usage] = this.getOptionalNullableDocumentation();
        }

        // Check if any endpoints use custom pagination
        const hasCustomPagination = Object.values(this.context.ir.services).some((service) =>
            service.endpoints.some((endpoint) => endpoint.pagination?.type === "custom")
        );

        if (hasCustomPagination) {
            const customPagerName = customConfig?.["custom-pager-name"] ?? "CustomPager";
            // Add custom pagination documentation as an addendum to the Pagination feature
            addendumsByFeatureId[FernGeneratorCli.StructuredFeatureId.Pagination] =
                this.getCustomPaginationDocumentation(customPagerName);
        }

        return addendumsByFeatureId;
    }

    private getCustomPaginationDocumentation(customPagerName: string): string {
        return `## Custom Pagination Implementation

The SDK uses a custom bidirectional pagination implementation via the \`${customPagerName}\` class. This class is a skeleton implementation that you must complete based on your API's specific pagination structure (e.g., HATEOAS links).

### Implementation Steps

1. **Locate the skeleton class**: Find \`core/pagination/${customPagerName}.java\`
2. **Implement required methods**: Replace the \`UnsupportedOperationException\` with your logic
3. **Add to .fernignore**: Ensure the file is listed in \`.fernignore\` to preserve your changes

### Example Implementation

\`\`\`java
public class ${customPagerName}<T> implements BiDirectionalPage<T>, Iterable<T> {
    private final List<T> items;
    private final String nextUrl;
    private final String previousUrl;
    private final OkHttpClient client;

    @Override
    public boolean hasNext() {
        return nextUrl != null;
    }

    @Override
    public ${customPagerName}<T> nextPage() throws IOException {
        if (!hasNext()) {
            throw new NoSuchElementException("No next page available");
        }
        // Make HTTP request to nextUrl
        // Parse response and return new ${customPagerName} instance
    }

    @Override
    public List<T> getItems() {
        return items;
    }

    // ... implement other required methods
}
\`\`\`

### Usage

Once implemented, the custom pager provides bidirectional navigation:

\`\`\`java
${customPagerName}<Item> page = client.listItems();

// Navigate forward
while (page.hasNext()) {
    for (Item item : page.getItems()) {
        // Process item
    }
    page = page.nextPage();
}

// Navigate backward
if (page.hasPrevious()) {
    page = page.previousPage();
}
\`\`\``;
    }

    private getOptionalNullableDocumentation(): string {
        return `## OptionalNullable for PATCH Requests

For PATCH requests, the SDK uses \`OptionalNullable<T>\` to handle three-state nullable semantics:

- **ABSENT**: Field not provided (omitted from JSON)
- **NULL**: Field explicitly set to null (included as \`null\` in JSON)
- **PRESENT**: Field has a non-null value

\`\`\`java
import com.seed.api.core.OptionalNullable;

UpdateRequest request = UpdateRequest.builder()
    .fieldName(OptionalNullable.absent())    // Skip field
    .anotherField(OptionalNullable.ofNull()) // Clear field
    .yetAnotherField(OptionalNullable.of("value")) // Set value
    .build();
\`\`\`

### Important Notes

- **Required fields**: For required fields, you cannot use \`absent()\`. Required fields must always be present with either a non-null value or explicitly set to null using \`ofNull()\`.
- **Type safety**: \`OptionalNullable<T>\` is not fully type-safe since all three states use the same type, but it provides a cleaner API than nested \`Optional<Optional<T>>\` for handling three-state nullable semantics.`;
    }

    private getPrerenderedSnippetsForFeature(
        featureId: FernGeneratorCli.FeatureId,
        predicate: (endpoint: EndpointWithFilepath) => boolean = () => true,
        backupRenderer: (endpoint: EndpointWithFilepath) => string
    ): string[] {
        return this.getEndpointsForFeature(featureId)
            .filter(predicate)
            .map((endpoint) => {
                const prerendered = this.prerenderedSnippetsByEndpointId[endpoint.endpoint.id];
                return prerendered ?? backupRenderer(endpoint);
            });
    }

    private renderSnippetsTemplateForFeature(
        featureId: FernGeneratorCli.FeatureId,
        templateRenderer: (endpoint: EndpointWithFilepath) => string,
        predicate: (endpoint: EndpointWithFilepath) => boolean = () => true
    ): string[] {
        return this.getEndpointsForFeature(featureId).filter(predicate).map(templateRenderer);
    }

    private renderUsageSnippet(endpoint: EndpointWithFilepath): string {
        const clientClassReference = this.context.getRootClientClassReference();
        const endpointMethodInvocation = this.getMethodCall(endpoint, [ReadmeSnippetBuilder.ELLIPSES]);

        const builderParameters: Array<{ name: string; value: java.TypeLiteral }> = [];
        if (this.context.ir.variables != null && this.context.ir.variables.length > 0) {
            for (const variable of this.context.ir.variables) {
                const variableName = variable.name.camelCase.unsafeName;
                builderParameters.push({
                    name: variableName,
                    value: java.TypeLiteral.string(`YOUR_${variable.name.screamingSnakeCase.unsafeName}`)
                });
            }
        }

        const clientBuilder = java.TypeLiteral.builder({
            classReference: clientClassReference,
            parameters: builderParameters
        });

        const snippet = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(" client = ");
            writer.writeNodeStatement(clientBuilder);
            writer.newLine();
            writer.writeNodeStatement(endpointMethodInvocation);
        });

        return snippet.toString({
            packageName: ReadmeSnippetBuilder.SNIPPET_PACKAGE_NAME,
            customConfig: this.context.customConfig
        });
    }

    private renderEnvironmentsSnippet(_endpoint: EndpointWithFilepath): string {
        const clientClassReference = this.context.getRootClientClassReference();
        const defaultEnvironmentId = this.getDefaultEnvironmentId();
        // This should never happen because the precondition prevents this code from running
        // if we don't have a default environment ID, but we need this check for the linter.
        if (defaultEnvironmentId == null) {
            throw new Error("Could not get default environment ID for README snippet");
        }

        const productionEnvironment = java.codeblock((writer) => {
            writer.writeNode(this.context.getEnvironmentClassReference());
            writer.write(".");
            writer.write(defaultEnvironmentId);
        });

        const clientInitialization = java.TypeLiteral.builder({
            classReference: clientClassReference,
            parameters: [
                {
                    name: "environment",
                    value: java.TypeLiteral.raw(productionEnvironment)
                }
            ]
        });

        const withEnvironment = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(` ${this.rootPackageClientName} = `);
            writer.writeNode(clientInitialization);
        });

        const snippet = java.codeblock((writer) => {
            writer.writeNodeStatement(withEnvironment);
        });

        return this.renderSnippet(snippet);
    }

    private renderBaseUrlSnippet(_endpoint: EndpointWithFilepath): string {
        const clientClassReference = this.context.getRootClientClassReference();

        const baseUrl = java.codeblock('"https://example.com"');
        const clientInitialization = java.TypeLiteral.builder({
            classReference: clientClassReference,
            parameters: [
                {
                    name: "url",
                    value: java.TypeLiteral.raw(baseUrl)
                }
            ]
        });

        const withCustomUrl = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(` ${this.rootPackageClientName} = `);
            writer.writeNode(clientInitialization);
        });

        const snippet = java.codeblock((writer) => {
            writer.writeNodeStatement(withCustomUrl);
        });

        return this.renderSnippet(snippet);
    }

    private renderExceptionHandlingSnippet(endpoint: EndpointWithFilepath): string {
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

        return this.renderSnippet(snippet);
    }

    private renderCustomClientSnippet(_endpoint: EndpointWithFilepath): string {
        const okHttpClientClassReference = this.context.getOkHttpClientClassReference();
        const okHttpClientAssignment = java.codeblock((writer) => {
            writer.writeNode(okHttpClientClassReference);
            writer.write(" customClient = ...");
        });

        const clientClassReference = this.context.getRootClientClassReference();

        const clientInitialization = java.TypeLiteral.builder({
            classReference: clientClassReference,
            parameters: [
                {
                    name: "httpClient",
                    value: java.TypeLiteral.raw(java.codeblock("customClient"))
                }
            ]
        });

        const clientWithCustomClient = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(` ${this.rootPackageClientName} = `);
            writer.writeNode(clientInitialization);
        });

        const snippet = java.codeblock((writer) => {
            writer.writeNodeStatement(okHttpClientAssignment);
            writer.newLine();
            writer.writeNodeStatement(clientWithCustomClient);
        });

        return this.renderSnippet(snippet);
    }

    private renderRetriesSnippet(endpoint: EndpointWithFilepath): string {
        const clientClassReference = this.context.getRootClientClassReference();

        const clientInitialization = java.TypeLiteral.builder({
            classReference: clientClassReference,
            parameters: [
                {
                    name: "maxRetries",
                    value: java.TypeLiteral.raw(java.codeblock("1"))
                }
            ]
        });

        const clientWithRetries = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(` ${this.rootPackageClientName} = `);
            writer.writeNodeStatement(clientInitialization);
        });

        return this.renderSnippet(clientWithRetries);
    }

    private renderTimeoutsSnippet(endpoint: EndpointWithFilepath): string {
        const requestOptionsClassReference = this.context.getRequestOptionsClassReference();
        const requestOptionsInitialization = java.TypeLiteral.builder({
            classReference: requestOptionsClassReference,
            parameters: [
                {
                    name: "timeout",
                    value: java.TypeLiteral.raw(java.codeblock("10"))
                }
            ]
        });

        const endpointMethodInvocation = this.getMethodCall(endpoint, [
            ReadmeSnippetBuilder.ELLIPSES,
            requestOptionsInitialization
        ]);

        const clientClassReference = this.context.getRootClientClassReference();
        const clientInitialization = java.TypeLiteral.builder({
            classReference: clientClassReference,
            parameters: [
                {
                    name: "timeout",
                    value: java.TypeLiteral.raw(java.codeblock("10"))
                }
            ]
        });

        const clientWithTimeout = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(` ${this.rootPackageClientName} = `);
            writer.writeNode(clientInitialization);
        });

        const snippet = java.codeblock((writer) => {
            writer.writeLine("// Client level");
            writer.writeNodeStatement(clientWithTimeout);
            writer.newLine();
            writer.writeLine("// Request level");
            writer.writeNodeStatement(endpointMethodInvocation);
        });

        return this.renderSnippet(snippet);
    }

    private renderCustomHeadersSnippet(endpoint: EndpointWithFilepath): string {
        const clientClassReference = this.context.getRootClientClassReference();

        const clientInitialization = java.TypeLiteral.builder({
            classReference: clientClassReference,
            parameters: [
                {
                    name: "addHeader",
                    value: java.TypeLiteral.raw(java.codeblock('"X-Custom-Header", "custom-value"'))
                },
                {
                    name: "addHeader",
                    value: java.TypeLiteral.raw(java.codeblock('"X-Request-Id", "abc-123"'))
                }
            ]
        });

        const clientWithHeaders = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(` ${this.rootPackageClientName} = `);
            writer.writeNodeStatement(clientInitialization);
        });

        const requestOptionsClassReference = this.context.getRequestOptionsClassReference();
        const requestOptionsInitialization = java.TypeLiteral.builder({
            classReference: requestOptionsClassReference,
            parameters: [
                {
                    name: "addHeader",
                    value: java.TypeLiteral.raw(java.codeblock('"X-Request-Header", "request-value"'))
                }
            ]
        });

        const endpointMethodInvocation = this.getMethodCall(endpoint, [
            ReadmeSnippetBuilder.ELLIPSES,
            requestOptionsInitialization
        ]);

        const snippet = java.codeblock((writer) => {
            writer.writeLine("// Client level");
            writer.writeNodeStatement(clientWithHeaders);
            writer.newLine();
            writer.writeLine("// Request level");
            writer.writeNodeStatement(endpointMethodInvocation);
        });

        return this.renderSnippet(snippet);
    }

    private renderRawResponseSnippet(endpoint: EndpointWithFilepath): string {
        // Get the endpoint method call with withRawResponse()
        const clientAccess = this.getAccessFromRootClient(endpoint.fernFilepath);
        const withRawResponseCall = java.invokeMethod({
            on: clientAccess,
            method: "withRawResponse",
            arguments_: []
        });

        const endpointMethodCall = java.invokeMethod({
            on: withRawResponseCall,
            method: this.getEndpointMethodName(endpoint.endpoint),
            arguments_: [ReadmeSnippetBuilder.ELLIPSES]
        });

        // Get the endpoint name for the response type
        const endpointMethodName = this.getEndpointMethodName(endpoint.endpoint);
        const responseTypeName = this.capitalizeFirstLetter(endpointMethodName) + "HttpResponse";

        const snippet = java.codeblock((writer) => {
            writer.write(responseTypeName);
            writer.write(" response = ");
            writer.writeNodeStatement(endpointMethodCall);
            writer.newLine();
            writer.writeLine("System.out.println(response.body());");
            writer.writeLine('System.out.println(response.headers().get("X-My-Header"));');
        });

        return this.renderSnippet(snippet);
    }

    private renderPaginationSnippet(endpoint: EndpointWithFilepath): string {
        const clientClassReference = this.context.getRootClientClassReference();
        const clientInitialization = java.TypeLiteral.builder({
            classReference: clientClassReference,
            parameters: []
        });

        const returnTypeClassReference = this.context.getReturnTypeForEndpoint(endpoint.endpoint);

        // Check if this is custom pagination
        const isCustomPagination = endpoint.endpoint.pagination?.type === "custom";

        if (isCustomPagination) {
            // For custom pagination, provide a different example
            const customPagerClassName = this.context.customConfig?.["custom-pager-name"] ?? "CustomPager";
            const endpointMethodCall = this.getMethodCall(endpoint, [ReadmeSnippetBuilder.ELLIPSES]);

            const snippet = java.codeblock((writer) => {
                writer.writeNode(clientClassReference);
                writer.write(` ${this.getRootPackageClientName()} = `);
                writer.writeNodeStatement(clientInitialization);
                writer.newLine();
                writer.write(`${customPagerClassName}<?> response = `);
                writer.writeNodeStatement(endpointMethodCall);
                writer.newLine();
                writer.writeLine("// Iterate through pages using bidirectional navigation");
                writer.writeLine("while (response.hasNext()) {");
                writer.indent();
                writer.writeLine("for (var item : response.getItems()) {");
                writer.indent();
                writer.writeLine("// Process each item");
                writer.dedent();
                writer.writeLine("}");
                writer.writeLine("response = response.nextPage();");
                writer.dedent();
                writer.writeLine("}");
                writer.newLine();
                writer.writeLine("// Navigate to previous page");
                writer.writeLine("if (response.hasPrevious()) {");
                writer.indent();
                writer.writeLine("response = response.previousPage();");
                writer.dedent();
                writer.writeLine("}");
                writer.newLine();
                writer.writeLine("// Access the full response for metadata");
                writer.writeLine("response.getResponse().ifPresent(fullResponse -> {");
                writer.indent();
                writer.writeLine("// Access custom pagination metadata from the response");
                writer.dedent();
                writer.writeLine("});");
            });

            return this.renderSnippet(snippet);
        }

        // Standard pagination (cursor/offset)
        const paginationClassReference = java.Type.generic(this.context.getPaginationClassReference(), [
            returnTypeClassReference
        ]);

        const endpointMethodCall = this.getMethodCall(endpoint, [ReadmeSnippetBuilder.ELLIPSES]);

        const streamItemsMethodCall = java.invokeMethod({
            on: java.codeblock("response"),
            method: "streamItems",
            arguments_: []
        });

        const mapMethodCall = java.invokeMethod({
            on: streamItemsMethodCall,
            method: "map",
            arguments_: [java.codeblock("item -> ...")]
        });

        const manualPaginationSnippet = java.codeblock((writer) => {
            writer.writeLine("for (");
            writer.indent();
            writer.indent();
            writer.writeNode(java.Type.list(returnTypeClassReference));
            writer.writeTextStatement(" items = response.getItems");
            writer.writeTextStatement("response.hasNext()");
            writer.write("items = items.nextPage().getItems()");
            writer.writeLine(") {");
            writer.dedent();
            writer.writeLine("// Do something with items");
            writer.dedent();
            writer.writeLine("}");
        });

        const cursorAccessSnippet = java.codeblock((writer) => {
            writer.writeLine("response.getResponse().ifPresent(r -> {");
            writer.indent();
            writer.writeLine("String cursor = r.getNext();");
            writer.writeLine("// Use cursor for stateless pagination");
            writer.dedent();
            writer.writeLine("});");
        });

        const snippet = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(` ${this.getRootPackageClientName()} = `);
            writer.writeNodeStatement(clientInitialization);
            writer.newLine();
            writer.writeNode(paginationClassReference);
            writer.write(" response = ");
            writer.writeNodeStatement(endpointMethodCall);
            writer.newLine();
            writer.writeLine("// Iterator");
            writer.controlFlow("for", java.codeblock("item : response"));
            writer.writeLine("// Do something with item");
            writer.endControlFlow();
            writer.newLine();
            writer.writeLine("// Streaming");
            writer.writeNodeStatement(mapMethodCall);
            writer.newLine();
            writer.writeLine("// Manual pagination");
            writer.writeNode(manualPaginationSnippet);
            writer.newLine();
            writer.writeLine("// Access pagination metadata");
            writer.writeNode(cursorAccessSnippet);
        });

        return this.renderSnippet(snippet);
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
        const exampleStyle = this.context.ir.readmeConfig?.exampleStyle;

        const snippetsByEndpointId: Record<EndpointId, FernGeneratorExec.Endpoint[]> = {};

        for (const endpointSnippet of Object.values(endpointSnippets)) {
            if (endpointSnippet.id.identifierOverride == null) {
                throw new Error("Internal error; snippets must define the endpoint id to generate README.md");
            }
            if (endpointSnippet.snippet.type !== "java") {
                throw new Error(`Internal error; expected java snippet but got: ${endpointSnippet.snippet.type}`);
            }

            const endpointId = endpointSnippet.id.identifierOverride;
            if (!snippetsByEndpointId[endpointId]) {
                snippetsByEndpointId[endpointId] = [];
            }
            snippetsByEndpointId[endpointId].push(endpointSnippet);
        }

        for (const [endpointId, endpointSnippetList] of Object.entries(snippetsByEndpointId)) {
            let selectedSnippet: FernGeneratorExec.Endpoint;

            if (exampleStyle === "minimal") {
                selectedSnippet = endpointSnippetList.reduce((best, current) => {
                    const currentIsMinimal =
                        current.exampleIdentifier?.toLowerCase().includes("minimal") ||
                        current.exampleIdentifier?.toLowerCase().includes("required");
                    const bestIsMinimal =
                        best.exampleIdentifier?.toLowerCase().includes("minimal") ||
                        best.exampleIdentifier?.toLowerCase().includes("required");

                    if (currentIsMinimal && !bestIsMinimal) {
                        return current;
                    }
                    if (bestIsMinimal && !currentIsMinimal) {
                        return best;
                    }

                    if (current.snippet.type === "java" && best.snippet.type === "java") {
                        const currentLength = current.snippet.syncClient.length;
                        const bestLength = best.snippet.syncClient.length;
                        return currentLength < bestLength ? current : best;
                    }
                    return best;
                });
            } else {
                selectedSnippet = endpointSnippetList.reduce((best, current) => {
                    if (current.snippet.type === "java" && best.snippet.type === "java") {
                        const currentLength = current.snippet.syncClient.length;
                        const bestLength = best.snippet.syncClient.length;
                        return currentLength > bestLength ? current : best;
                    }
                    return best;
                });
            }

            if (selectedSnippet.snippet.type !== "java") {
                throw new Error(`Internal error; expected java snippet but got: ${selectedSnippet.snippet.type}`);
            }
            let snippet = selectedSnippet.snippet.syncClient;

            if (exampleStyle === "minimal") {
                snippet = this.filterOptionalParametersFromSnippet(snippet, endpointId);
            }

            snippets[endpointId] = snippet;
        }
        return snippets;
    }

    private filterOptionalParametersFromSnippet(snippet: string, endpointId: string): string {
        const endpoint = this.endpointsById[endpointId];
        if (!endpoint?.endpoint.requestBody) {
            return snippet;
        }

        const requestBody = endpoint.endpoint.requestBody;
        const optionalFieldNames = new Set<string>();

        if (requestBody.type === "reference") {
            const requestBodyRef = requestBody;
            if (requestBodyRef.requestBodyType.type === "named") {
                const typeId = requestBodyRef.requestBodyType.typeId;
                for (const type of Object.values(this.context.ir.types)) {
                    if (type.name.typeId === typeId && type.shape.type === "object") {
                        for (const property of type.shape.properties) {
                            const valueType = property.valueType;
                            if (
                                valueType.type === "container" &&
                                (valueType.container.type === "optional" || valueType.container.type === "nullable")
                            ) {
                                const fieldName = property.name.name.camelCase.unsafeName;
                                optionalFieldNames.add(fieldName);
                            }
                        }
                    }
                }
            }
        }

        if (optionalFieldNames.size === 0) {
            return snippet;
        }

        const lines = snippet.split("\n");
        const filteredLines: string[] = [];

        for (const line of lines) {
            let shouldInclude = true;
            for (const optionalField of optionalFieldNames) {
                const methodPattern = new RegExp(`\\.${optionalField}\\s*\\(`);
                if (methodPattern.test(line)) {
                    shouldInclude = false;
                    break;
                }
            }

            if (shouldInclude) {
                filteredLines.push(line);
            }
        }

        return filteredLines.join("\n");
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

    private getDefaultEnvironmentId(): string | undefined {
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

    private getDefaultEndpointIdWithMaybeEmptySnippets(endpointSnippets: FernGeneratorExec.Endpoint[]): EndpointId {
        if (endpointSnippets.length > 0) {
            return this.context.ir.readmeConfig?.defaultEndpoint != null
                ? this.context.ir.readmeConfig.defaultEndpoint
                : this.getDefaultEndpointId();
        }

        const dynamicIr = this.context.ir.dynamic;

        if (dynamicIr == null) {
            throw new Error("Cannot generate README without dynamic IR");
        }

        const endpoints = Object.entries(dynamicIr.endpoints);

        if (endpoints.length == 0) {
            throw new Error("Cannot generate README without endpoints.");
        }

        // Prefer endpoints with a request body.
        const endpointsWithReferencedRequestBody = endpoints.filter((entry) => {
            const [_id, endpoint] = entry;

            if (endpoint.request.body == null) {
                return false;
            }

            return endpoint.request.body.type === "referenced";
        });

        if (endpointsWithReferencedRequestBody.length > 0 && endpointsWithReferencedRequestBody[0] != null) {
            // Return the EndpointId of the first Endpoint
            return endpointsWithReferencedRequestBody[0][0];
        }

        // Need this check for the linter
        if (endpoints[0] == null) {
            throw new Error("Cannot generate README with null endpoint.");
        }

        return endpoints[0][0];
    }

    /**
     * renders a snippet, skipping the package statement
     */
    private renderSnippet(snippet: java.AstNode): string {
        const asString = snippet.toString({
            packageName: ReadmeSnippetBuilder.SNIPPET_PACKAGE_NAME,
            customConfig: this.context.customConfig
        });
        if (asString.split("\n").length < 3) {
            return asString;
        } else {
            return asString.split("\n").slice(2).join("\n");
        }
    }

    private capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    private hasWebSocketChannels(): boolean {
        return this.context.ir.websocketChannels != null && Object.keys(this.context.ir.websocketChannels).length > 0;
    }

    private renderWebSocketSnippet(_endpoint: EndpointWithFilepath): string {
        // Find first WebSocket channel by checking subpackages and root package
        let channel: WebSocketChannel | null = null;
        let fernFilepath: FernFilepath | null = null;

        // Check root package first
        if (this.context.ir.rootPackage.websocket != null && this.context.ir.websocketChannels != null) {
            const foundChannel = this.context.ir.websocketChannels[this.context.ir.rootPackage.websocket];
            if (foundChannel) {
                channel = foundChannel;
                fernFilepath = this.context.ir.rootPackage.fernFilepath;
            }
        }

        // If not found, check subpackages
        if (!channel && this.context.ir.subpackages) {
            for (const subpackage of Object.values(this.context.ir.subpackages)) {
                if (subpackage.websocket != null && this.context.ir.websocketChannels != null) {
                    const foundChannel = this.context.ir.websocketChannels[subpackage.websocket];
                    if (foundChannel) {
                        channel = foundChannel;
                        fernFilepath = subpackage.fernFilepath;
                        break;
                    }
                }
            }
        }

        if (!channel || !fernFilepath) {
            return "";
        }

        // Get access path to WebSocket client from root client
        const clientAccessParts = fernFilepath.allParts.map(
            (part: { camelCase: { safeName: string } }) => part.camelCase.safeName + "()"
        );
        const wsClientAccess =
            clientAccessParts.length > 0
                ? `${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME}.${clientAccessParts.join(".")}`
                : ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME;

        // Build client initialization with auth if needed
        const clientClassReference = this.context.getRootClientClassReference();
        const builderParameters: Array<{ name: string; value: java.TypeLiteral }> = [];

        // Add auth parameters if auth is configured
        if (this.context.ir.auth.schemes.length > 0) {
            const authScheme = this.context.ir.auth.schemes[0];
            if (authScheme?.type === "bearer") {
                const tokenName = authScheme.token?.camelCase?.unsafeName ?? "token";
                builderParameters.push({
                    name: tokenName,
                    value: java.TypeLiteral.string("<token>")
                });
            } else if (authScheme?.type === "basic") {
                builderParameters.push({
                    name: "username",
                    value: java.TypeLiteral.string("<username>")
                });
                builderParameters.push({
                    name: "password",
                    value: java.TypeLiteral.string("<password>")
                });
            } else if (authScheme?.type === "header") {
                const headerName = authScheme.name.name?.camelCase?.unsafeName ?? "apiKey";
                builderParameters.push({
                    name: headerName,
                    value: java.TypeLiteral.string("<api-key>")
                });
            }
        }

        // Add environment variables if any
        if (this.context.ir.variables != null && this.context.ir.variables.length > 0) {
            for (const variable of this.context.ir.variables) {
                const variableName = variable.name.camelCase.unsafeName;
                builderParameters.push({
                    name: variableName,
                    value: java.TypeLiteral.string(`YOUR_${variable.name.screamingSnakeCase.unsafeName}`)
                });
            }
        }

        const clientBuilder = java.TypeLiteral.builder({
            classReference: clientClassReference,
            parameters: builderParameters
        });

        // Find first send and receive messages from examples if available
        let firstSendMessageName: string | undefined;
        let firstReceiveMessageName: string | undefined;

        // Use IR examples if available (prefer user-specified, fallback to autogenerated)
        const examples =
            channel.examples.length > 0
                ? channel.examples
                : channel.v2Examples?.userSpecifiedExamples
                  ? Object.values(channel.v2Examples.userSpecifiedExamples)
                  : channel.v2Examples?.autogeneratedExamples
                    ? Object.values(channel.v2Examples.autogeneratedExamples)
                    : [];

        if (examples.length > 0 && examples[0]) {
            const exampleMessages = examples[0].messages;
            if (exampleMessages) {
                for (const message of exampleMessages) {
                    const messageId = message.type;
                    const messageDefinition = channel.messages.find((m) => m.type === messageId);
                    if (messageDefinition) {
                        if (messageDefinition.origin === "client" && !firstSendMessageName) {
                            firstSendMessageName = this.capitalizeFirstLetter(
                                messageDefinition.displayName || messageId
                            );
                        } else if (messageDefinition.origin === "server" && !firstReceiveMessageName) {
                            firstReceiveMessageName = this.capitalizeFirstLetter(
                                messageDefinition.displayName || messageId
                            );
                        }
                    }
                    if (firstSendMessageName && firstReceiveMessageName) {
                        break;
                    }
                }
            }
        }

        // Fallback: scan all messages if examples don't have both types
        if (!firstSendMessageName || !firstReceiveMessageName) {
            for (const message of channel.messages) {
                if (message.origin === "client" && !firstSendMessageName) {
                    firstSendMessageName = this.capitalizeFirstLetter(message.displayName || message.type);
                } else if (message.origin === "server" && !firstReceiveMessageName) {
                    firstReceiveMessageName = this.capitalizeFirstLetter(message.displayName || message.type);
                }
                if (firstSendMessageName && firstReceiveMessageName) {
                    break;
                }
            }
        }

        const snippet = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(" client = ");
            writer.writeNodeStatement(clientBuilder);
            writer.newLine();
            writer.writeLine("// Connect to the WebSocket");
            writer.writeLine(`var ws = ${wsClientAccess};`);
            writer.writeLine("ws.connect().join();");
            writer.newLine();

            if (firstReceiveMessageName) {
                writer.writeLine("// Register message handlers to receive server messages");
                writer.writeLine(`ws.on${firstReceiveMessageName}(message -> {`);
                writer.indent();
                writer.writeLine('System.out.println("Received: " + message);');
                writer.dedent();
                writer.writeLine("});");
                writer.newLine();
            }

            if (firstSendMessageName) {
                writer.writeLine("// Send messages to the server");
                writer.writeNodeStatement(
                    java.invokeMethod({
                        on: java.codeblock("ws"),
                        method: `send${firstSendMessageName}`,
                        arguments_: [ReadmeSnippetBuilder.ELLIPSES]
                    })
                );
                writer.newLine();
            }

            writer.writeLine("// Close the connection when done");
            writer.writeLine("ws.disconnect();");
        });

        return this.renderSnippet(snippet);
    }
}
