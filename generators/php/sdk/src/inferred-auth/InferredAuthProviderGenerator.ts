import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";

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

export declare namespace InferredAuthProviderGenerator {
    interface Args {
        scheme: InferredAuthScheme;
        context: SdkGeneratorContext;
    }
}

export class InferredAuthProviderGenerator extends FileGenerator<PhpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
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

    public doGenerate(): PhpFile {
        const class_ = php.class_({
            name: InferredAuthProviderGenerator.CLASS_NAME,
            namespace: this.context.getCoreNamespace(),
            docs: "The InferredAuthProvider retrieves an access token from the configured token endpoint.\nThe access token is then used as the bearer token in every authenticated request."
        });

        this.addFields(class_);
        class_.addConstructor(this.getConstructor());
        class_.addMethod(this.getGetTokenMethod());
        class_.addMethod(this.getRefreshMethod());
        class_.addMethod(this.getGetAuthHeadersMethod());

        const expiryProperty = this.scheme.tokenEndpoint.expiryProperty;
        if (expiryProperty != null) {
            class_.addMethod(this.getExpiresAtMethod());
        }

        return new PhpFile({
            clazz: class_,
            directory: RelativeFilePath.of("Core"),
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            RelativeFilePath.of("Core"),
            RelativeFilePath.of(`${InferredAuthProviderGenerator.CLASS_NAME}.php`)
        );
    }

    private addFields(class_: php.Class): void {
        const expiryProperty = this.scheme.tokenEndpoint.expiryProperty;

        // Only add BUFFER_IN_MINUTES if we have an expiry property (otherwise it's never read)
        if (expiryProperty != null) {
            class_.addField(
                php.field({
                    name: "$BUFFER_IN_MINUTES",
                    access: "private",
                    type: php.Type.int(),
                    initializer: php.codeblock(`${InferredAuthProviderGenerator.BUFFER_IN_MINUTES}`)
                })
            );
        }

        class_.addField(
            php.field({
                name: "$authClient",
                access: "private",
                type: php.Type.reference(this.getAuthClientClassReference())
            })
        );

        class_.addField(
            php.field({
                name: "$options",
                access: "private",
                type: php.Type.array(php.Type.mixed())
            })
        );

        class_.addField(
            php.field({
                name: "$accessToken",
                access: "private",
                type: php.Type.optional(php.Type.string())
            })
        );

        if (expiryProperty != null) {
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
                name: "authClient",
                type: php.Type.reference(this.getAuthClientClassReference()),
                docs: "The client used to retrieve the access token."
            }),
            php.parameter({
                name: "options",
                type: php.Type.array(php.Type.mixed()),
                docs: "The options containing credentials for the token endpoint."
            })
        ];

        return {
            parameters,
            body: php.codeblock((writer) => {
                writer.writeLine("$this->authClient = $authClient;");
                writer.writeLine("$this->options = $options;");
                writer.writeLine("$this->accessToken = null;");

                const expiryProperty = this.scheme.tokenEndpoint.expiryProperty;
                if (expiryProperty != null) {
                    writer.writeLine("$this->expiresAt = null;");
                }
            })
        };
    }

    private getGetTokenMethod(): php.Method {
        const expiryProperty = this.scheme.tokenEndpoint.expiryProperty;

        return php.method({
            name: "getToken",
            access: "public",
            parameters: [],
            return_: php.Type.string(),
            docs: "Returns a cached access token, refreshing if necessary.",
            body: php.codeblock((writer) => {
                if (expiryProperty != null) {
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
        const authenticatedRequestHeaders = this.scheme.tokenEndpoint.authenticatedRequestHeaders;
        const requestProperties = this.getTokenEndpointRequestProperties();

        return php.method({
            name: "refresh",
            access: "private",
            parameters: [],
            return_: php.Type.string(),
            docs: "Refreshes the access token by calling the token endpoint.",
            body: php.codeblock((writer) => {
                const requestClassReference = this.getTokenEndpointRequestClassReference();

                // Build the array shape for PHPDoc annotation
                const arrayShapeParts = requestProperties.map((prop) => {
                    if (prop.literal != null) {
                        // Use the literal type in the PHPDoc
                        const literalType = this.context.getLiteralAsString(prop.literal);
                        return prop.isOptional
                            ? `${prop.camelName}?: ${literalType}|null`
                            : `${prop.camelName}: ${literalType}`;
                    }
                    if (prop.isOptional) {
                        return `${prop.camelName}?: string|null`;
                    }
                    return `${prop.camelName}: string`;
                });
                const arrayShape = `array{${arrayShapeParts.join(", ")}}`;

                // Add PHPDoc annotation to tell PHPStan the expected type
                writer.writeLine(`/** @var ${arrayShape} $values */`);
                writer.writeLine("$values = [");
                writer.indent();
                for (const prop of requestProperties) {
                    if (prop.literal != null) {
                        // Emit the literal value directly
                        writer.writeLine(`'${prop.camelName}' => ${this.context.getLiteralAsString(prop.literal)},`);
                    } else if (prop.isOptional) {
                        writer.writeLine(`'${prop.camelName}' => $this->options['${prop.camelName}'] ?? null,`);
                    } else {
                        writer.writeLine(`'${prop.camelName}' => $this->options['${prop.camelName}'],`);
                    }
                }
                writer.dedent();
                writer.writeLine("];");
                writer.newLine();

                if (requestClassReference != null) {
                    writer.write("$request = new ");
                    writer.writeNode(requestClassReference);
                    writer.writeLine("($values);");
                    writer.newLine();
                    writer.write("$tokenResponse = $this->authClient->");
                    writer.write(this.getEndpointMethodName());
                    writer.writeLine("($request);");
                } else {
                    writer.write("$tokenResponse = $this->authClient->");
                    writer.write(this.getEndpointMethodName());
                    writer.writeLine("($values);");
                }

                // Get the access token from the response
                if (authenticatedRequestHeaders.length > 0) {
                    const firstHeader = authenticatedRequestHeaders[0];
                    if (firstHeader != null) {
                        const accessTokenProperty = this.getResponsePropertyAccess(firstHeader.responseProperty);
                        writer.newLine();
                        writer.writeLine(`$this->accessToken = $tokenResponse${accessTokenProperty};`);
                    }
                }

                const expiryProperty = this.scheme.tokenEndpoint.expiryProperty;
                if (expiryProperty != null) {
                    const expiresInProperty = this.getResponsePropertyAccess(expiryProperty);
                    writer.writeLine(
                        `$this->expiresAt = $this->getExpiresAt($tokenResponse${expiresInProperty}, $this->BUFFER_IN_MINUTES);`
                    );
                }

                writer.newLine();
                writer.writeLine("return $this->accessToken;");
            })
        });
    }

    private getTokenEndpointRequestProperties(): Array<{
        camelName: string;
        isOptional: boolean;
        literal?: Literal;
    }> {
        const properties: Array<{ camelName: string; isOptional: boolean; literal?: Literal }> = [];
        const service = this.tokenEndpointHttpService;

        // Add query parameters
        for (const query of this.tokenEndpoint.queryParameters) {
            properties.push({
                camelName: query.name.name.camelCase.unsafeName,
                isOptional: this.context.isOptional(query.valueType),
                literal: this.context.maybeLiteral(query.valueType)
            });
        }

        // Add headers (service-level and endpoint-level)
        for (const header of [...service.headers, ...this.tokenEndpoint.headers]) {
            properties.push({
                camelName: header.name.name.camelCase.unsafeName,
                isOptional: this.context.isOptional(header.valueType),
                literal: this.context.maybeLiteral(header.valueType)
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
                        camelName: property.name.name.camelCase.unsafeName,
                        isOptional: this.context.isOptional(property.valueType),
                        literal: this.context.maybeLiteral(property.valueType)
                    });
                }
            },
            fileUpload: (fileUpload) => {
                for (const property of fileUpload.properties) {
                    if (property.type === "bodyProperty") {
                        properties.push({
                            camelName: property.name.name.camelCase.unsafeName,
                            isOptional: this.context.isOptional(property.valueType),
                            literal: this.context.maybeLiteral(property.valueType)
                        });
                    }
                }
            },
            bytes: () => undefined,
            _other: () => undefined
        });

        return properties;
    }

    private getGetAuthHeadersMethod(): php.Method {
        const authenticatedRequestHeaders = this.scheme.tokenEndpoint.authenticatedRequestHeaders;

        return php.method({
            name: "getAuthHeaders",
            access: "public",
            parameters: [],
            return_: php.Type.map(php.Type.string(), php.Type.string()),
            docs: "Returns the authentication headers to be included in requests.",
            body: php.codeblock((writer) => {
                writer.writeLine("$token = $this->getToken();");
                writer.writeLine("return [");
                writer.indent();

                for (const header of authenticatedRequestHeaders) {
                    const headerName = header.headerName;
                    const valuePrefix = header.valuePrefix;

                    if (valuePrefix != null) {
                        writer.writeLine(`'${headerName}' => "${valuePrefix}" . $token,`);
                    } else {
                        writer.writeLine(`'${headerName}' => $token,`);
                    }
                }

                writer.dedent();
                writer.writeLine("];");
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
