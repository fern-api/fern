import { fail } from "node:assert";
import { assertNever } from "@fern-api/core-utils";
import { CSharpFile, FileGenerator, GrpcClientInfo } from "@fern-api/csharp-base";
import { ast, escapeForCSharpString, lazy } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import {
    AuthScheme,
    HttpHeader,
    InferredAuthScheme,
    Literal,
    OAuthScheme,
    PrimitiveTypeV1,
    PrimitiveTypeV2,
    ServiceId,
    Subpackage,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { RawClient } from "../endpoint/http/RawClient";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { collectInferredAuthCredentials } from "../utils/inferredAuthUtils";
import { WebSocketClientGenerator } from "../websocket/WebsocketClientGenerator";

const GetFromEnvironmentOrThrow = "GetFromEnvironmentOrThrow";

interface ConstructorParameter {
    name: string;
    docs?: string;
    isOptional: boolean;
    typeReference: TypeReference;
    type: ast.Type;
    /**
     * The header associated with this parameter
     */
    header?: HeaderInfo;
    environmentVariable?: string;
    /**
     * The wire value to use in examples (e.g., "client_id", "X-API-Key")
     * Falls back to parameter name if not provided
     */
    exampleValue?: string;
}

interface LiteralParameter {
    name: string;
    value: Literal;
    header?: HeaderInfo;
}

interface HeaderInfo {
    name: string;
    prefix?: string;
}

export class RootClientGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private rawClient: RawClient;
    private serviceId: ServiceId | undefined;
    private grpcClientInfo: GrpcClientInfo | undefined;
    private oauth: OAuthScheme | undefined;
    private inferred: InferredAuthScheme | undefined;

    constructor(context: SdkGeneratorContext) {
        super(context);
        this.oauth = context.getOauth();
        this.inferred = context.getInferredAuth();
        this.rawClient = new RawClient(context);
        this.serviceId = this.context.ir.rootPackage.service;
        this.grpcClientInfo =
            this.serviceId != null ? this.context.getGrpcClientInfoForServiceId(this.serviceId) : undefined;
    }

    private members = lazy({
        clientOptionsParameterName: () => "clientOptions",
        client: () => this.Types.RootClient.explicit("_client"),
        grpcClient: () => this.Types.RootClient.explicit("_grpc"),
        clientName: () => this.model.getPropertyNameFor(this.members.client),
        grpcClientName: () => this.model.getPropertyNameFor(this.members.grpcClient)
    });

    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of(`${this.names.classes.rootClient}.cs`));
    }

    /**
     * Generates the c# factory methods to create the websocket api client.
     *
     * @remarks
     * This method only returns methods if WebSockets are enabled via the `enableWebsockets`
     *
     * @returns an array of ast.Method objects that represent the factory methods.
     */
    private generateWebsocketFactories(cls: ast.Class) {
        if (this.settings.enableWebsockets) {
            for (const subpackage of this.getSubpackages()) {
                if (subpackage.websocket != null) {
                    const websocketChannel = this.context.getWebsocketChannel(subpackage.websocket);
                    if (websocketChannel != null) {
                        WebSocketClientGenerator.createWebSocketApiFactories(
                            cls,
                            subpackage,
                            this.context,
                            this.Types.RootClient.namespace,
                            websocketChannel
                        );
                    }
                }
            }
        }
    }

    public doGenerate(): CSharpFile {
        const interfaceReference = this.csharp.classReference({
            name: `I${this.names.classes.rootClient}`,
            namespace: this.namespaces.root
        });
        const class_ = this.csharp.class_({
            reference: this.Types.RootClient,
            partial: true,
            access: this.settings.rootClientAccess,
            interfaceReferences: [interfaceReference]
        });

        class_.addField({
            access: ast.Access.Private,
            origin: this.members.client,
            type: this.Types.RawClient,
            readonly: true
        });

        if (this.grpcClientInfo != null) {
            class_.addField({
                access: ast.Access.Private,
                origin: this.members.grpcClient,
                type: this.Types.RawGrpcClient,
                readonly: true
            });

            class_.addField({
                origin: class_.explicit(this.grpcClientInfo.privatePropertyName),
                access: ast.Access.Private,
                type: this.grpcClientInfo.classReference
            });
        }

        class_.addConstructor(this.getConstructorMethod());

        for (const subpackage of this.getSubpackages()) {
            if (this.context.subPackageHasEndpointsRecursively(subpackage)) {
                class_.addField({
                    access: ast.Access.Public,
                    get: true,
                    origin: subpackage,
                    type: this.context.getSubpackageClassReference(subpackage)
                });
            }
        }

        this.generateWebsocketFactories(class_);

        const rootServiceId = this.context.ir.rootPackage.service;
        if (rootServiceId != null) {
            const service =
                this.context.getHttpService(rootServiceId) ?? fail(`Service with id ${rootServiceId} not found`);
            service.endpoints.flatMap((endpoint) => {
                return this.context.endpointGenerator.generate(class_, {
                    serviceId: rootServiceId,
                    endpoint,
                    rawClientReference: this.members.clientName,
                    rawClient: this.rawClient,
                    rawGrpcClientReference: this.members.grpcClientName,
                    grpcClientInfo: this.grpcClientInfo
                });
            });
        }

        const { optionalParameters } = this.getConstructorParameters();
        if (optionalParameters.some((parameter) => parameter.environmentVariable != null)) {
            this.getFromEnvironmentOrThrowMethod(class_);
        }
        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of(""),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    private getConstructorMethod() {
        const { requiredParameters, optionalParameters, literalParameters } = this.getConstructorParameters();
        const parameters: ast.Parameter[] = [];
        for (const param of requiredParameters) {
            parameters.push(
                this.csharp.parameter({
                    name: param.name,
                    type: this.context.csharpTypeMapper.convert({
                        reference: param.typeReference
                    }),
                    docs: param.docs
                })
            );
        }
        for (const param of optionalParameters) {
            parameters.push(
                this.csharp.parameter({
                    name: param.name,
                    type: this.context.csharpTypeMapper.convert({ reference: param.typeReference }).asOptional(),
                    docs: param.docs,
                    initializer: "null"
                })
            );
        }

        parameters.push(
            this.csharp.parameter({
                name: this.members.clientOptionsParameterName,
                type: this.Types.ClientOptions.asOptional(),
                initializer: "null"
            })
        );

        // Separate auth headers from platform headers
        const authHeaderEntries: ast.Dictionary.MapEntry[] = [];
        for (const param of [...requiredParameters, ...optionalParameters]) {
            if (param.header != null) {
                authHeaderEntries.push({
                    key: this.csharp.codeblock(this.csharp.string_({ string: param.header.name })),
                    value: this.csharp.codeblock(
                        param.header.prefix != null
                            ? `$"${param.header.prefix} {${param.isOptional ? `${param.name} ?? ""` : param.name}}"`
                            : param.isOptional || param.type.isOptional
                              ? `${param.name} ?? ""`
                              : param.name
                    )
                });
            }
        }

        for (const param of literalParameters) {
            if (param.header != null) {
                authHeaderEntries.push({
                    key: this.csharp.codeblock(this.csharp.string_({ string: param.header.name })),
                    value: this.csharp.codeblock(
                        param.value.type === "string"
                            ? this.csharp.string_({ string: param.value.string })
                            : param.value
                              ? `"${true.toString()}"`
                              : `"${false.toString()}"`
                    )
                });
            }
        }

        // Platform headers (no auth)
        const platformHeaderEntries: ast.Dictionary.MapEntry[] = [];
        const platformHeaders = this.context.ir.sdkConfig.platformHeaders;
        platformHeaderEntries.push({
            key: this.csharp.codeblock(`"${platformHeaders.language}"`),
            value: this.csharp.codeblock('"C#"')
        });
        platformHeaderEntries.push({
            key: this.csharp.codeblock(`"${platformHeaders.sdkName}"`),
            value: this.csharp.codeblock(`"${this.namespaces.root}"`)
        });
        platformHeaderEntries.push({
            key: this.csharp.codeblock(`"${platformHeaders.sdkVersion}"`),
            value: this.context.getCurrentVersionValueAccess()
        });
        if (platformHeaders.userAgent != null) {
            platformHeaderEntries.push({
                key: this.csharp.codeblock(`"${platformHeaders.userAgent.header}"`),
                value: this.csharp.codeblock(`"${platformHeaders.userAgent.value}"`)
            });
        }

        const platformHeaderDictionary = this.csharp.dictionary({
            keyType: this.Primitive.string,
            valueType: this.Primitive.string,
            values: {
                type: "entries",
                entries: platformHeaderEntries
            }
        });

        const authHeaderDictionary = this.csharp.dictionary({
            keyType: this.Primitive.string,
            valueType: this.Primitive.string,
            values: {
                type: "entries",
                entries: authHeaderEntries
            }
        });

        return {
            access: ast.Access.Public,
            parameters,
            body: this.csharp.codeblock((writer) => {
                const writeConstructorBody = (innerWriter: typeof writer) => {
                    for (const param of optionalParameters) {
                        if (param.environmentVariable != null) {
                            innerWriter.writeLine(`${param.name} ??= ${GetFromEnvironmentOrThrow}(`);
                            innerWriter.indent();
                            innerWriter.writeNode(this.csharp.string_({ string: param.environmentVariable }));
                            innerWriter.writeLine(",");
                            innerWriter.writeLine(
                                `"Please pass in ${escapeForCSharpString(param.name)} or set the environment variable ${escapeForCSharpString(param.environmentVariable)}."`
                            );
                            innerWriter.dedent();
                            innerWriter.writeLine(");");
                        }
                    }
                    // Initialize clientOptions with platform headers only
                    innerWriter.write("clientOptions ??= ");
                    innerWriter.writeNodeStatement(
                        this.csharp.instantiateClass({
                            classReference: this.generation.Types.ClientOptions,
                            arguments_: []
                        })
                    );

                    if (this.settings.includeExceptionHandler) {
                        innerWriter.write("clientOptions.ExceptionHandler = ");
                        innerWriter.writeNodeStatement(
                            this.csharp.instantiateClass({
                                classReference: this.generation.Types.ExceptionHandler,
                                arguments_: [
                                    this.csharp.instantiateClass({
                                        classReference: this.generation.Types.CustomExceptionInterceptor,
                                        arguments_: [this.csharp.codeblock("clientOptions")]
                                    })
                                ]
                            })
                        );
                    }

                    // Add platform headers to clientOptions
                    innerWriter.write("var platformHeaders = ");
                    innerWriter.writeNodeStatement(
                        this.csharp.instantiateClass({
                            classReference: this.generation.Types.Headers,
                            arguments_: [platformHeaderDictionary]
                        })
                    );

                    for (const param of literalParameters) {
                        if (param.header != null) {
                            innerWriter.controlFlow("if", this.csharp.codeblock(`clientOptions.${param.name} != null`));
                            innerWriter.write(`platformHeaders["${param.header.name}"] = `);
                            if (param.value.type === "string") {
                                innerWriter.write(`clientOptions.${param.name}`);
                            } else {
                                innerWriter.write(`clientOptions.${param.name}.ToString()!`);
                            }
                            innerWriter.writeLine(";");
                            innerWriter.endControlFlow();
                        }
                    }

                    innerWriter.controlFlow("foreach", this.csharp.codeblock("var header in platformHeaders"));
                    innerWriter.controlFlow(
                        "if",
                        this.csharp.codeblock("!clientOptions.Headers.ContainsKey(header.Key)")
                    );
                    innerWriter.writeLine("clientOptions.Headers[header.Key] = header.Value;");
                    innerWriter.endControlFlow();
                    innerWriter.endControlFlow();

                    // Only clone clientOptions if we have auth headers or OAuth/inferred auth
                    const needsAuthHeaders =
                        authHeaderEntries.length > 0 || this.oauth != null || this.inferred != null;
                    const clientOptionsVariable = needsAuthHeaders ? "clientOptionsWithAuth" : "clientOptions";

                    if (needsAuthHeaders) {
                        // Clone clientOptions for use with auth headers
                        innerWriter.writeLine("var clientOptionsWithAuth = clientOptions.Clone();");

                        // Add auth headers to the cloned clientOptions
                        if (authHeaderEntries.length > 0) {
                            innerWriter.write("var authHeaders = ");
                            innerWriter.writeNodeStatement(
                                this.csharp.instantiateClass({
                                    classReference: this.generation.Types.Headers,
                                    arguments_: [authHeaderDictionary]
                                })
                            );
                            innerWriter.controlFlow("foreach", this.csharp.codeblock("var header in authHeaders"));
                            innerWriter.writeLine("clientOptionsWithAuth.Headers[header.Key] = header.Value;");
                            innerWriter.endControlFlow();
                        }
                    }

                    if (this.oauth != null) {
                        const authClientClassReference = this.context.getSubpackageClassReferenceForServiceId(
                            this.oauth.configuration.tokenEndpoint.endpointReference.serviceId
                        );

                        // Use clientOptions (platform headers only) for OAuth token requests
                        const arguments_ = [
                            this.generation.Types.RawClient.new({
                                arguments_: [this.csharp.codeblock("clientOptions")]
                            })
                        ];
                        innerWriter.write("var tokenProvider = new OAuthTokenProvider(clientId, clientSecret, ");
                        innerWriter.writeNode(
                            this.csharp.instantiateClass({
                                classReference: authClientClassReference,
                                arguments_,
                                forceUseConstructor: true
                            })
                        );
                        innerWriter.writeTextStatement(")");

                        innerWriter.writeTextStatement(
                            `clientOptionsWithAuth.Headers["Authorization"] = new Func<global::System.Threading.Tasks.ValueTask<string>>(async () => await tokenProvider.${this.names.methods.getAccessTokenAsync}().ConfigureAwait(false))`
                        );
                    }

                    if (this.inferred != null) {
                        const authClientClassReference = this.context.getSubpackageClassReferenceForServiceId(
                            this.inferred.tokenEndpoint.endpoint.serviceId
                        );

                        const credentialParams = this.getInferredAuthCredentialParams();

                        // Use clientOptions (platform headers only) for inferred auth token requests
                        const arguments_ = [
                            this.generation.Types.RawClient.new({
                                arguments_: [this.csharp.codeblock("clientOptions")]
                            })
                        ];

                        innerWriter.write("var inferredAuthProvider = new InferredAuthTokenProvider(");
                        for (const param of credentialParams) {
                            innerWriter.write(`${param}, `);
                        }
                        innerWriter.writeNode(
                            this.csharp.instantiateClass({
                                classReference: authClientClassReference,
                                arguments_,
                                forceUseConstructor: true
                            })
                        );
                        innerWriter.writeTextStatement(")");

                        const authenticatedHeaders = this.inferred.tokenEndpoint.authenticatedRequestHeaders;
                        if (authenticatedHeaders.length === 0) {
                            this.context.logger.warn(
                                "Inferred auth scheme has no authenticated request headers. At least one header should be specified."
                            );
                        }
                        for (const authHeader of authenticatedHeaders) {
                            const headerName = authHeader.headerName;
                            innerWriter.writeNode(
                                this.csharp.codeblock((writer) => {
                                    writer.write(
                                        `clientOptionsWithAuth.Headers["${headerName}"] = new Func<global::System.Threading.Tasks.ValueTask<string>>(async () => (await inferredAuthProvider.${this.names.methods.getAuthHeadersAsync}().ConfigureAwait(false)).First().Value);`
                                    );
                                })
                            );
                        }
                    }

                    innerWriter.writeLine(`${this.members.clientName} = `);
                    innerWriter.writeNodeStatement(
                        this.csharp.instantiateClass({
                            classReference: this.generation.Types.RawClient,
                            arguments_: [this.csharp.codeblock(clientOptionsVariable)]
                        })
                    );
                    if (this.grpcClientInfo != null) {
                        innerWriter.writeLine("_grpc = _client.Grpc");
                        innerWriter.write(this.grpcClientInfo.privatePropertyName);
                        innerWriter.write(" = ");
                        innerWriter.writeNodeStatement(
                            this.csharp.instantiateClass({
                                classReference: this.grpcClientInfo.classReference,
                                arguments_: [this.csharp.codeblock("_grpc.Channel")]
                            })
                        );
                    }
                    const arguments_ = [this.csharp.codeblock("_client")];
                    for (const subpackage of this.getSubpackages()) {
                        if (this.context.subPackageHasEndpointsRecursively(subpackage)) {
                            innerWriter.writeLine(`${subpackage.name.pascalCase.safeName} = `);
                            innerWriter.writeNodeStatement(
                                this.csharp.instantiateClass({
                                    classReference: this.context.getSubpackageClassReference(subpackage),
                                    arguments_
                                })
                            );
                        }
                    }
                };

                if (this.settings.includeExceptionHandler) {
                    writer.controlFlowWithoutStatement("try");
                    writeConstructorBody(writer);
                    writer.endControlFlow();
                    writer.controlFlow("catch", this.csharp.codeblock("Exception ex"));
                    writer.write("var interceptor = ");
                    writer.writeNodeStatement(
                        this.csharp.instantiateClass({
                            classReference: this.generation.Types.CustomExceptionInterceptor,
                            arguments_: [this.csharp.codeblock("clientOptions")]
                        })
                    );
                    writer.writeLine("interceptor.Intercept(ex);");
                    writer.writeLine("throw;");
                    writer.endControlFlow();
                } else {
                    writeConstructorBody(writer);
                }
            })
        };
    }

    public generateExampleClientInstantiationSnippet({
        clientOptionsArgument,
        includeEnvVarArguments,
        asSnippet
    }: {
        clientOptionsArgument?: ast.ClassInstantiation;
        includeEnvVarArguments?: boolean;
        asSnippet?: boolean;
    }): ast.ClassInstantiation {
        const arguments_: ast.CodeBlock[] = [];

        // Use the same parameter ordering as the constructor
        const { requiredParameters, optionalParameters } = this.getConstructorParameters();
        const allParameters = [...requiredParameters, ...optionalParameters];

        for (const param of allParameters) {
            // Skip parameters with environment variables unless explicitly including them
            if (param.environmentVariable != null && !includeEnvVarArguments) {
                continue;
            }

            // Use example values consistently in both snippets and tests for clarity
            const value = param.exampleValue ?? param.name;
            arguments_.push(this.csharp.codeblock(`"${value}"`));
        }

        if (clientOptionsArgument != null) {
            arguments_.push(
                this.csharp.codeblock((writer) => {
                    writer.write(`${this.members.clientOptionsParameterName}: `);
                    writer.writeNode(clientOptionsArgument);
                })
            );
        }
        return this.csharp.instantiateClass({
            classReference: asSnippet ? this.Types.RootClientForSnippets : this.Types.RootClient,
            arguments_
        });
    }

    private getConstructorParameters(authOnly = false): {
        allParameters: ConstructorParameter[];
        requiredParameters: ConstructorParameter[];
        optionalParameters: ConstructorParameter[];
        literalParameters: LiteralParameter[];
    } {
        const allParameters: ConstructorParameter[] = [];
        const requiredParameters: ConstructorParameter[] = [];
        const optionalParameters: ConstructorParameter[] = [];
        const literalParameters: LiteralParameter[] = [];
        const seenParameterNames = new Set<string>();

        for (const scheme of this.context.ir.auth.schemes) {
            for (const param of this.getParameterFromAuthScheme(scheme)) {
                if (!seenParameterNames.has(param.name)) {
                    allParameters.push(param);
                    seenParameterNames.add(param.name);
                }
            }
        }
        for (const header of this.context.ir.headers) {
            const param = this.getParameterForHeader(header);
            if (!seenParameterNames.has(param.name)) {
                allParameters.push(param);
                seenParameterNames.add(param.name);
            }
        }

        for (const param of allParameters) {
            if (param.isOptional || param.environmentVariable != null) {
                optionalParameters.push(param);
            } else if (param.typeReference.type === "container" && param.typeReference.container.type === "literal") {
                literalParameters.push({
                    name: param.name,
                    value: param.typeReference.container.literal,
                    header: param.header
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
                        type: this.context.csharpTypeMapper.convert({
                            reference: scheme.valueType
                        }),
                        environmentVariable: scheme.headerEnvVar,
                        exampleValue: scheme.name.name.screamingSnakeCase.safeName
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
                            v2: PrimitiveTypeV2.string({
                                default: undefined,
                                validation: undefined
                            })
                        }),
                        type: this.Primitive.string,
                        environmentVariable: scheme.tokenEnvVar,
                        exampleValue: scheme.token.screamingSnakeCase.safeName
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
                            v2: PrimitiveTypeV2.string({
                                default: undefined,
                                validation: undefined
                            })
                        }),
                        type: this.Primitive.string,
                        environmentVariable: scheme.usernameEnvVar,
                        exampleValue: scheme.username.screamingSnakeCase.safeName
                    },
                    {
                        name: passwordName,
                        docs: scheme.docs ?? `The ${passwordName} to use for authentication.`,
                        isOptional,
                        typeReference: TypeReference.primitive({
                            v1: PrimitiveTypeV1.String,
                            v2: PrimitiveTypeV2.string({
                                default: undefined,
                                validation: undefined
                            })
                        }),
                        type: this.Primitive.string,
                        environmentVariable: scheme.passwordEnvVar,
                        exampleValue: scheme.password.screamingSnakeCase.safeName
                    }
                ];
            }
        } else if (scheme.type === "oauth") {
            if (this.oauth !== null) {
                return [
                    {
                        name: "clientId",
                        docs: "The clientId to use for authentication.",
                        isOptional,
                        typeReference: TypeReference.primitive({
                            v1: PrimitiveTypeV1.String,
                            v2: PrimitiveTypeV2.string({
                                default: undefined,
                                validation: undefined
                            })
                        }),
                        type: this.Primitive.string,
                        environmentVariable: scheme.configuration.clientIdEnvVar,
                        exampleValue: "client_id"
                    },
                    {
                        name: "clientSecret",
                        docs: "The clientSecret to use for authentication.",
                        isOptional,
                        typeReference: TypeReference.primitive({
                            v1: PrimitiveTypeV1.String,
                            v2: PrimitiveTypeV2.string({
                                default: undefined,
                                validation: undefined
                            })
                        }),
                        type: this.Primitive.string,
                        environmentVariable: scheme.configuration.clientSecretEnvVar,
                        exampleValue: "client_secret"
                    }
                ];
            } else {
                this.context.logger.warn(
                    `Auth scheme is set to OAuth (type: ${scheme.type}), but no OAuth configuration is provided. ` +
                        `Make sure the IR includes OAuth configuration with client credentials.`
                );
                return [];
            }
        } else if (scheme.type === "inferred") {
            if (this.inferred != null) {
                const parameters: ConstructorParameter[] = [];
                const tokenEndpointReference = scheme.tokenEndpoint.endpoint;
                const tokenEndpointHttpService = this.context.getHttpService(tokenEndpointReference.serviceId);
                if (tokenEndpointHttpService == null) {
                    this.context.logger.warn(
                        `Service with id ${tokenEndpointReference.serviceId} not found for inferred auth`
                    );
                    return [];
                }
                const tokenEndpoint = this.context.resolveEndpoint(
                    tokenEndpointHttpService,
                    tokenEndpointReference.endpointId
                );

                const credentials = collectInferredAuthCredentials(this.context, tokenEndpoint);
                for (const credential of credentials) {
                    const typeRef = this.context.csharpTypeMapper.convert({
                        reference: credential.typeReference
                    });
                    parameters.push({
                        name: credential.camelName,
                        docs: credential.docs ?? `The ${credential.camelName} for authentication.`,
                        isOptional: isOptional || credential.isOptional,
                        typeReference: credential.typeReference,
                        type: typeRef,
                        exampleValue: credential.wireValue
                    });
                }

                return parameters;
            } else {
                this.context.logger.warn(
                    `Auth scheme is set to inferred (type: ${scheme.type}), but no inferred auth configuration is provided. ` +
                        `Make sure the IR includes inferred auth configuration with a token endpoint.`
                );
                return [];
            }
        } else {
            assertNever(scheme);
        }
    }

    private getParameterForHeader(header: HttpHeader): ConstructorParameter {
        return {
            name:
                header.valueType.type === "container" && header.valueType.container.type === "literal"
                    ? header.name.name.pascalCase.safeName
                    : header.name.name.camelCase.safeName,
            header: {
                name: header.name.wireValue
            },
            docs: header.docs,
            isOptional: header.valueType.type === "container" && header.valueType.container.type === "optional",
            typeReference: header.valueType,
            type: this.context.csharpTypeMapper.convert({
                reference: header.valueType
            }),
            exampleValue: header.name.name.screamingSnakeCase.safeName
        };
    }

    private getFromEnvironmentOrThrowMethod(cls: ast.Class) {
        cls.addMethod({
            access: ast.Access.Private,
            name: GetFromEnvironmentOrThrow,
            return_: this.Primitive.string,
            parameters: [
                this.csharp.parameter({
                    name: "env",
                    type: this.Primitive.string
                }),
                this.csharp.parameter({
                    name: "message",
                    type: this.Primitive.string
                })
            ],
            isAsync: false,
            body: this.csharp.codeblock((writer) => {
                writer.write("return Environment.GetEnvironmentVariable(env) ?? throw new ");
                writer.writeNode(this.System.Exception);
                writer.writeLine("(message);");
            }),
            type: ast.MethodType.STATIC
        });
    }

    private getSubpackages(): Subpackage[] {
        return this.context.getSubpackages(this.context.ir.rootPackage.subpackages);
    }

    private getInferredAuthCredentialParams(): string[] {
        if (this.inferred == null) {
            return [];
        }

        const params: string[] = [];
        const tokenEndpointReference = this.inferred.tokenEndpoint.endpoint;
        const tokenEndpointHttpService = this.context.getHttpService(tokenEndpointReference.serviceId);
        if (tokenEndpointHttpService == null) {
            return [];
        }
        const tokenEndpoint = this.context.resolveEndpoint(tokenEndpointHttpService, tokenEndpointReference.endpointId);

        const credentials = collectInferredAuthCredentials(this.context, tokenEndpoint);
        return credentials.map((credential) => credential.camelName);
    }
}
