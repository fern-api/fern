import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import {
    EndpointReference,
    HttpEndpoint,
    HttpService,
    Name,
    OAuthScheme,
    ObjectProperty,
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

export class OauthTokenProviderGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private classReference: ast.ClassReference;
    private scheme: OAuthScheme;
    private tokenEndpointHttpService: HttpService;
    private tokenEndpointReference: EndpointReference;
    private tokenEndpoint: HttpEndpoint;
    private clientField: ast.Field;

    private readonly BUFFER_IN_MINUTES_FIELD = this.csharp.field({
        access: ast.Access.Private,
        const_: true,
        name: "BufferInMinutes",
        type: this.csharp.Type.double(),
        initializer: this.csharp.codeblock("2")
    });

    private readonly ACCESS_TOKEN_FIELD = this.csharp.field({
        access: ast.Access.Private,
        name: "_accessToken",
        type: this.csharp.Type.optional(this.csharp.Type.string())
    });

    private readonly EXPIRES_AT_FIELD = this.csharp.field({
        access: ast.Access.Private,
        name: "_expiresAt",
        type: this.csharp.Type.optional(this.csharp.Type.dateTime())
    });

    private readonly CLIENT_ID_FIELD = this.csharp.field({
        access: ast.Access.Private,
        name: "_clientId",
        type: this.csharp.Type.string()
    });

    private readonly CLIENT_SECRET_FIELD = this.csharp.field({
        access: ast.Access.Private,
        name: "_clientSecret",
        type: this.csharp.Type.string()
    });

    constructor({ context, scheme }: OauthTokenProviderGenerator.Args) {
        super(context);
        this.scheme = scheme;
        this.classReference = this.context.getOauthTokenProviderClassReference();
        this.tokenEndpointReference = this.scheme.configuration.tokenEndpoint.endpointReference;
        this.tokenEndpointHttpService = this.context.getHttpServiceOrThrow(this.tokenEndpointReference.serviceId);
        const httpEndpoint = this.context.resolveEndpointOrThrow(
            this.tokenEndpointHttpService,
            this.tokenEndpointReference.endpointId
        );
        this.tokenEndpoint = httpEndpoint;
        this.clientField = this.csharp.field({
            access: ast.Access.Private,
            name: "_client",
            type: this.csharp.Type.reference(
                this.context.getSubpackageClassReferenceForServiceIdOrThrow(this.tokenEndpointReference.serviceId)
            )
        });
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            ...this.classReference,
            partial: true,
            access: ast.Access.Public
        });

        class_.addField(this.BUFFER_IN_MINUTES_FIELD);
        class_.addField(this.ACCESS_TOKEN_FIELD);

        if (this.getExpiresIn() != null) {
            class_.addField(this.EXPIRES_AT_FIELD);
        }

        class_.addField(this.CLIENT_ID_FIELD);
        class_.addField(this.CLIENT_SECRET_FIELD);

        class_.addField(this.clientField);

        class_.addMethod(this.getAccessTokenMethod());

        class_.addConstructor({
            access: ast.Access.Public,
            parameters: [
                this.csharp.parameter({
                    name: "clientId",
                    type: this.csharp.Type.string()
                }),
                this.csharp.parameter({
                    name: "clientSecret",
                    type: this.csharp.Type.string()
                }),
                this.csharp.parameter({
                    name: "client",
                    type: this.clientField.type
                })
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeTextStatement(`${this.CLIENT_ID_FIELD.name} = clientId`);
                writer.writeTextStatement(`${this.CLIENT_SECRET_FIELD.name} = clientSecret`);
                writer.writeTextStatement(`${this.clientField.name} = client`);
            })
        });

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getCoreDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.context.getCoreDirectory(), RelativeFilePath.of(`${this.classReference.name}.cs`));
    }

    public static readonly GET_ACCESS_TOKEN_ASYNC_METHOD_NAME = "GetAccessTokenAsync";

    private getAccessTokenMethod(): ast.Method {
        return this.csharp.method({
            access: ast.Access.Public,
            isAsync: true,
            name: OauthTokenProviderGenerator.GET_ACCESS_TOKEN_ASYNC_METHOD_NAME,
            parameters: [],
            body: this.getAccessTokenBody(),
            return_: this.csharp.Type.string()
        });
    }

    private getAccessTokenBody(): ast.CodeBlock {
        const expiresIn = this.getExpiresIn();
        const tokenEndpoint = this.scheme.configuration.tokenEndpoint;

        return this.csharp.codeblock((writer) => {
            writer.controlFlow(
                "if",
                this.csharp.codeblock((writer) => {
                    writer.write(`${this.ACCESS_TOKEN_FIELD.name} == null`);
                    // check expiresIn if present in the IR
                    if (expiresIn != null) {
                        writer.write(`|| DateTime.UtcNow >= ${this.EXPIRES_AT_FIELD.name}`);
                    }
                })
            );

            writer.writeNodeStatement(
                this.csharp.codeblock((writer) => {
                    const requestType = this.tokenEndpoint.requestBody?._visit({
                        reference: (value) => {
                            return this.context.csharpTypeMapper.convert({ reference: value.requestBodyType });
                        },
                        inlinedRequestBody: (value) => {
                            return this.csharp.Type.reference(
                                this.context.getRequestWrapperReference(
                                    this.tokenEndpointReference.serviceId,
                                    value.name
                                )
                            );
                        },
                        fileUpload: (value) => undefined,
                        bytes: (value) => undefined,
                        _other: (value) => undefined
                    });
                    if (!this.csharp.is.Type.reference(requestType)) {
                        throw new Error("Failed to get request class reference");
                    }

                    writer.write("var tokenResponse = ");
                    writer.writeNode(
                        this.csharp.invokeMethod({
                            async: true,
                            method: `${this.clientField.name}.${this.context.getEndpointMethodName(
                                this.tokenEndpoint
                            )}`,
                            arguments_: [
                                this.csharp.instantiateClass({
                                    classReference: requestType.value,
                                    // TODO(dsinghvi): assumes only top level client id and client secret inputs
                                    arguments_: [
                                        {
                                            name: this.context.getNameForField(
                                                this.scheme.configuration.tokenEndpoint.requestProperties.clientId
                                                    .property.name
                                            ),
                                            assignment: this.csharp.codeblock(this.CLIENT_ID_FIELD.name)
                                        },
                                        {
                                            name: this.context.getNameForField(
                                                this.scheme.configuration.tokenEndpoint.requestProperties.clientSecret
                                                    .property.name
                                            ),
                                            assignment: this.csharp.codeblock(this.CLIENT_SECRET_FIELD.name)
                                        }
                                    ]
                                })
                            ]
                        })
                    );
                })
            );

            writer.writeTextStatement(
                `${this.ACCESS_TOKEN_FIELD.name} = tokenResponse.${this.dotAccess(
                    tokenEndpoint.responseProperties.accessToken.property,
                    tokenEndpoint.responseProperties.accessToken.propertyPath?.map((val) => val.name) ?? []
                )}`
            );

            if (expiresIn != null) {
                writer.writeTextStatement(
                    `${this.EXPIRES_AT_FIELD.name} = DateTime.UtcNow.AddSeconds(tokenResponse.${this.dotAccess(
                        expiresIn.property,
                        expiresIn.propertyPath?.map((val) => val.name) ?? []
                    )}).AddMinutes(-${this.BUFFER_IN_MINUTES_FIELD.name})`
                );
            }

            writer.endControlFlow();

            writer.writeTextStatement(`return $"Bearer {${this.ACCESS_TOKEN_FIELD.name}}"`);
        });
    }

    private getExpiresIn(): ResponseProperty | undefined {
        return this.scheme.configuration.tokenEndpoint.responseProperties.expiresIn;
    }

    private dotAccess(property: ObjectProperty, path?: Name[]): string {
        if (path != null && path.length > 0) {
            return `${path.map((val) => val.pascalCase).join(".")}.${property.name.name.pascalCase.safeName}`;
        }
        return property.name.name.pascalCase.safeName;
    }
}
