import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, is, lazy } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

type EndpointReference = FernIr.EndpointReference;
type HttpEndpoint = FernIr.HttpEndpoint;
type HttpService = FernIr.HttpService;
type OAuthScheme = FernIr.OAuthScheme;
type ObjectProperty = FernIr.ObjectProperty;
type ResponseProperty = FernIr.ResponseProperty;

import { fail } from "assert";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export declare namespace OauthTokenProviderGenerator {
    interface Args {
        scheme: OAuthScheme;
        context: SdkGeneratorContext;
    }
}

export class OauthTokenProviderGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private classReference: ast.ClassReference;
    private scheme: OAuthScheme;
    private tokenEndpointHttpService: HttpService;
    private tokenEndpointReference: EndpointReference;
    private tokenEndpoint: HttpEndpoint;
    private cls: ast.Class;
    private clientField: ast.Field;
    private bufferInMinutesField: ast.Field;
    private accessTokenField: ast.Field;
    private expiresAtField: ast.Field | undefined;
    private clientIdField: ast.Field;
    private clientSecretField: ast.Field;
    private expiresIn: ResponseProperty | undefined;
    private requestType: ast.ClassReference;
    private additionalRequestFields = new Map<string, ast.Field>();

    constructor({ context, scheme }: OauthTokenProviderGenerator.Args) {
        super(context);
        this.scheme = scheme;
        this.classReference = this.Types.OAuthTokenProvider;
        this.tokenEndpointReference = this.scheme.configuration.tokenEndpoint.endpointReference;
        this.tokenEndpointHttpService =
            this.context.getHttpService(this.tokenEndpointReference.serviceId) ??
            fail(`Service with id ${this.tokenEndpointReference.serviceId} not found`);
        this.expiresIn = this.scheme.configuration.tokenEndpoint.responseProperties.expiresIn;

        this.tokenEndpoint = this.context.resolveEndpoint(
            this.tokenEndpointHttpService,
            this.tokenEndpointReference.endpointId
        );

        this.requestType = this.getRequestType();

        this.cls = this.csharp.class_({
            reference: this.classReference,
            partial: true,
            access: ast.Access.Public
        });

        this.clientField = this.cls.addField({
            origin: this.cls.explicit("_client"),
            access: ast.Access.Private,
            type: this.context.getSubpackageClassReferenceForServiceId(this.tokenEndpointReference.serviceId)
        });

        this.bufferInMinutesField = this.cls.addField({
            origin: this.cls.explicit("BufferInMinutes"),
            access: ast.Access.Private,
            const_: true,

            type: this.Primitive.double,
            initializer: this.csharp.codeblock("2")
        });

        this.accessTokenField = this.cls.addField({
            origin: this.cls.explicit("_accessToken"),
            access: ast.Access.Private,
            type: this.Primitive.string.asOptional()
        });

        this.expiresAtField =
            this.expiresIn == null
                ? undefined
                : this.cls.addField({
                      origin: this.cls.explicit("_expiresAt"),
                      access: ast.Access.Private,
                      type: this.Value.dateTime.asOptional()
                  });

        this.clientIdField = this.cls.addField({
            origin: this.cls.explicit("_clientId"),
            access: ast.Access.Private,
            type: this.Primitive.string
        });

        this.clientSecretField = this.cls.addField({
            origin: this.cls.explicit("_clientSecret"),
            access: ast.Access.Private,
            type: this.Primitive.string
        });

        // Propagate required, non-literal custom properties from the token endpoint request
        // as fields on the class. Literal properties are hardcoded in the request class and
        // don't need to be passed through. This aligns with Java's approach of skipping only
        // literals, while also keeping the optional guard to avoid adding optional-typed
        // properties as required constructor parameters.
        for (const customProperty of this.scheme.configuration.tokenEndpoint.requestProperties.customProperties ?? []) {
            if (isLiteralTypeReference(customProperty.property.valueType)) {
                continue;
            }
            const typeRef = this.context.csharpTypeMapper.convert({
                reference: customProperty.property.valueType
            });
            if (typeRef.isOptional) {
                continue;
            }
            const name = this.model.getPropertyNameFor(this.case.resolveNameAndWireValue(customProperty.property.name));

            this.additionalRequestFields.set(
                name,
                this.cls.addField({
                    origin: this.cls.explicit(this.format.private(name)),
                    access: ast.Access.Private,
                    type: typeRef
                })
            );
        }
        const scopes = this.scheme.configuration.tokenEndpoint.requestProperties.scopes;
        if (scopes && !isLiteralTypeReference(scopes.property.valueType)) {
            const typeRef = this.context.csharpTypeMapper.convert({
                reference: scopes.property.valueType
            });
            if (!typeRef.isOptional) {
                const name = this.model.getPropertyNameFor(this.case.resolveNameAndWireValue(scopes.property.name));
                this.additionalRequestFields.set(
                    name,
                    this.cls.addField({
                        origin: this.cls.explicit(this.format.private(name)),
                        access: ast.Access.Private,
                        type: typeRef
                    })
                );
            }
        }

        const ctor = this.cls.addConstructor({});

        // add the client id and client secret as parameters and assign them in the body
        ctor.body.assign(this.clientIdField, ctor.addParameter({ name: "clientId", type: this.Primitive.string }));

        ctor.body.assign(
            this.clientSecretField,
            ctor.addParameter({ name: "clientSecret", type: this.Primitive.string })
        );

        // propagate additional request properties to constructor
        for (const [parameter, field] of this.additionalRequestFields.entries()) {
            // add each field as a parameter to the constructor and assign it in the body
            ctor.body.assign(field, ctor.addParameter({ name: parameter, type: field.type }));
        }

        // add the client as the last parameter and assign it in the body
        ctor.body.assign(this.clientField, ctor.addParameter({ name: "client", type: this.clientField.type }));

        this.cls.addMethod({
            access: ast.Access.Public,
            isAsync: true,
            name: this.names.methods.getAccessTokenAsync,
            body: this.getAccessTokenBody(),
            return_: this.Primitive.string
        });
    }

    public doGenerate(): CSharpFile {
        return new CSharpFile({
            clazz: this.cls,
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

    private getAccessTokenBody(): ast.CodeBlock {
        const tokenEndpoint = this.scheme.configuration.tokenEndpoint;

        return this.csharp.codeblock((writer) => {
            writer.controlFlow(
                "if",
                this.csharp.codeblock((writer) => {
                    writer.write(`${this.accessTokenField.name} == null`);
                    // check expiresIn if present in the IR
                    if (this.expiresIn != null && this.expiresAtField != null) {
                        writer.write(`|| DateTime.UtcNow >= ${this.expiresAtField.name}`);
                    }
                })
            );

            writer.writeNodeStatement(
                this.csharp.codeblock((writer) => {
                    writer.write("var tokenResponse = ");
                    writer.writeNode(
                        this.csharp.invokeMethod({
                            async: true,
                            method: `${this.clientField.name}.${this.context.getEndpointMethodName(this.tokenEndpoint)}`,
                            arguments_: [
                                this.csharp.instantiateClass({
                                    classReference: this.requestType,
                                    // TODO(dsinghvi): assumes only top level client id and client secret inputs
                                    arguments_: [
                                        {
                                            name: this.request.clientId,
                                            assignment: this.csharp.codeblock(this.clientIdField.name)
                                        },
                                        {
                                            name: this.request.secret,
                                            assignment: this.csharp.codeblock(this.clientSecretField.name)
                                        },
                                        ...this.additionalRequestFields.entries().map(([name, field]) => {
                                            return {
                                                name,
                                                assignment: this.csharp.codeblock(field.name)
                                            };
                                        })
                                    ]
                                })
                            ]
                        })
                    );
                })
            );

            writer.writeTextStatement(
                `${this.accessTokenField.name} = tokenResponse.${this.dotAccess(
                    tokenEndpoint.responseProperties.accessToken.property,
                    tokenEndpoint.responseProperties.accessToken.propertyPath?.map((val) => val.name) ?? []
                )}`
            );

            if (this.expiresIn != null && this.expiresAtField != null) {
                writer.writeTextStatement(
                    `${this.expiresAtField.name} = DateTime.UtcNow.AddSeconds(tokenResponse.${this.dotAccess(
                        this.expiresIn.property,
                        this.expiresIn.propertyPath?.map((val) => val.name) ?? []
                    )}).AddMinutes(-${this.bufferInMinutesField.name})`
                );
            }

            writer.endControlFlow();

            writer.writeTextStatement(`return $"Bearer {${this.accessTokenField.name}}"`);
        });
    }

    private request = lazy({
        clientId: () =>
            this.context.getNameForField(
                this.case.resolveNameAndWireValue(
                    this.scheme.configuration.tokenEndpoint.requestProperties.clientId.property.name
                )
            ),
        secret: () =>
            this.context.getNameForField(
                this.case.resolveNameAndWireValue(
                    this.scheme.configuration.tokenEndpoint.requestProperties.clientSecret.property.name
                )
            )
    });

    private getRequestType(): ast.ClassReference {
        // NOTE: prior to the origin tracking, using the sdkRequest or the requestBody type would return
        // the same type name.
        // Now with origin tracking, they will not, because when a classreference is created for the same name
        // but not same origin, the nameRegistry will force a redirection of the second one.
        //
        // so we really should find the origin that the request type is being generated from
        // otherwise we'd need a rather hacky-lookup scheme.

        // try to get the request type from the sdk request first
        const requestWrapper = this.getRequestBody();
        if (requestWrapper) {
            return this.context.getRequestWrapperReference(this.tokenEndpointReference.serviceId, requestWrapper);
        }
        const reference = this.requestTypeReference();
        if (reference) {
            const typeRef = this.context.csharpTypeMapper.convert({ reference });
            if (is.ClassReference(typeRef)) {
                return typeRef;
            }
        }
        throw new Error("Failed to get request class reference");
    }

    private getRequestBody() {
        return (
            this.tokenEndpoint.sdkRequest?.shape._visit({
                _other: (value) => undefined,
                justRequestBody: (value) => undefined,
                wrapper: (value) => value
            }) ??
            this.tokenEndpoint.requestBody?._visit({
                _other: (value) => undefined,
                reference: (value) => undefined,
                fileUpload: (value) => undefined,
                bytes: (value) => undefined,
                inlinedRequestBody: (value) => value
            })
        );
    }

    private rtr() {
        if (
            is.IR.SdkRequestShape.JustRequestBody(this.tokenEndpoint.sdkRequest?.shape) &&
            is.IR.SdkRequestBodyType.TypeReference(this.tokenEndpoint.sdkRequest.shape.value)
        ) {
            return this.tokenEndpoint.sdkRequest.shape.value.requestBodyType;
        }

        if (is.IR.HttpRequestBody.Reference(this.tokenEndpoint.requestBody)) {
            return this.tokenEndpoint.requestBody.requestBodyType;
        }

        return undefined;
    }

    private requestTypeReference() {
        return (
            this.tokenEndpoint.sdkRequest?.shape._visit({
                _other: (value) => undefined,
                wrapper: (value) => undefined,
                justRequestBody: (value) =>
                    value._visit({
                        typeReference: (value) => value.requestBodyType,
                        bytes: (value) => undefined,
                        _other: (value) => undefined
                    })
            }) ??
            this.tokenEndpoint.requestBody?._visit({
                _other: (value) => undefined,
                inlinedRequestBody: (value) => undefined,
                fileUpload: (value) => undefined,
                bytes: (value) => undefined,
                reference: (value) => value.requestBodyType
            })
        );
    }

    private dotAccess(property: ObjectProperty, path?: FernIr.NameOrString[]): string {
        if (path != null && path.length > 0) {
            return `${path.map((val) => this.case.pascalSafe(val)).join(".")}.${this.case.pascalSafe(property.name)}`;
        }
        return this.case.pascalSafe(property.name);
    }
}

/**
 * Checks if a type reference is a literal type (container with literal value).
 * Literal properties are hardcoded in the request class and should not be
 * propagated as constructor parameters.
 */
function isLiteralTypeReference(typeReference: FernIr.TypeReference): boolean {
    return typeReference.type === "container" && typeReference.container.type === "literal";
}
