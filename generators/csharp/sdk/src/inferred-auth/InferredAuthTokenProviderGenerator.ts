import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, is } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import {
    EndpointReference,
    HttpEndpoint,
    HttpService,
    InferredAuthScheme,
    ResponseProperty
} from "@fern-fern/ir-sdk/api";
import { fail } from "assert";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { collectInferredAuthCredentials } from "../utils/inferredAuthUtils";

export declare namespace InferredAuthTokenProviderGenerator {
    interface Args {
        scheme: InferredAuthScheme;
        context: SdkGeneratorContext;
    }
}

export class InferredAuthTokenProviderGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private classReference: ast.ClassReference;
    private scheme: InferredAuthScheme;
    private tokenEndpointHttpService: HttpService;
    private tokenEndpointReference: EndpointReference;
    private tokenEndpoint: HttpEndpoint;
    private cls: ast.Class;
    private clientField: ast.Field;
    private bufferInMinutesField: ast.Field | undefined;
    private cachedHeadersField: ast.Field | undefined;
    private expiresAtField: ast.Field | undefined;
    private lockField: ast.Field | undefined;
    private expiryProperty: ResponseProperty | undefined;
    private requestType: ast.ClassReference;
    private credentialFields = new Map<string, { field: ast.Field; pascalName: string; isOptional: boolean }>();

    constructor({ context, scheme }: InferredAuthTokenProviderGenerator.Args) {
        super(context);
        this.scheme = scheme;
        this.classReference = this.Types.InferredAuthTokenProvider;
        this.tokenEndpointReference = this.scheme.tokenEndpoint.endpoint;
        this.tokenEndpointHttpService =
            this.context.getHttpService(this.tokenEndpointReference.serviceId) ??
            fail(`Service with id ${this.tokenEndpointReference.serviceId} not found`);
        this.expiryProperty = this.scheme.tokenEndpoint.expiryProperty;

        this.tokenEndpoint = this.context.resolveEndpoint(
            this.tokenEndpointHttpService,
            this.tokenEndpointReference.endpointId
        );

        this.requestType = this.getRequestType();

        this.cls = this.csharp.class_({
            reference: this.classReference,
            partial: true,
            access: ast.Access.Internal
        });

        this.clientField = this.cls.addField({
            origin: this.cls.explicit("_client"),
            access: ast.Access.Private,
            type: this.context.getSubpackageClassReferenceForServiceId(this.tokenEndpointReference.serviceId)
        });

        if (this.expiryProperty != null) {
            this.bufferInMinutesField = this.cls.addField({
                origin: this.cls.explicit("BufferInMinutes"),
                access: ast.Access.Private,
                const_: true,
                type: this.Primitive.double,
                initializer: this.csharp.codeblock("2")
            });

            this.cachedHeadersField = this.cls.addField({
                origin: this.cls.explicit("_cachedHeaders"),
                access: ast.Access.Private,
                type: this.Collection.idictionary(this.Primitive.string, this.Primitive.string).asOptional()
            });

            this.expiresAtField = this.cls.addField({
                origin: this.cls.explicit("_expiresAt"),
                access: ast.Access.Private,
                type: this.Value.dateTime.asOptional()
            });

            this.lockField = this.cls.addField({
                origin: this.cls.explicit("_lock"),
                access: ast.Access.Private,
                readonly: true,
                type: this.csharp.classReference({
                    name: "SemaphoreSlim",
                    namespace: "System.Threading"
                }),
                initializer: this.csharp.codeblock("new SemaphoreSlim(1, 1)")
            });
        } else {
            this.expiresAtField = undefined;
        }

        this.collectCredentialProperties();

        const ctor = this.cls.addConstructor({ access: ast.Access.Internal });

        for (const [parameter, { field }] of this.credentialFields.entries()) {
            ctor.body.assign(field, ctor.addParameter({ name: parameter, type: field.type }));
        }

        ctor.body.assign(this.clientField, ctor.addParameter({ name: "client", type: this.clientField.type }));

        this.cls.addMethod({
            access: ast.Access.Internal,
            isAsync: true,
            name: this.names.methods.getAuthHeadersAsync,
            body: this.getAuthHeadersBody(),
            return_: this.Collection.idictionary(this.Primitive.string, this.Primitive.string)
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

    private collectCredentialProperties(): void {
        const credentials = collectInferredAuthCredentials(this.context, this.tokenEndpoint);

        for (const credential of credentials) {
            const typeRef = this.context.csharpTypeMapper.convert({
                reference: credential.typeReference
            });

            const field = this.cls.addField({
                origin: this.cls.explicit(this.format.private(credential.camelName)),
                access: ast.Access.Private,
                type: typeRef
            });

            this.credentialFields.set(credential.camelName, {
                field,
                pascalName: credential.pascalName,
                isOptional: credential.isOptional
            });
        }

        if (this.credentialFields.size === 0) {
            this.context.logger.warn(
                `Inferred auth token endpoint has no credential parameters (headers or body properties). ` +
                    `The token provider will be created but may not work as expected.`
            );
        }
    }

    private getAuthHeadersBody(): ast.CodeBlock {
        const authenticatedHeaders = this.scheme.tokenEndpoint.authenticatedRequestHeaders;

        if (this.expiryProperty == null) {
            return this.csharp.codeblock((writer) => {
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
                                        arguments_: this.buildRequestArguments()
                                    })
                                ]
                            })
                        );
                    })
                );

                writer.writeTextStatement("var headers = new Dictionary<string, string>()");

                for (const authHeader of authenticatedHeaders) {
                    const headerName = authHeader.headerName;
                    const valuePrefix = authHeader.valuePrefix ?? "";
                    const accessorChain = this.buildResponsePropertyAccessor(
                        "tokenResponse",
                        authHeader.responseProperty
                    );

                    if (valuePrefix !== "") {
                        writer.writeTextStatement(`headers["${headerName}"] = $"${valuePrefix}{${accessorChain}}"`);
                    } else {
                        writer.writeTextStatement(`headers["${headerName}"] = ${accessorChain}`);
                    }
                }

                writer.writeTextStatement("return headers");
            });
        }

        if (
            this.cachedHeadersField == null ||
            this.expiresAtField == null ||
            this.lockField == null ||
            this.bufferInMinutesField == null ||
            this.expiryProperty == null
        ) {
            throw new Error("Caching fields should be defined when expiryProperty is not null");
        }

        const cachedHeadersField = this.cachedHeadersField;
        const expiresAtField = this.expiresAtField;
        const lockField = this.lockField;
        const bufferInMinutesField = this.bufferInMinutesField;
        const expiryProperty = this.expiryProperty;

        return this.csharp.codeblock((writer) => {
            writer.controlFlow(
                "if",
                this.csharp.codeblock((writer) => {
                    writer.write(`${cachedHeadersField.name} == null`);
                    writer.write(` || DateTime.UtcNow >= ${expiresAtField.name}`);
                })
            );

            writer.writeTextStatement(`await ${lockField.name}.WaitAsync().ConfigureAwait(false)`);
            writer.writeLine("try");
            writer.pushScope();

            writer.controlFlow(
                "if",
                this.csharp.codeblock((writer) => {
                    writer.write(`${cachedHeadersField.name} == null`);
                    writer.write(` || DateTime.UtcNow >= ${expiresAtField.name}`);
                })
            );

            writer.writeLine("try");
            writer.pushScope();

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
                                    arguments_: this.buildRequestArguments()
                                })
                            ]
                        })
                    );
                })
            );

            writer.writeTextStatement(`${cachedHeadersField.name} = new Dictionary<string, string>()`);

            for (const authHeader of authenticatedHeaders) {
                const headerName = authHeader.headerName;
                const valuePrefix = authHeader.valuePrefix ?? "";
                const accessorChain = this.buildResponsePropertyAccessor("tokenResponse", authHeader.responseProperty);

                if (valuePrefix !== "") {
                    writer.writeTextStatement(
                        `${cachedHeadersField.name}["${headerName}"] = $"${valuePrefix}{${accessorChain}}"`
                    );
                } else {
                    writer.writeTextStatement(`${cachedHeadersField.name}["${headerName}"] = ${accessorChain}`);
                }
            }

            const expiryAccessor = this.buildResponsePropertyAccessor("tokenResponse", expiryProperty);
            writer.writeTextStatement(
                `${expiresAtField.name} = DateTime.UtcNow.AddSeconds(${expiryAccessor}).AddMinutes(-${bufferInMinutesField.name})`
            );

            writer.popScope();
            writer.writeLine("catch");
            writer.pushScope();
            writer.writeTextStatement(`${cachedHeadersField.name} = null`);
            writer.writeTextStatement(`${expiresAtField.name} = null`);
            writer.writeTextStatement("throw");
            writer.popScope();

            writer.endControlFlow();

            writer.popScope();
            writer.writeLine("finally");
            writer.pushScope();
            writer.writeTextStatement(`${lockField.name}.Release()`);
            writer.popScope();

            writer.endControlFlow();

            writer.writeTextStatement(`return ${cachedHeadersField.name}`);
        });
    }

    private buildRequestArguments(): {
        name: string;
        assignment: ast.CodeBlock;
    }[] {
        const arguments_: { name: string; assignment: ast.CodeBlock }[] = [];

        for (const { field, pascalName } of this.credentialFields.values()) {
            arguments_.push({
                name: pascalName,
                assignment: this.csharp.codeblock(field.name)
            });
        }

        return arguments_;
    }

    private buildResponsePropertyAccessor(responseVar: string, responseProperty: ResponseProperty): string {
        let accessor = responseVar;

        if (responseProperty.propertyPath != null && responseProperty.propertyPath.length > 0) {
            for (const pathElement of responseProperty.propertyPath) {
                accessor += `.${pathElement.name.pascalCase.safeName}`;
            }
        }

        accessor += `.${responseProperty.property.name.name.pascalCase.safeName}`;

        return accessor;
    }

    private getRequestType(): ast.ClassReference {
        const requestWrapper = this.requestWrapperName();
        if (requestWrapper) {
            return this.context.getRequestWrapperReference(this.tokenEndpointReference.serviceId, requestWrapper);
        }
        const reference = this.requestTypeReference();
        if (reference) {
            const typeRef = this.context.csharpTypeMapper.convert({ reference });
            if (is.ClassReference(typeRef)) {
                return typeRef;
            }
            throw new Error(
                `Failed to get request class reference for inferred auth token endpoint. ` +
                    `Expected ClassReference but got ${typeRef.constructor.name}. ` +
                    `Service ID: ${this.tokenEndpointReference.serviceId}, ` +
                    `Endpoint ID: ${this.tokenEndpointReference.endpointId}`
            );
        }
        throw new Error(
            `Failed to get request type reference for inferred auth token endpoint. ` +
                `Service ID: ${this.tokenEndpointReference.serviceId}, ` +
                `Endpoint ID: ${this.tokenEndpointReference.endpointId}. ` +
                `The token endpoint must have either an SDK request wrapper or a request body.`
        );
    }

    private requestWrapperName() {
        return (
            this.tokenEndpoint.sdkRequest?.shape._visit({
                _other: () => undefined,
                justRequestBody: () => undefined,
                wrapper: (value) => value.wrapperName
            }) ??
            this.tokenEndpoint.requestBody?._visit({
                _other: () => undefined,
                reference: () => undefined,
                fileUpload: () => undefined,
                bytes: () => undefined,
                inlinedRequestBody: (value) => value.name
            })
        );
    }

    private requestTypeReference() {
        return (
            this.tokenEndpoint.sdkRequest?.shape._visit({
                _other: () => undefined,
                wrapper: () => undefined,
                justRequestBody: (value) =>
                    value._visit({
                        typeReference: (value) => value.requestBodyType,
                        bytes: () => undefined,
                        _other: () => undefined
                    })
            }) ??
            this.tokenEndpoint.requestBody?._visit({
                _other: () => undefined,
                inlinedRequestBody: () => undefined,
                fileUpload: () => undefined,
                bytes: () => undefined,
                reference: (value) => value.requestBodyType
            })
        );
    }
}
