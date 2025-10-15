import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";
import { isNonNullish } from "@fern-api/core-utils";
import { CodeBlock, Expression, rust, Statement, UseStatement, Writer } from "@fern-api/rust-codegen";

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
    private static ERRORS_FEATURE_ID: FernGeneratorCli.FeatureId = "ERRORS";
    private static REQUEST_TYPES_FEATURE_ID: FernGeneratorCli.FeatureId = "REQUEST_TYPES";
    private static PAGINATION_FEATURE_ID: FernGeneratorCli.FeatureId = "PAGINATION";
    private static ADDITIONAL_HEADERS_FEATURE_ID: FernGeneratorCli.FeatureId = "ADDITIONAL_HEADERS";
    private static ADDITIONAL_QUERY_STRING_PARAMETERS_FEATURE_ID: FernGeneratorCli.FeatureId =
        "ADDITIONAL_QUERY_STRING_PARAMETERS";

    private readonly context: SdkGeneratorContext;
    private readonly endpointsById: Record<EndpointId, EndpointWithFilepath> = {};
    private readonly prerenderedSnippetsByEndpointId: Record<EndpointId, string> = {};
    private readonly defaultEndpointId: EndpointId;
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
                : this.getDefaultEndpointId();
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

        // Pagination disable it for now, currently only support normal pagination
        // snippets[ReadmeSnippetBuilder.PAGINATION_FEATURE_ID] = this.buildPaginationSnippets();

        return snippets;
    }

    private buildUsageSnippets(): string[] {
        const endpointIds = this.getConfiguredEndpointIdsForFeature(FernGeneratorCli.StructuredFeatureId.Usage);
        if (endpointIds != null && endpointIds.length > 0) {
            return endpointIds.map((endpointId) => this.getSnippetForEndpointId(endpointId)).filter(isNonNullish);
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

    private getSnippetForEndpointId(endpointId: EndpointId): string | undefined {
        return this.prerenderedSnippetsByEndpointId[endpointId];
    }

    private getEndpointsForFeature(featureId: FeatureId): EndpointWithFilepath[] {
        const endpointIds = this.getConfiguredEndpointIdsForFeature(featureId) ?? [this.defaultEndpointId];
        return endpointIds.map(this.lookupEndpointById.bind(this)).filter(isNonNullish);
    }

    private getConfiguredEndpointIdsForFeature(featureId: FeatureId): EndpointId[] | undefined {
        return this.context.ir.readmeConfig?.features?.[this.getFeatureKey(featureId)];
    }

    private lookupEndpointById(endpointId: EndpointId): EndpointWithFilepath | undefined {
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
        const methodName = endpoint.endpoint.name.snakeCase.safeName;
        return `${clientAccess}.${methodName}`;
    }

    private getAccessFromRootClient(fernFilepath: FernFilepath): string {
        const clientAccessParts = fernFilepath.allParts.map((part) => part.snakeCase.safeName);
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
        return requestBody.name.pascalCase.safeName;
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
        fields.push({
            name: "api_key",
            value: Expression.functionCall("Some", [
                Expression.methodCall({
                    target: Expression.stringLiteral("your-api-key"),
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

    private writeCode(code: string): string {
        return code.trim() + "\n";
    }
}
