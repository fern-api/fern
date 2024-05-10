import { assertNever } from "@fern-api/core-utils";
import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { AuthScheme, HttpHeader, PrimitiveType, Subpackage, TypeReference } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

interface ConstructorParameter {
    name: string;
    docs?: string;
    isOptional: boolean;
    typeReference: TypeReference;
    /**
     * The header associated with this parameter
     */
    header?: HeaderInfo;
    environmentVariable?: string;
}

interface HeaderInfo {
    name: string;
    prefix?: string;
}

const GetFromEnvironmentOrThrow = "GetFromEnvironmentOrThrow";

export class RootClientGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of(this.context.getRootClientClassName() + ".cs"));
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            name: this.context.getRootClientClassName(),
            namespace: this.context.getNamespace(),
            partial: true,
            access: "public"
        });

        class_.addField(
            csharp.field({
                access: "private",
                name: "_client",
                type: csharp.Type.reference(this.context.getRawClientClassReference())
            })
        );

        class_.addConstructor(this.getConstructorMethod());

        for (const subpackage of this.getSubpackages()) {
            if (subpackage.service == null) {
                continue;
            }
            class_.addField(
                csharp.field({
                    access: "public",
                    get: true,
                    name: subpackage.name.pascalCase.safeName,
                    type: csharp.Type.reference(this.context.getServiceClassReference(subpackage.service))
                })
            );
        }

        const rootServiceId = this.context.ir.rootPackage.service;
        if (rootServiceId != null) {
            const service = this.context.getHttpServiceOrThrow(rootServiceId);
            for (const endpoint of service.endpoints) {
                class_.addMethod(
                    csharp.method({
                        name: this.context.getEndpointMethodName(endpoint),
                        access: "public",
                        isAsync: true,
                        parameters: [],
                        summary: endpoint.docs
                    })
                );
            }
        }

        class_.addMethod(this.getFromEnvironmentOrThrowMethod());

        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of("")
        });
    }

    private getConstructorMethod(): csharp.Class.Constructor {
        const { requiredParameters, optionalParameters } = this.getConstructorParameters();
        const parameters: csharp.Parameter[] = [];
        for (const param of requiredParameters) {
            parameters.push(
                csharp.parameter({
                    name: param.name,
                    type: this.context.csharpTypeMapper.convert({ reference: param.typeReference }),
                    docs: param.docs
                })
            );
        }
        for (const param of optionalParameters) {
            parameters.push(
                csharp.parameter({
                    name: param.name,
                    type: this.context.csharpTypeMapper.convert({ reference: param.typeReference }),
                    docs: param.docs,
                    initializer: "null"
                })
            );
        }
        parameters.push(
            csharp.parameter({
                name: "clientOptions",
                type: csharp.Type.reference(this.context.getClientOptionsClassReference()),
                initializer: "null"
            })
        );

        const headerEntries: csharp.Dictionary.MapEntry[] = [];
        for (const param of optionalParameters) {
            if (param.header != null) {
                headerEntries.push({
                    key: csharp.codeblock(`"${param.header.name}"`),
                    value: csharp.codeblock(
                        param.header.prefix != null ? `$"${param.header.prefix} {${param.name}}"` : param.name
                    )
                });
            }
        }

        const platformHeaders = this.context.ir.sdkConfig.platformHeaders;
        headerEntries.push({
            key: csharp.codeblock(`"${platformHeaders.language}"`),
            value: csharp.codeblock('"C#"')
        });
        if (this.context.config.publish != null) {
            headerEntries.push({
                key: csharp.codeblock(`"${platformHeaders.sdkName}"`),
                value: csharp.codeblock(`"${this.context.config.publish.registriesV2.rubygems.packageName}"`)
            });
            headerEntries.push({
                key: csharp.codeblock(`"${platformHeaders.sdkVersion}"`),
                value: csharp.codeblock(`"${this.context.config.publish.version}"`)
            });
        }

        const headerDictionary = csharp.dictionary({
            keyType: csharp.Types.string(),
            valueType: csharp.Types.string(),
            entries: headerEntries
        });
        return {
            access: "public",
            parameters,
            body: csharp.codeblock((writer) => {
                for (const param of optionalParameters) {
                    if (param.environmentVariable != null) {
                        writer.writeLine(`${param.name} = ${param.name} ?? ${GetFromEnvironmentOrThrow}(`);
                        writer.indent();
                        writer.writeLine(`"${param.environmentVariable}",`);
                        writer.writeLine(
                            `"Please pass in ${param.name} or set the environment variable ${param.environmentVariable}."`
                        );
                        writer.dedent();
                    }
                }
                writer.writeLine("_client = ");
                writer.writeNodeStatement(
                    csharp.instantiateClass({
                        classReference: this.context.getRawClientClassReference(),
                        arguments_: [
                            csharp.codeblock((writer) => {
                                writer.writeNode(headerDictionary);
                            }),
                            csharp.codeblock("clientOptions ?? new ClientOptions()")
                        ]
                    })
                );
                for (const subpackage of this.getSubpackages()) {
                    if (subpackage.service == null) {
                        continue;
                    }
                    writer.writeLine(`${subpackage.name.pascalCase.safeName} = `);
                    writer.writeNodeStatement(
                        csharp.instantiateClass({
                            classReference: this.context.getServiceClassReference(subpackage.service),
                            arguments_: [csharp.codeblock("_client")]
                        })
                    );
                }
            })
        };
    }

    private getConstructorParameters(): {
        allParameters: ConstructorParameter[];
        requiredParameters: ConstructorParameter[];
        optionalParameters: ConstructorParameter[];
    } {
        const allParameters: ConstructorParameter[] = [];
        const requiredParameters: ConstructorParameter[] = [];
        const optionalParameters: ConstructorParameter[] = [];

        for (const scheme of this.context.ir.auth.schemes) {
            allParameters.push(...this.getParameterFromAuthScheme(scheme));
        }
        for (const header of this.context.ir.headers) {
            allParameters.push(this.getParameterForHeader(header));
        }

        for (const param of allParameters) {
            if (param.isOptional || param.environmentVariable != null) {
                optionalParameters.push(param);
            } else {
                requiredParameters.push(param);
            }
        }
        return {
            allParameters,
            requiredParameters,
            optionalParameters
        };
    }

    private getParameterFromAuthScheme(scheme: AuthScheme): ConstructorParameter[] {
        const isOptional = this.context.ir.sdkConfig.isAuthMandatory;
        switch (scheme.type) {
            case "header": {
                const name = scheme.name.name.camelCase.safeName;
                return [
                    {
                        name,
                        docs: scheme.docs ?? `The ${name} to use for authentication.`,
                        isOptional,
                        header: {
                            name: scheme.name.wireValue,
                            prefix: scheme.prefix
                        },
                        typeReference: scheme.valueType,
                        environmentVariable: scheme.headerEnvVar
                    }
                ];
            }
            case "bearer": {
                const name = scheme.token.camelCase.safeName;
                return [
                    {
                        name,
                        docs: scheme.docs ?? `The ${name} to use for authentication.`,
                        isOptional,
                        header: {
                            name: "Authorization",
                            prefix: "Bearer"
                        },
                        typeReference: TypeReference.primitive(PrimitiveType.String),
                        environmentVariable: scheme.tokenEnvVar
                    }
                ];
            }
            case "basic": {
                const usernameName = scheme.username.camelCase.safeName;
                const passwordName = scheme.password.camelCase.safeName;
                return [
                    {
                        name: usernameName,
                        docs: scheme.docs ?? `The ${usernameName} to use for authentication.`,
                        isOptional,
                        typeReference: TypeReference.primitive(PrimitiveType.String),
                        environmentVariable: scheme.usernameEnvVar
                    },
                    {
                        name: passwordName,
                        docs: scheme.docs ?? `The ${passwordName} to use for authentication.`,
                        isOptional,
                        typeReference: TypeReference.primitive(PrimitiveType.String),
                        environmentVariable: scheme.passwordEnvVar
                    }
                ];
            }
            default:
                assertNever(scheme);
        }
    }

    private getParameterForHeader(header: HttpHeader): ConstructorParameter {
        const name = header.name.name.camelCase.safeName;
        return {
            name,
            header: {
                name: header.name.wireValue
            },
            docs: header.docs,
            isOptional: header.valueType.type === "container" && header.valueType.container.type === "optional",
            typeReference: header.valueType
        };
    }

    private getFromEnvironmentOrThrowMethod(): csharp.Method {
        return csharp.method({
            access: "private",
            name: GetFromEnvironmentOrThrow,
            return_: csharp.Types.string(),
            parameters: [
                csharp.parameter({
                    name: "env",
                    type: csharp.Types.string()
                }),
                csharp.parameter({
                    name: "message",
                    type: csharp.Types.string()
                })
            ],
            isAsync: false,
            body: csharp.codeblock((writer) => {
                writer.writeLine("var value = Environment.GetEnvironmentVariable(env);");
                writer.writeLine("if (value == null) {");
                writer.writeLine("    throw new Exception(message);");
                writer.writeLine("}");
                writer.writeLine("return value;");
            })
        });
    }

    private getSubpackages(): Subpackage[] {
        return this.context.ir.rootPackage.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }
}
