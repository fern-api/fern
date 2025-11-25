import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";

import {
    EndpointReference,
    HttpEndpoint,
    HttpService,
    NameAndWireValue,
    OAuthScheme,
    ObjectProperty,
    PropertyPathItem,
    RequestProperty,
    ResponseProperty
} from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace OauthTokenProviderGenerator {
    interface Args {
        scheme: OAuthScheme;
        context: SdkGeneratorContext;
    }
}

export class OauthTokenProviderGenerator extends FileGenerator<PhpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private static readonly CLASS_NAME = "OAuthTokenProvider";
    private static readonly BUFFER_IN_MINUTES = 2;

    private scheme: OAuthScheme;
    private tokenEndpointHttpService: HttpService;
    private tokenEndpointReference: EndpointReference;
    private tokenEndpoint: HttpEndpoint;

    constructor({ context, scheme }: OauthTokenProviderGenerator.Args) {
        super(context);
        this.scheme = scheme;
        this.tokenEndpointReference = this.scheme.configuration.tokenEndpoint.endpointReference;

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

    public doGenerate(): PhpFile {
        const class_ = php.class_({
            name: OauthTokenProviderGenerator.CLASS_NAME,
            namespace: this.context.getCoreNamespace(),
            docs: "The OAuthTokenProvider retrieves an OAuth access token, refreshing it as needed.\nThe access token is then used as the bearer token in every authenticated request."
        });

        this.addFields(class_);
        class_.addConstructor(this.getConstructor());
        class_.addMethod(this.getGetTokenMethod());
        class_.addMethod(this.getRefreshMethod());

        const expiresIn = this.scheme.configuration.tokenEndpoint.responseProperties.expiresIn;
        if (expiresIn != null) {
            class_.addMethod(this.getExpiresAtMethod());
        }

        class_.addMethod(this.getDebugInfoMethod());

        return new PhpFile({
            clazz: class_,
            directory: RelativeFilePath.of("Core"),
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of("Core"), RelativeFilePath.of(`${OauthTokenProviderGenerator.CLASS_NAME}.php`));
    }

    private addFields(class_: php.Class): void {
        class_.addField(
            php.field({
                name: "$BUFFER_IN_MINUTES",
                access: "private",
                type: php.Type.int(),
                initializer: php.codeblock(`${OauthTokenProviderGenerator.BUFFER_IN_MINUTES}`)
            })
        );

        class_.addField(
            php.field({
                name: "$clientId",
                access: "private",
                type: php.Type.string()
            })
        );

        class_.addField(
            php.field({
                name: "$clientSecret",
                access: "private",
                type: php.Type.string()
            })
        );

        class_.addField(
            php.field({
                name: "$authClient",
                access: "private",
                type: php.Type.reference(this.getAuthClientClassReference())
            })
        );

        class_.addField(
            php.field({
                name: "$accessToken",
                access: "private",
                type: php.Type.optional(php.Type.string())
            })
        );

        const expiresIn = this.scheme.configuration.tokenEndpoint.responseProperties.expiresIn;
        if (expiresIn != null) {
            class_.addField(
                php.field({
                    name: "$expiresAt",
                    access: "private",
                    type: php.Type.optional(php.Type.reference(this.getDateTimeClassReference()))
                })
            );
        }
    }

    private getConstructor(): php.Class.Constructor {
        const parameters: php.Parameter[] = [
            php.parameter({
                name: "clientId",
                type: php.Type.string(),
                docs: "The client ID for OAuth authentication."
            }),
            php.parameter({
                name: "clientSecret",
                type: php.Type.string(),
                docs: "The client secret for OAuth authentication."
            }),
            php.parameter({
                name: "authClient",
                type: php.Type.reference(this.getAuthClientClassReference()),
                docs: "The client used to retrieve the OAuth token."
            })
        ];

        return {
            parameters,
            body: php.codeblock((writer) => {
                writer.writeLine("$this->clientId = $clientId;");
                writer.writeLine("$this->clientSecret = $clientSecret;");
                writer.writeLine("$this->authClient = $authClient;");
                writer.writeLine("$this->accessToken = null;");

                const expiresIn = this.scheme.configuration.tokenEndpoint.responseProperties.expiresIn;
                if (expiresIn != null) {
                    writer.writeLine("$this->expiresAt = null;");
                }
            })
        };
    }

    private getGetTokenMethod(): php.Method {
        const expiresIn = this.scheme.configuration.tokenEndpoint.responseProperties.expiresIn;

        return php.method({
            name: "getToken",
            access: "public",
            parameters: [],
            return_: php.Type.string(),
            docs: "Returns a cached access token, refreshing if necessary.",
            body: php.codeblock((writer) => {
                if (expiresIn != null) {
                    writer.controlFlow(
                        "if",
                        php.codeblock(
                            "$this->accessToken !== null && ($this->expiresAt === null || $this->expiresAt > new DateTime())"
                        )
                    );
                    writer.writeLine("return $this->accessToken;");
                    writer.endControlFlow();
                } else {
                    writer.controlFlow("if", php.codeblock("$this->accessToken !== null"));
                    writer.writeLine("return $this->accessToken;");
                    writer.endControlFlow();
                }
                writer.writeLine("return $this->refresh();");
            })
        });
    }

    private getRefreshMethod(): php.Method {
        const requestProperties = this.scheme.configuration.tokenEndpoint.requestProperties;
        const responseProperties = this.scheme.configuration.tokenEndpoint.responseProperties;

        const clientIdProperty = this.getRequestPropertyName(requestProperties.clientId);
        const clientSecretProperty = this.getRequestPropertyName(requestProperties.clientSecret);
        const accessTokenProperty = this.getResponsePropertyAccess(responseProperties.accessToken);

        return php.method({
            name: "refresh",
            access: "private",
            parameters: [],
            return_: php.Type.string(),
            docs: "Refreshes the access token by calling the token endpoint.",
            body: php.codeblock((writer) => {
                const requestClassReference = this.getTokenEndpointRequestClassReference();
                if (requestClassReference != null) {
                    writer.write("$request = new ");
                    writer.writeNode(requestClassReference);
                    writer.writeLine("([");
                } else {
                    writer.write("$tokenResponse = $this->authClient->");
                    writer.write(this.getEndpointMethodName());
                    writer.writeLine("([");
                }
                writer.indent();
                writer.writeLine(`'${clientIdProperty}' => $this->clientId,`);
                writer.writeLine(`'${clientSecretProperty}' => $this->clientSecret,`);

                for (const customProperty of requestProperties.customProperties ?? []) {
                    const propName = this.getRequestPropertyName(customProperty);
                    const literal = this.context.maybeLiteral(customProperty.property.valueType);
                    if (literal != null) {
                        writer.writeLine(`'${propName}' => ${this.context.getLiteralAsString(literal)},`);
                    }
                }

                if (requestProperties.scopes != null) {
                    const scopesPropName = this.getRequestPropertyName(requestProperties.scopes);
                    const scopesLiteral = this.context.maybeLiteral(requestProperties.scopes.property.valueType);
                    if (scopesLiteral != null) {
                        writer.writeLine(`'${scopesPropName}' => ${this.context.getLiteralAsString(scopesLiteral)},`);
                    }
                }

                writer.dedent();
                writer.writeLine("]);");

                if (requestClassReference != null) {
                    writer.newLine();
                    writer.write("$tokenResponse = $this->authClient->");
                    writer.write(this.getEndpointMethodName());
                    writer.writeLine("($request);");
                }

                writer.newLine();
                writer.writeLine(`$this->accessToken = $tokenResponse${accessTokenProperty};`);

                const expiresIn = responseProperties.expiresIn;
                if (expiresIn != null) {
                    const expiresInProperty = this.getResponsePropertyAccess(expiresIn);
                    writer.writeLine(
                        `$this->expiresAt = $this->getExpiresAt($tokenResponse${expiresInProperty}, $this->BUFFER_IN_MINUTES);`
                    );
                }

                writer.newLine();
                writer.writeLine("return $this->accessToken;");
            })
        });
    }

    private getTokenEndpointRequestClassReference(): php.ClassReference | undefined {
        const sdkRequest = this.tokenEndpoint.sdkRequest;
        if (sdkRequest == null) {
            return undefined;
        }
        if (sdkRequest.shape.type === "wrapper") {
            return php.classReference({
                name: sdkRequest.shape.wrapperName.pascalCase.safeName,
                namespace: this.context.getLocationForWrappedRequest(this.tokenEndpointReference.serviceId).namespace
            });
        }
        return undefined;
    }

    private getRequestPropertyName(requestProperty: RequestProperty): string {
        return requestProperty.property.name.name.camelCase.unsafeName;
    }

    private getExpiresAtMethod(): php.Method {
        return php.method({
            name: "getExpiresAt",
            access: "private",
            parameters: [
                php.parameter({
                    name: "expiresInSeconds",
                    type: php.Type.int(),
                    docs: "The number of seconds until the token expires."
                }),
                php.parameter({
                    name: "bufferInMinutes",
                    type: php.Type.int(),
                    docs: "The buffer time in minutes to subtract from the expiration."
                })
            ],
            return_: php.Type.reference(this.getDateTimeClassReference()),
            docs: "Calculates the expiration time with a buffer.",
            body: php.codeblock((writer) => {
                writer.writeLine("$now = new DateTime();");
                writer.writeLine("$expiresInSecondsWithBuffer = $expiresInSeconds - ($bufferInMinutes * 60);");
                writer.writeLine('$now->modify("+{$expiresInSecondsWithBuffer} seconds");');
                writer.writeLine("return $now;");
            })
        });
    }

    private getDebugInfoMethod(): php.Method {
        const expiresIn = this.scheme.configuration.tokenEndpoint.responseProperties.expiresIn;
        return php.method({
            name: "__debugInfo",
            access: "public",
            parameters: [],
            return_: php.Type.array(php.Type.mixed()),
            docs: "Returns debug information with sensitive credentials redacted.",
            body: php.codeblock((writer) => {
                writer.writeLine("return [");
                writer.indent();
                writer.writeLine("'clientId' => '[REDACTED]',");
                writer.writeLine("'clientSecret' => '[REDACTED]',");
                writer.writeLine("'hasAccessToken' => $this->accessToken !== null,");
                if (expiresIn != null) {
                    writer.writeLine("'expiresAt' => $this->expiresAt,");
                }
                writer.dedent();
                writer.writeLine("];");
            })
        });
    }

    private getAuthClientClassReference(): php.ClassReference {
        const subpackageId = this.tokenEndpointReference.subpackageId;
        if (subpackageId != null) {
            const subpackage = this.context.getSubpackageOrThrow(subpackageId);
            return this.context.getSubpackageClassReference(subpackage);
        }
        return php.classReference({
            name: this.context.getRootClientClassName(),
            namespace: this.context.getRootNamespace()
        });
    }

    private getDateTimeClassReference(): php.ClassReference {
        return php.classReference({
            name: "DateTime",
            namespace: ""
        });
    }

    private getEndpointMethodName(): string {
        return this.context.getEndpointMethodName(this.tokenEndpoint);
    }

    private getPropertyName(name: NameAndWireValue): string {
        return name.name.camelCase.unsafeName;
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
        return `->${pathItem.name.camelCase.safeName}`;
    }

    private getObjectPropertyAccess(property: ObjectProperty): string {
        return `->${property.name.name.camelCase.safeName}`;
    }
}
