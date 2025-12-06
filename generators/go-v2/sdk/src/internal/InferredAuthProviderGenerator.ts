import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { FileGenerator, GoFile } from "@fern-api/go-base";

import {
    HttpEndpoint,
    HttpHeader,
    HttpService,
    InferredAuthScheme,
    InlinedRequestBodyProperty,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

interface TokenRequestParameter {
    name: string;
    pascalCaseName: string;
    camelCaseName: string;
    type: go.Type;
    typeReference: TypeReference;
    isOptional: boolean;
    isHeader: boolean;
    wireValue: string;
}

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
            name: "InferredAuthProvider"
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
                type: go.Type.pointer(this.getTokenResponseType())
            })
        );

        // Add tokenRequest field to store the request parameters
        const tokenRequestTypeRef = this.getTokenRequestTypeReference();
        if (tokenRequestTypeRef != null) {
            struct.addField(
                go.field({
                    name: "tokenRequest",
                    type: go.Type.pointer(go.Type.reference(tokenRequestTypeRef))
                })
            );
        }

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
        const tokenRequestTypeRef = this.getTokenRequestTypeReference();
        const parameters: go.Parameter[] = [this.context.getRequestOptionsParameter()];

        // Add tokenRequest parameter if the token endpoint has a request type
        if (tokenRequestTypeRef != null) {
            parameters.push(
                go.parameter({
                    name: "tokenRequest",
                    type: go.Type.pointer(go.Type.reference(tokenRequestTypeRef))
                })
            );
        }

        return {
            name: "NewInferredAuthProvider",
            parameters,
            body: go.codeblock((writer) => {
                const fields: { name: string; value: go.TypeInstantiation }[] = [
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
                ];

                // Add tokenRequest field if present
                if (tokenRequestTypeRef != null) {
                    fields.push({
                        name: "tokenRequest",
                        value: go.TypeInstantiation.reference(go.codeblock("tokenRequest"))
                    });
                }

                writer.write("return ");
                writer.writeNode(
                    go.TypeInstantiation.structPointer({
                        typeReference: go.typeReference({
                            name: "InferredAuthProvider"
                        }),
                        fields
                    })
                );
            })
        };
    }

    private getAuthHeadersMethod(): go.Method {
        const hasExpiry = this.inferredAuthScheme.tokenEndpoint.expiryProperty != null;
        const recv = this.getReceiverName();

        return new go.Method({
            name: "AuthHeaders",
            parameters: [this.context.getContextParameter()],
            return_: [go.Type.reference(this.context.getNetHttpHeaderTypeReference()), go.Type.error()],
            body: go.codeblock((writer) => {
                // Lock the mutex
                writer.writeLine(`${recv}.mu.Lock()`);
                writer.writeLine(`defer ${recv}.mu.Unlock()`);
                writer.newLine();

                // Check if we have a valid cached token
                if (hasExpiry) {
                    writer.writeLine("// Check if we have a valid cached token");
                    writer.writeLine(
                        `if ${recv}.cachedToken != nil && ${recv}.expiresAt != nil && time.Now().Before(*${recv}.expiresAt) {`
                    );
                    writer.indent();
                    writer.writeLine(`return ${recv}.buildHeaders(), nil`);
                    writer.dedent();
                    writer.writeLine("}");
                } else {
                    writer.writeLine("// Check if we have a cached token");
                    writer.writeLine(`if ${recv}.cachedToken != nil {`);
                    writer.indent();
                    writer.writeLine(`return ${recv}.buildHeaders(), nil`);
                    writer.dedent();
                    writer.writeLine("}");
                }
                writer.newLine();

                // Fetch a new token
                writer.writeLine("// Fetch a new token");
                writer.write(`token, err := ${recv}.client.`);
                writer.write(this.getTokenEndpointMethodName());
                // Use the stored token request if available
                const tokenRequestTypeRef = this.getTokenRequestTypeReference();
                if (tokenRequestTypeRef != null) {
                    writer.writeLine(`(ctx, ${recv}.tokenRequest)`);
                } else {
                    writer.writeLine("(ctx, nil)");
                }
                writer.writeLine("if err != nil {");
                writer.indent();
                writer.writeLine("return nil, err");
                writer.dedent();
                writer.writeLine("}");
                writer.newLine();
                writer.writeLine(`${recv}.cachedToken = token`);

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
                    writer.writeLine(`${recv}.expiresAt = &expiresAt`);
                }

                writer.newLine();
                writer.writeLine(`return ${recv}.buildHeaders(), nil`);
            }),
            typeReference: go.typeReference({
                name: "InferredAuthProvider"
            }),
            pointerReceiver: true,
            docs: "AuthHeaders returns the authentication headers for the request. It handles token caching and automatic refresh when tokens expire."
        });
    }

    private getBuildHeadersMethod(): go.Method {
        const recv = this.getReceiverName();
        return new go.Method({
            name: "buildHeaders",
            parameters: [],
            return_: [go.Type.reference(this.context.getNetHttpHeaderTypeReference())],
            body: go.codeblock((writer) => {
                writer.writeLine("headers := make(http.Header)");
                for (const header of this.inferredAuthScheme.tokenEndpoint.authenticatedRequestHeaders) {
                    const responsePath = this.getResponsePropertyPath(`${recv}.cachedToken`, header.responseProperty);
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
                name: "InferredAuthProvider"
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
        if (responseProperty.propertyPath != null) {
            for (const pathPart of responseProperty.propertyPath) {
                parts.push(pathPart.name.pascalCase.unsafeName);
            }
        }
        parts.push(responseProperty.property.name.name.pascalCase.unsafeName);
        return parts.join(".");
    }

    private getReceiverName(): string {
        // go-ast uses the first letter of the type name, lowercased
        return "i";
    }

    private getTokenEndpoint(): HttpEndpoint {
        const service = this.getService();
        const endpointRef = this.inferredAuthScheme.tokenEndpoint.endpoint;
        const httpEndpoint = service.endpoints.find((e) => e.id === endpointRef.endpointId);
        if (httpEndpoint == null) {
            throw new Error(`Endpoint with ID ${endpointRef.endpointId} not found`);
        }
        return httpEndpoint;
    }

    private getTokenEndpointMethodName(): string {
        const httpEndpoint = this.getTokenEndpoint();
        return this.context.getMethodName(httpEndpoint.name);
    }

    private getService(): HttpService {
        const endpointRef = this.inferredAuthScheme.tokenEndpoint.endpoint;
        const service = this.context.ir.services[endpointRef.serviceId];
        if (service == null) {
            throw new Error(`Service with ID ${endpointRef.serviceId} not found`);
        }
        return service;
    }

    private getServiceClientLocation() {
        const service = this.getService();
        return this.context.getClientFileLocation({
            fernFilepath: service.name.fernFilepath,
            subpackage: undefined
        });
    }

    private getAuthClientTypeReference(): go.TypeReference {
        // The provider is in the same package as the auth client, so no importPath needed
        return go.typeReference({
            name: "Client"
        });
    }

    private getAuthClientConstructorReference(): go.TypeReference {
        // The provider is in the same package as the auth client, so no importPath needed
        return go.typeReference({
            name: "NewClient"
        });
    }

    private getTokenResponseType(): go.Type {
        // Get the response type from the token endpoint
        const service = this.getService();
        const endpoint = this.inferredAuthScheme.tokenEndpoint.endpoint;
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
        const service = this.getService();
        return this.context.getClientPackageName({
            fernFilepath: service.name.fernFilepath,
            subpackage: undefined
        });
    }

    private getDirectory(): RelativeFilePath {
        return this.getServiceClientLocation().directory;
    }

    private getImportPath(): string {
        return this.getServiceClientLocation().importPath;
    }

    /**
     * Extracts the non-literal parameters from the token endpoint request.
     * These are the parameters that need to be provided by the user via WithToken().
     */
    public getTokenRequestParameters(): TokenRequestParameter[] {
        const endpoint = this.getTokenEndpoint();
        const parameters: TokenRequestParameter[] = [];

        // Extract headers (excluding literals)
        for (const header of endpoint.headers) {
            if (!this.isLiteralType(header.valueType)) {
                parameters.push(this.headerToParameter(header));
            }
        }

        // Extract body properties (excluding literals)
        const requestBody = endpoint.requestBody;
        if (requestBody != null && requestBody.type === "inlinedRequestBody") {
            for (const property of requestBody.properties) {
                if (!this.isLiteralType(property.valueType)) {
                    parameters.push(this.bodyPropertyToParameter(property));
                }
            }
        }

        return parameters;
    }

    private isLiteralType(typeReference: TypeReference): boolean {
        return typeReference.type === "container" && typeReference.container.type === "literal";
    }

    private headerToParameter(header: HttpHeader): TokenRequestParameter {
        const isOptional = this.context.isOptional(header.valueType);
        return {
            name: header.name.name.originalName,
            pascalCaseName: header.name.name.pascalCase.unsafeName,
            camelCaseName: header.name.name.camelCase.safeName,
            type: this.context.goTypeMapper.convert({ reference: header.valueType }),
            typeReference: header.valueType,
            isOptional,
            isHeader: true,
            wireValue: header.name.wireValue
        };
    }

    private bodyPropertyToParameter(property: InlinedRequestBodyProperty): TokenRequestParameter {
        const isOptional = this.context.isOptional(property.valueType);
        return {
            name: property.name.name.originalName,
            pascalCaseName: property.name.name.pascalCase.unsafeName,
            camelCaseName: property.name.name.camelCase.safeName,
            type: this.context.goTypeMapper.convert({ reference: property.valueType }),
            typeReference: property.valueType,
            isOptional,
            isHeader: false,
            wireValue: property.name.wireValue
        };
    }

    /**
     * Gets the type reference for the token request struct.
     * This is the request type for the token endpoint.
     */
    public getTokenRequestTypeReference(): go.TypeReference | undefined {
        const endpoint = this.getTokenEndpoint();
        const sdkRequest = endpoint.sdkRequest;
        if (sdkRequest == null) {
            return undefined;
        }
        const shape = sdkRequest.shape;
        if (shape.type !== "wrapper") {
            return undefined;
        }
        // Get the request type name from the wrapper
        const wrapperName = shape.wrapperName.pascalCase.unsafeName;
        // The request type is generated in the root package (or based on exportAllRequestsAtRoot config)
        const service = this.getService();
        const location = this.context.customConfig.exportAllRequestsAtRoot
            ? { importPath: this.context.getRootImportPath() }
            : this.context.getPackageLocation(service.name.fernFilepath);
        return go.typeReference({
            name: wrapperName,
            importPath: location.importPath
        });
    }
}
