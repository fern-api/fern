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
import { getRequestBodyProperties } from "../utils/requestBodyUtils";

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
    private credentialFields = new Map<string, { field: ast.Field; propertyName: string; isOptional: boolean }>();

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
            access: ast.Access.Public
        });

        this.clientField = this.cls.addField({
            origin: this.cls.explicit("_client"),
            access: ast.Access.Private,
            type: this.context.getSubpackageClassReferenceForServiceId(this.tokenEndpointReference.serviceId)
        });

        // Only add caching-related fields when expiry property exists
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
            // When no expiry, we don't need these fields
            this.expiresAtField = undefined;
        }

        // Collect credential properties from the token endpoint request
        this.collectCredentialProperties();

        const ctor = this.cls.addConstructor({});

        // Add credential fields as constructor parameters
        for (const [parameter, { field }] of this.credentialFields.entries()) {
            ctor.body.assign(field, ctor.addParameter({ name: parameter, type: field.type }));
        }

        // Add the client as the last parameter and assign it in the body
        ctor.body.assign(this.clientField, ctor.addParameter({ name: "client", type: this.clientField.type }));

        this.cls.addMethod({
            access: ast.Access.Public,
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
        // Collect headers from the token endpoint
        for (const header of this.tokenEndpoint.headers) {
            const fieldName = header.name.name.camelCase.unsafeName;
            const typeRef = this.context.csharpTypeMapper.convert({ reference: header.valueType });

            // Skip literal types - they are hardcoded in the request
            if (header.valueType.type === "container" && header.valueType.container.type === "literal") {
                continue;
            }

            // Include both required and optional fields
            const field = this.cls.addField({
                origin: this.cls.explicit(this.format.private(fieldName)),
                access: ast.Access.Private,
                type: typeRef
            });
            // Use PascalCase property name for the request object initializer
            const propertyName = header.name.name.pascalCase.safeName;
            this.credentialFields.set(fieldName, { field, propertyName, isOptional: typeRef.isOptional });
        }

        // Collect body properties from the token endpoint
        getRequestBodyProperties(this.context, this.tokenEndpoint.requestBody)
            .filter((prop) => !this.credentialFields.has(prop.name.name.camelCase.unsafeName))
            .forEach((prop) => {
                const fieldName = prop.name.name.camelCase.unsafeName;
                const typeRef = this.context.csharpTypeMapper.convert({ reference: prop.valueType });

                const field = this.cls.addField({
                    origin: this.cls.explicit(this.format.private(fieldName)),
                    access: ast.Access.Private,
                    type: typeRef
                });
                // Use PascalCase property name for the request object initializer
                const propertyName = prop.name.name.pascalCase.safeName;
                this.credentialFields.set(fieldName, {
                    field,
                    propertyName,
                    isOptional: typeRef.isOptional
                });
            });

        // Validate that we have at least one credential field
        if (this.credentialFields.size === 0) {
            this.context.logger.warn(
                `Inferred auth token endpoint has no credential parameters (headers or body properties). ` +
                    `The token provider will be created but may not work as expected.`
            );
        }
    }

    private getAuthHeadersBody(): ast.CodeBlock {
        const authenticatedHeaders = this.scheme.tokenEndpoint.authenticatedRequestHeaders;

        // When there's no expiry property, match TypeScript behavior: don't cache, always fetch fresh
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

                // Build the headers dictionary from the authenticated request headers
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

        // When there IS an expiry property, use caching with refresh logic
        // Assert that these fields exist since we're in the expiry != null branch
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
            // First check without lock for performance
            writer.controlFlow(
                "if",
                this.csharp.codeblock((writer) => {
                    writer.write(`${cachedHeadersField.name} == null`);
                    writer.write(` || DateTime.UtcNow >= ${expiresAtField.name}`);
                })
            );

            // Acquire lock to ensure thread-safe token refresh
            writer.writeTextStatement(`await ${lockField.name}.WaitAsync().ConfigureAwait(false)`);
            writer.writeLine("try");
            writer.pushScope();

            // Double-check after acquiring lock
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

            // Build the headers dictionary from the authenticated request headers
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
            // Clear cache on error to force fresh fetch on next call
            writer.writeTextStatement(`${cachedHeadersField.name} = null`);
            writer.writeTextStatement(`${expiresAtField.name} = null`);
            writer.writeTextStatement("throw");
            writer.popScope();

            writer.endControlFlow(); // End if (double-check)

            writer.popScope();
            writer.writeLine("finally");
            writer.pushScope();
            writer.writeTextStatement(`${lockField.name}.Release()`);
            writer.popScope();

            writer.endControlFlow(); // End if (first check)

            writer.writeTextStatement(`return ${cachedHeadersField.name}`);
        });
    }

    private buildRequestArguments(): { name: string; assignment: ast.CodeBlock }[] {
        const arguments_: { name: string; assignment: ast.CodeBlock }[] = [];

        for (const { field, propertyName } of this.credentialFields.values()) {
            arguments_.push({
                name: propertyName,
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
        // Try to get the request type from the sdk request first
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
        }
        throw new Error("Failed to get request class reference");
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
