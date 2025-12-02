import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { FileGenerator, GoFile } from "@fern-api/go-base";

import { InferredAuthScheme } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace InferredAuthProviderGenerator {
    interface Args {
        context: SdkGeneratorContext;
        inferredAuthScheme: InferredAuthScheme;
    }
}

const BUFFER_IN_MINUTES = 2;

/**
 * Generates the InferredAuthProvider struct that handles token acquisition,
 * caching, and automatic refresh for OAuth-style authentication.
 */
export class InferredAuthProviderGenerator extends FileGenerator<GoFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private inferredAuthScheme: InferredAuthScheme;

    constructor({ context, inferredAuthScheme }: InferredAuthProviderGenerator.Args) {
        super(context);
        this.inferredAuthScheme = inferredAuthScheme;
    }

    public doGenerate(): GoFile {
        const struct = go.struct({
            name: "InferredAuthProvider",
            importPath: this.getImportPath()
        });

        // Add fields
        struct.addField(
            go.field({
                name: "mu",
                type: go.Type.reference(
                    go.typeReference({
                        name: "Mutex",
                        importPath: "sync"
                    })
                )
            })
        );

        struct.addField(
            go.field({
                name: "client",
                type: go.Type.pointer(go.Type.reference(this.getAuthClientTypeReference()))
            })
        );

        struct.addField(
            go.field({
                name: "options",
                type: this.context.getRequestOptionsType()
            })
        );

        if (this.inferredAuthScheme.tokenEndpoint.expiryProperty != null) {
            struct.addField(
                go.field({
                    name: "expiresAt",
                    type: go.Type.pointer(
                        go.Type.reference(
                            go.typeReference({
                                name: "Time",
                                importPath: "time"
                            })
                        )
                    )
                })
            );
        }

        struct.addField(
            go.field({
                name: "cachedToken",
                type: go.Type.pointer(go.Type.reference(this.getTokenResponseTypeReference()))
            })
        );

        // Add constructor
        struct.addConstructor(this.getConstructor());

        // Add AuthHeaders method
        struct.addMethod(this.getAuthHeadersMethod());

        // Add buildHeaders helper method
        struct.addMethod(this.getBuildHeadersMethod());

        return new GoFile({
            node: struct,
            rootImportPath: this.context.getRootImportPath(),
            packageName: this.getPackageName(),
            importPath: this.getImportPath(),
            directory: this.getDirectory(),
            filename: "inferred_auth_provider.go",
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.getDirectory(), RelativeFilePath.of("inferred_auth_provider.go"));
    }

    private getConstructor(): go.Struct.Constructor {
        return {
            name: "NewInferredAuthProvider",
            parameters: [this.context.getRequestOptionsParameter()],
            body: go.codeblock((writer) => {
                writer.write("return ");
                writer.writeNode(
                    go.TypeInstantiation.structPointer({
                        typeReference: go.typeReference({
                            name: "InferredAuthProvider",
                            importPath: this.getImportPath()
                        }),
                        fields: [
                            {
                                name: "client",
                                value: go.TypeInstantiation.reference(
                                    go.invokeFunc({
                                        func: this.getAuthClientConstructorReference(),
                                        arguments_: [go.codeblock("options")],
                                        multiline: false
                                    })
                                )
                            },
                            {
                                name: "options",
                                value: go.TypeInstantiation.reference(go.codeblock("options"))
                            }
                        ]
                    })
                );
            })
        };
    }

    private getAuthHeadersMethod(): go.Method {
        const hasExpiry = this.inferredAuthScheme.tokenEndpoint.expiryProperty != null;

        return new go.Method({
            name: "AuthHeaders",
            parameters: [this.context.getContextParameter()],
            return_: [go.Type.reference(this.context.getNetHttpHeaderTypeReference()), go.Type.error()],
            body: go.codeblock((writer) => {
                // Lock the mutex
                writer.writeLine("p.mu.Lock()");
                writer.writeLine("defer p.mu.Unlock()");
                writer.newLine();

                // Check if we have a valid cached token
                if (hasExpiry) {
                    writer.writeLine("// Check if we have a valid cached token");
                    writer.writeLine(
                        "if p.cachedToken != nil && p.expiresAt != nil && time.Now().Before(*p.expiresAt) {"
                    );
                    writer.indent();
                    writer.writeLine("return p.buildHeaders(), nil");
                    writer.dedent();
                    writer.writeLine("}");
                } else {
                    writer.writeLine("// Check if we have a cached token");
                    writer.writeLine("if p.cachedToken != nil {");
                    writer.indent();
                    writer.writeLine("return p.buildHeaders(), nil");
                    writer.dedent();
                    writer.writeLine("}");
                }
                writer.newLine();

                // Fetch a new token
                writer.writeLine("// Fetch a new token");
                writer.write("token, err := p.client.");
                writer.write(this.getTokenEndpointMethodName());
                writer.writeLine("(ctx)");
                writer.writeLine("if err != nil {");
                writer.indent();
                writer.writeLine("return nil, err");
                writer.dedent();
                writer.writeLine("}");
                writer.newLine();
                writer.writeLine("p.cachedToken = token");

                // Set expiry if present
                if (hasExpiry && this.inferredAuthScheme.tokenEndpoint.expiryProperty != null) {
                    writer.newLine();
                    writer.writeLine("// Calculate expiry time with buffer");
                    const expiryPath = this.getResponsePropertyPath(
                        "token",
                        this.inferredAuthScheme.tokenEndpoint.expiryProperty
                    );
                    writer.writeLine(`expiresIn := ${expiryPath}`);
                    writer.writeLine(
                        `expiresAt := time.Now().Add(time.Duration(expiresIn)*time.Second - time.Duration(${BUFFER_IN_MINUTES})*time.Minute)`
                    );
                    writer.writeLine("p.expiresAt = &expiresAt");
                }

                writer.newLine();
                writer.writeLine("return p.buildHeaders(), nil");
            }),
            typeReference: go.typeReference({
                name: "InferredAuthProvider",
                importPath: this.getImportPath()
            }),
            pointerReceiver: true,
            docs: "AuthHeaders returns the authentication headers for the request. It handles token caching and automatic refresh when tokens expire."
        });
    }

    private getBuildHeadersMethod(): go.Method {
        return new go.Method({
            name: "buildHeaders",
            parameters: [],
            return_: [go.Type.reference(this.context.getNetHttpHeaderTypeReference())],
            body: go.codeblock((writer) => {
                writer.writeLine("headers := make(http.Header)");
                for (const header of this.inferredAuthScheme.tokenEndpoint.authenticatedRequestHeaders) {
                    const responsePath = this.getResponsePropertyPath("p.cachedToken", header.responseProperty);
                    if (header.valuePrefix != null) {
                        writer.writeLine(
                            `headers.Set("${header.headerName}", "${header.valuePrefix}" + ${responsePath})`
                        );
                    } else {
                        writer.writeLine(`headers.Set("${header.headerName}", ${responsePath})`);
                    }
                }
                writer.writeLine("return headers");
            }),
            typeReference: go.typeReference({
                name: "InferredAuthProvider",
                importPath: this.getImportPath()
            }),
            pointerReceiver: true,
            docs: "buildHeaders constructs the authentication headers from the cached token."
        });
    }

    private getResponsePropertyPath(
        variable: string,
        responseProperty: import("@fern-fern/ir-sdk/api").ResponseProperty
    ): string {
        const parts: string[] = [variable];
        for (const pathPart of responseProperty.propertyPath) {
            parts.push(pathPart.name.pascalCase.unsafeName);
        }
        parts.push(responseProperty.property.name.name.pascalCase.unsafeName);
        return parts.join(".");
    }

    private getTokenEndpointMethodName(): string {
        // Get the endpoint from the IR
        const endpoint = this.inferredAuthScheme.tokenEndpoint.endpoint;
        // The method name is typically the endpoint name in PascalCase
        return endpoint.endpointId;
    }

    private getAuthClientTypeReference(): go.TypeReference {
        // The auth client is typically in the auth package
        const endpoint = this.inferredAuthScheme.tokenEndpoint.endpoint;
        const service = this.context.ir.services[endpoint.serviceId];
        if (service == null) {
            throw new Error(`Service with ID ${endpoint.serviceId} not found`);
        }
        return go.typeReference({
            name: "Client",
            importPath: this.context.getClientFileLocation({
                fernFilepath: service.name.fernFilepath,
                subpackage: undefined
            }).importPath
        });
    }

    private getAuthClientConstructorReference(): go.TypeReference {
        const endpoint = this.inferredAuthScheme.tokenEndpoint.endpoint;
        const service = this.context.ir.services[endpoint.serviceId];
        if (service == null) {
            throw new Error(`Service with ID ${endpoint.serviceId} not found`);
        }
        return go.typeReference({
            name: "NewClient",
            importPath: this.context.getClientFileLocation({
                fernFilepath: service.name.fernFilepath,
                subpackage: undefined
            }).importPath
        });
    }

    private getTokenResponseTypeReference(): go.TypeReference {
        // Get the response type from the token endpoint
        const endpoint = this.inferredAuthScheme.tokenEndpoint.endpoint;
        const service = this.context.ir.services[endpoint.serviceId];
        if (service == null) {
            throw new Error(`Service with ID ${endpoint.serviceId} not found`);
        }
        const httpEndpoint = service.endpoints.find((e) => e.id === endpoint.endpointId);
        if (httpEndpoint == null) {
            throw new Error(`Endpoint with ID ${endpoint.endpointId} not found`);
        }
        const responseBody = httpEndpoint.response?.body;
        if (responseBody == null || responseBody.type !== "json") {
            throw new Error("Token endpoint must have a JSON response body");
        }
        const jsonResponse = responseBody.value;
        if (jsonResponse.type !== "response") {
            throw new Error("Token endpoint must have a response type");
        }
        return this.context.goTypeMapper.convert({ reference: jsonResponse.responseBodyType });
    }

    private getPackageName(): string {
        return "core";
    }

    private getDirectory(): RelativeFilePath {
        return RelativeFilePath.of("core");
    }

    private getImportPath(): string {
        return this.context.getCoreImportPath();
    }
}
