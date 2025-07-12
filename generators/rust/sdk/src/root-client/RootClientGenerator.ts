import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { FileGenerator, RustFile } from "@fern-api/rust-base";
import { rust } from "@fern-api/rust-codegen";

import {
    AuthScheme,
    ContainerType,
    HttpHeader,
    Literal,
    PrimitiveTypeV1,
    Subpackage,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

interface ConstructorParameters {
    all: ConstructorParameter[];
    required: ConstructorParameter[];
    optional: ConstructorParameter[];
    literal: LiteralParameter[];
}

interface ConstructorParameter {
    name: string;
    isOptional: boolean;
    typeReference: TypeReference;
    docs?: string;
    header?: HeaderInfo;
    environmentVariable?: string;
}

interface LiteralParameter {
    name: string;
    value: Literal;
    docs?: string;
    header?: HeaderInfo;
    environmentVariable?: string;
}

interface HeaderInfo {
    name: string;
    prefix?: string;
}

const STRING_TYPE_REFERENCE = TypeReference.primitive({
    v1: PrimitiveTypeV1.String,
    v2: undefined
});

const BEARER_HEADER_INFO: HeaderInfo = {
    name: "Authorization",
    prefix: "Bearer"
};

const GET_FROM_ENV_OR_THROW = "getFromEnvOrThrow";

export class RootClientGenerator extends FileGenerator<RustFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of(this.context.getRootClientStructName() + ".rs"));
    }

    public doGenerate(): RustFile {
        const struct = rust.struct({
            name: this.context.getRootClientStructName(),
            namespace: this.context.getRootNamespace()
        });

        if (!this.context.ir.rootPackage.hasEndpointsInTree) {
            return this.newRootClientFile(struct);
        }

        struct.addField(
            rust.field({
                name: `$${this.context.getClientOptionsName()}`,
                access: "private",
                type: this.context.getClientOptionsType()
            })
        );
        struct.addField(this.context.rawClient.getField());

        const subpackages = this.getRootSubpackages();
        const constructorParameters = this.getConstructorParameters();
        struct.addConstructor(
            this.getConstructorMethod({
                constructorParameters,
                subpackages
            })
        );

        for (const subpackage of subpackages) {
            struct.addField(this.context.getSubpackageField(subpackage));
        }

        const rootServiceId = this.context.ir.rootPackage.service;
        if (rootServiceId != null) {
            const service = this.context.getHttpServiceOrThrow(rootServiceId);
            for (const endpoint of service.endpoints) {
                const methods = this.context.endpointGenerator.generate({
                    serviceId: rootServiceId,
                    service,
                    endpoint
                });
                struct.addMethods(methods);
            }
        }

        if (constructorParameters.optional.some((parameter) => parameter.environmentVariable != null)) {
            struct.addMethod(this.getFromEnvOrThrowMethod());
        }

        return this.newRootClientFile(struct);
    }

    private getConstructorMethod({
        constructorParameters,
        subpackages
    }: {
        constructorParameters: ConstructorParameters;
        subpackages: Subpackage[];
    }): rust.Class.Constructor {
        const parameters: rust.Parameter[] = [];
        for (const param of [...constructorParameters.required, ...constructorParameters.optional]) {
            parameters.push(
                rust.parameter({
                    name: param.name,
                    type: this.context.rustTypeMapper.convert({ reference: param.typeReference }),
                    docs: param.docs
                })
            );
        }
        for (const param of constructorParameters.literal) {
            parameters.push(
                rust.parameter({
                    name: param.name,
                    type: this.getLiteralRootClientParameterType({ literal: param.value }),
                    docs: param.docs
                })
            );
        }

        parameters.push(
            rust.parameter({
                name: this.context.getClientOptionsName(),
                type: rust.Type.optional(this.context.getClientOptionsType()),
                initializer: rust.codeblock("null")
            })
        );

        const headerEntries: rust.Map.Entry[] = [];
        for (const param of constructorParameters.required) {
            if (param.header != null) {
                headerEntries.push({
                    key: rust.codeblock(`'${param.header.name}'`),
                    value: this.getHeaderValue({ prefix: param.header.prefix, parameterName: param.name })
                });
            }
        }
        for (const param of constructorParameters.optional) {
            if (param.header != null && param.environmentVariable != null) {
                // Variables backed by an environment variable can be instantiated in-line.
                headerEntries.push({
                    key: rust.codeblock(`'${param.header.name}'`),
                    value: this.getHeaderValue({ prefix: param.header.prefix, parameterName: param.name })
                });
            }
        }

        for (const param of constructorParameters.literal) {
            if (param.header != null) {
                headerEntries.push({
                    key: rust.codeblock(`'${param.header.name}'`),
                    value: rust.codeblock(this.context.getLiteralAsString(param.value))
                });
            }
        }

        const platformHeaders = this.context.ir.sdkConfig.platformHeaders;
        headerEntries.push({
            key: rust.codeblock(`'${platformHeaders.language}'`),
            value: rust.codeblock("'PHP'")
        });
        headerEntries.push({
            key: rust.codeblock(`'${platformHeaders.sdkName}'`),
            value: rust.codeblock(`'${this.context.getRootNamespace()}'`)
        });
        if (this.context.version != null) {
            headerEntries.push({
                key: rust.codeblock(`'${platformHeaders.sdkVersion}'`),
                value: rust.codeblock(`'${this.context.version}'`)
            });
        }
        const userAgent = this.context.getUserAgent();
        if (userAgent != null) {
            headerEntries.push({
                key: rust.codeblock(`'${userAgent.header}'`),
                value: rust.codeblock(`'${userAgent.value}'`)
            });
        }
        const headers = rust.map({
            entries: headerEntries,
            multiline: true
        });
        return {
            access: "public",
            parameters,
            body: rust.codeblock((writer) => {
                for (const param of constructorParameters.optional) {
                    if (param.environmentVariable != null) {
                        writer.write(`$${param.name} ??= `);
                        writer.writeNodeStatement(
                            rust.invokeMethod({
                                method: `$this->${GET_FROM_ENV_OR_THROW}`,
                                arguments_: [
                                    rust.codeblock(`'${param.environmentVariable}'`),
                                    rust.codeblock(
                                        `'Please pass in ${param.name} or set the environment variable ${param.environmentVariable}.'`
                                    )
                                ]
                            })
                        );
                    }
                }

                writer.write("$defaultHeaders = ");
                writer.writeNodeStatement(headers);
                for (const param of constructorParameters.optional) {
                    if (param.header != null && param.environmentVariable == null) {
                        writer.controlFlow("if", rust.codeblock(`$${param.name} != null`));
                        writer.write(`$defaultHeaders['${param.header.name}'] = `);
                        writer.writeNodeStatement(
                            this.getHeaderValue({ prefix: param.header.prefix, parameterName: param.name })
                        );
                        writer.endControlFlow();
                    }
                }
                for (const param of constructorParameters.literal) {
                    if (param.header != null) {
                        writer.controlFlow("if", rust.codeblock(`$${param.name} != null`));
                        writer.write(`$defaultHeaders['${param.header.name}'] = `);
                        writer.writeNodeStatement(
                            this.getHeaderValue({ prefix: param.header.prefix, parameterName: param.name })
                        );
                        writer.endControlFlow();
                    }
                }
                writer.writeLine();

                writer.writeNodeStatement(
                    rust.codeblock((writer) => {
                        writer.write(`$this->${this.context.getClientOptionsName()} = `);
                        writer.writeNode(rust.variable(this.context.getClientOptionsName()));
                        writer.write(" ?? []");
                    })
                );
                writer.write(
                    `$this->${this.context.getClientOptionsName()}['${this.context.getHeadersOptionName()}'] = `
                );
                writer.writeNodeStatement(
                    rust.invokeMethod({
                        method: "array_merge",
                        arguments_: [
                            rust.codeblock("$defaultHeaders"),
                            rust.codeblock(
                                `$this->${this.context.getClientOptionsName()}['${this.context.getHeadersOptionName()}'] ?? []`
                            )
                        ],
                        multiline: true
                    })
                );
                writer.writeLine();

                writer.write("$this->client = ");
                writer.writeNodeStatement(
                    this.context.rawClient.instantiate({
                        arguments_: [
                            {
                                name: "options",
                                assignment: rust.codeblock((writer) => {
                                    const clientOptions = `$this->${this.context.getClientOptionsName()}`;
                                    writer.write(clientOptions);
                                })
                            }
                        ]
                    })
                );

                if (subpackages.length > 0) {
                    writer.writeLine();
                }

                for (const subpackage of subpackages) {
                    writer.write(`$this->${subpackage.name.camelCase.safeName} = `);
                    writer.writeNodeStatement(
                        rust.instantiateClass({
                            classReference: this.context.getSubpackageClassReference(subpackage),
                            arguments_: [
                                rust.codeblock(`$this->${this.context.rawClient.getFieldName()}`),
                                rust.codeblock(`$this->${this.context.getClientOptionsName()}`)
                            ]
                        })
                    );
                }
            })
        };
    }

    private getFromEnvOrThrowMethod(): rust.Method {
        return rust.method({
            access: "private",
            name: GET_FROM_ENV_OR_THROW,
            return_: rust.Type.string(),
            parameters: [
                rust.parameter({
                    name: "env",
                    type: rust.Type.string()
                }),
                rust.parameter({
                    name: "message",
                    type: rust.Type.string()
                })
            ],
            body: rust.codeblock((writer) => {
                writer.writeTextStatement("$value = getenv($env)");
                writer.write("return $value ? (string) $value : throw new ");
                writer.writeNode(this.context.getExceptionClassReference());
                writer.writeTextStatement("($message)");
            })
        });
    }

    private getConstructorParameters(): ConstructorParameters {
        const allParameters: ConstructorParameter[] = [];
        const requiredParameters: ConstructorParameter[] = [];
        const optionalParameters: ConstructorParameter[] = [];
        const literalParameters: LiteralParameter[] = [];

        for (const scheme of this.context.ir.auth.schemes) {
            allParameters.push(...this.getParameterForAuthScheme(scheme));
        }

        for (const header of this.context.ir.headers) {
            allParameters.push(this.getParameterForHeader(header));
        }

        for (const param of allParameters) {
            if (param.isOptional || param.environmentVariable != null) {
                optionalParameters.push(param);
                continue;
            }
            const literal = this.context.maybeLiteral(param.typeReference);
            if (literal != null) {
                literalParameters.push({
                    name: param.name,
                    value: literal,
                    docs: param.docs,
                    header: param.header,
                    environmentVariable: param.environmentVariable
                });
                continue;
            }
            requiredParameters.push(param);
        }

        return {
            all: allParameters,
            required: requiredParameters,
            optional: optionalParameters,
            literal: literalParameters
        };
    }

    private getParameterForAuthScheme(scheme: AuthScheme): ConstructorParameter[] {
        const isOptional = !this.context.ir.sdkConfig.isAuthMandatory;
        switch (scheme.type) {
            case "bearer": {
                const name = this.context.getParameterName(scheme.token);
                return [
                    {
                        name,
                        docs: this.getAuthParameterDocs({ docs: scheme.docs, name }),
                        isOptional,
                        header: BEARER_HEADER_INFO,
                        typeReference: this.getAuthParameterTypeReference({
                            typeReference: STRING_TYPE_REFERENCE,
                            envVar: scheme.tokenEnvVar,
                            isOptional
                        }),
                        environmentVariable: scheme.tokenEnvVar
                    }
                ];
            }
            case "basic": {
                const username = this.context.getParameterName(scheme.username);
                const password = this.context.getParameterName(scheme.password);
                return [
                    {
                        name: username,
                        docs: this.getAuthParameterDocs({ docs: scheme.docs, name: username }),
                        isOptional,
                        typeReference: this.getAuthParameterTypeReference({
                            typeReference: STRING_TYPE_REFERENCE,
                            envVar: scheme.usernameEnvVar,
                            isOptional
                        }),
                        environmentVariable: scheme.usernameEnvVar
                    },
                    {
                        name: password,
                        docs: this.getAuthParameterDocs({ docs: scheme.docs, name: username }),
                        isOptional,
                        typeReference: this.getAuthParameterTypeReference({
                            typeReference: STRING_TYPE_REFERENCE,
                            envVar: scheme.passwordEnvVar,
                            isOptional
                        }),
                        environmentVariable: scheme.passwordEnvVar
                    }
                ];
            }
            case "header": {
                const name = this.context.getParameterName(scheme.name.name);
                return [
                    {
                        name,
                        docs: this.getAuthParameterDocs({ docs: scheme.docs, name }),
                        isOptional,
                        header: {
                            name: scheme.name.wireValue,
                            prefix: scheme.prefix
                        },
                        typeReference: this.getAuthParameterTypeReference({
                            typeReference: scheme.valueType,
                            envVar: scheme.headerEnvVar,
                            isOptional
                        }),
                        environmentVariable: scheme.headerEnvVar
                    }
                ];
            }
            case "oauth": {
                // Fallback to the default bearer token scheme if the user hasn't already configured it.
                if (this.context.ir.auth.schemes.some((s) => s.type === "bearer")) {
                    return [];
                }
                const name = "token";
                return [
                    {
                        name,
                        docs: this.getAuthParameterDocs({ docs: scheme.docs, name }),
                        isOptional,
                        header: BEARER_HEADER_INFO,
                        typeReference: STRING_TYPE_REFERENCE
                    }
                ];
            }
            default:
                assertNever(scheme);
        }
    }

    private getParameterForHeader(header: HttpHeader): ConstructorParameter {
        return {
            name: this.context.getParameterName(header.name.name),
            header: {
                name: header.name.wireValue
            },
            docs: header.docs,
            isOptional: this.context.isOptional(header.valueType),
            typeReference: header.valueType
        };
    }

    private getHeaderValue({
        prefix,
        parameterName
    }: {
        prefix: string | undefined;
        parameterName: string;
    }): rust.CodeBlock {
        return rust.codeblock(prefix != null ? `"${prefix} $${parameterName}"` : `$${parameterName}`);
    }

    private getAuthParameterTypeReference({
        typeReference,
        envVar,
        isOptional
    }: {
        typeReference: TypeReference;
        envVar: string | undefined;
        isOptional: boolean;
    }): TypeReference {
        // If the parameter is backed by an environment variable,
        // it should be treated as optional.
        return envVar != null || isOptional
            ? TypeReference.container(ContainerType.optional(typeReference))
            : typeReference;
    }

    private getLiteralRootClientParameterType({ literal }: { literal: Literal }): rust.Type {
        switch (literal.type) {
            case "string":
                return rust.Type.optional(rust.Type.string());
            case "boolean":
                return rust.Type.optional(rust.Type.bool());
            default:
                assertNever(literal);
        }
    }

    private getAuthParameterDocs({ docs, name }: { docs: string | undefined; name: string }): string {
        return docs ?? `The ${name} to use for authentication.`;
    }

    private getRootSubpackages(): Subpackage[] {
        return this.context.ir.rootPackage.subpackages
            .map((subpackageId) => {
                return this.context.getSubpackageOrThrow(subpackageId);
            })
            .filter((subpackage) => this.context.shouldGenerateSubpackageClient(subpackage));
    }

    private newRootClientFile(class_: rust.Class): RustFile {
        return new RustFile({
            clazz: class_,
            directory: RelativeFilePath.of(""),
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }
}
