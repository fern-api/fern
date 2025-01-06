import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile, php } from "@fern-api/php-codegen";

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

export class RootClientGenerator extends FileGenerator<PhpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of(this.context.getRootClientClassName() + ".php"));
    }

    public doGenerate(): PhpFile {
        const class_ = php.class_({
            name: this.context.getRootClientClassName(),
            namespace: this.context.getRootNamespace()
        });

        if (!this.context.ir.rootPackage.hasEndpointsInTree) {
            return this.newRootClientFile(class_);
        }

        class_.addField(
            php.field({
                name: `$${this.context.getClientOptionsName()}`,
                access: "private",
                type: php.Type.optional(this.context.getClientOptionsType())
            })
        );
        class_.addField(this.context.rawClient.getField());

        const subpackages = this.getRootSubpackages();
        const constructorParameters = this.getConstructorParameters();
        class_.addConstructor(
            this.getConstructorMethod({
                constructorParameters,
                subpackages
            })
        );

        for (const subpackage of subpackages) {
            class_.addField(this.context.getSubpackageField(subpackage));
        }

        const rootServiceId = this.context.ir.rootPackage.service;
        if (rootServiceId != null) {
            const service = this.context.getHttpServiceOrThrow(rootServiceId);
            for (const endpoint of service.endpoints) {
                const method = this.context.endpointGenerator.generate({
                    serviceId: rootServiceId,
                    endpoint
                });
                class_.addMethod(method);
            }
        }

        if (constructorParameters.optional.some((parameter) => parameter.environmentVariable != null)) {
            class_.addMethod(this.getFromEnvOrThrowMethod());
        }

        return this.newRootClientFile(class_);
    }

    private getConstructorMethod({
        constructorParameters,
        subpackages
    }: {
        constructorParameters: ConstructorParameters;
        subpackages: Subpackage[];
    }): php.Class.Constructor {
        const parameters: php.Parameter[] = [];
        for (const param of [...constructorParameters.required, ...constructorParameters.optional]) {
            parameters.push(
                php.parameter({
                    name: param.name,
                    type: this.context.phpTypeMapper.convert({ reference: param.typeReference }),
                    docs: param.docs
                })
            );
        }

        parameters.push(
            php.parameter({
                name: `$${this.context.getClientOptionsName()}`,
                type: php.Type.optional(this.context.getClientOptionsType()),
                initializer: php.codeblock("null")
            })
        );

        const headerEntries: php.Map.Entry[] = [];
        for (const param of constructorParameters.required) {
            if (param.header != null) {
                headerEntries.push({
                    key: php.codeblock(`'${param.header.name}'`),
                    value: this.getHeaderValue({ prefix: param.header.prefix, parameterName: param.name })
                });
            }
        }
        for (const param of constructorParameters.optional) {
            if (param.header != null && param.environmentVariable != null) {
                // Variables backed by an environment variable can be instantiated in-line.
                headerEntries.push({
                    key: php.codeblock(`'${param.header.name}'`),
                    value: this.getHeaderValue({ prefix: param.header.prefix, parameterName: param.name })
                });
            }
        }

        for (const param of constructorParameters.literal) {
            headerEntries.push({
                key: php.codeblock(`'${param.name}'`),
                value: php.codeblock(this.context.getLiteralAsString(param.value))
            });
        }

        const platformHeaders = this.context.ir.sdkConfig.platformHeaders;
        headerEntries.push({
            key: php.codeblock(`'${platformHeaders.language}'`),
            value: php.codeblock("'PHP'")
        });
        headerEntries.push({
            key: php.codeblock(`'${platformHeaders.sdkName}'`),
            value: php.codeblock(`'${this.context.getRootNamespace()}'`)
        });
        if (this.context.version != null) {
            headerEntries.push({
                key: php.codeblock(`'${platformHeaders.sdkVersion}'`),
                value: php.codeblock(`'${this.context.version}'`)
            });
        }
        if (platformHeaders.userAgent != null) {
            headerEntries.push({
                key: php.codeblock(`'${platformHeaders.userAgent.header}'`),
                value: php.codeblock(`'${platformHeaders.userAgent.value}'`)
            });
        }
        const headers = php.map({
            entries: headerEntries,
            multiline: true
        });
        return {
            access: "public",
            parameters,
            body: php.codeblock((writer) => {
                for (const param of constructorParameters.optional) {
                    if (param.environmentVariable != null) {
                        writer.write(`$${param.name} ??= `);
                        writer.writeNodeStatement(
                            php.invokeMethod({
                                method: `$this->${GET_FROM_ENV_OR_THROW}`,
                                arguments_: [
                                    php.codeblock(`'${param.environmentVariable}'`),
                                    php.codeblock(
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
                        writer.controlFlow("if", php.codeblock(`$${param.name} != null`));
                        writer.write(`$defaultHeaders['${param.header.name}'] = `);
                        writer.writeNodeStatement(
                            this.getHeaderValue({ prefix: param.header.prefix, parameterName: param.name })
                        );
                        writer.endControlFlow();
                    }
                }
                writer.writeLine();

                writer.write(`$this->${this.context.getClientOptionsName()} = `);
                writer.writeNodeStatement(
                    php.codeblock((writer) => {
                        writer.write(`$${this.context.getClientOptionsName()} ?? `);
                        writer.writeNode(php.codeblock("[]"));
                    })
                );
                writer.write(
                    `$this->${this.context.getClientOptionsName()}['${this.context.getHeadersOptionName()}'] = `
                );
                writer.writeNodeStatement(
                    php.invokeMethod({
                        method: "array_merge",
                        arguments_: [
                            php.codeblock("$defaultHeaders"),
                            php.codeblock(
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
                                assignment: php.codeblock((writer) => {
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
                        php.instantiateClass({
                            classReference: this.context.getSubpackageClassReference(subpackage),
                            arguments_: [php.codeblock(`$this->${this.context.rawClient.getFieldName()}`)]
                        })
                    );
                }
            })
        };
    }

    private getFromEnvOrThrowMethod(): php.Method {
        return php.method({
            access: "private",
            name: GET_FROM_ENV_OR_THROW,
            return_: php.Type.string(),
            parameters: [
                php.parameter({
                    name: "env",
                    type: php.Type.string()
                }),
                php.parameter({
                    name: "message",
                    type: php.Type.string()
                })
            ],
            body: php.codeblock((writer) => {
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
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    name: param.header!.name,
                    value: literal
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
            name: `$${header.name.name.camelCase.safeName}`,
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
    }): php.CodeBlock {
        return php.codeblock(prefix != null ? `"${prefix} $${parameterName}"` : `$${parameterName}`);
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

    private newRootClientFile(class_: php.Class): PhpFile {
        return new PhpFile({
            clazz: class_,
            directory: RelativeFilePath.of(""),
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }
}
