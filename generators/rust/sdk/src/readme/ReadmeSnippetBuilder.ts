import { AbstractReadmeSnippetBuilder, GeneratorError } from "@fern-api/base-generator";
import { isNonNullish } from "@fern-api/core-utils";
import { CodeBlock, Expression, rust, Statement, UseStatement, Writer } from "@fern-api/rust-codegen";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

interface EndpointWithFilepath {
    endpoint: FernIr.HttpEndpoint;
    fernFilepath: FernIr.FernFilepath;
}

export class ReadmeSnippetBuilder extends AbstractReadmeSnippetBuilder {
    private static CLIENT_VARIABLE_NAME = "client";
    private static ERRORS_FEATURE_ID: FernGeneratorCli.FeatureId = "ERRORS";
    private static REQUEST_TYPES_FEATURE_ID: FernGeneratorCli.FeatureId = "REQUEST_TYPES";
    private static PAGINATION_FEATURE_ID: FernGeneratorCli.FeatureId = "PAGINATION";
    private static ADDITIONAL_HEADERS_FEATURE_ID: FernGeneratorCli.FeatureId = "ADDITIONAL_HEADERS";
    private static ADDITIONAL_QUERY_STRING_PARAMETERS_FEATURE_ID: FernGeneratorCli.FeatureId =
        "ADDITIONAL_QUERY_STRING_PARAMETERS";
    private static WEBSOCKETS_FEATURE_ID: FernGeneratorCli.FeatureId = "WEBSOCKETS";
    private static ENVIRONMENTS_FEATURE_ID: FernGeneratorCli.FeatureId = "ENVIRONMENTS";

    private readonly context: SdkGeneratorContext;
    private readonly endpointsById: Record<FernIr.EndpointId, EndpointWithFilepath> = {};
    private readonly prerenderedSnippetsByEndpointId: Record<FernIr.EndpointId, string> = {};
    private readonly defaultEndpointId: FernIr.EndpointId | undefined;
    private readonly crateName: string;

    constructor({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: FernGeneratorExec.Endpoint[];
    }) {
        super({ endpointSnippets });
        this.context = context;

        this.endpointsById = this.buildEndpointsById();
        this.prerenderedSnippetsByEndpointId = this.buildPrerenderedSnippetsByEndpointId(endpointSnippets);
        this.defaultEndpointId =
            this.context.ir.readmeConfig?.defaultEndpoint != null
                ? this.context.ir.readmeConfig.defaultEndpoint
                : endpointSnippets.length > 0
                  ? this.getDefaultEndpointId()
                  : undefined;
        this.crateName = this.context.getCrateName();
    }

    public buildReadmeSnippets(): Record<FernGeneratorCli.FeatureId, string[]> {
        const snippets: Record<FernGeneratorCli.FeatureId, string[]> = {};

        // Core usage snippet using prerendered snippets
        snippets[FernGeneratorCli.StructuredFeatureId.Usage] = this.buildUsageSnippets();

        // Error handling
        snippets[ReadmeSnippetBuilder.ERRORS_FEATURE_ID] = this.buildErrorSnippets();

        // Request types
        snippets[ReadmeSnippetBuilder.REQUEST_TYPES_FEATURE_ID] = this.buildRequestTypesSnippets();

        // Retries
        snippets[FernGeneratorCli.StructuredFeatureId.Retries] = this.buildRetrySnippets();

        // Timeouts
        snippets[FernGeneratorCli.StructuredFeatureId.Timeouts] = this.buildTimeoutSnippets();

        // Additional headers
        snippets[ReadmeSnippetBuilder.ADDITIONAL_HEADERS_FEATURE_ID] = this.buildAdditionalHeadersSnippets();

        // Additional query string parameters
        snippets[ReadmeSnippetBuilder.ADDITIONAL_QUERY_STRING_PARAMETERS_FEATURE_ID] =
            this.buildAdditionalQueryStringParametersSnippets();

        // WebSocket
        const wsSnippets = this.buildWebSocketSnippets();
        if (wsSnippets.length > 0) {
            snippets[ReadmeSnippetBuilder.WEBSOCKETS_FEATURE_ID] = wsSnippets;
        }

        // Environments
        if (this.context.ir.environments != null) {
            snippets[ReadmeSnippetBuilder.ENVIRONMENTS_FEATURE_ID] = this.buildEnvironmentsSnippets();
        }

        // Pagination disable it for now, currently only support normal pagination
        // snippets[ReadmeSnippetBuilder.PAGINATION_FEATURE_ID] = this.buildPaginationSnippets();

        return snippets;
    }

