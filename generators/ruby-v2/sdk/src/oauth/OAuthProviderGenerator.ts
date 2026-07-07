import { GeneratorError } from "@fern-api/base-generator";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { astNodeToCodeBlockWithComments } from "../utils/astNodeToCodeBlockWithComments.js";
import { Comments } from "../utils/comments.js";

export declare namespace OAuthProviderGenerator {
    interface Args {
        scheme: FernIr.OAuthScheme;
        context: SdkGeneratorContext;
    }
}

interface TokenEndpointProperty {
    snakeName: string;
    isOptional: boolean;
    literal?: FernIr.Literal;
}

/**
 * Generates the `OAuthProvider` class used by the SDK client to obtain and cache
 * OAuth client-credentials access tokens. The provider calls the configured
 * token endpoint, maps the configured request/response properties, and refreshes
 * the token when it is close to expiring.
 */
export class OAuthProviderGenerator extends FileGenerator<RubyFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public static readonly CLASS_NAME = "OAuthProvider";
    private static readonly BUFFER_IN_SECONDS = 120; // 2 minutes
    private static readonly CLIENT_ID_OPTION = "client_id";
    private static readonly CLIENT_SECRET_OPTION = "client_secret";
    private static readonly DEFAULT_TOKEN_HEADER = "Authorization";
    private static readonly DEFAULT_TOKEN_PREFIX = "Bearer";

    private scheme: FernIr.OAuthScheme;
    private clientCredentials: FernIr.OAuthClientCredentials;
    private tokenEndpointHttpService: FernIr.HttpService;
    private tokenEndpointReference: FernIr.EndpointReference;
    private tokenEndpoint: FernIr.HttpEndpoint;

    constructor({ context, scheme }: OAuthProviderGenerator.Args) {
        super(context);
        this.scheme = scheme;
        if (scheme.configuration.type !== "clientCredentials") {
            throw GeneratorError.internalError(`Unsupported OAuth configuration type: ${scheme.configuration.type}`);
        }
        this.clientCredentials = scheme.configuration;
        this.tokenEndpointReference = this.clientCredentials.tokenEndpoint.endpointReference;

        const service = this.context.ir.services[this.tokenEndpointReference.serviceId];
        if (service == null) {
            throw GeneratorError.referenceError(`Service with id ${this.tokenEndpointReference.serviceId} not found`);
        }
        this.tokenEndpointHttpService = service;

        const endpoint = this.tokenEndpointHttpService.endpoints.find(
            (e) => e.id === this.tokenEndpointReference.endpointId
        );
        if (endpoint == null) {
            throw GeneratorError.referenceError(`Endpoint with id ${this.tokenEndpointReference.endpointId} not found`);
        }
        this.tokenEndpoint = endpoint;
    }

    public doGenerate(): RubyFile {
        const rootModule = this.context.getRootModule();
        const internalModule = ruby.module({ name: "Internal" });
        const class_ = ruby.class_({ name: OAuthProviderGenerator.CLASS_NAME });

        class_.addStatement(
            ruby.codeblock(`BUFFER_IN_SECONDS = ${OAuthProviderGenerator.BUFFER_IN_SECONDS} # 2 minutes`)
        );

        class_.addMethod(this.getInitializeMethod());
        class_.addMethod(this.getTokenMethod());
        class_.addMethod(this.getAuthHeadersMethod());

        if (this.hasExpiry()) {
            class_.addMethod(this.getTokenNeedsRefreshMethod());
        }

        class_.addMethod(this.getRefreshMethod());

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
        return "oauth_provider.rb";
    }

    private hasExpiry(): boolean {
        return this.clientCredentials.tokenEndpoint.responseProperties.expiresIn != null;
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
                if (this.hasExpiry()) {
                    writer.writeLine("@expires_at = nil");
                }
            })
        );

        return method;
    }

    private getTokenMethod(): ruby.Method {
        const method = ruby.method({
            name: "token",
            kind: ruby.MethodKind.Instance,
            docstring:
                "Returns a cached access token, refreshing if necessary.\nRefreshes the token if it's nil, or if we're within the buffer period before expiration.",
            returnType: ruby.Type.string()
        });

        method.addStatement(
            ruby.codeblock((writer) => {
                if (this.hasExpiry()) {
                    writer.writeLine("return refresh if @access_token.nil? || token_needs_refresh?");
                } else {
                    writer.writeLine("return refresh if @access_token.nil?");
                }
                writer.newLine();
                writer.writeLine("@access_token");
            })
        );

        return method;
    }

    private getAuthHeadersMethod(): ruby.Method {
        const method = ruby.method({
            name: "auth_headers",
            kind: ruby.MethodKind.Instance,
            docstring: "Returns the authentication headers to be included in requests.",
            returnType: ruby.Type.hash(ruby.Type.string(), ruby.Type.string())
        });

        const headerName = this.clientCredentials.tokenHeader ?? OAuthProviderGenerator.DEFAULT_TOKEN_HEADER;
        const prefix = this.clientCredentials.tokenPrefix ?? OAuthProviderGenerator.DEFAULT_TOKEN_PREFIX;

        // The prefix originates from the API spec; sanitize Ruby interpolation sigils so a
        // spec cannot inject executable code into the generated auth_headers method.
        const safePrefix = prefix.replace(/#(?=[{$@])/g, "\\#");
        const valueNode =
            safePrefix.length > 0
                ? ruby.TypeLiteral.interpolatedString(`${safePrefix} #{access_token}`)
                : ruby.codeblock("access_token");

        method.addStatement(
            ruby.codeblock((writer) => {
                writer.writeLine("access_token = token");
                writer.writeNode(
                    ruby.TypeLiteral.hash([
                        {
                            key: ruby.TypeLiteral.string(headerName),
                            value: valueNode
                        }
                    ])
                );
                writer.writeNewLineIfLastLineNot();
            })
        );

        return method;
    }

    private getTokenNeedsRefreshMethod(): ruby.Method {
        const method = ruby.method({
            name: "token_needs_refresh?",
            kind: ruby.MethodKind.Instance,
            visibility: "private",
            docstring:
                "Checks if the token needs to be refreshed.\nReturns true if the token will expire within the buffer period.",
            returnType: ruby.Type.boolean()
        });

        method.addStatement(
            ruby.codeblock((writer) => {
                writer.writeLine("return true if @expires_at.nil?");
                writer.newLine();
                writer.writeLine("Time.now >= (@expires_at - BUFFER_IN_SECONDS)");
            })
        );

        return method;
    }

    private getRefreshMethod(): ruby.Method {
        const responseProperties = this.clientCredentials.tokenEndpoint.responseProperties;
        const requestEntries = this.getRefreshRequestEntries();

        const method = ruby.method({
            name: "refresh",
            kind: ruby.MethodKind.Instance,
            visibility: "private",
            docstring: "Refreshes the access token by calling the token endpoint.",
            returnType: ruby.Type.string()
        });

        method.addStatement(
            ruby.codeblock((writer) => {
                if (requestEntries.length === 0) {
                    writer.writeLine("request_params = {}");
                } else {
                    writer.writeLine("request_params = {");
                    writer.indent();
                    for (let i = 0; i < requestEntries.length; i++) {
                        const entry = requestEntries[i];
                        if (entry == null) {
                            continue;
                        }
                        const comma = i < requestEntries.length - 1 ? "," : "";
                        writer.writeLine(`${entry.wireName}: ${entry.value}${comma}`);
                    }
                    writer.dedent();
                    writer.writeLine("}");
                }
                writer.newLine();

                const endpointMethodName = this.getEndpointMethodName();
                writer.writeLine(`token_response = @auth_client.${endpointMethodName}(**request_params)`);
                writer.newLine();

                const accessTokenAccess = this.getResponsePropertyAccess(responseProperties.accessToken);
                writer.writeLine(`@access_token = token_response${accessTokenAccess}`);

                if (responseProperties.expiresIn != null) {
                    const expiresInAccess = this.getResponsePropertyAccess(responseProperties.expiresIn);
                    writer.writeLine(`@expires_at = Time.now + token_response${expiresInAccess}`);
                }

                writer.newLine();
                writer.writeLine("@access_token");
            })
        );

        return method;
    }

    /**
     * Builds the ordered list of keyword arguments passed to the token endpoint.
     *
     * The keys are the token endpoint's wire property names (what the generated
     * endpoint method expects). The values are:
     * - `@options[:client_id]` / `@options[:client_secret]` for the configured
     *   client-id / client-secret request properties,
     * - the literal value for literal properties (e.g. `grant_type`), which Ruby
     *   must send explicitly since the generated request model keeps them as fields,
     * - `@options[:<wire>]` for any other required, non-literal property (scopes and
     *   required custom properties).
     *
     * Optional, non-literal properties are omitted; they are not surfaced as
     * constructor parameters and can be safely left off the request.
     */
    private getRefreshRequestEntries(): Array<{ wireName: string; value: string }> {
        const clientIdWire = this.getRequestPropertyWireSnake(
            this.clientCredentials.tokenEndpoint.requestProperties.clientId
        );
        const clientSecretWire = this.getRequestPropertyWireSnake(
            this.clientCredentials.tokenEndpoint.requestProperties.clientSecret
        );

        const entries: Array<{ wireName: string; value: string }> = [];
        for (const property of this.getTokenEndpointProperties()) {
            if (property.snakeName === clientIdWire) {
                entries.push({
                    wireName: property.snakeName,
                    value: `@options[:${OAuthProviderGenerator.CLIENT_ID_OPTION}]`
                });
            } else if (property.snakeName === clientSecretWire) {
                entries.push({
                    wireName: property.snakeName,
                    value: `@options[:${OAuthProviderGenerator.CLIENT_SECRET_OPTION}]`
                });
            } else if (property.literal != null) {
                entries.push({ wireName: property.snakeName, value: this.getLiteralAsRubyString(property.literal) });
            } else if (!property.isOptional) {
                entries.push({ wireName: property.snakeName, value: `@options[:${property.snakeName}]` });
            }
            // Optional, non-literal properties are intentionally omitted.
        }
        return entries;
    }

    /**
     * The additional (non client-id / client-secret) request properties that the
     * OAuth flow cannot synthesize and must be supplied by the caller: the scopes
     * mapping and any required, non-literal custom properties. These are surfaced
     * as constructor parameters on the root client and forwarded via `@options`.
     */
    public getAdditionalRequestPropertyNames(): string[] {
        const clientIdWire = this.getRequestPropertyWireSnake(
            this.clientCredentials.tokenEndpoint.requestProperties.clientId
        );
        const clientSecretWire = this.getRequestPropertyWireSnake(
            this.clientCredentials.tokenEndpoint.requestProperties.clientSecret
        );

        const names: string[] = [];
        for (const property of this.getTokenEndpointProperties()) {
            if (property.snakeName === clientIdWire || property.snakeName === clientSecretWire) {
                continue;
            }
            if (property.literal != null || property.isOptional) {
                continue;
            }
            names.push(property.snakeName);
        }
        return names;
    }

    private getTokenEndpointProperties(): TokenEndpointProperty[] {
        const properties: TokenEndpointProperty[] = [];
        const service = this.tokenEndpointHttpService;

        for (const query of this.tokenEndpoint.queryParameters) {
            properties.push({
                snakeName: this.case.snakeUnsafe(query.name),
                isOptional: this.isOptional(query.valueType),
                literal: this.maybeLiteral(query.valueType)
            });
        }

        for (const header of [...service.headers, ...this.tokenEndpoint.headers]) {
            properties.push({
                snakeName: this.case.snakeUnsafe(header.name),
                isOptional: this.isOptional(header.valueType),
                literal: this.maybeLiteral(header.valueType)
            });
        }

        this.tokenEndpoint.requestBody?._visit({
            reference: () => undefined,
            inlinedRequestBody: (request) => {
                for (const property of request.properties) {
                    properties.push({
                        snakeName: this.case.snakeUnsafe(property.name),
                        isOptional: this.isOptional(property.valueType),
                        literal: this.maybeLiteral(property.valueType)
                    });
                }
            },
            fileUpload: (fileUpload) => {
                for (const property of fileUpload.properties) {
                    if (property.type === "bodyProperty") {
                        properties.push({
                            snakeName: this.case.snakeUnsafe(property.name),
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

    private getRequestPropertyWireSnake(requestProperty: FernIr.RequestProperty): string {
        return requestProperty.property._visit({
            query: (query) => this.case.snakeUnsafe(query.name),
            body: (body) => this.case.snakeUnsafe(body.name),
            _other: () => {
                throw GeneratorError.internalError("Unsupported OAuth request property type");
            }
        });
    }

    private getEndpointMethodName(): string {
        return this.case.snakeSafe(this.tokenEndpoint.name);
    }

    private getResponsePropertyAccess(responseProperty: FernIr.ResponseProperty): string {
        const propertyPath = responseProperty.propertyPath ?? [];
        const parts = [
            ...propertyPath.map((p) => `.${this.case.snakeSafe(p.name)}`),
            `.${this.case.snakeSafe(responseProperty.property.name)}`
        ];
        return parts.join("");
    }

    private isOptional(typeReference: { type: string }): boolean {
        return typeReference.type === "container" || typeReference.type === "unknown";
    }

    private maybeLiteral(typeReference: {
        type: string;
        container?: { type: string; literal?: FernIr.Literal };
    }): FernIr.Literal | undefined {
        if (typeReference.type === "container") {
            const container = typeReference as { type: string; container: { type: string; literal?: FernIr.Literal } };
            if (container.container?.type === "literal") {
                return container.container.literal;
            }
        }
        return undefined;
    }

    private getLiteralAsRubyString(literal: FernIr.Literal): string {
        switch (literal.type) {
            case "string":
                return `"${literal.string}"`;
            case "boolean":
                return literal.boolean ? "true" : "false";
            default:
                throw GeneratorError.internalError(`Unknown literal type: ${(literal as FernIr.Literal).type}`);
        }
    }
}
