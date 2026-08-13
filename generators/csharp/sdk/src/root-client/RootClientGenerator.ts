import { fail } from "node:assert";
import { getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { CSharpFile, FileGenerator, GrpcClientInfo } from "@fern-api/csharp-base";
import { ast, escapeForCSharpString, lazy, Writer } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

type AuthScheme = FernIr.AuthScheme;
type InferredAuthScheme = FernIr.InferredAuthScheme;
type OAuthScheme = FernIr.OAuthScheme;
type PrimitiveTypeV1 = FernIr.PrimitiveTypeV1;
const PrimitiveTypeV1 = FernIr.PrimitiveTypeV1;
type PrimitiveTypeV2 = FernIr.PrimitiveTypeV2;
const PrimitiveTypeV2 = FernIr.PrimitiveTypeV2;
type ServiceId = FernIr.ServiceId;
type Subpackage = FernIr.Subpackage;
type HttpHeader = FernIr.HttpHeader;
type Literal = FernIr.Literal;
type TypeReference = FernIr.TypeReference;

import { RawClient } from "../endpoint/http/RawClient.js";
import { isEndpointSecurity } from "../endpoint/request/endpointAuthHeaders.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { collectInferredAuthCredentials } from "../utils/inferredAuthUtils.js";
import { WebSocketClientGenerator } from "../websocket/WebsocketClientGenerator.js";
import { APPEND_APP_INFO_METHOD_NAME, buildAppendAppInfoMethodLines } from "./buildAppInfoUserAgent.js";
import { buildUserAgentHeaderEntry } from "./buildUserAgentHeaderEntry.js";
import {
    BUILD_USER_AGENT_METHOD_NAME,
    BUILD_USER_AGENT_RETURN_SUFFIX,
    buildUserAgentLocalLines,
    buildUserAgentReturnPrefix,
    buildUserAgentReturnWithoutVersion,
    getUserAgentProduct
} from "./buildUserAgentMethodBody.js";
import { dedupAuthHeaderEntries } from "./dedupAuthHeaderEntries.js";
import {
    getServerVariableOptions,
    getServerVariableValueExpression,
    type ServerVariableOption,
    urlTemplateToInterpolatedString
} from "./serverVariables.js";

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
     * Whether this parameter comes from a global API header (as opposed to an auth scheme).
     */
    isGlobalHeader?: boolean;
    /**
     * The wire value to use in examples (e.g., "client_id", "X-API-Key")
     * Falls back to parameter name if not provided
     */
    exampleValue?: string;
    /**
     * The client default value from x-fern-default.
     * When present, the parameter is optional and uses this value as fallback.
     */
    clientDefault?: Literal;
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
    /**
     * Set while building the constructor body when the opt-in
     * `allow-user-agent-app-info` config actually wraps a written User-Agent value,
     * so the emitted `AppendAppInfoToUserAgent` helper is only added when referenced.
     */
    private usesAppInfoHelper = false;

    constructor(context: SdkGeneratorContext) {
        super(context);
        this.oauth = context.getOauth();
        this.inferred = context.getInferredAuth();
        this.rawClient = new RawClient(context);
        this.serviceId = this.context.ir.rootPackage.service;
        this.grpcClientInfo =
            this.serviceId != null ? this.context.getGrpcClientInfoForServiceId(this.serviceId) : undefined;
    }

    /**
     * Both OAuth and inferred auth attach their Authorization header through a
     * token provider, and only one provider can drive the root client's auth
     * header. When both schemes are present (e.g. `auth: any` with an OAuth and
     * an inferred scheme), pick the provider-based scheme that appears first in
     * `ir.auth.schemes`, which mirrors the declared `any` order.
     */
    private shouldUseOAuthProvider(): boolean {
        if (this.oauth == null) {
            return false;
        }
        if (this.inferred == null) {
            return true;
        }
        for (const scheme of this.context.ir.auth.schemes) {
            if (scheme.type === "oauth") {
                return true;
            }
            if (scheme.type === "inferred") {
                return false;
            }
        }
        return true;
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

        if (this.settings.includePlatformHeaders) {
            this.addBuildUserAgentMethod(class_);
        }

        // Emit the self-contained `AppendAppInfoToUserAgent` helper only when the
        // opt-in `allow-user-agent-app-info` config actually wrapped a written
        // User-Agent value (set by `getConstructorMethod`, invoked above), so
        // flag-off output and clients that never send a User-Agent stay unchanged.
        if (this.usesAppInfoHelper) {
            this.addAppendAppInfoMethod(class_);
        }

        for (const subpackage of this.getSubpackages()) {
            if (this.context.subPackageHasEndpointsRecursively(subpackage)) {
                class_.addField({
                    access: ast.Access.Public,
                    get: true,
                    origin: subpackage,
                    type: this.context.getSubpackageInterfaceReference(subpackage)
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
        if (
            !this.isAnyAuthWithMultipleSchemes() &&
            !this.isEndpointSecurity() &&
            optionalParameters.some(
                (parameter) =>
                    parameter.environmentVariable != null && !(parameter.isGlobalHeader && parameter.isOptional)
            )
        ) {
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
        const unified = this.settings.unifiedClientOptions;
        // Under `any`-composed auth with more than one scheme, each scheme's
        // credentials are independently optional: the caller supplies exactly one
        // scheme's creds. We must not throw for missing creds nor wire up a token
        // provider / auth header unless that scheme's creds were actually provided.
        const anyAuthMultiScheme = this.isAnyAuthWithMultipleSchemes();
        const endpointSecurity = this.isEndpointSecurity();
        const preferExplicitAuth = this.preferExplicitAuthEnabled();
        const parameters: ast.Parameter[] = [];

        // In unified mode, check if any ClientOptions fields are truly required.
        // This includes auth params (non-optional, no env var) and BaseUrl when there's no default environment.
        // If so, ClientOptions itself must be required (non-nullable, no default).
        const hasRequiredUnifiedFields =
            unified &&
            (requiredParameters.some((p) => p.environmentVariable == null) ||
                this.context.ir.environments?.defaultEnvironment == null);

        if (!unified) {
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
        }

        if (hasRequiredUnifiedFields) {
            parameters.push(
                this.csharp.parameter({
                    name: this.members.clientOptionsParameterName,
                    type: this.Types.ClientOptions
                })
            );
        } else {
            parameters.push(
                this.csharp.parameter({
                    name: this.members.clientOptionsParameterName,
                    type: this.Types.ClientOptions.asOptional(),
                    initializer: "null"
                })
            );
        }

        /**
         * Returns the expression to access a parameter value.
         * In unified mode, reads from clientOptions.PascalCase; otherwise uses the local variable name.
         */
        const paramAccess = (param: ConstructorParameter): string => {
            if (unified) {
                return `clientOptions.${this.toPascalCase(param.name)}`;
            }
            return param.name;
        };

        // Separate auth headers from platform headers.
        //
        // Multiple auth schemes can resolve to the same HTTP header name (e.g.
        // an oauth2 bearer scheme + an apiKey-in-header scheme both named
        // `Authorization`). The generated `Dictionary<string, string>`
        // collection initializer throws `System.ArgumentException` at runtime
        // when the same key is added twice, so we dedup here. Earlier entries
        // win; we preserve the IR-established ordering of required > optional
        // > literal so the most specific / required scheme takes precedence.
        const authHeaderCandidates: { headerName: string; entry: ast.Dictionary.MapEntry }[] = [];
        // Parallel list used only under `any`-composed multi-scheme auth: each auth
        // header is written conditionally (guarded on its credential being non-null)
        // instead of via an unconditional dictionary initializer.
        const authHeaderConditionalWrites: { headerName: string; condition: string | null; value: string }[] = [];

        for (const param of [...requiredParameters, ...optionalParameters]) {
            if (param.header != null) {
                const access = paramAccess(param);
                const fallback = this.getHeaderFallback(param);
                authHeaderCandidates.push({
                    headerName: param.header.name,
                    entry: {
                        key: this.csharp.codeblock(this.csharp.string_({ string: param.header.name })),
                        value: this.csharp.codeblock(
                            param.header.prefix != null
                                ? `$"${param.header.prefix} {${param.isOptional ? `${access} ?? ${fallback}` : access}}"`
                                : param.isOptional || param.type.isOptional
                                  ? `${access} ?? ${fallback}`
                                  : access
                        )
                    }
                });
                authHeaderConditionalWrites.push({
                    headerName: param.header.name,
                    condition: `${access} != null`,
                    value: param.header.prefix != null ? `$"${param.header.prefix} {${access}}"` : access
                });
            }
        }

        for (const param of literalParameters) {
            if (param.header != null) {
                const literalValue =
                    param.value.type === "string"
                        ? `"${escapeForCSharpString(param.value.string)}"`
                        : param.value.boolean
                          ? `"${true.toString()}"`
                          : `"${false.toString()}"`;
                authHeaderCandidates.push({
                    headerName: param.header.name,
                    entry: {
                        key: this.csharp.codeblock(this.csharp.string_({ string: param.header.name })),
                        value: this.csharp.codeblock(
                            param.value.type === "string"
                                ? this.csharp.string_({ string: param.value.string })
                                : param.value.boolean
                                  ? `"${true.toString()}"`
                                  : `"${false.toString()}"`
                        )
                    }
                });
                authHeaderConditionalWrites.push({
                    headerName: param.header.name,
                    condition: null,
                    value: literalValue
                });
            }
        }

        const authHeaderEntries = dedupAuthHeaderEntries(authHeaderCandidates, (item) => item.headerName).map(
            (item) => item.entry
        );
        const authHeaderConditionalWriteEntries = dedupAuthHeaderEntries(
            authHeaderConditionalWrites,
            (item) => item.headerName
        );

        // Platform headers (no auth)
        const platformHeaderEntries: ast.Dictionary.MapEntry[] = [];
        if (!this.settings.omitFernHeaders) {
            const platformHeaders = this.context.ir.sdkConfig.platformHeaders;
            platformHeaderEntries.push({
                key: this.csharp.codeblock(`"${platformHeaders.language}"`),
                value: this.csharp.codeblock('"C#"')
            });
            platformHeaderEntries.push({
                key: this.csharp.codeblock(`"${platformHeaders.sdkName}"`),
                // Use the package identity (NuGet package id or nuget filesystem
                // publish target) so the SDK-name header matches the `User-Agent`;
                // falls back to the root namespace when neither is configured.
                value: this.csharp.codeblock(`"${this.generation.names.project.packageId}"`)
            });
            platformHeaderEntries.push({
                key: this.csharp.codeblock(`"${platformHeaders.sdkVersion}"`),
                value: this.context.getCurrentVersionValueAccess()
            });
            // When the opt-in `allow-user-agent-app-info` config is set, wrap the
            // computed User-Agent value expression in the emitted
            // `AppendAppInfoToUserAgent` helper, which appends the caller-supplied
            // `AppInfo` product token. `clientOptions` is already initialized (and
            // non-null) at the point the platform-headers dictionary is written, so
            // `clientOptions.AppInfo` is safe to read. Keeping this wrapping local to
            // the generated client (rather than modifying the shared
            // `BuildUserAgent`/core-utilities) keeps flag-off output byte-identical.
            const withAppInfo = (userAgentValue: ast.AstNode): ast.AstNode => {
                if (!this.settings.allowUserAgentAppInfo) {
                    return userAgentValue;
                }
                this.usesAppInfoHelper = true;
                return this.csharp.codeblock((writer) => {
                    writer.write(`${APPEND_APP_INFO_METHOD_NAME}(`);
                    writer.writeNode(userAgentValue);
                    writer.write(", clientOptions.AppInfo)");
                });
            };

            if (this.settings.includePlatformHeaders) {
                // Emit a single structured `User-Agent` consolidating the SDK
                // name/version with the OS, architecture, and runtime, all
                // resolved at runtime by the `BuildUserAgent` helper.
                platformHeaderEntries.push({
                    key: this.csharp.codeblock(`"${platformHeaders.userAgent?.header ?? "User-Agent"}"`),
                    value: withAppInfo(this.csharp.codeblock(`${BUILD_USER_AGENT_METHOD_NAME}()`))
                });
            } else {
                // When `user-agent-name-from-package` is enabled, falls back to
                // `$"<NuGetPackageId>/{Version.Current}"` when the IR has no
                // `platformHeaders.userAgent` (e.g. OpenAPI imports), mirroring the
                // TypeScript generator's npm-package-name fallback. Defaults off so
                // existing C# SDKs imported from OpenAPI keep emitting no User-Agent.
                const userAgentEntry = buildUserAgentHeaderEntry({
                    userAgent: platformHeaders.userAgent,
                    packageName: this.generation.names.project.packageId,
                    csharp: this.csharp,
                    versionValueAccess: this.context.getCurrentVersionValueAccess(),
                    userAgentNameFromPackage: this.settings.userAgentNameFromPackage
                });
                if (userAgentEntry != null) {
                    platformHeaderEntries.push({
                        key: userAgentEntry.key,
                        value: withAppInfo(userAgentEntry.value)
                    });
                }
            }
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
                    if (unified && !hasRequiredUnifiedFields) {
                        // In unified mode, initialize clientOptions BEFORE env var fallbacks
                        // so we can write to clientOptions.Property.
                        // Skip when there are required fields — the parameter is already non-nullable.
                        innerWriter.write("clientOptions ??= ");
                        innerWriter.writeNodeStatement(
                            this.csharp.instantiateClass({
                                classReference: this.generation.Types.ClientOptions,
                                arguments_: []
                            })
                        );
                    }

                    if (preferExplicitAuth) {
                        // Record which credentials were passed explicitly, before the env-var
                        // fallbacks below overwrite null parameters, so explicitly provided
                        // basic auth wins over env-var-derived OAuth credentials.
                        const clientIdAccess = unified ? "clientOptions.ClientId" : "clientId";
                        const clientSecretAccess = unified ? "clientOptions.ClientSecret" : "clientSecret";
                        innerWriter.writeTextStatement(
                            `var explicitOAuthAuth = ${clientIdAccess} != null || ${clientSecretAccess} != null`
                        );
                        innerWriter.writeTextStatement(
                            `var explicitBasicAuth = ${this.getBasicAuthCredentialAccesses(unified)
                                .map((access) => `${access} != null`)
                                .join(" || ")}`
                        );
                    }

                    for (const param of optionalParameters) {
                        const clientDefaultLiteral =
                            param.isGlobalHeader && param.clientDefault != null
                                ? this.getHeaderFallback(param)
                                : undefined;
                        if (param.environmentVariable != null) {
                            const target = paramAccess(param);
                            if (anyAuthMultiScheme || endpointSecurity || (param.isGlobalHeader && param.isOptional)) {
                                // Fall back to the env var if set, but do not throw when it is
                                // missing — the caller may be authenticating with another scheme.
                                innerWriter.write(`${target} ??= Environment.GetEnvironmentVariable(`);
                                innerWriter.writeNode(this.csharp.string_({ string: param.environmentVariable }));
                                if (clientDefaultLiteral != null) {
                                    innerWriter.writeTextStatement(`) ?? ${clientDefaultLiteral}`);
                                } else {
                                    innerWriter.writeTextStatement(")");
                                }
                            } else {
                                innerWriter.writeLine(`${target} ??= ${GetFromEnvironmentOrThrow}(`);
                                innerWriter.indent();
                                innerWriter.writeNode(this.csharp.string_({ string: param.environmentVariable }));
                                innerWriter.writeLine(",");
                                innerWriter.writeLine(
                                    `"Please pass in ${escapeForCSharpString(param.name)} or set the environment variable ${escapeForCSharpString(param.environmentVariable)}."`
                                );
                                innerWriter.dedent();
                                innerWriter.writeLine(");");
                            }
                        } else if (clientDefaultLiteral != null && (anyAuthMultiScheme || endpointSecurity)) {
                            // Header dictionary entries apply the client default inline elsewhere,
                            // but the `any`-composed multi-scheme and endpoint-security paths write
                            // headers conditionally, so the default must be applied here.
                            innerWriter.writeTextStatement(`${paramAccess(param)} ??= ${clientDefaultLiteral}`);
                        }
                    }

                    if (!unified) {
                        // In non-unified mode, initialize clientOptions after env var fallbacks (existing behavior)
                        innerWriter.write("clientOptions ??= ");
                        innerWriter.writeNodeStatement(
                            this.csharp.instantiateClass({
                                classReference: this.generation.Types.ClientOptions,
                                arguments_: []
                            })
                        );
                    }

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

                    this.writeServerVariableInterpolation(innerWriter);

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

                    // Check if any auth scheme is basic auth
                    const hasBasicAuth = this.context.ir.auth.schemes.some((s) => s.type === "basic");

                    // Only clone clientOptions if we have auth headers or OAuth/inferred auth/basic auth
                    const needsAuthHeaders =
                        authHeaderEntries.length > 0 ||
                        this.oauth != null ||
                        this.inferred != null ||
                        hasBasicAuth ||
                        endpointSecurity;
                    const clientOptionsVariable = needsAuthHeaders ? "clientOptionsWithAuth" : "clientOptions";

                    if (needsAuthHeaders) {
                        // Clone clientOptions for use with auth headers
                        innerWriter.writeLine("var clientOptionsWithAuth = clientOptions.Clone();");

                        // In endpoint-security mode, auth is routed per endpoint: store each scheme's
                        // headers keyed by scheme instead of flattening them onto every request.
                        if (endpointSecurity) {
                            this.writeEndpointSecurityAuthHeaderSchemes(innerWriter, { unified });
                        }

                        // Add auth headers to the cloned clientOptions
                        if (authHeaderEntries.length > 0 && !endpointSecurity) {
                            if (anyAuthMultiScheme) {
                                // Only set a scheme's auth header when its credential was provided,
                                // so callers can authenticate with just one of the `any` schemes.
                                for (const write of authHeaderConditionalWriteEntries) {
                                    if (write.condition != null) {
                                        innerWriter.controlFlow("if", this.csharp.codeblock(write.condition));
                                        innerWriter.writeTextStatement(
                                            `clientOptionsWithAuth.Headers["${write.headerName}"] = ${write.value}`
                                        );
                                        innerWriter.endControlFlow();
                                    } else {
                                        innerWriter.writeTextStatement(
                                            `clientOptionsWithAuth.Headers["${write.headerName}"] = ${write.value}`
                                        );
                                    }
                                }
                            } else {
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
                    }

                    // Add Basic Auth header if applicable
                    if (hasBasicAuth && !endpointSecurity) {
                        const basicSchemes = this.context.ir.auth.schemes.filter(
                            (s): s is typeof s & { type: "basic" } => s.type === "basic"
                        );
                        const isAuthOptional = !this.context.ir.sdkConfig.isAuthMandatory || anyAuthMultiScheme;
                        let isFirstBlock = true;
                        for (let i = 0; i < basicSchemes.length; i++) {
                            const basicScheme = basicSchemes[i];
                            if (basicScheme == null) {
                                continue;
                            }
                            const usernameName = this.case.camelSafe(basicScheme.username);
                            const passwordName = this.case.camelSafe(basicScheme.password);
                            const usernameAccess = unified
                                ? `clientOptions.${this.toPascalCase(usernameName)}`
                                : usernameName;
                            const passwordAccess = unified
                                ? `clientOptions.${this.toPascalCase(passwordName)}`
                                : passwordName;
                            const usernameOmitted = !!basicScheme.usernameOmit;
                            const passwordOmitted = !!basicScheme.passwordOmit;
                            // Condition: only require non-omitted fields to be present
                            let condition: string;
                            if (!usernameOmitted && !passwordOmitted) {
                                condition = `${usernameAccess} != null && ${passwordAccess} != null`;
                            } else if (usernameOmitted && !passwordOmitted) {
                                condition = `${passwordAccess} != null`;
                            } else if (!usernameOmitted && passwordOmitted) {
                                condition = `${usernameAccess} != null`;
                            } else {
                                // Both fields omitted — skip auth header entirely when auth is non-mandatory
                                continue;
                            }
                            if (isAuthOptional || basicSchemes.length > 1) {
                                const controlFlowKeyword = isFirstBlock ? "if" : "else if";
                                innerWriter.controlFlow(controlFlowKeyword, this.csharp.codeblock(condition));
                            }
                            isFirstBlock = false;
                            // Build credential string: omitted fields are empty, provided fields use interpolation
                            const usernamePart = usernameOmitted ? "" : `{${usernameAccess}}`;
                            const passwordPart = passwordOmitted ? "" : `{${passwordAccess}}`;
                            innerWriter.writeTextStatement(
                                `clientOptionsWithAuth.Headers["Authorization"] = $"Basic {Convert.ToBase64String(global::System.Text.Encoding.UTF8.GetBytes($"${usernamePart}:${passwordPart}"))}"`
                            );
                            if (isAuthOptional || basicSchemes.length > 1) {
                                innerWriter.endControlFlow();
                            }
                        }
                    }

                    if (this.oauth != null && this.shouldUseOAuthProvider() && !endpointSecurity) {
                        const authClientClassReference = this.context.getSubpackageClassReferenceForServiceId(
                            this.oauth.configuration.tokenEndpoint.endpointReference.serviceId
                        );

                        // Use clientOptions (platform headers only) for OAuth token requests
                        const arguments_ = [
                            this.generation.Types.RawClient.new({
                                arguments_: [this.csharp.codeblock("clientOptions")]
                            })
                        ];
                        const oauthAdditionalParams = this.getOAuthAdditionalParamNames();
                        const clientIdAccess = unified ? "clientOptions.ClientId" : "clientId";
                        const clientSecretAccess = unified ? "clientOptions.ClientSecret" : "clientSecret";
                        // Only wire up the OAuth token provider when OAuth creds were supplied;
                        // otherwise the caller is using another `any` scheme (e.g. an API key).
                        if (anyAuthMultiScheme) {
                            innerWriter.controlFlow(
                                "if",
                                this.csharp.codeblock(
                                    preferExplicitAuth
                                        ? `${clientIdAccess} != null && ${clientSecretAccess} != null && (explicitOAuthAuth || !explicitBasicAuth)`
                                        : `${clientIdAccess} != null && ${clientSecretAccess} != null`
                                )
                            );
                        }
                        innerWriter.write(
                            `var tokenProvider = new OAuthTokenProvider(${clientIdAccess}, ${clientSecretAccess}, `
                        );
                        for (const param of oauthAdditionalParams) {
                            const paramRef = unified ? `clientOptions.${this.toPascalCase(param)}` : param;
                            innerWriter.write(`${paramRef}, `);
                        }
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
                        if (anyAuthMultiScheme) {
                            innerWriter.endControlFlow();
                        }
                    }

                    if (this.inferred != null && !this.shouldUseOAuthProvider() && !endpointSecurity) {
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

                        // Only wire up the inferred-auth token provider when its creds were
                        // supplied; otherwise the caller is using another `any` scheme.
                        const shouldGuardInferred = anyAuthMultiScheme && credentialParams.length > 0;
                        if (shouldGuardInferred) {
                            const guard = credentialParams
                                .map(
                                    (param) =>
                                        `${unified ? `clientOptions.${this.toPascalCase(param)}` : param} != null`
                                )
                                .join(" && ");
                            innerWriter.controlFlow("if", this.csharp.codeblock(guard));
                        }

                        innerWriter.write("var inferredAuthProvider = new InferredAuthTokenProvider(");
                        for (const param of credentialParams) {
                            const paramRef = unified ? `clientOptions.${this.toPascalCase(param)}` : param;
                            innerWriter.write(`${paramRef}, `);
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
                        if (shouldGuardInferred) {
                            innerWriter.endControlFlow();
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
                        innerWriter.writeLine(`${this.members.grpcClientName} = ${this.members.clientName}.Grpc;`);
                        innerWriter.write(this.grpcClientInfo.privatePropertyName);
                        innerWriter.write(" = ");
                        innerWriter.writeNodeStatement(
                            this.csharp.instantiateClass({
                                classReference: this.grpcClientInfo.classReference,
                                arguments_: [this.csharp.codeblock(`${this.members.grpcClientName}.Channel`)]
                            })
                        );
                    }
                    const arguments_ = [this.csharp.codeblock(this.members.clientName)];
                    for (const subpackage of this.getSubpackages()) {
                        if (this.context.subPackageHasEndpointsRecursively(subpackage)) {
                            innerWriter.writeLine(`${this.case.pascalSafe(subpackage.name)} = `);
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

    /**
     * In endpoint-security mode, populates `clientOptionsWithAuth.AuthHeaderSchemes` with each
     * scheme's ready-to-send headers, keyed by the scheme's IR key. Each scheme is guarded on
     * its credentials being present so callers only need creds for the schemes their endpoints
     * use. `ClientOptions.GetAuthHeadersForEndpoint` later routes these per request. Mirrors the
     * per-scheme header construction of the flat path, but keyed by scheme instead of flattened.
     */
    private writeEndpointSecurityAuthHeaderSchemes(writer: Writer, { unified }: { unified: boolean }): void {
        const access = (name: string): string => (unified ? `clientOptions.${this.toPascalCase(name)}` : name);
        const setScheme = (key: string, headerName: string, valueExpression: string): void => {
            writer.write(`clientOptionsWithAuth.AuthHeaderSchemes["${key}"] = new `);
            writer.writeNode(this.generation.Types.Headers);
            writer.writeTextStatement(`(new Dictionary<string, string>() { { "${headerName}", ${valueExpression} } })`);
        };

        for (const scheme of this.context.ir.auth.schemes) {
            switch (scheme.type) {
                case "bearer": {
                    const tokenAccess = access(this.case.camelSafe(scheme.token));
                    writer.controlFlow("if", this.csharp.codeblock(`${tokenAccess} != null`));
                    setScheme(scheme.key, "Authorization", `$"Bearer {${tokenAccess}}"`);
                    writer.endControlFlow();
                    break;
                }
                case "header": {
                    const headerAccess = access(this.case.camelSafe(scheme.name));
                    const headerName = getWireValue(scheme.name);
                    const value = scheme.prefix != null ? `$"${scheme.prefix} {${headerAccess}}"` : headerAccess;
                    writer.controlFlow("if", this.csharp.codeblock(`${headerAccess} != null`));
                    setScheme(scheme.key, headerName, value);
                    writer.endControlFlow();
                    break;
                }
                case "basic": {
                    const usernameOmitted = !!scheme.usernameOmit;
                    const passwordOmitted = !!scheme.passwordOmit;
                    if (usernameOmitted && passwordOmitted) {
                        break;
                    }
                    const usernameAccess = access(this.case.camelSafe(scheme.username));
                    const passwordAccess = access(this.case.camelSafe(scheme.password));
                    const conditions: string[] = [];
                    if (!usernameOmitted) {
                        conditions.push(`${usernameAccess} != null`);
                    }
                    if (!passwordOmitted) {
                        conditions.push(`${passwordAccess} != null`);
                    }
                    const usernamePart = usernameOmitted ? "" : `{${usernameAccess}}`;
                    const passwordPart = passwordOmitted ? "" : `{${passwordAccess}}`;
                    writer.controlFlow("if", this.csharp.codeblock(conditions.join(" && ")));
                    setScheme(
                        scheme.key,
                        "Authorization",
                        `$"Basic {Convert.ToBase64String(global::System.Text.Encoding.UTF8.GetBytes($"${usernamePart}:${passwordPart}"))}"`
                    );
                    writer.endControlFlow();
                    break;
                }
                case "oauth": {
                    if (this.oauth == null) {
                        break;
                    }
                    const authClientClassReference = this.context.getSubpackageClassReferenceForServiceId(
                        this.oauth.configuration.tokenEndpoint.endpointReference.serviceId
                    );
                    const arguments_ = [
                        this.generation.Types.RawClient.new({
                            arguments_: [this.csharp.codeblock("clientOptions")]
                        })
                    ];
                    const oauthAdditionalParams = this.getOAuthAdditionalParamNames();
                    const clientIdAccess = access("clientId");
                    const clientSecretAccess = access("clientSecret");
                    writer.controlFlow(
                        "if",
                        this.csharp.codeblock(`${clientIdAccess} != null && ${clientSecretAccess} != null`)
                    );
                    writer.write(
                        `var tokenProvider = new OAuthTokenProvider(${clientIdAccess}, ${clientSecretAccess}, `
                    );
                    for (const param of oauthAdditionalParams) {
                        writer.write(`${access(param)}, `);
                    }
                    writer.writeNode(
                        this.csharp.instantiateClass({
                            classReference: authClientClassReference,
                            arguments_,
                            forceUseConstructor: true
                        })
                    );
                    writer.writeTextStatement(")");
                    writer.write("var oauthAuthHeaders = new ");
                    writer.writeNode(this.generation.Types.Headers);
                    writer.writeTextStatement("()");
                    writer.writeTextStatement(
                        `oauthAuthHeaders["Authorization"] = new Func<global::System.Threading.Tasks.ValueTask<string>>(async () => await tokenProvider.${this.names.methods.getAccessTokenAsync}().ConfigureAwait(false))`
                    );
                    writer.writeTextStatement(
                        `clientOptionsWithAuth.AuthHeaderSchemes["${scheme.key}"] = oauthAuthHeaders`
                    );
                    writer.endControlFlow();
                    break;
                }
                case "inferred": {
                    if (this.inferred == null) {
                        break;
                    }
                    const authClientClassReference = this.context.getSubpackageClassReferenceForServiceId(
                        this.inferred.tokenEndpoint.endpoint.serviceId
                    );
                    const credentialParams = this.getInferredAuthCredentialParams();
                    const arguments_ = [
                        this.generation.Types.RawClient.new({
                            arguments_: [this.csharp.codeblock("clientOptions")]
                        })
                    ];
                    const shouldGuard = credentialParams.length > 0;
                    if (shouldGuard) {
                        const guard = credentialParams.map((param) => `${access(param)} != null`).join(" && ");
                        writer.controlFlow("if", this.csharp.codeblock(guard));
                    }
                    writer.write("var inferredAuthProvider = new InferredAuthTokenProvider(");
                    for (const param of credentialParams) {
                        writer.write(`${access(param)}, `);
                    }
                    writer.writeNode(
                        this.csharp.instantiateClass({
                            classReference: authClientClassReference,
                            arguments_,
                            forceUseConstructor: true
                        })
                    );
                    writer.writeTextStatement(")");
                    const authenticatedHeaders = this.inferred.tokenEndpoint.authenticatedRequestHeaders;
                    if (authenticatedHeaders.length === 0) {
                        this.context.logger.warn(
                            "Inferred auth scheme has no authenticated request headers. At least one header should be specified."
                        );
                    }
                    writer.write("var inferredAuthHeaders = new ");
                    writer.writeNode(this.generation.Types.Headers);
                    writer.writeTextStatement("()");
                    for (const authHeader of authenticatedHeaders) {
                        writer.writeTextStatement(
                            `inferredAuthHeaders["${authHeader.headerName}"] = new Func<global::System.Threading.Tasks.ValueTask<string>>(async () => (await inferredAuthProvider.${this.names.methods.getAuthHeadersAsync}().ConfigureAwait(false)).First().Value)`
                        );
                    }
                    writer.writeTextStatement(
                        `clientOptionsWithAuth.AuthHeaderSchemes["${scheme.key}"] = inferredAuthHeaders`
                    );
                    if (shouldGuard) {
                        writer.endControlFlow();
                    }
                    break;
                }
                default:
                    assertNever(scheme);
            }
        }
    }

    /**
     * Rebuilds the environment base URL(s) from the API's URL template(s) when the user
     * sets any server URL variable (e.g. region/edge) at construction time. Each `{id}`
     * placeholder is substituted with the provided value, falling back to the variable's
     * IR default when omitted. Emits nothing when the API declares no server variables.
     */
    private writeServerVariableInterpolation(writer: Writer): void {
        const config = this.context.ir.environments;
        const options = getServerVariableOptions(config, this.case, this.settings.serverUrlVariables);
        if (options.length === 0 || config == null) {
            return;
        }
        const environments = config.environments;
        const variableSetCondition = options
            .map(({ optionName }) => `clientOptions.${optionName} != null`)
            .join(" || ");
        switch (environments.type) {
            case "singleBaseUrl": {
                const templatedEnvironments = environments.environments.filter((env) => env.urlTemplate != null);
                const firstTemplate = templatedEnvironments[0]?.urlTemplate;
                if (firstTemplate == null) {
                    return;
                }
                writer.controlFlow("if", this.csharp.codeblock(variableSetCondition));
                this.writeServerVariableLocals(writer, options);
                writer.controlFlow("if", this.csharp.codeblock("!clientOptions.IsBaseUrlExplicitlySet"));
                writer.writeTextStatement(
                    `clientOptions.BaseUrl = ${urlTemplateToInterpolatedString(firstTemplate, options)}`
                );
                writer.endControlFlow();
                for (const environment of templatedEnvironments) {
                    if (environment.urlTemplate == null) {
                        continue;
                    }
                    writer.controlFlow(
                        "else if",
                        this.csharp.codeblock((conditionWriter) => {
                            conditionWriter.write("clientOptions.BaseUrl == ");
                            conditionWriter.writeNode(this.Types.Environments);
                            conditionWriter.write(`.${this.getEnvironmentConstantName(environment.name)}`);
                        })
                    );
                    writer.writeTextStatement(
                        `clientOptions.BaseUrl = ${urlTemplateToInterpolatedString(environment.urlTemplate, options)}`
                    );
                    writer.endControlFlow();
                }
                writer.endControlFlow();
                break;
            }
            case "multipleBaseUrls": {
                const templatedEnvironments = environments.environments.filter((env) => env.urlTemplates != null);
                const firstTemplatedEnvironment = templatedEnvironments[0];
                if (firstTemplatedEnvironment == null) {
                    return;
                }
                const writeEnvironmentAssignment = (
                    environment: FernIr.MultipleBaseUrlsEnvironment,
                    assignmentWriter: Writer
                ): void => {
                    assignmentWriter.write("clientOptions.Environment = ");
                    assignmentWriter.writeNodeStatement(
                        this.csharp.instantiateClass({
                            classReference: this.Types.Environments,
                            arguments_: environments.baseUrls.map((baseUrl) => {
                                const template = environment.urlTemplates?.[baseUrl.id];
                                return {
                                    name: this.case.pascalSafe(baseUrl.name),
                                    assignment:
                                        template != null
                                            ? this.csharp.codeblock(urlTemplateToInterpolatedString(template, options))
                                            : this.csharp.codeblock(
                                                  this.csharp.string_({ string: environment.urls[baseUrl.id] ?? "" })
                                              )
                                };
                            }),
                            multiline: true
                        })
                    );
                };
                writer.controlFlow("if", this.csharp.codeblock(variableSetCondition));
                this.writeServerVariableLocals(writer, options);
                writer.controlFlow("if", this.csharp.codeblock("!clientOptions.IsEnvironmentExplicitlySet"));
                writeEnvironmentAssignment(firstTemplatedEnvironment, writer);
                writer.endControlFlow();
                for (const environment of templatedEnvironments) {
                    writer.controlFlow(
                        "else if",
                        this.csharp.codeblock((conditionWriter) => {
                            conditionWriter.write("clientOptions.Environment == ");
                            conditionWriter.writeNode(this.Types.Environments);
                            conditionWriter.write(`.${this.getEnvironmentConstantName(environment.name)}`);
                        })
                    );
                    writeEnvironmentAssignment(environment, writer);
                    writer.endControlFlow();
                }
                writer.endControlFlow();
                break;
            }
            default:
                assertNever(environments);
        }
    }

    private getEnvironmentConstantName(environmentName: FernIr.NameOrString): string {
        return this.settings.pascalCaseEnvironments
            ? this.case.pascalSafe(environmentName)
            : this.case.screamingSnakeSafe(environmentName);
    }

    private writeServerVariableLocals(writer: Writer, options: ServerVariableOption[]): void {
        for (const option of options) {
            writer.writeTextStatement(`var ${option.localName} = ${getServerVariableValueExpression(option)}`);
        }
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

        if (this.settings.unifiedClientOptions) {
            // In unified mode, auth params become named properties inside ClientOptions
            const clientOptionsFields: Array<{ name: string; assignment: ast.CodeBlock | ast.AstNode }> = [];

            for (const param of allParameters) {
                if (param.environmentVariable != null && !includeEnvVarArguments) {
                    continue;
                }
                const value = param.exampleValue ?? param.name;
                clientOptionsFields.push({
                    name: this.toPascalCase(param.name),
                    assignment: this.csharp.codeblock(`"${value}"`)
                });
            }

            // Merge fields from existing clientOptionsArgument (e.g., BaseUrl, MaxRetries)
            if (clientOptionsArgument != null && Array.isArray(clientOptionsArgument.arguments_)) {
                for (const arg of clientOptionsArgument.arguments_) {
                    if ("name" in arg && "assignment" in arg) {
                        clientOptionsFields.push({
                            name: arg.name,
                            assignment: arg.assignment as ast.AstNode
                        });
                    }
                }
            }

            if (clientOptionsFields.length > 0) {
                arguments_.push(
                    this.csharp.codeblock((writer) => {
                        writer.write(`${this.members.clientOptionsParameterName}: `);
                        writer.writeNode(
                            this.csharp.instantiateClass({
                                classReference: this.Types.ClientOptions,
                                arguments_: clientOptionsFields,
                                multiline: true
                            })
                        );
                    })
                );
            }
        } else {
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
        // In endpoint-security mode each scheme's credentials are independently optional (the
        // caller supplies only what the endpoints they call require), so treat like `any`-composed auth.
        const isOptional =
            this.context.ir.sdkConfig.isAuthMandatory ||
            this.isAnyAuthWithMultipleSchemes() ||
            this.isEndpointSecurity();
        if (scheme.type === "header") {
            {
                const name = this.case.camelSafe(scheme.name);
                return [
                    {
                        name,
                        docs: scheme.docs ?? `The ${name} to use for authentication.`,
                        isOptional,
                        header: {
                            name: getWireValue(scheme.name),
                            prefix: scheme.prefix
                        },
                        typeReference: scheme.valueType,
                        type: this.context.csharpTypeMapper.convert({
                            reference: scheme.valueType
                        }),
                        environmentVariable: scheme.headerEnvVar,
                        exampleValue: scheme.headerPlaceholder ?? this.case.screamingSnakeSafe(scheme.name)
                    }
                ];
            }
        } else if (scheme.type === "bearer") {
            {
                const name = this.case.camelSafe(scheme.token);
                return [
                    {
                        name,
                        docs: scheme.docs ?? `The ${name} to use for authentication.`,
                        isOptional,
                        header: {
                            name: "Authorization",
                            prefix: "Bearer"
                        },
                        typeReference: FernIr.TypeReference.primitive({
                            v1: FernIr.PrimitiveTypeV1.String,
                            v2: FernIr.PrimitiveTypeV2.string({
                                default: undefined,
                                validation: undefined
                            })
                        }),
                        type: this.Primitive.string,
                        environmentVariable: scheme.tokenEnvVar,
                        exampleValue: scheme.tokenPlaceholder ?? this.case.screamingSnakeSafe(scheme.token)
                    }
                ];
            }
        } else if (scheme.type === "basic") {
            {
                const usernameName = this.case.camelSafe(scheme.username);
                const passwordName = this.case.camelSafe(scheme.password);
                const usernameOmitted = !!scheme.usernameOmit;
                const passwordOmitted = !!scheme.passwordOmit;
                // When omit is true, the field is completely removed from the end-user API.
                const params: ConstructorParameter[] = [];
                if (!usernameOmitted) {
                    params.push({
                        name: usernameName,
                        docs: scheme.docs ?? `The ${usernameName} to use for authentication.`,
                        isOptional,
                        typeReference: FernIr.TypeReference.primitive({
                            v1: FernIr.PrimitiveTypeV1.String,
                            v2: FernIr.PrimitiveTypeV2.string({
                                default: undefined,
                                validation: undefined
                            })
                        }),
                        type: this.Primitive.string,
                        environmentVariable: scheme.usernameEnvVar,
                        exampleValue: scheme.usernamePlaceholder ?? this.case.screamingSnakeSafe(scheme.username)
                    });
                }
                if (!passwordOmitted) {
                    params.push({
                        name: passwordName,
                        docs: scheme.docs ?? `The ${passwordName} to use for authentication.`,
                        isOptional,
                        typeReference: FernIr.TypeReference.primitive({
                            v1: FernIr.PrimitiveTypeV1.String,
                            v2: FernIr.PrimitiveTypeV2.string({
                                default: undefined,
                                validation: undefined
                            })
                        }),
                        type: this.Primitive.string,
                        environmentVariable: scheme.passwordEnvVar,
                        exampleValue: scheme.passwordPlaceholder ?? this.case.screamingSnakeSafe(scheme.password)
                    });
                }
                return params;
            }
        } else if (scheme.type === "oauth") {
            if (this.oauth !== null) {
                return [
                    {
                        name: "clientId",
                        docs: "The clientId to use for authentication.",
                        isOptional,
                        typeReference: FernIr.TypeReference.primitive({
                            v1: FernIr.PrimitiveTypeV1.String,
                            v2: FernIr.PrimitiveTypeV2.string({
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
                        typeReference: FernIr.TypeReference.primitive({
                            v1: FernIr.PrimitiveTypeV1.String,
                            v2: FernIr.PrimitiveTypeV2.string({
                                default: undefined,
                                validation: undefined
                            })
                        }),
                        type: this.Primitive.string,
                        environmentVariable: scheme.configuration.clientSecretEnvVar,
                        exampleValue: "client_secret"
                    },
                    ...this.getOAuthAdditionalConstructorParams(scheme, isOptional)
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
        const hasClientDefault = header.clientDefault != null;
        return {
            name:
                header.valueType.type === "container" && header.valueType.container.type === "literal"
                    ? this.case.pascalSafe(header.name)
                    : this.case.camelSafe(header.name),
            header: {
                name: getWireValue(header.name)
            },
            docs: header.docs,
            isOptional:
                hasClientDefault ||
                (header.valueType.type === "container" && header.valueType.container.type === "optional"),
            typeReference: header.valueType,
            type: this.context.csharpTypeMapper.convert({
                reference: header.valueType
            }),
            environmentVariable: header.env,
            isGlobalHeader: true,
            exampleValue: this.case.screamingSnakeSafe(header.name),
            clientDefault: header.clientDefault
        };
    }

    private getHeaderFallback(param: ConstructorParameter): string {
        if (param.clientDefault != null) {
            switch (param.clientDefault.type) {
                case "string":
                    return `"${escapeForCSharpString(param.clientDefault.string)}"`;
                case "boolean":
                    return param.clientDefault.boolean ? `"${true.toString()}"` : `"${false.toString()}"`;
                default:
                    assertNever(param.clientDefault);
            }
        }
        return `""`;
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

    /**
     * Emits a static helper that builds a structured `User-Agent` of the shape
     * `{sdkName}/{sdkVersion} ({os}; {arch}) {runtime}/{runtimeVersion}`, with the
     * OS, architecture, and runtime version resolved at runtime. The OS/arch group
     * is omitted when neither can be determined (and reduced to a single value when
     * only one is), and the runtime version is dropped when unavailable, so the
     * helper never emits an empty group and never throws.
     */
    private addBuildUserAgentMethod(cls: ast.Class) {
        const { productName, appendVersion } = getUserAgentProduct({
            userAgentValue: this.context.ir.sdkConfig.platformHeaders.userAgent?.value,
            packageName: this.generation.names.project.packageId
        });
        cls.addMethod({
            access: ast.Access.Private,
            name: BUILD_USER_AGENT_METHOD_NAME,
            return_: this.Primitive.string,
            parameters: [],
            isAsync: false,
            body: this.csharp.codeblock((writer) => {
                for (const line of buildUserAgentLocalLines()) {
                    writer.writeLine(line);
                }
                if (!appendVersion) {
                    writer.writeLine(buildUserAgentReturnWithoutVersion(productName));
                    return;
                }
                writer.write(buildUserAgentReturnPrefix(productName));
                // Written via `writeNode` so the generated `Version` reference
                // registers its using directive.
                writer.writeNode(this.context.getCurrentVersionValueAccess());
                writer.writeLine(BUILD_USER_AGENT_RETURN_SUFFIX);
            }),
            type: ast.MethodType.STATIC
        });
    }

    /**
     * Emits the self-contained static `AppendAppInfoToUserAgent(string userAgent,
     * AppInfo? appInfo)` helper used by the opt-in `allow-user-agent-app-info`
     * feature. It appends the caller-supplied, sanitized `AppInfo` product token to
     * whichever `User-Agent` value the SDK would otherwise send. Percent-encodes
     * non-RFC-7230 `tchar` in `Name`/`Version` and escapes comment delimiters and
     * control characters (incl. CR/LF) in `Comment`; values are trimmed before the
     * blank check and before encoding, so blank values are dropped rather than
     * encoded into whitespace tokens. Only netstandard2.0/net462-safe APIs are used.
     */
    private addAppendAppInfoMethod(cls: ast.Class) {
        cls.addMethod({
            access: ast.Access.Private,
            name: APPEND_APP_INFO_METHOD_NAME,
            return_: this.Primitive.string,
            parameters: [
                this.csharp.parameter({ name: "userAgent", type: this.Primitive.string }),
                this.csharp.parameter({ name: "appInfo", type: this.Types.AppInfo.asOptional() })
            ],
            isAsync: false,
            body: this.csharp.codeblock((writer) => {
                for (const line of buildAppendAppInfoMethodLines()) {
                    writer.writeLine(line);
                }
            }),
            type: ast.MethodType.STATIC
        });
    }

    private getSubpackages(): Subpackage[] {
        return this.context.getSubpackages(this.context.ir.rootPackage.subpackages);
    }

    private getOAuthAdditionalConstructorParams(scheme: OAuthScheme, isOptional: boolean): ConstructorParameter[] {
        const params: ConstructorParameter[] = [];
        // Include required, non-literal custom properties, matching Java's approach of
        // skipping only literals. Keep the optional guard to avoid adding optional-typed
        // properties as required constructor parameters.
        for (const customProperty of scheme.configuration.tokenEndpoint.requestProperties.customProperties ?? []) {
            if (isLiteralTypeReference(customProperty.property.valueType)) {
                continue;
            }
            const typeRef = this.context.csharpTypeMapper.convert({
                reference: customProperty.property.valueType
            });
            if (typeRef.isOptional) {
                continue;
            }
            const name = this.case.camelSafe(customProperty.property.name);
            params.push({
                name,
                docs: `The ${name} for OAuth authentication.`,
                isOptional,
                typeReference: customProperty.property.valueType,
                type: typeRef,
                exampleValue: name
            });
        }
        const scopes = scheme.configuration.tokenEndpoint.requestProperties.scopes;
        if (scopes && !isLiteralTypeReference(scopes.property.valueType)) {
            const typeRef = this.context.csharpTypeMapper.convert({
                reference: scopes.property.valueType
            });
            if (!typeRef.isOptional) {
                const name = this.case.camelSafe(scopes.property.name);
                params.push({
                    name,
                    docs: `The ${name} for OAuth authentication.`,
                    isOptional,
                    typeReference: scopes.property.valueType,
                    type: typeRef,
                    exampleValue: name
                });
            }
        }
        return params;
    }

    /**
     * Gets the parameter names for additional OAuth fields (custom properties and scopes)
     * that need to be passed to the OAuthTokenProvider constructor.
     */
    private getOAuthAdditionalParamNames(): string[] {
        if (this.oauth == null) {
            return [];
        }
        return this.getOAuthAdditionalConstructorParams(this.oauth, false).map((p) => p.name);
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

    private toPascalCase(name: string): string {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    /**
     * True when auth is `any`-composed across more than one scheme. In that case
     * each scheme's credentials are independently optional (the caller supplies
     * exactly one scheme's creds), so we must not throw for missing creds and must
     * only wire up a scheme's token provider / header when its creds are present.
     */
    /**
     * Whether explicitly provided constructor auth credentials should take precedence
     * over environment-variable defaults when selecting the auth scheme. Opt-in via the
     * `prefer-explicit-auth` config; only applies when OAuth client-credentials is
     * composed with a basic auth scheme via `auth: any` (outside endpoint-security).
     */
    private preferExplicitAuthEnabled(): boolean {
        if (!this.settings.preferExplicitAuth) {
            return false;
        }
        if (this.isEndpointSecurity()) {
            return false;
        }
        if (!this.isAnyAuthWithMultipleSchemes()) {
            return false;
        }
        if (this.oauth == null || this.oauth.configuration.type !== "clientCredentials") {
            return false;
        }
        return this.getBasicAuthCredentialAccesses(false).length > 0;
    }

    /**
     * Returns the constructor accesses for the basic auth credential parameters
     * (excluding omitted fields), e.g. `["username", "password"]` or, in unified
     * mode, `["clientOptions.Username", "clientOptions.Password"]`.
     */
    private getBasicAuthCredentialAccesses(unified: boolean): string[] {
        const accesses: string[] = [];
        for (const scheme of this.context.ir.auth.schemes) {
            if (scheme.type !== "basic") {
                continue;
            }
            if (!scheme.usernameOmit) {
                const name = this.case.camelSafe(scheme.username);
                accesses.push(unified ? `clientOptions.${this.toPascalCase(name)}` : name);
            }
            if (!scheme.passwordOmit) {
                const name = this.case.camelSafe(scheme.password);
                accesses.push(unified ? `clientOptions.${this.toPascalCase(name)}` : name);
            }
        }
        return accesses;
    }

    private isAnyAuthWithMultipleSchemes(): boolean {
        return this.context.ir.auth.requirement === "ANY" && this.context.ir.auth.schemes.length > 1;
    }

    /**
     * Whether the API applies auth per-endpoint (each endpoint declares its own schemes) rather
     * than applying every configured scheme flatly to every request. In this mode each scheme's
     * credentials are independently optional and are routed per endpoint by ClientOptions.
     */
    private isEndpointSecurity(): boolean {
        return isEndpointSecurity(this.context);
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
