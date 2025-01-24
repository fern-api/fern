import { CSharpFile, FileGenerator, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import {
    EndpointId,
    EndpointReference,
    ExampleRequestBody,
    HttpEndpoint,
    HttpService,
    Name,
    OAuthScheme,
    ObjectProperty,
    ResponseProperty,
    http
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
    private classReference: csharp.ClassReference;
    private scheme: OAuthScheme;
    private tokenEndpointHttpService: HttpService;
    private tokenEndpointReference: EndpointReference;
    private tokenEndpoint: HttpEndpoint;
    private clientField: csharp.Field;

    private static readonly BUFFER_IN_MINUTES_FIELD = csharp.field({
        access: csharp.Access.Private,
        const_: true,
        name: "BufferInMinutes",
        type: csharp.Type.double(),
        initializer: csharp.codeblock("2")
    });

    private static readonly ACCESS_TOKEN_FIELD = csharp.field({
        access: csharp.Access.Private,
        name: "_accessToken",
        type: csharp.Type.optional(csharp.Type.string())
    });

    private static readonly EXPIRES_AT_FIELD = csharp.field({
        access: csharp.Access.Private,
        name: "_expiresAt",
        type: csharp.Type.optional(csharp.Type.dateTime())
    });

    private static readonly CLIENT_ID_FIELD = csharp.field({
        access: csharp.Access.Private,
        name: "_clientId",
        type: csharp.Type.string()
    });

    private static readonly CLIENT_SECRET_FIELD = csharp.field({
        access: csharp.Access.Private,
        name: "_clientSecret",
        type: csharp.Type.string()
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
        this.clientField = csharp.field({
            access: csharp.Access.Private,
            name: "_client",
            type: csharp.Type.reference(
                this.context.getSubpackageClassReferenceForServiceIdOrThrow(this.tokenEndpointReference.serviceId)
            )
        });
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.classReference,
            partial: true,
            access: csharp.Access.Public
        });

        class_.addField(OauthTokenProviderGenerator.BUFFER_IN_MINUTES_FIELD);
        class_.addField(OauthTokenProviderGenerator.ACCESS_TOKEN_FIELD);

        if (this.getExpiresIn() != null) {
            class_.addField(OauthTokenProviderGenerator.EXPIRES_AT_FIELD);
        }

        class_.addField(OauthTokenProviderGenerator.CLIENT_ID_FIELD);
        class_.addField(OauthTokenProviderGenerator.CLIENT_SECRET_FIELD);

        class_.addField(this.clientField);

        class_.addMethod(this.getAccessTokenMethod());

        class_.addConstructor({
            access: csharp.Access.Public,
            parameters: [
                csharp.parameter({
                    name: "clientId",
                    type: csharp.Type.string()
                }),
                csharp.parameter({
                    name: "clientSecret",
                    type: csharp.Type.string()
                }),
                csharp.parameter({
                    name: "client",
                    type: this.clientField.type
                })
            ],
            body: csharp.codeblock((writer) => {
                writer.writeTextStatement(`${OauthTokenProviderGenerator.CLIENT_ID_FIELD.name} = clientId`);
                writer.writeTextStatement(`${OauthTokenProviderGenerator.CLIENT_SECRET_FIELD.name} = clientSecret`);
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

    private getAccessTokenMethod(): csharp.Method {
        return csharp.method({
            access: csharp.Access.Public,
            isAsync: true,
            name: OauthTokenProviderGenerator.GET_ACCESS_TOKEN_ASYNC_METHOD_NAME,
            parameters: [],
            body: this.getAccessTokenBody(),
            return_: csharp.Type.string()
        });
    }

    private getAccessTokenBody(): csharp.CodeBlock {
        const expiresIn = this.getExpiresIn();
        const tokenEndpoint = this.scheme.configuration.tokenEndpoint;

        return csharp.codeblock((writer) => {
            writer.controlFlow(
                "if",
                csharp.codeblock((writer) => {
                    writer.write(`${OauthTokenProviderGenerator.ACCESS_TOKEN_FIELD.name} == null`);
                    // check expiresIn if present in the IR
                    if (expiresIn != null) {
                        writer.write(`|| DateTime.UtcNow >= ${OauthTokenProviderGenerator.EXPIRES_AT_FIELD.name}`);
                    }
                })
            );

            writer.writeNodeStatement(
                csharp.codeblock((writer) => {
                    const requestType = this.tokenEndpoint.requestBody?._visit({
                        reference: (value) => {
                            return this.context.csharpTypeMapper.convert({ reference: value.requestBodyType });
                        },
                        inlinedRequestBody: (value) => {
                            return csharp.Type.reference(
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
                    if (requestType == null || requestType.internalType.type !== "reference") {
                        throw new Error("Failed to get request class reference");
                    }

                    writer.write("var tokenResponse = ");
                    writer.writeNode(
                        csharp.invokeMethod({
                            async: true,
                            method: `${this.clientField.name}.${this.context.getEndpointMethodName(
                                this.tokenEndpoint
                            )}`,
                            arguments_: [
                                csharp.instantiateClass({
                                    classReference: requestType.internalType.value,
                                    // TODO(dsinghvi): assumes only top level client id and client secret inputs
                                    arguments_: [
                                        {
                                            name: this.context.getNameForField(
                                                this.scheme.configuration.tokenEndpoint.requestProperties.clientId
                                                    .property.name
                                            ),
                                            assignment: csharp.codeblock(
                                                OauthTokenProviderGenerator.CLIENT_ID_FIELD.name
                                            )
                                        },
                                        {
                                            name: this.context.getNameForField(
                                                this.scheme.configuration.tokenEndpoint.requestProperties.clientSecret
                                                    .property.name
                                            ),
                                            assignment: csharp.codeblock(
                                                OauthTokenProviderGenerator.CLIENT_SECRET_FIELD.name
                                            )
                                        }
                                    ]
                                })
                            ]
                        })
                    );
                })
            );

            writer.writeTextStatement(
                `${OauthTokenProviderGenerator.ACCESS_TOKEN_FIELD.name} = tokenResponse.${this.dotAccess(
                    tokenEndpoint.responseProperties.accessToken.property,
                    tokenEndpoint.responseProperties.accessToken.propertyPath
                )}`
            );

            if (expiresIn != null) {
                writer.writeTextStatement(
                    `${
                        OauthTokenProviderGenerator.EXPIRES_AT_FIELD.name
                    } = DateTime.UtcNow.AddSeconds(tokenResponse.${this.dotAccess(
                        expiresIn.property,
                        expiresIn.propertyPath
                    )}).AddMinutes(-${OauthTokenProviderGenerator.BUFFER_IN_MINUTES_FIELD.name})`
                );
            }

            writer.endControlFlow();

            writer.writeTextStatement(`return $"Bearer {${OauthTokenProviderGenerator.ACCESS_TOKEN_FIELD.name}}"`);
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
