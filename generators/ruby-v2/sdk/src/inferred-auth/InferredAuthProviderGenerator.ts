import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import {
    EndpointReference,
    HttpEndpoint,
    HttpService,
    InferredAuthScheme,
    Literal,
    NameAndWireValue,
    ObjectProperty,
    PropertyPathItem,
    ResponseProperty
} from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { astNodeToCodeBlockWithComments } from "../utils/astNodeToCodeBlockWithComments";
import { Comments } from "../utils/comments";

export declare namespace InferredAuthProviderGenerator {
    interface Args {
        scheme: InferredAuthScheme;
        context: SdkGeneratorContext;
    }
}

export class InferredAuthProviderGenerator extends FileGenerator<RubyFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private static readonly CLASS_NAME = "InferredAuthProvider";
    private static readonly BUFFER_IN_MINUTES = 2;

    private scheme: InferredAuthScheme;
    private tokenEndpointHttpService: HttpService;
    private tokenEndpointReference: EndpointReference;
    private tokenEndpoint: HttpEndpoint;

    constructor({ context, scheme }: InferredAuthProviderGenerator.Args) {
        super(context);
        this.scheme = scheme;
        this.tokenEndpointReference = this.scheme.tokenEndpoint.endpoint;

        const service = this.context.ir.services[this.tokenEndpointReference.serviceId];
        if (service == null) {
            throw new Error(`Service with id ${this.tokenEndpointReference.serviceId} not found`);
        }
        this.tokenEndpointHttpService = service;

        const endpoint = this.tokenEndpointHttpService.endpoints.find(
            (e) => e.id === this.tokenEndpointReference.endpointId
        );
        if (endpoint == null) {
            throw new Error(`Endpoint with id ${this.tokenEndpointReference.endpointId} not found`);
        }
        this.tokenEndpoint = endpoint;
    }

    public doGenerate(): RubyFile {
        const rootModule = this.context.getRootModule();
        const internalModule = ruby.module({ name: "Internal" });
        const class_ = ruby.class_({ name: InferredAuthProviderGenerator.CLASS_NAME });

        // Add constants
        class_.addStatement(ruby.codeblock(`BUFFER_IN_MINUTES = ${InferredAuthProviderGenerator.BUFFER_IN_MINUTES}`));

        // Add initialize method
        class_.addMethod(this.getInitializeMethod());

        // Add get_token method
        class_.addMethod(this.getGetTokenMethod());

        // Add refresh method
        class_.addMethod(this.getRefreshMethod());

        // Add get_auth_headers method
        class_.addMethod(this.getGetAuthHeadersMethod());

        // Add expires_at method if we have an expiry property
        const expiryProperty = this.scheme.tokenEndpoint.expiryProperty;
        if (expiryProperty != null) {
            class_.addMethod(this.getExpiresAtMethod());
        }

        internalModule.addStatement(class_);
        rootModule.addStatement(internalModule);

        return new RubyFile({
            node: astNodeToCodeBlockWithComments(rootModule, [Comments.FrozenStringLiteral]),
            directory: this.getDirectory(),
            filename: this.getFilename(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.getDirectory(), RelativeFilePath.of(this.getFilename()));
    }

    private getDirectory(): RelativeFilePath {
        return join(this.context.getRootFolderPath(), RelativeFilePath.of("internal"));
    }

    private getFilename(): string {
        return "inferred_auth_provider.rb";
    }

    private getInitializeMethod(): ruby.Method {
        const parameters: ruby.KeywordParameter[] = [
            ruby.parameters.keyword({
                name: "auth_client",
                type: ruby.Type.untyped(),
                docs: "The client used to retrieve the access token."
            }),
            ruby.parameters.keyword({
                name: "options",
                type: ruby.Type.hash(ruby.Type.string(), ruby.Type.untyped()),
                docs: "The options containing credentials for the token endpoint."
            })
        ];

        const method = ruby.method({
            name: "initialize",
            kind: ruby.MethodKind.Instance,
            parameters: { keyword: parameters },
            returnType: ruby.Type.void()
        });

        method.addStatement(
            ruby.codeblock((writer) => {
                writer.writeLine("@auth_client = auth_client");
                writer.writeLine("@options = options");
                writer.writeLine("@access_token = nil");

                const expiryProperty = this.scheme.tokenEndpoint.expiryProperty;
                if (expiryProperty != null) {
                    writer.writeLine("@expires_at = nil");
                }
            })
        );

        return method;
    }

    private getGetTokenMethod(): ruby.Method {
        const expiryProperty = this.scheme.tokenEndpoint.expiryProperty;

        const method = ruby.method({
            name: "get_token",
            kind: ruby.MethodKind.Instance,
            docstring: "Returns a cached access token, refreshing if necessary.",
            returnType: ruby.Type.string()
        });

        method.addStatement(
            ruby.codeblock((writer) => {
                if (expiryProperty != null) {
                    writer.writeLine(
                        "return @access_token if @access_token && (@expires_at.nil? || @expires_at > Time.now)"
                    );
                } else {
                    writer.writeLine("return @access_token if @access_token");
                }
                writer.newLine();
                writer.writeLine("refresh");
            })
        );

        return method;
    }

    private getRefreshMethod(): ruby.Method {
        const authenticatedRequestHeaders = this.scheme.tokenEndpoint.authenticatedRequestHeaders;
        const requestProperties = this.getTokenEndpointRequestProperties();

        const method = ruby.method({
            name: "refresh",
            kind: ruby.MethodKind.Instance,
            visibility: "private",
            docstring: "Refreshes the access token by calling the token endpoint.",
            returnType: ruby.Type.string()
        });

        method.addStatement(
            ruby.codeblock((writer) => {
                // Build the request hash
                writer.writeLine("request_params = {");
                writer.indent();
                for (const prop of requestProperties) {
                    if (prop.literal != null) {
                        // Emit the literal value directly
                        writer.writeLine(`${prop.snakeName}: ${this.getLiteralAsRubyString(prop.literal)},`);
                    } else {
                        writer.writeLine(`${prop.snakeName}: @options[:${prop.snakeName}],`);
                    }
                }
                writer.dedent();
                writer.writeLine("}");
                writer.newLine();

                // Call the token endpoint
                const endpointMethodName = this.getEndpointMethodName();
                writer.writeLine(`token_response = @auth_client.${endpointMethodName}(**request_params)`);
                writer.newLine();

                // Get the access token from the response
                if (authenticatedRequestHeaders.length > 0) {
                    const firstHeader = authenticatedRequestHeaders[0];
                    if (firstHeader != null) {
                        const accessTokenProperty = this.getResponsePropertyAccess(firstHeader.responseProperty);
                        writer.writeLine(`@access_token = token_response${accessTokenProperty}`);
                    }
                }

                const expiryProperty = this.scheme.tokenEndpoint.expiryProperty;
                if (expiryProperty != null) {
                    const expiresInProperty = this.getResponsePropertyAccess(expiryProperty);
                    writer.writeLine(
                        `@expires_at = get_expires_at(token_response${expiresInProperty}, BUFFER_IN_MINUTES)`
                    );
                }

                writer.newLine();
                writer.writeLine("@access_token");
            })
        );

        return method;
    }

    private getTokenEndpointRequestProperties(): Array<{
        snakeName: string;
        isOptional: boolean;
        literal?: Literal;
    }> {
        const properties: Array<{ snakeName: string; isOptional: boolean; literal?: Literal }> = [];
        const service = this.tokenEndpointHttpService;

        // Add query parameters
        for (const query of this.tokenEndpoint.queryParameters) {
            properties.push({
                snakeName: query.name.name.snakeCase.unsafeName,
                isOptional: this.isOptional(query.valueType),
                literal: this.maybeLiteral(query.valueType)
            });
        }

        // Add headers (service-level and endpoint-level)
        for (const header of [...service.headers, ...this.tokenEndpoint.headers]) {
            properties.push({
                snakeName: header.name.name.snakeCase.unsafeName,
                isOptional: this.isOptional(header.valueType),
                literal: this.maybeLiteral(header.valueType)
            });
        }

        // Add request body properties
        this.tokenEndpoint.requestBody?._visit({
            reference: () => {
                // For referenced request bodies, we don't have individual properties
            },
            inlinedRequestBody: (request) => {
                for (const property of request.properties) {
                    properties.push({
                        snakeName: property.name.name.snakeCase.unsafeName,
                        isOptional: this.isOptional(property.valueType),
                        literal: this.maybeLiteral(property.valueType)
                    });
                }
            },
            fileUpload: (fileUpload) => {
                for (const property of fileUpload.properties) {
                    if (property.type === "bodyProperty") {
                        properties.push({
                            snakeName: property.name.name.snakeCase.unsafeName,
                            isOptional: this.isOptional(property.valueType),
                            literal: this.maybeLiteral(property.valueType)
                        });
                    }
                }
            },
            bytes: () => undefined,
            _other: () => undefined
        });

        return properties;
    }

    private getGetAuthHeadersMethod(): ruby.Method {
        const authenticatedRequestHeaders = this.scheme.tokenEndpoint.authenticatedRequestHeaders;

        const method = ruby.method({
            name: "get_auth_headers",
            kind: ruby.MethodKind.Instance,
            docstring: "Returns the authentication headers to be included in requests.",
            returnType: ruby.Type.hash(ruby.Type.string(), ruby.Type.string())
        });

        method.addStatement(
            ruby.codeblock((writer) => {
                writer.writeLine("token = get_token");
                writer.writeLine("{");
                writer.indent();

                for (const header of authenticatedRequestHeaders) {
                    const headerName = header.headerName;
                    const valuePrefix = header.valuePrefix;

                    if (valuePrefix != null) {
                        writer.writeLine(`"${headerName}" => "${valuePrefix}#{token}",`);
                    } else {
                        writer.writeLine(`"${headerName}" => token,`);
                    }
                }

                writer.dedent();
                writer.writeLine("}");
            })
        );

        return method;
    }

    private getExpiresAtMethod(): ruby.Method {
        const method = ruby.method({
            name: "get_expires_at",
            kind: ruby.MethodKind.Instance,
            visibility: "private",
            docstring: "Calculates the expiration time with a buffer.",
            parameters: {
                positional: [
                    ruby.parameters.positional({
                        name: "expires_in_seconds",
                        type: ruby.Type.integer()
                    }),
                    ruby.parameters.positional({
                        name: "buffer_in_minutes",
                        type: ruby.Type.integer()
                    })
                ]
            },
            returnType: ruby.Type.class_(ruby.classReference({ name: "Time", modules: [] }))
        });

        method.addStatement(
            ruby.codeblock((writer) => {
                writer.writeLine("expires_in_seconds_with_buffer = expires_in_seconds - (buffer_in_minutes * 60)");
                writer.writeLine("Time.now + expires_in_seconds_with_buffer");
            })
        );

        return method;
    }

    private getEndpointMethodName(): string {
        return this.tokenEndpoint.name.snakeCase.safeName;
    }

    private getPropertyName(name: NameAndWireValue): string {
        return name.name.snakeCase.unsafeName;
    }

    private getResponsePropertyAccess(responseProperty: ResponseProperty): string {
        const propertyPath = responseProperty.propertyPath ?? [];
        const parts = [
            ...propertyPath.map((p) => this.getPropertyPathItemAccess(p)),
            this.getObjectPropertyAccess(responseProperty.property)
        ];
        return parts.join("");
    }

    private getPropertyPathItemAccess(pathItem: PropertyPathItem): string {
        return `.${pathItem.name.snakeCase.safeName}`;
    }

    private getObjectPropertyAccess(property: ObjectProperty): string {
        return `.${property.name.name.snakeCase.safeName}`;
    }

    private isOptional(typeReference: { type: string }): boolean {
        return typeReference.type === "container" || typeReference.type === "unknown";
    }

    private maybeLiteral(typeReference: {
        type: string;
        container?: { type: string; literal?: Literal };
    }): Literal | undefined {
        if (typeReference.type === "container") {
            const container = typeReference as { type: string; container: { type: string; literal?: Literal } };
            if (container.container?.type === "literal") {
                return container.container.literal;
            }
        }
        return undefined;
    }

    private getLiteralAsRubyString(literal: Literal): string {
        switch (literal.type) {
            case "string":
                return `"${literal.string}"`;
            case "boolean":
                return literal.boolean ? "true" : "false";
            default:
                throw new Error(`Unknown literal type: ${(literal as Literal).type}`);
        }
    }
}
