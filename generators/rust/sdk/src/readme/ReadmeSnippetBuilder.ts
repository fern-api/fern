import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";
import { isNonNullish } from "@fern-api/core-utils";
import { rust, UseStatement, Expression, Statement, CodeBlock, Writer } from "@fern-api/rust-codegen";

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

    private readonly context: SdkGeneratorContext;
    private readonly endpointsById: Record<EndpointId, EndpointWithFilepath> = {};
    private readonly prerenderedSnippetsByEndpointId: Record<EndpointId, string> = {};
    private readonly defaultEndpointId: EndpointId;
    private readonly packageName: string;

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
        this.packageName = this.context.configManager.get("packageName") || this.context.ir.apiName.snakeCase.safeName;
    }

    public buildReadmeSnippets(): Record<FernGeneratorCli.FeatureId, string[]> {
        const snippets: Record<FernGeneratorCli.FeatureId, string[]> = {};

        // Core usage snippet using prerendered snippets
        snippets[FernGeneratorCli.StructuredFeatureId.Usage] = this.buildUsageSnippets();

        // Error handling
        snippets[ReadmeSnippetBuilder.ERRORS_FEATURE_ID] = this.buildErrorSnippets();

        // Retries
        snippets[FernGeneratorCli.StructuredFeatureId.Retries] = this.buildRetrySnippets();

        // Timeouts
        snippets[FernGeneratorCli.StructuredFeatureId.Timeouts] = this.buildTimeoutSnippets();

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
            // For now, we'll accept any snippet type and try to extract the client code
            // This is because Rust may not be officially supported in the union type yet
            const snippet = endpointSnippet.snippet as any;
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

        // Use statements
        const useStatements = [
            new UseStatement({ path: this.packageName, items: ["ClientError", this.context.getClientBuilderName()] })
        ];

        // Main function with error handling
        const mainFunction = rust.standaloneFunction({
            name: "main",
            parameters: [],
            isAsync: true,
            attributes: [rust.attribute({ name: "tokio::main" })],
            returnType: rust.Type.result(
                rust.Type.reference(rust.reference({ name: "()" })),
                rust.Type.reference(rust.reference({ name: "ClientError" }))
            ),
            body: CodeBlock.fromStatements(this.buildErrorHandlingBody(endpoint))
        });

        // Write use statements
        useStatements.forEach((useStmt) => {
            useStmt.write(writer);
            writer.newLine();
        });
        writer.newLine();

        // Write main function
        mainFunction.write(writer);

        return writer.toString().trim() + "\n";
    }

    private buildErrorHandlingBody(endpoint: EndpointWithFilepath): Statement[] {
        // Build client
        const clientBuild = Expression.methodChain(
            Expression.methodCall({
                target: Expression.reference(this.context.getClientBuilderName()),
                method: "new",
                args: [Expression.stringLiteral("https://api.example.com")]
            }),
            [
                { method: "api_key", args: [Expression.stringLiteral("your-api-key")] },
                { method: "build", args: [] }
            ]
        );

        const clientVar = Statement.let({
            name: "client",
            value: Expression.try(clientBuild)
        });

        // Method call with match - parse the method chain
        const methodCallParts = this.getMethodCall(endpoint).split(".");
        let methodTarget = Expression.reference(methodCallParts[0] || "client");

        for (let i = 1; i < methodCallParts.length - 1; i++) {
            methodTarget = Expression.fieldAccess(methodTarget, methodCallParts[i] || "");
        }

        const methodCall = Expression.await(
            Expression.methodCall({
                target: methodTarget,
                method: methodCallParts[methodCallParts.length - 1] || "call",
                args: []
            })
        );

        const matchStatement = Statement.match(methodCall, [
            {
                pattern: "Ok(response)",
                body: [
                    Statement.expression(
                        Expression.macroCall("println!", [
                            Expression.stringLiteral("Success: {:?}"),
                            Expression.reference("response")
                        ])
                    )
                ]
            },
            {
                pattern: "Err(ClientError::ApiError { status_code, body, .. })",
                body: [
                    Statement.expression(
                        Expression.macroCall("println!", [
                            Expression.stringLiteral("API Error {}: {:?}"),
                            Expression.reference("status_code"),
                            Expression.reference("body")
                        ])
                    )
                ]
            },
            {
                pattern: "Err(e)",
                body: [
                    Statement.expression(
                        Expression.macroCall("println!", [
                            Expression.stringLiteral("Other error: {:?}"),
                            Expression.reference("e")
                        ])
                    )
                ]
            }
        ]);

        return [clientVar, matchStatement, Statement.return(Expression.ok(Expression.raw("()")))];
    }

    private buildRetryCode(endpoint: EndpointWithFilepath): string {
        const writer = new Writer();

        const useStatements = [
            new UseStatement({ path: this.packageName, items: [this.context.getClientBuilderName()] })
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
            body: CodeBlock.fromStatements(this.buildRetryBody(endpoint))
        });

        mainFunction.write(writer);
        return writer.toString().trim() + "\n";
    }

    private buildRetryBody(endpoint: EndpointWithFilepath): Statement[] {
        const clientBuild = Expression.methodChain(
            Expression.methodCall({
                target: Expression.reference(this.context.getClientBuilderName()),
                method: "new",
                args: [Expression.stringLiteral("https://api.example.com")]
            }),
            [
                { method: "api_key", args: [Expression.stringLiteral("your-api-key")] },
                { method: "max_retries", args: [Expression.numberLiteral(3)] },
                { method: "build", args: [] },
                { method: "expect", args: [Expression.stringLiteral("Failed to build client")] }
            ]
        );

        const clientVar = Statement.let({
            name: "client",
            value: clientBuild
        });

        // Method call
        const methodCallParts = this.getMethodCall(endpoint).split(".");
        let methodTarget = Expression.reference(methodCallParts[0] || "client");

        for (let i = 1; i < methodCallParts.length - 1; i++) {
            methodTarget = Expression.fieldAccess(methodTarget, methodCallParts[i] || "");
        }

        const responseVar = Statement.let({
            name: "response",
            value: Expression.methodCall({
                target: Expression.await(
                    Expression.methodCall({
                        target: methodTarget,
                        method: methodCallParts[methodCallParts.length - 1] || "call",
                        args: []
                    })
                ),
                method: "expect",
                args: [Expression.stringLiteral("API call failed")]
            })
        });

        return [clientVar, responseVar];
    }

    private buildTimeoutCode(endpoint: EndpointWithFilepath): string {
        const useStatements = [
            new UseStatement({ path: this.packageName, items: [this.context.getClientBuilderName()] }),
            new UseStatement({ path: "std::time", items: ["Duration"] })
        ];

        const writer = new Writer();

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
            body: CodeBlock.fromStatements(this.buildTimeoutBody(endpoint))
        });

        mainFunction.write(writer);
        return writer.toString().trim() + "\n";
    }

    private buildTimeoutBody(endpoint: EndpointWithFilepath): Statement[] {
        const clientBuild = Expression.methodChain(
            Expression.methodCall({
                target: Expression.reference(this.context.getClientBuilderName()),
                method: "new",
                args: [Expression.stringLiteral("https://api.example.com")]
            }),
            [
                { method: "api_key", args: [Expression.stringLiteral("your-api-key")] },
                {
                    method: "timeout",
                    args: [Expression.functionCall("Duration::from_secs", [Expression.numberLiteral(30)])]
                },
                { method: "build", args: [] },
                { method: "expect", args: [Expression.stringLiteral("Failed to build client")] }
            ]
        );

        const clientVar = Statement.let({
            name: "client",
            value: clientBuild
        });

        // Method call
        const methodCallParts = this.getMethodCall(endpoint).split(".");
        let methodTarget = Expression.reference(methodCallParts[0] || "client");

        for (let i = 1; i < methodCallParts.length - 1; i++) {
            methodTarget = Expression.fieldAccess(methodTarget, methodCallParts[i] || "");
        }

        const responseVar = Statement.let({
            name: "response",
            value: Expression.methodCall({
                target: Expression.await(
                    Expression.methodCall({
                        target: methodTarget,
                        method: methodCallParts[methodCallParts.length - 1] || "call",
                        args: []
                    })
                ),
                method: "expect",
                args: [Expression.stringLiteral("API call failed")]
            })
        });

        return [clientVar, responseVar];
    }

    private writeCode(code: string): string {
        return code.trim() + "\n";
    }
}
