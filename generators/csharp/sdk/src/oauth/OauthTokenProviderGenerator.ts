import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, is } from "@fern-api/csharp-codegen";
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

    private addBufferInMinutesField(cls: ast.Class): ast.Field {
        return cls.addField({
            origin: cls.explicit("BufferInMinutes"),
            access: ast.Access.Private,
            const_: true,

            type: this.csharp.Type.double,
            initializer: this.csharp.codeblock("2")
        });
    }

    private addAccessTokenField(cls: ast.Class): ast.Field {
        return cls.addField({
            origin: cls.explicit("_accessToken"),
            access: ast.Access.Private,
            type: this.csharp.Type.optional(this.csharp.Type.string)
        });
    }

    private addExpiresAtField(cls: ast.Class): ast.Field {
        return cls.addField({
            origin: cls.explicit("_expiresAt"),
            access: ast.Access.Private,
            type: this.csharp.Type.optional(this.csharp.Type.dateTime)
        });
    }

    private addClientIdField(cls: ast.Class): ast.Field {
        return cls.addField({
            origin: cls.explicit("_clientId"),
            access: ast.Access.Private,
            type: this.csharp.Type.string
        });
    }

    private addClientSecretField(cls: ast.Class): ast.Field {
        return cls.addField({
            origin: cls.explicit("_clientSecret"),
            access: ast.Access.Private,
            type: this.csharp.Type.string
        });
    }

    constructor({ context, scheme }: OauthTokenProviderGenerator.Args) {
        super(context);
        this.scheme = scheme;
        this.classReference = this.types.OAuthTokenProvider;
        this.tokenEndpointReference = this.scheme.configuration.tokenEndpoint.endpointReference;
        this.tokenEndpointHttpService = this.context.common.getHttpServiceOrThrow(
            this.tokenEndpointReference.serviceId
        );
        const httpEndpoint = this.context.resolveEndpointOrThrow(
            this.tokenEndpointHttpService,
            this.tokenEndpointReference.endpointId
        );
        this.tokenEndpoint = httpEndpoint;
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.classReference,
            partial: true,
            access: ast.Access.Public
        });

        const clientField = class_.addField({
            origin: class_.explicit("_client"),
            access: ast.Access.Private,
            type: this.csharp.Type.reference(
                this.context.common.getSubpackageClassReferenceForServiceIdOrThrow(
                    this.tokenEndpointReference.serviceId
                )
            )
        });

        const bufferInMinutesField = this.addBufferInMinutesField(class_);
        const accessTokenField = this.addAccessTokenField(class_);

        let expiresAtField: ast.Field | undefined;
        if (this.getExpiresIn() != null) {
            expiresAtField = this.addExpiresAtField(class_);
        }

        const clientIdField = this.addClientIdField(class_);
        const clientSecretField = this.addClientSecretField(class_);

        this.getAccessTokenMethod(
            class_,
            clientField,
            accessTokenField,
            expiresAtField,
            bufferInMinutesField,
            clientIdField,
            clientSecretField
        );

        class_.addConstructor({
            access: ast.Access.Public,
            parameters: [
                this.csharp.parameter({
                    name: "clientId",
                    type: this.csharp.Type.string
                }),
                this.csharp.parameter({
                    name: "clientSecret",
                    type: this.csharp.Type.string
                }),
                this.csharp.parameter({
                    name: "client",
                    type: clientField.type
                })
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeTextStatement(`${clientIdField.name} = clientId`);
                writer.writeTextStatement(`${clientSecretField.name} = clientSecret`);
                writer.writeTextStatement(`${clientField.name} = client`);
            })
        });

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getCoreDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.context.getCoreDirectory(), RelativeFilePath.of(`${this.classReference.name}.cs`));
    }

    private getAccessTokenMethod(
        cls: ast.Class,
        clientField: ast.Field,
        accessTokenField: ast.Field,
        expiresAtField: ast.Field | undefined,
        bufferInMinutesField: ast.Field,
        clientIdField: ast.Field,
        clientSecretField: ast.Field
    ): ast.Method {
        return cls.addMethod({
            access: ast.Access.Public,
            isAsync: true,
            name: this.names.methods.getAccessTokenAsync,
            parameters: [],
            body: this.getAccessTokenBody(
                clientField,
                accessTokenField,
                expiresAtField,
                bufferInMinutesField,
                clientIdField,
                clientSecretField
            ),
            return_: this.csharp.Type.string
        });
    }

    private getAccessTokenBody(
        clientField: ast.Field,
        accessTokenField: ast.Field,
        expiresAtField: ast.Field | undefined,
        bufferInMinutesField: ast.Field,
        clientIdField: ast.Field,
        clientSecretField: ast.Field
    ): ast.CodeBlock {
        const expiresIn = this.getExpiresIn();
        const tokenEndpoint = this.scheme.configuration.tokenEndpoint;

        return this.csharp.codeblock((writer) => {
            writer.controlFlow(
                "if",
                this.csharp.codeblock((writer) => {
                    writer.write(`${accessTokenField.name} == null`);
                    // check expiresIn if present in the IR
                    if (expiresIn != null && expiresAtField != null) {
                        writer.write(`|| DateTime.UtcNow >= ${expiresAtField.name}`);
                    }
                })
            );

            writer.writeNodeStatement(
                this.csharp.codeblock((writer) => {
                    // NOTE: prior to the origin tracking, using the sdkRequest or the requestBody type would return
                    // the same type name.
                    // Now with origin tracking, they will not, because when a classreference is created for the same name
                    // but not same origin, the nameRegistry will force a redirection of the second one.
                    //
                    // so we really should find the origin that the request type is being generated from
                    // otherwise we'd need a rather hacky-lookup scheme.

                    // try to get the request type from the sdk request first
                    let requestType: ast.Type | undefined = this.tokenEndpoint.sdkRequest?.shape._visit({
                        wrapper: (value) => {
                            return this.csharp.Type.reference(
                                this.context.common.getRequestWrapperReference(
                                    this.tokenEndpointReference.serviceId,
                                    value.wrapperName
                                )
                            );
                        },
                        justRequestBody: (value) => {
                            return value._visit({
                                typeReference: (value) => {
                                    return this.context.csharpTypeMapper.convert({
                                        reference: value.requestBodyType
                                    });
                                },
                                bytes: (value) => {
                                    return undefined;
                                },
                                _other: (value) => {
                                    return undefined;
                                }
                            });
                        },
                        _other: (value) => {
                            return undefined;
                        }
                    });
                    requestType ??= this.tokenEndpoint.requestBody?._visit({
                        reference: (value) => {
                            return this.context.csharpTypeMapper.convert({ reference: value.requestBodyType });
                        },
                        inlinedRequestBody: (value) => {
                            return this.csharp.Type.reference(
                                this.context.common.getRequestWrapperReference(
                                    this.tokenEndpointReference.serviceId,
                                    value.name
                                )
                            );
                        },
                        fileUpload: (value) => undefined,
                        bytes: (value) => undefined,
                        _other: (value) => undefined
                    });
                    if (!is.Type.reference(requestType)) {
                        throw new Error("Failed to get request class reference");
                    }

                    writer.write("var tokenResponse = ");
                    writer.writeNode(
                        this.csharp.invokeMethod({
                            async: true,
                            method: `${clientField.name}.${this.context.getEndpointMethodName(this.tokenEndpoint)}`,
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
                                            assignment: this.csharp.codeblock(clientIdField.name)
                                        },
                                        {
                                            name: this.context.getNameForField(
                                                this.scheme.configuration.tokenEndpoint.requestProperties.clientSecret
                                                    .property.name
                                            ),
                                            assignment: this.csharp.codeblock(clientSecretField.name)
                                        }
                                    ]
                                })
                            ]
                        })
                    );
                })
            );

            writer.writeTextStatement(
                `${accessTokenField.name} = tokenResponse.${this.dotAccess(
                    tokenEndpoint.responseProperties.accessToken.property,
                    tokenEndpoint.responseProperties.accessToken.propertyPath?.map((val) => val.name) ?? []
                )}`
            );

            if (expiresIn != null && expiresAtField != null) {
                writer.writeTextStatement(
                    `${expiresAtField.name} = DateTime.UtcNow.AddSeconds(tokenResponse.${this.dotAccess(
                        expiresIn.property,
                        expiresIn.propertyPath?.map((val) => val.name) ?? []
                    )}).AddMinutes(-${bufferInMinutesField.name})`
                );
            }

            writer.endControlFlow();

            writer.writeTextStatement(`return $"Bearer {${accessTokenField.name}}"`);
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
