import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { FileGenerator, GoFile } from "@fern-api/go-base";

import { HttpEndpoint, HttpService, InferredAuthScheme, ResponseProperty } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace InferredAuthProviderGenerator {
    interface Args {
        context: SdkGeneratorContext;
        inferredAuthScheme: InferredAuthScheme;
    }
}

export class InferredAuthProviderGenerator extends FileGenerator<GoFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private inferredAuthScheme: InferredAuthScheme;

    constructor({ context, inferredAuthScheme }: InferredAuthProviderGenerator.Args) {
        super(context);
        this.inferredAuthScheme = inferredAuthScheme;
    }

    protected getFilepath(): RelativeFilePath {
        return RelativeFilePath.of("internal/inferred_auth_provider.go");
    }

    protected doGenerate(): GoFile {
        const tokenEndpoint = this.getTokenEndpoint();
        const tokenService = this.getTokenService();

        return new GoFile({
            packageName: "internal",
            filename: "inferred_auth_provider.go",
            directory: RelativeFilePath.of("internal"),
            rootImportPath: this.context.getRootImportPath(),
            importPath: this.context.getRootImportPath() + "/internal",
            customConfig: this.context.customConfig,
            node: this.generateFileContent(tokenEndpoint, tokenService)
        });
    }

    private generateFileContent(tokenEndpoint: HttpEndpoint, tokenService: HttpService): go.AstNode {
        return go.codeblock((writer) => {
            // Write imports
            this.writeImports(writer);

            // Write constants
            this.writeConstants(writer);

            // Write TokenCache struct if needed
            if (this.hasExpiryProperty()) {
                this.writeTokenCacheStruct(writer);
            }

            // Write InferredAuthProvider struct
            this.writeInferredAuthProviderStruct(writer);

            // Write constructor
            this.writeConstructor(writer, tokenEndpoint, tokenService);

            // Write GetOrFetch method (for callback pattern)
            // This is written by writePrivateMethods

            // Write private methods
            this.writePrivateMethods(writer, tokenEndpoint);
        });
    }

    private writeImports(writer: go.Writer): void {
        writer.writeLine("import (");
        writer.indent();
        writer.writeLine('"net/http"');
        writer.writeLine('"sync"');
        writer.writeLine('"time"');
        writer.dedent();
        writer.writeLine(")");
        writer.writeLine();
    }

    private writeConstants(writer: go.Writer): void {
        if (this.hasExpiryProperty()) {
            writer.writeLine("const bufferInMinutes = 2");
            writer.writeLine();
        }
    }

    private writeTokenCacheStruct(writer: go.Writer): void {
        writer.writeLine("type TokenCache struct {");
        writer.indent();
        writer.writeLine("token     string");
        writer.writeLine("expiresAt time.Time");
        writer.writeLine("mu        sync.RWMutex");
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine();
    }

    private writeInferredAuthProviderStruct(writer: go.Writer): void {
        writer.writeLine("type InferredAuthProvider struct {");
        writer.indent();

        if (this.hasExpiryProperty()) {
            writer.writeLine("cache *TokenCache");
        }

        // Add options for token endpoint parameters
        const tokenEndpoint = this.getTokenEndpoint();
        const requestProperties = this.getTokenEndpointRequestProperties(tokenEndpoint);

        for (const property of requestProperties) {
            const fieldName = this.toPascalCase(property.name.name.originalName);
            writer.writeLine(`${fieldName} string`);
        }

        writer.dedent();
        writer.writeLine("}");
        writer.writeLine();
    }

    private writeConstructor(writer: go.Writer, tokenEndpoint: HttpEndpoint, tokenService: HttpService): void {
        writer.writeLine("func NewInferredAuthProvider(");
        writer.indent();

        // Add parameters for token endpoint properties
        const requestProperties = this.getTokenEndpointRequestProperties(tokenEndpoint);
        for (const property of requestProperties) {
            const fieldName = this.toCamelCase(property.name.name.originalName);
            writer.writeLine(`${fieldName} string,`);
        }

        writer.dedent();
        writer.writeLine(") *InferredAuthProvider {");
        writer.indent();

        writer.writeLine("return &InferredAuthProvider{");
        writer.indent();

        if (this.hasExpiryProperty()) {
            writer.writeLine("cache: &TokenCache{},");
        }

        // Set the request properties
        for (const property of requestProperties) {
            const fieldName = this.toPascalCase(property.name.name.originalName);
            const paramName = this.toCamelCase(property.name.name.originalName);
            writer.writeLine(`${fieldName}: ${paramName},`);
        }

        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine();
    }

    private writeGetOrFetchMethod(writer: go.Writer): void {
        writer.writeLine(
            "func (p *InferredAuthProvider) GetOrFetch(tokenFetcher func() (string, error)) (http.Header, error) {"
        );
        writer.indent();

        let tokenVar = "token";
        if (this.hasExpiryProperty()) {
            // Use cached token approach
            writer.writeLine("token, err := p.getOrFetchToken(tokenFetcher)");
            writer.writeLine("if err != nil {");
            writer.indent();
            writer.writeLine("return nil, err");
            writer.dedent();
            writer.writeLine("}");
        } else {
            // Always fetch token approach
            writer.writeLine("token, err := tokenFetcher()");
            writer.writeLine("if err != nil {");
            writer.indent();
            writer.writeLine("return nil, err");
            writer.dedent();
            writer.writeLine("}");
        }

        writer.writeLine();
        writer.writeLine("headers := make(http.Header)");

        // Set headers from authenticated request headers configuration
        for (const authHeader of this.inferredAuthScheme.tokenEndpoint.authenticatedRequestHeaders) {
            const headerName = authHeader.headerName ?? "Authorization";
            const valuePrefix = authHeader.valuePrefix ?? (headerName === "Authorization" ? "Bearer " : "");

            writer.writeLine(`headers.Set("${headerName}", "${valuePrefix}" + ${tokenVar})`);
        }

        writer.writeLine("return headers, nil");
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine();
    }

    private writePrivateMethods(writer: go.Writer, tokenEndpoint: HttpEndpoint): void {
        this.writeGetOrFetchMethod(writer);

        if (this.hasExpiryProperty()) {
            this.writeGetOrFetchTokenMethod(writer, tokenEndpoint);
        }
    }

    private writeGetOrFetchTokenMethod(writer: go.Writer, tokenEndpoint: HttpEndpoint): void {
        writer.writeLine(
            "func (p *InferredAuthProvider) getOrFetchToken(tokenFetcher func() (string, error)) (string, error) {"
        );
        writer.indent();

        writer.writeLine("p.cache.mu.RLock()");
        writer.writeLine('if p.cache.token != "" && time.Now().Before(p.cache.expiresAt) {');
        writer.indent();
        writer.writeLine("token := p.cache.token");
        writer.writeLine("p.cache.mu.RUnlock()");
        writer.writeLine("return token, nil");
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine("p.cache.mu.RUnlock()");
        writer.writeLine();

        writer.writeLine("p.cache.mu.Lock()");
        writer.writeLine("defer p.cache.mu.Unlock()");
        writer.writeLine();

        writer.writeLine("// Double-check pattern");
        writer.writeLine('if p.cache.token != "" && time.Now().Before(p.cache.expiresAt) {');
        writer.indent();
        writer.writeLine("return p.cache.token, nil");
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine();

        writer.writeLine("token, err := tokenFetcher()");
        writer.writeLine("if err != nil {");
        writer.indent();
        writer.writeLine('return "", err');
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine();

        // TODO: Handle expiry if needed
        // For now, we're getting the token directly so we can't extract expiry from the response
        // This would need to be handled differently if expiry support is required

        writer.writeLine("p.cache.token = token");
        writer.writeLine("return token, nil");
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine();
    }

    // Note: extractResponseProperty method removed since we now work with typed responses directly

    // Helper methods
    private getTokenEndpoint(): HttpEndpoint {
        const endpointReference = this.inferredAuthScheme.tokenEndpoint.endpoint;
        const service = this.context.ir.services[endpointReference.serviceId];
        if (!service) {
            throw new Error(`Token service not found: ${endpointReference.serviceId}`);
        }
        const endpoint = service.endpoints.find((e) => e.id === endpointReference.endpointId);
        if (!endpoint) {
            throw new Error(`Token endpoint not found: ${endpointReference.endpointId}`);
        }
        return endpoint;
    }

    private getTokenService(): HttpService {
        const endpointReference = this.inferredAuthScheme.tokenEndpoint.endpoint;
        const service = this.context.ir.services[endpointReference.serviceId];
        if (!service) {
            throw new Error(`Token service not found: ${endpointReference.serviceId}`);
        }
        return service;
    }

    private getTokenEndpointRequestProperties(endpoint: HttpEndpoint): any[] {
        // Extract request properties from the endpoint
        // This is a simplified version - would need to handle headers, query params, and body properties
        if (endpoint.requestBody?.type === "inlinedRequestBody") {
            return endpoint.requestBody.properties || [];
        }
        return [];
    }

    private hasExpiryProperty(): boolean {
        return this.inferredAuthScheme.tokenEndpoint.expiryProperty != null;
    }

    private toPascalCase(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }

    private toCamelCase(str: string): string {
        return str.charAt(0).toLowerCase() + str.slice(1).replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }
}