    private buildUsageSnippets(): string[] {
        const endpointIds = this.getConfiguredEndpointIdsForFeature(FernGeneratorCli.StructuredFeatureId.Usage);
        if (endpointIds != null && endpointIds.length > 0) {
            return endpointIds.map((endpointId) => this.getSnippetForEndpointId(endpointId)).filter(isNonNullish);
        }
        if (this.defaultEndpointId == null) {
            return [];
        }
        const snippet = this.getSnippetForEndpointId(this.defaultEndpointId);
        return snippet != null ? [snippet] : [];
    }

    private buildErrorSnippets(): string[] {
        const errorEndpoints = this.getEndpointsForFeature(ReadmeSnippetBuilder.ERRORS_FEATURE_ID);
        return errorEndpoints.map((endpoint) => {
            const codeString = this.buildErrorHandlingCode(endpoint);
            return this.writeCode(codeString);
        });
    }

    private buildRequestTypesSnippets(): string[] {
        // Find any endpoint with a request body across all services
        let endpointWithRequest: EndpointWithFilepath | null = null;

        for (const service of Object.values(this.context.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.requestBody != null && endpoint.requestBody.type === "inlinedRequestBody") {
                    endpointWithRequest = {
                        endpoint,
                        fernFilepath: service.name.fernFilepath
                    };
                    break;
                }
            }
            if (endpointWithRequest != null) {
                break;
            }
        }

        if (endpointWithRequest == null) {
            return [];
        }

