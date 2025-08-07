import { AbstractEndpointSnippetGenerator, ErrorReporter, Result } from "@fern-api/browser-compatible-base-generator";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import dedent from "dedent";
import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";

export class EndpointSnippetGenerator extends AbstractEndpointSnippetGenerator<DynamicSnippetsGeneratorContext> {
    private clientVariableName = "client";

    protected generateSync(
        request: FernGeneratorExec.dynamic.EndpointSnippetRequest
    ): Result<FernGeneratorExec.Snippet, FernGeneratorExec.SnippetGenerationFailure> {
        const endpoint = this.context.resolveEndpoint(request.endpoint);
        if (endpoint == null) {
            return Result.err({
                type: "endpointNotFound",
                message: `Endpoint ${request.endpoint.method} ${request.endpoint.path} not found`
            });
        }

        const snippet = this.buildSnippet(request, endpoint);
        return Result.ok({ sync: snippet });
    }

    private buildSnippet(
        request: FernGeneratorExec.dynamic.EndpointSnippetRequest,
        endpoint: FernGeneratorExec.dynamic.Endpoint
    ): string {
        const packageName = this.context.getPackageName();
        const hasAuth = this.context.hasAuth();
        const errorReporter = new ErrorReporter();

        // Build imports
        const imports: string[] = [`use ${packageName}::ApiClientBuilder;`];

        // Add async runtime import if needed
        imports.push("");
        imports.push("#[tokio::main]");
        imports.push("async fn main() {");

        // Build client initialization
        const clientInit = this.buildClientInitialization(request, hasAuth);

        // Build endpoint call
        const endpointCall = this.buildEndpointCall(request, endpoint, errorReporter);

        // Combine all parts
        const snippet = dedent`
            ${imports.join("\n")}
                ${clientInit}
            
                ${endpointCall}
            }
        `;

        return snippet;
    }

    private buildClientInitialization(
        request: FernGeneratorExec.dynamic.EndpointSnippetRequest,
        hasAuth: boolean
    ): string {
        const baseUrl = request.baseUrl ?? "https://api.example.com";
        const lines: string[] = [];

        lines.push(`let ${this.clientVariableName} = ApiClientBuilder::new("${baseUrl}")`);

        // Add auth if needed
        if (hasAuth && request.auth != null) {
            const authLine = this.buildAuthLine(request.auth);
            if (authLine) {
                lines.push(`    ${authLine}`);
            }
        }

        // Add any additional headers
        if (request.headers != null) {
            Object.entries(request.headers).forEach(([key, value]) => {
                if (typeof value === "string") {
                    lines.push(`    .header("${key}", "${value}")`);
                }
            });
        }

        lines.push("    .build()");
        lines.push('    .expect("Failed to build client");');

        return lines.join("\n");
    }

    private buildAuthLine(auth: FernGeneratorExec.dynamic.Auth): string | undefined {
        switch (auth.type) {
            case "bearer":
                return `.api_key("${auth.token}")`;
            case "basic":
                return `.basic_auth("${auth.username}", "${auth.password}")`;
            case "header":
                return `.header("${auth.name}", "${auth.value}")`;
            default:
                return undefined;
        }
    }

    private buildEndpointCall(
        request: FernGeneratorExec.dynamic.EndpointSnippetRequest,
        endpoint: FernGeneratorExec.dynamic.Endpoint,
        errorReporter: ErrorReporter
    ): string {
        const parts = endpoint.location.path.split("/").filter((p) => p.length > 0);
        const methodChain: string[] = [];

        // Build the method chain for nested resources
        let currentPath = "";
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!part.startsWith(":")) {
                // Convert to snake_case for Rust method names
                const methodName = this.toSnakeCase(part);
                methodChain.push(methodName);
            }
        }

        // Get the final method name
        const lastPart = parts[parts.length - 1];
        const finalMethod = this.toSnakeCase(lastPart);

        // Build the full call
        let call = `let response = ${this.clientVariableName}`;
        if (methodChain.length > 0) {
            call += `.${methodChain.join(".")}()`;
        }
        call += `.${finalMethod}()`;

        // Add path parameters
        if (request.pathParameters != null) {
            const pathParams = this.buildPathParameters(request.pathParameters);
            if (pathParams.length > 0) {
                call = call.replace("()", `(${pathParams.join(", ")})`);
            }
        }

        // Add request body if present
        if (request.requestBody != null) {
            const body = this.buildRequestBody(request.requestBody, errorReporter);
            if (body) {
                call += `.body(${body})`;
            }
        }

        // Add query parameters
        if (request.queryParameters != null) {
            Object.entries(request.queryParameters).forEach(([key, value]) => {
                if (value != null) {
                    const rustValue = this.convertToRustValue(value);
                    call += `\n    .query("${key}", ${rustValue})`;
                }
            });
        }

        call += "\n    .await";
        call += '\n    .expect("API call failed");';

        call += '\n\nprintln!("Response: {:?}", response);';

        return call;
    }

    private buildPathParameters(pathParams: Record<string, unknown>): string[] {
        return Object.entries(pathParams).map(([_, value]) => {
            return this.convertToRustValue(value);
        });
    }

    private buildRequestBody(body: unknown, errorReporter: ErrorReporter): string | undefined {
        if (body == null) {
            return undefined;
        }

        if (typeof body === "object") {
            // For objects, we'll use serde_json
            return `serde_json::json!(${JSON.stringify(body)})`;
        }

        return this.convertToRustValue(body);
    }

    private convertToRustValue(value: unknown): string {
        if (value == null) {
            return "None";
        }

        if (typeof value === "string") {
            return `"${value}".to_string()`;
        }

        if (typeof value === "number") {
            if (Number.isInteger(value)) {
                return `${value}`;
            }
            return `${value}f64`;
        }

        if (typeof value === "boolean") {
            return value ? "true" : "false";
        }

        if (Array.isArray(value)) {
            const elements = value.map((v) => this.convertToRustValue(v)).join(", ");
            return `vec![${elements}]`;
        }

        if (typeof value === "object") {
            // For complex objects, use serde_json
            return `serde_json::json!(${JSON.stringify(value)})`;
        }

        return '""';
    }

    private toSnakeCase(str: string): string {
        return str
            .replace(/([A-Z])/g, "_$1")
            .toLowerCase()
            .replace(/^_/, "")
            .replace(/-/g, "_");
    }
}
