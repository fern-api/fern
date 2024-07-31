import { assertNever } from "@fern-api/core-utils";
import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import {
    AuthScheme,
    HttpHeader,
    Literal,
    PrimitiveTypeV1,
    PrimitiveTypeV2,
    Subpackage,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { EndpointGenerator } from "../endpoint/EndpointGenerator";
import { RawClient } from "../endpoint/RawClient";
import { CLIENT_OPTIONS_CLASS_NAME } from "../options/ClientOptionsGenerator";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export const CLIENT_MEMBER_NAME = "_client";

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

interface LiteralParameter {
    name: string;
    value: Literal;
}

interface HeaderInfo {
    name: string;
    prefix?: string;
}

const GetFromEnvironmentOrThrow = "GetFromEnvironmentOrThrow";

export class RootClientGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private rawClient: RawClient;
    private endpointGenerator: EndpointGenerator;
    constructor(context: SdkGeneratorContext) {
        super(context);
        this.rawClient = new RawClient(context);
        this.endpointGenerator = new EndpointGenerator(context, this.rawClient);
    }

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
            class_.addField(
                csharp.field({
                    access: "public",
                    get: true,
                    init: true,
                    name: subpackage.name.pascalCase.safeName,
                    type: csharp.Type.reference(this.context.getSubpackageClassReference(subpackage))
                })
            );
        }

        const rootServiceId = this.context.ir.rootPackage.service;
        if (rootServiceId != null) {
            const service = this.context.getHttpServiceOrThrow(rootServiceId);
            for (const endpoint of service.endpoints) {
                const method = this.endpointGenerator.generate({
                    serviceId: rootServiceId,
                    endpoint,
                    rawClientReference: CLIENT_MEMBER_NAME
                });
                class_.addMethod(method);
            }
        }

        const { optionalParameters } = this.getConstructorParameters();
        if (optionalParameters.some((parameter) => parameter.environmentVariable != null)) {
            class_.addMethod(this.getFromEnvironmentOrThrowMethod());
        }
        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of("")
        });
    }

    private getConstructorMethod(): csharp.Class.Constructor {
        const { requiredParameters, optionalParameters, literalParameters } = this.getConstructorParameters();
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
                    type: this.context.csharpTypeMapper
                        .convert({ reference: param.typeReference })
                        .toOptionalIfNotAlready(),
                    docs: param.docs,
                    initializer: "null"
                })
            );
        }
        parameters.push(
            csharp.parameter({
                name: "clientOptions",
                type: csharp.Type.optional(csharp.Type.reference(this.context.getClientOptionsClassReference())),
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

        for (const param of literalParameters) {
            headerEntries.push({
                key: csharp.codeblock(`"${param.name}"`),
                value: csharp.codeblock(
                    param.value.type === "string" ? `"${param.value.string}"` : `${param.value.boolean}.ToString()`
                )
            });
        }

        const platformHeaders = this.context.ir.sdkConfig.platformHeaders;
        headerEntries.push({
            key: csharp.codeblock(`"${platformHeaders.language}"`),
            value: csharp.codeblock('"C#"')
        });
        if (this.context.config.publish != null) {
            headerEntries.push({
                key: csharp.codeblock(`"${platformHeaders.sdkName}"`),
                value: csharp.codeblock(`"${this.context.getNamespace()}"`)
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

        const headerSupplierDictionary = csharp.dictionary({
            keyType: csharp.Types.string(),
            valueType: csharp.Types.reference(
                csharp.classReference({
                    name: "Func",
                    namespace: "System",
                    generics: [csharp.Types.string()]
                })
            ),
            entries: []
        });
        return {
            access: "public",
            parameters,
            body: csharp.codeblock((writer) => {
                for (const param of optionalParameters) {
                    if (param.environmentVariable != null) {
                        writer.writeLine(`${param.name} ??= ${GetFromEnvironmentOrThrow}(`);
                        writer.indent();
                        writer.writeLine(`"${param.environmentVariable}",`);
                        writer.writeLine(
                            `"Please pass in ${param.name} or set the environment variable ${param.environmentVariable}."`
                        );
                        writer.dedent();
                        writer.writeLine(");");
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
                            csharp.codeblock((writer) => {
                                writer.writeNode(headerSupplierDictionary);
                            }),
                            csharp.codeblock(`clientOptions ?? new ${CLIENT_OPTIONS_CLASS_NAME}()`)
                        ]
                    })
                );
                for (const subpackage of this.getSubpackages()) {
                    writer.writeLine(`${subpackage.name.pascalCase.safeName} = `);
                    writer.writeNodeStatement(
                        csharp.instantiateClass({
                            classReference: this.context.getSubpackageClassReference(subpackage),
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
        literalParameters: LiteralParameter[];
    } {
        const allParameters: ConstructorParameter[] = [];
        const requiredParameters: ConstructorParameter[] = [];
        const optionalParameters: ConstructorParameter[] = [];
        const literalParameters: LiteralParameter[] = [];

        for (const scheme of this.context.ir.auth.schemes) {
            allParameters.push(...this.getParameterFromAuthScheme(scheme));
        }
        for (const header of this.context.ir.headers) {
            allParameters.push(this.getParameterForHeader(header));
        }

        for (const param of allParameters) {
            if (param.isOptional || param.environmentVariable != null) {
                optionalParameters.push(param);
            } else if (param.typeReference.type === "container" && param.typeReference.container.type === "literal") {
                literalParameters.push({
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    name: param.header!.name,
                    value: param.typeReference.container.literal
                });
            } else {
                requiredParameters.push(param);
            }
        }
        return {
            allParameters,
            requiredParameters,
            optionalParameters,
            literalParameters
        };
    }

    private getParameterFromAuthScheme(scheme: AuthScheme): ConstructorParameter[] {
        const isOptional = this.context.ir.sdkConfig.isAuthMandatory;
        if (scheme.type === "header") {
            {
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
        } else if (scheme.type === "bearer") {
            {
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
                        typeReference: TypeReference.primitive({
                            v1: PrimitiveTypeV1.String,
                            v2: PrimitiveTypeV2.string({ default: undefined, validation: undefined })
                        }),
                        environmentVariable: scheme.tokenEnvVar
                    }
                ];
            }
        } else if (scheme.type === "basic") {
            {
                const usernameName = scheme.username.camelCase.safeName;
                const passwordName = scheme.password.camelCase.safeName;
                return [
                    {
                        name: usernameName,
                        docs: scheme.docs ?? `The ${usernameName} to use for authentication.`,
                        isOptional,
                        typeReference: TypeReference.primitive({
                            v1: PrimitiveTypeV1.String,
                            v2: PrimitiveTypeV2.string({ default: undefined, validation: undefined })
                        }),
                        environmentVariable: scheme.usernameEnvVar
                    },
                    {
                        name: passwordName,
                        docs: scheme.docs ?? `The ${passwordName} to use for authentication.`,
                        isOptional,
                        typeReference: TypeReference.primitive({
                            v1: PrimitiveTypeV1.String,
                            v2: PrimitiveTypeV2.string({ default: undefined, validation: undefined })
                        }),
                        environmentVariable: scheme.passwordEnvVar
                    }
                ];
            }
        } else if (scheme.type === "oauth") {
            return [];
        } else {
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
                writer.writeLine("return Environment.GetEnvironmentVariable(env) ?? throw new Exception(message);");
            }),
            type: csharp.MethodType.STATIC
        });
    }

    private getSubpackages(): Subpackage[] {
        return this.context.ir.rootPackage.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }
}