        const codeString = this.buildRequestTypesCode(endpointWithRequest);
        return [this.writeCode(codeString)];
    }

    private buildRetrySnippets(): string[] {
        const retryEndpoints = this.getEndpointsForFeature(FernGeneratorCli.StructuredFeatureId.Retries);
        return retryEndpoints.map((endpoint) => {
            const codeString = this.buildRetryCode(endpoint);
            return this.writeCode(codeString);
        });
    }

    private buildTimeoutSnippets(): string[] {
        const timeoutEndpoints = this.getEndpointsForFeature(FernGeneratorCli.StructuredFeatureId.Timeouts);
        return timeoutEndpoints.map((endpoint) => {
            const codeString = this.buildTimeoutCode(endpoint);
            return this.writeCode(codeString);
        });
    }

    private buildAdditionalHeadersSnippets(): string[] {
        const headerEndpoints = this.getEndpointsForFeature(ReadmeSnippetBuilder.ADDITIONAL_HEADERS_FEATURE_ID);
        return headerEndpoints.map((endpoint) => {
            const codeString = this.buildAdditionalHeadersCode(endpoint);
            return this.writeCode(codeString);
        });
    }

    private buildAdditionalQueryStringParametersSnippets(): string[] {
        const queryEndpoints = this.getEndpointsForFeature(
            ReadmeSnippetBuilder.ADDITIONAL_QUERY_STRING_PARAMETERS_FEATURE_ID
        );
        return queryEndpoints.map((endpoint) => {
            const codeString = this.buildAdditionalQueryParamsCode(endpoint);
            return this.writeCode(codeString);
        });
    }

    private buildPaginationSnippets(): string[] {
        let paginationEndpoints = this.getEndpointsForFeature(ReadmeSnippetBuilder.PAGINATION_FEATURE_ID);

        // If no endpoints are explicitly configured for pagination, auto-detect paginated endpoints
        if (paginationEndpoints.length === 0) {
            paginationEndpoints = this.getPaginatedEndpoints();
        }

        return paginationEndpoints.map((endpoint) => {
            const codeString = this.buildPaginationCode(endpoint);
            return this.writeCode(codeString);
        });
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
                throw GeneratorError.internalError("Internal error; snippets must define the endpoint id to generate README.md");
            }

            if (snippets[endpointSnippet.id.identifierOverride] != null) {
                continue;
            }

            // For now, we'll accept any snippet type and try to extract the client code
            // This is because Rust may not be officially supported in the union type yet
            const snippet = endpointSnippet.snippet as { type?: string; client?: string };
            if (snippet.type === "rust" && snippet.client) {
                snippets[endpointSnippet.id.identifierOverride] = snippet.client;
            } else if (snippet.client) {
                // Fallback: use client property if it exists
                snippets[endpointSnippet.id.identifierOverride] = snippet.client;
            }
        }
        return snippets;
    }

    private getSnippetForEndpointId(endpointId: FernIr.EndpointId): string | undefined {
        return this.prerenderedSnippetsByEndpointId[endpointId];
    }

    private getEndpointsForFeature(featureId: FernIr.FeatureId): EndpointWithFilepath[] {
        const configuredIds = this.getConfiguredEndpointIdsForFeature(featureId);
        const endpointIds = configuredIds ?? (this.defaultEndpointId != null ? [this.defaultEndpointId] : []);
        return endpointIds.map(this.lookupEndpointById.bind(this)).filter(isNonNullish);
    }

    private getConfiguredEndpointIdsForFeature(featureId: FernIr.FeatureId): FernIr.EndpointId[] | undefined {
        return this.context.ir.readmeConfig?.features?.[this.getFeatureKey(featureId)];
    }

    private lookupEndpointById(endpointId: FernIr.EndpointId): EndpointWithFilepath | undefined {
        return this.endpointsById[endpointId];
    }

    private getPaginatedEndpoints(): EndpointWithFilepath[] {
        const paginatedEndpoints: EndpointWithFilepath[] = [];
        for (const service of Object.values(this.context.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.pagination) {
                    paginatedEndpoints.push({
                        endpoint,
                        fernFilepath: service.name.fernFilepath
                    });
                }
            }
        }
        return paginatedEndpoints;
    }

    private getMethodCall(endpoint: EndpointWithFilepath): string {
        const clientAccess = this.getAccessFromRootClient(endpoint.fernFilepath);
        const methodName = this.context.case.snakeSafe(endpoint.endpoint.name);
        return `${clientAccess}.${methodName}`;
    }

    private getAccessFromRootClient(fernFilepath: FernIr.FernFilepath): string {
        const clientAccessParts = fernFilepath.allParts.map((part) => this.context.case.snakeSafe(part));
        return clientAccessParts.length > 0
            ? `${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME}.${clientAccessParts.join(".")}`
            : ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME;
    }

    private buildErrorHandlingCode(endpoint: EndpointWithFilepath): string {
        const writer = new Writer();
        const methodCall = this.getMethodCall(endpoint);

        // Build the method call expression
        const callExpr = Expression.await(
            Expression.try(Expression.functionCall(`${methodCall}`, [Expression.none()]))
        );

        // Build match statement with error handling using AST
        const matchStatement = Statement.match(callExpr, [
            {
                pattern: "Ok(response)",
                body: [Statement.expression(Expression.raw('println!("Success: {:?}", response)'))]
            },
            {
                pattern: "Err(ApiError::HTTP { status, message })",
                body: [Statement.expression(Expression.raw('println!("API Error {}: {:?}", status, message)'))]
            },
            {
                pattern: "Err(e)",
                body: [Statement.expression(Expression.raw('println!("Other error: {:?}", e)'))]
            }
        ]);

        matchStatement.write(writer);
        return writer.toString().trim();
    }

    private buildRequestTypesCode(endpoint: EndpointWithFilepath): string {
        const writer = new Writer();

        // Get the request type name (e.g., "PostWithObjectBody")
        const requestTypeName = this.getRequestTypeName(endpoint);

        if (requestTypeName == null) {
            return "";
        }

        // Use statement to import from crate using AST
        const useStatement = new UseStatement({
            path: `${this.crateName}::prelude`,
            items: ["*"]
        });

        // Create struct initialization with placeholder using Expression.raw
        // We use raw because "..." is not a valid field name and should appear as-is
        const structInit = Expression.raw(`${requestTypeName} {\n    ...\n}`);

        const letStatement = Statement.let({
            name: "request",
            value: structInit
        });

        useStatement.write(writer);
        writer.newLine();
        writer.newLine();
        letStatement.write(writer);

        return writer.toString().trim();
    }

    private getRequestTypeName(endpoint: EndpointWithFilepath): string | null {
        if (endpoint.endpoint.requestBody == null || endpoint.endpoint.requestBody.type !== "inlinedRequestBody") {
            return null;
        }

        // Get the type name from the inlined request body
        const requestBody = endpoint.endpoint.requestBody;

        // Use the name property which gives us the proper PascalCase name
        return this.context.case.pascalSafe(requestBody.name);
    }

    private getClientConfigStruct(
        sectionType: "error" | "retry" | "timeout" | "pagination",
        _endpoint?: EndpointWithFilepath
    ): Expression {
        const fields: Array<{ name: string; value: Expression }> = [];

        // Add base_url - use hardcoded example for README sections
        fields.push({
            name: "base_url",
            value: Expression.methodCall({
                target: Expression.stringLiteral(" "),
                method: "to_string",
                args: []
            })
        });

        // Always add api_key for consistency across all README sections
        // This provides a simple, consistent example regardless of actual auth type
        const apiKeyPlaceholder = this.context.getHeaderAuthPlaceholder() ?? "your-api-key";
        fields.push({
            name: "api_key",
            value: Expression.functionCall("Some", [
                Expression.methodCall({
                    target: Expression.stringLiteral(apiKeyPlaceholder),
                    method: "to_string",
                    args: []
                })
            ])
        });

        // Add section-specific fields
        switch (sectionType) {
            case "retry":
                fields.push({
                    name: "max_retries",
                    value: Expression.raw("3")
                });
                break;
            case "timeout":
                fields.push({
                    name: "timeout",
                    value: Expression.raw("Duration::from_secs(30)")
                });
                break;
            case "pagination":
                // No additional fields needed for pagination
                break;
            // error section doesn't need additional fields
        }

        return Expression.structConstruction(
            "ClientConfig",
            fields.map((field) => ({ name: field.name, value: field.value }))
        );
    }

    private buildRetryCode(endpoint: EndpointWithFilepath): string {
        const writer = new Writer();
        const methodCall = this.getMethodCall(endpoint);

        // Build RequestOptions expression
        const optionsExpr = Expression.functionCall("Some", [
            Expression.methodCall({
                target: Expression.functionCall("RequestOptions::new", []),
                method: "max_retries",
                args: [Expression.numberLiteral(3)]
            })
        ]);

        // Build the full call with multiline formatting
        const callExpr = Expression.functionCall(`${methodCall}`, [optionsExpr], true);

        // Wrap in try + await
        const awaitExpr = Expression.await(Expression.try(callExpr));

        // Create let statement
        const statement = Statement.let({
            name: "response",
            value: awaitExpr
        });

        statement.write(writer);
        return writer.toString().trim();
    }

    private buildTimeoutCode(endpoint: EndpointWithFilepath): string {
        const writer = new Writer();
        const methodCall = this.getMethodCall(endpoint);

        // Build RequestOptions expression
        const optionsExpr = Expression.functionCall("Some", [
            Expression.methodCall({
                target: Expression.functionCall("RequestOptions::new", []),
                method: "timeout_seconds",
                args: [Expression.numberLiteral(30)]
            })
        ]);

        // Build the full call with multiline formatting
        const callExpr = Expression.functionCall(`${methodCall}`, [optionsExpr], true);

        // Wrap in try + await
        const awaitExpr = Expression.await(Expression.try(callExpr));

        // Create let statement
        const statement = Statement.let({
            name: "response",
            value: awaitExpr
        });

        statement.write(writer);
        return writer.toString().trim();
    }

    private buildAdditionalHeadersCode(endpoint: EndpointWithFilepath): string {
        const writer = new Writer();
        const methodCall = this.getMethodCall(endpoint);

        // Manually format using Writer for proper multi-line method chain formatting
        writer.write(`let response = ${methodCall}(`);
        writer.newLine();
        writer.indent();
        writer.write("Some(");
        writer.newLine();
        writer.indent();
        writer.write("RequestOptions::new()");
        writer.newLine();
        writer.indent();
        writer.write('.additional_header("X-Custom-Header", "custom-value")');
        writer.newLine();
        writer.write('.additional_header("X-Another-Header", "another-value")');
        writer.dedent();
        writer.newLine();
        writer.dedent();
        writer.write(")");
        writer.newLine();
        writer.dedent();
        writer.write(")?");
        writer.newLine();
        writer.write(".await;");

        return writer.toString().trim();
    }

    private buildAdditionalQueryParamsCode(endpoint: EndpointWithFilepath): string {
        const writer = new Writer();
        const methodCall = this.getMethodCall(endpoint);

        // Manually format using Writer for proper multi-line method chain formatting
        writer.write(`let response = ${methodCall}(`);
        writer.newLine();
        writer.indent();
        writer.write("Some(");
        writer.newLine();
        writer.indent();
        writer.write("RequestOptions::new()");
        writer.newLine();
        writer.indent();
        writer.write('.additional_query_param("filter", "active")');
        writer.newLine();
        writer.write('.additional_query_param("sort", "desc")');
        writer.dedent();
        writer.newLine();
        writer.dedent();
        writer.write(")");
        writer.newLine();
        writer.dedent();
        writer.write(")?");
        writer.newLine();
        writer.write(".await;");

        return writer.toString().trim();
    }

    private buildPaginationCode(endpoint: EndpointWithFilepath): string {
        const writer = new Writer();

        // Use prelude for all imports
        const useStatements = [
            new UseStatement({ path: `${this.crateName}::prelude`, items: ["*"] }),
            new UseStatement({ path: "futures", items: ["StreamExt"] })
        ];

        // Write use statements
        useStatements.forEach((useStmt) => {
            useStmt.write(writer);
            writer.newLine();
        });
        writer.newLine();

        const mainFunction = rust.standaloneFunction({
            name: "main",
            parameters: [],
            isAsync: true,
            attributes: [rust.attribute({ name: "tokio::main" })],
            body: CodeBlock.fromStatements(this.buildPaginationBody(endpoint))
        });

        mainFunction.write(writer);
        return writer.toString().trim() + "\n";
    }

    private buildPaginationBody(endpoint: EndpointWithFilepath): Statement[] {
        // Build client using ClientConfig pattern
        const configVar = Statement.let({
            name: "config",
            value: this.getClientConfigStruct("pagination", endpoint)
        });

        const clientBuild = Expression.methodCall({
            target: Expression.raw(`${this.context.getClientName()}::new(config)`),
            method: "expect",
            args: [Expression.stringLiteral("Failed to build client")]
        });

        const clientVar = Statement.let({
            name: "client",
            value: clientBuild
        });

        // Generate pagination example based on the actual endpoint
        const methodCall = this.getMethodCall(endpoint);
        const paginatedMethodCall = `${methodCall}().await?`;

        // Create pagination stream example
        const streamVar = Statement.let({
            name: "mut paginated_stream",
            value: Expression.raw(paginatedMethodCall)
        });

        // Create the while loop for streaming pagination
        const whileLoop = Statement.raw(`while let Some(item) = paginated_stream.next().await {
            match item {
                Ok(data) => println!("Received item: {:?}", data),
                Err(e) => eprintln!("Error fetching page: {}", e),
            }
        }`);

        return [configVar, clientVar, streamVar, whileLoop];
    }

    private buildWebSocketSnippets(): string[] {
        if (!this.context.hasWebSocketChannels()) {
            return [];
        }

        const websocketChannels = this.context.ir.websocketChannels;
        if (!websocketChannels) {
            return [];
        }

        // Find the first WebSocket channel via subpackages (like Python's _get_example_websocket_channel)
        const exampleChannel = this.getExampleWebSocketChannel();
        if (exampleChannel == null) {
            return [];
        }

        const { subpackage, channel, channelId } = exampleChannel;
        const crateName = this.crateName;

        // Build channel name map to get proper client name
        const channelNameMap = this.buildWebSocketChannelNameMap(websocketChannels);
        const names = channelNameMap.get(channelId);
        if (names == null) {
            return [];
        }

        const clientMessages = channel.messages.filter((m) => m.origin === "client");
        const serverMessages = channel.messages.filter((m) => m.origin === "server");

        // Get the subpackage access path (e.g., "market_data" or "realtime")
        const subpackageName = this.context.case.snakeSafe(subpackage.name);

        // Build connect params from IR (without the url, since connectors provide it from config)
        const connectParams: string[] = [];
        for (const pathParam of channel.pathParameters) {
            connectParams.push(`"${this.context.case.snakeSafe(pathParam.name)}"`);
        }
        for (const header of channel.headers) {
            // Skip authorization header — the connector auto-injects it from the stored token
            if (this.context.case.snakeSafe(header.name) === "authorization") {
                continue;
            }
            connectParams.push(`"${this.context.case.snakeSafe(header.name)}"`);
        }
        for (const qp of channel.queryParameters) {
            const isOptional = qp.valueType.type === "container" && qp.valueType.container.type === "optional";
            if (isOptional) {
                connectParams.push("None");
            } else {
                connectParams.push(`"${this.context.case.snakeSafe(qp.name)}"`);
            }
        }

        const snippets: string[] = [];

        // --- Snippet: Connect via root client + send + receive + close ---
        const writer = new Writer();

        // Use statement
        writer.write(`use ${crateName}::prelude::*;`);
        writer.newLine();
        writer.newLine();

        // Create client using ClientConfig with token auth (matching the standard SDK pattern)
        const rootClientName = this.context.getClientName();
        const tokenPlaceholder = this.context.getBearerTokenPlaceholder() ?? this.context.getHeaderAuthPlaceholder() ?? "your-api-key";
        writer.write(`let client = ${rootClientName}::new(ClientConfig {`);
        writer.newLine();
        writer.indent();
        writer.write(`token: Some(${JSON.stringify(tokenPlaceholder)}.to_string()),`);
        writer.newLine();
        writer.write(`..Default::default()`);
        writer.dedent();
        writer.newLine();
        writer.write(`})`);
        writer.newLine();
        writer.write(`.expect("Failed to create client");`);
        writer.newLine();
        writer.newLine();

        // Connect via root client accessor (e.g., client.realtime.connect(...))
        writer.write(`// Connect to the WebSocket`);
        writer.newLine();
        if (connectParams.length > 0) {
            writer.write(`let mut ${subpackageName} = client.${subpackageName}.connect(`);
            writer.newLine();
            writer.indent();
            for (const param of connectParams) {
                writer.write(param + ",");
                writer.newLine();
            }
            writer.dedent();
            writer.write(").await.expect(\"Failed to connect\");");
        } else {
            writer.write(`let mut ${subpackageName} = client.${subpackageName}.connect().await.expect("Failed to connect");`);
        }
        writer.newLine();
        writer.newLine();

        // Receive messages
        if (serverMessages.length > 0) {
            writer.write(`// Iterate over messages as they arrive`);
            writer.newLine();
            writer.write(`while let Some(Ok(message)) = ${subpackageName}.recv().await {`);
            writer.newLine();
            writer.indent();
            writer.write(`println!("{:?}", message);`);
            writer.dedent();
            writer.newLine();
            writer.write(`}`);
            writer.newLine();
            writer.newLine();
        }

        // Send a message
        if (clientMessages.length > 0) {
            const firstMsg = clientMessages[0];
            if (firstMsg != null) {
                const methodName = this.getWebSocketMessageMethodName(firstMsg, "send");
                const bodyType = this.getWebSocketMessageBodyType(firstMsg);
                writer.write(`// Send a message`);
                writer.newLine();
                if (bodyType) {
                    writer.write(`${subpackageName}.${methodName}(&${bodyType} { /* fields */ }).await.expect("Failed to send");`);
                } else {
                    writer.write(`${subpackageName}.${methodName}(&serde_json::json!({})).await.expect("Failed to send");`);
                }
                writer.newLine();
                writer.newLine();
            }
        }

        // Close
        writer.write(`// Close the connection when done`);
        writer.newLine();
        writer.write(`${subpackageName}.close().await.expect("Failed to close");`);

        snippets.push(writer.toString().trim() + "\n");

        return snippets;
    }

    /**
     * Find the first WebSocket channel by checking subpackages (mirrors Python's _get_example_websocket_channel).
     */
    private getExampleWebSocketChannel(): {
        subpackage: FernIr.Subpackage;
        channel: FernIr.WebSocketChannel;
        channelId: string;
    } | undefined {
        const websocketChannels = this.context.ir.websocketChannels;
        if (websocketChannels == null) {
            return undefined;
        }

        for (const subpackageId of Object.keys(this.context.ir.subpackages)) {
            const subpackage = this.context.ir.subpackages[subpackageId];
            if (subpackage != null && subpackage.websocket != null && subpackage.websocket in websocketChannels) {
                const channel = websocketChannels[subpackage.websocket];
                if (channel != null) {
                    return {
                        subpackage,
                        channel,
                        channelId: subpackage.websocket
                    };
                }
            }
        }

        return undefined;
    }

    private buildWebSocketChannelNameMap(
        websocketChannels: Record<FernIr.WebSocketChannelId, FernIr.WebSocketChannel>
    ): Map<string, { moduleName: string; clientName: string }> {
        const nameMap = new Map<string, { moduleName: string; clientName: string }>();

        // Detect name collisions
        const nameCount = new Map<string, number>();
        for (const channel of Object.values(websocketChannels)) {
            const baseName = this.context.case.snakeSafe(channel.name);
            nameCount.set(baseName, (nameCount.get(baseName) ?? 0) + 1);
        }

        for (const [channelId, channel] of Object.entries(websocketChannels)) {
            const baseName = this.context.case.snakeSafe(channel.name);

            if ((nameCount.get(baseName) ?? 0) > 1) {
                // Derive unique name from channel ID
                const cleaned = channelId.replace(/^channel_/, "").replace(/\//g, "_");
                const pascalCase = cleaned
                    .split("_")
                    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                    .join("");
                nameMap.set(channelId, {
                    moduleName: cleaned,
                    clientName: `${pascalCase}Client`
                });
            } else {
                nameMap.set(channelId, {
                    moduleName: this.context.case.snakeSafe(channel.name),
                    clientName: `${this.context.case.pascalSafe(channel.name)}Client`
                });
            }
        }

        return nameMap;
    }

    private getWebSocketMessageMethodName(msg: FernIr.WebSocketMessage, prefix: string): string {
        const name = msg.body.type === "inlinedBody"
            ? this.context.case.snakeSafe(msg.body.name)
            : msg.type
                .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
                .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
                .toLowerCase();
        return `${prefix}_${name}`;
    }

    private getWebSocketMessageBodyType(msg: FernIr.WebSocketMessage): string | undefined {
        if (msg.body.type === "reference") {
            const typeRef = msg.body.bodyType;
            if (typeRef.type === "named") {
                return this.context.getUniqueTypeNameForReference(typeRef);
            }
            if (typeRef.type === "primitive") {
                return undefined;
            }
        }
        if (msg.body.type === "inlinedBody") {
            return this.context.case.pascalSafe(msg.body.name);
        }
        return undefined;
    }

    private buildEnvironmentsSnippets(): string[] {
        const envConfig = this.context.ir.environments;
        if (envConfig == null) {
            return [];
        }

        const environmentEnumName = this.context.customConfig.environmentEnumName || "Environment";
        const defaultEnvName = this.getDefaultEnvironmentName(envConfig);
        if (defaultEnvName == null) {
            return [];
        }

        const writer = new Writer();

        const useStatement = new UseStatement({
            path: `${this.crateName}::prelude`,
            items: ["*"]
        });
        useStatement.write(writer);
        writer.newLine();
        writer.newLine();

        writer.write(`let config = ClientConfig {`);
        writer.newLine();
        writer.indent();
        writer.write(`base_url: ${environmentEnumName}::${defaultEnvName}.url().to_string(),`);
        writer.newLine();
        writer.write(`..Default::default()`);
        writer.newLine();
        writer.dedent();
        writer.write(`};`);
        writer.newLine();
        writer.write(`let ${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME} = Client::new(config).expect("Failed to build client");`);

        return [this.writeCode(writer.toString().trim())];
    }

    private getDefaultEnvironmentName(envConfig: FernIr.EnvironmentsConfig): string | undefined {
        const defaultEnvId = envConfig.defaultEnvironment;
        const envs = envConfig.environments.environments;

        if (defaultEnvId != null) {
            const defaultEnv = envs.find((e) => e.id === defaultEnvId);
            if (defaultEnv != null) {
                return this.context.case.pascalSafe(defaultEnv.name);
            }
        }
        const firstName = envs[0]?.name;
        return firstName != null ? this.context.case.pascalSafe(firstName) : undefined;
    }

    private writeCode(code: string): string {
        return code.trim() + "\n";
    }
}
