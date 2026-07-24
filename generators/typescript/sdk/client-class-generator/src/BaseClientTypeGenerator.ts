import { CaseConverter, getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import type { FernIr } from "@fern-fern/ir-sdk";
import { getParameterNameForRootPathParameter, getPropertyKey, getTextOfTsNode } from "@fern-typescript/commons";
import type { FileContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { getClientDefaultValue, getLiteralValueForHeader, typeContainsNullable } from "./endpoints/utils/index.js";
import type { GeneratedHeader } from "./GeneratedHeader.js";
import { getServerVariableOptions, urlTemplateToTemplateLiteral } from "./serverVariables.js";

export declare namespace BaseClientTypeGenerator {
    export interface Init {
        generateIdempotentRequestOptions: boolean;
        ir: FernIr.IntermediateRepresentation;
        omitFernHeaders: boolean;
        includePlatformHeaders: boolean;
        retainOriginalCasing: boolean;
        parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
        caseConverter: CaseConverter;
    }
}

const OPTIONS_PARAMETER_NAME = "options";

export class BaseClientTypeGenerator {
    public static readonly OPTIONS_PARAMETER_NAME = OPTIONS_PARAMETER_NAME;
    private readonly generateIdempotentRequestOptions: boolean;
    private readonly ir: FernIr.IntermediateRepresentation;
    private readonly omitFernHeaders: boolean;
    private readonly includePlatformHeaders: boolean;
    private readonly retainOriginalCasing: boolean;
    private readonly parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    private readonly caseConverter: CaseConverter;

    constructor({
        generateIdempotentRequestOptions,
        ir,
        omitFernHeaders,
        includePlatformHeaders,
        retainOriginalCasing,
        parameterNaming,
        caseConverter
    }: BaseClientTypeGenerator.Init) {
        this.generateIdempotentRequestOptions = generateIdempotentRequestOptions;
        this.ir = ir;
        this.omitFernHeaders = omitFernHeaders;
        this.includePlatformHeaders = includePlatformHeaders;
        this.retainOriginalCasing = retainOriginalCasing;
        this.parameterNaming = parameterNaming;
        this.caseConverter = caseConverter;
    }

    public writeToFile(context: FileContext): void {
        if (this.shouldGenerateAuthCode()) {
            context.importsManager.addImportFromRoot("core/auth", {
                namedImports: [{ name: "AuthProvider", type: "type" }]
            });
        }

        this.generateBaseClientOptionsType(context);

        context.sourceFile.addInterface(context.baseClient.generateBaseRequestOptionsInterface(context));
        if (this.generateIdempotentRequestOptions) {
            context.sourceFile.addInterface(context.baseClient.generateBaseIdempotentRequestOptionsInterface(context));
        }

        this.generateNormalizedClientOptionsTypes(context);
        this.generateNormalizeClientOptionsFunction(context);
        this.generateNormalizeClientOptionsWithAuthFunction(context);
    }

    private generateBaseClientOptionsType(context: FileContext): void {
        const baseInterface = context.baseClient.generateBaseClientOptionsInterface(context);
        const authOptionsTypes = this.getAuthOptionsTypes(context);

        if (authOptionsTypes.length === 0) {
            context.sourceFile.addInterface(baseInterface);
            return;
        }

        const authProviderType = getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType());

        const basePropertiesStr = baseInterface.properties
            .map((prop) => {
                const docs = prop.docs ? `/** ${prop.docs.join(" ")} */\n    ` : "";
                const questionMark = prop.hasQuestionToken ? "?" : "";
                return `${docs}${prop.name}${questionMark}: ${prop.type};`;
            })
            .join("\n    ");

        const authOptionsIntersection = authOptionsTypes.join(" & ");
        const typeCode = `
export type AuthOption =
    | false
    | ${authProviderType}["getAuthRequest"]
    | ${authProviderType}
    | (${authOptionsIntersection});

export type BaseClientOptions = {
    ${basePropertiesStr}
    /** Override auth. Pass false to disable, a function returning auth headers, an AuthProvider, or auth options. */
    auth?: AuthOption;
} & ${authOptionsIntersection};`;

        context.sourceFile.addStatements(typeCode);
    }

    private getAuthOptionsTypes(context: FileContext): string[] {
        const authOptionsTypes: string[] = [];
        const authRequirement = this.ir.auth.requirement;

        if (authRequirement === "ANY") {
            // Get all auth options types for the tuple parameter
            const authProviderOptionsTypes: string[] = [];
            for (const authScheme of this.ir.auth.schemes) {
                const authOptionsType = this.getAuthOptionsTypeForScheme(authScheme, context);
                if (authOptionsType != null) {
                    authProviderOptionsTypes.push(authOptionsType);
                }
            }
            if (authProviderOptionsTypes.length > 0) {
                authOptionsTypes.push(`AnyAuthProvider.AuthOptions<[${authProviderOptionsTypes.join(", ")}]>`);
            }
        } else if (authRequirement === "ENDPOINT_SECURITY") {
            // Get all auth options types for the tuple parameter
            const authProviderOptionsTypes: string[] = [];
            for (const authScheme of this.ir.auth.schemes) {
                const authOptionsType = this.getAuthOptionsTypeForScheme(authScheme, context);
                if (authOptionsType != null) {
                    authProviderOptionsTypes.push(authOptionsType);
                }
            }
            if (authProviderOptionsTypes.length > 0) {
                authOptionsTypes.push(`RoutingAuthProvider.AuthOptions<[${authProviderOptionsTypes.join(", ")}]>`);
            }
        } else {
            for (const authScheme of this.ir.auth.schemes) {
                const authOptionsType = this.getAuthOptionsTypeForScheme(authScheme, context);
                if (authOptionsType != null) {
                    authOptionsTypes.push(authOptionsType);
                    break;
                }
            }
        }

        return authOptionsTypes;
    }

    private getAuthOptionsTypeForScheme(authScheme: FernIr.AuthScheme, context: FileContext): string | undefined {
        switch (authScheme.type) {
            case "bearer":
                return "BearerAuthProvider.AuthOptions";
            case "basic":
                return "BasicAuthProvider.AuthOptions";
            case "header":
                return "HeaderAuthProvider.AuthOptions";
            case "oauth":
                if (!context.generateOAuthClients) {
                    return undefined;
                }
                return "OAuthAuthProvider.AuthOptions";
            case "inferred":
                return "InferredAuthProvider.AuthOptions";
            default:
                assertNever(authScheme);
        }
    }

    private generateNormalizeClientOptionsFunction(context: FileContext): void {
        const fernHeaderEntries: [string, ts.Expression][] = [];

        if (!this.omitFernHeaders) {
            // X-Fern-Language header
            fernHeaderEntries.push([
                this.ir.sdkConfig.platformHeaders.language,
                ts.factory.createStringLiteral("JavaScript")
            ]);

            if (context.npmPackage != null) {
                fernHeaderEntries.push(
                    [
                        this.ir.sdkConfig.platformHeaders.sdkName,
                        ts.factory.createStringLiteral(context.npmPackage.packageName)
                    ],
                    [
                        this.ir.sdkConfig.platformHeaders.sdkVersion,
                        ts.factory.createStringLiteral(context.npmPackage.version)
                    ]
                );
            }

            // When includePlatformHeaders is enabled we emit a single structured
            // User-Agent (`{sdkName}/{version} ({os}; {arch}) {runtime}/{version}`)
            // that consolidates the platform + runtime information. This supersedes
            // the default `{package}/{version}` User-Agent, and the discrete
            // X-Fern-Runtime / X-Fern-Runtime-Version headers are dropped.
            const useRichUserAgent = this.includePlatformHeaders && context.npmPackage != null;

            if (useRichUserAgent && context.npmPackage != null) {
                fernHeaderEntries.push([
                    "User-Agent",
                    context.coreUtilities.runtime.userAgent._invoke(
                        ts.factory.createStringLiteral(context.npmPackage.packageName),
                        ts.factory.createStringLiteral(context.npmPackage.version)
                    )
                ]);
            } else if (this.ir.sdkConfig.platformHeaders.userAgent != null) {
                fernHeaderEntries.push([
                    this.ir.sdkConfig.platformHeaders.userAgent.header,
                    ts.factory.createStringLiteral(this.ir.sdkConfig.platformHeaders.userAgent.value)
                ]);
            } else if (context.npmPackage != null) {
                fernHeaderEntries.push([
                    "User-Agent",
                    ts.factory.createStringLiteral(`${context.npmPackage.packageName}/${context.npmPackage.version}`)
                ]);
            }

            if (!useRichUserAgent) {
                fernHeaderEntries.push(
                    ["X-Fern-Runtime", context.coreUtilities.runtime.type._getReferenceTo()],
                    ["X-Fern-Runtime-Version", context.coreUtilities.runtime.version._getReferenceTo()]
                );
            }
        }

        const rootHeaders = this.getRootHeaders(context);
        const hasHeaders = fernHeaderEntries.length > 0 || rootHeaders.length > 0;

        let headersSection = "";
        let headersReturn = "";

        if (hasHeaders) {
            context.importsManager.addImportFromRoot("core/headers", {
                namedImports: ["mergeHeaders"]
            });

            const headers = ts.factory.createObjectLiteralExpression([
                ...fernHeaderEntries.map(([key, value]) =>
                    ts.factory.createPropertyAssignment(getPropertyKey(key), value)
                ),
                ...rootHeaders.map(({ header, value }) =>
                    ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(header), value)
                )
            ]);

            headersSection = `
    const headers = mergeHeaders(
        ${getTextOfTsNode(headers)},
        options?.headers
    );

`;
            headersReturn = `
        headers,`;
        }

        const rootPathParamDefaults = this.getRootPathParameterDefaults();
        const serverVariableInterpolation = this.getServerVariableInterpolation(context);

        const functionCode = `
export function normalizeClientOptions<T extends BaseClientOptions = BaseClientOptions>(
    ${OPTIONS_PARAMETER_NAME}: T
): NormalizedClientOptions<T> {${headersSection}${serverVariableInterpolation.section}    return {
        ...options,${rootPathParamDefaults}${serverVariableInterpolation.returnFields}
        logging: ${getTextOfTsNode(
            context.coreUtilities.logging.createLogger._invoke(ts.factory.createIdentifier("options?.logging"))
        )},${headersReturn}
    } as NormalizedClientOptions<T>;
}`;

        context.sourceFile.addStatements(functionCode);
    }

    /**
     * Generates the interpolation of server URL variables (e.g. region/edge) into the base URL.
     * When the API declares server variables, each is exposed as a client option; if any is
     * provided the base URL is rebuilt from the environment's URL template(s) using those values.
     * Returns empty strings when the API declares no server variables, leaving output unchanged.
     */
    private getServerVariableInterpolation(context: FileContext): { section: string; returnFields: string } {
        const empty = { section: "", returnFields: "" };
        const options = getServerVariableOptions(this.ir, this.caseConverter);
        if (options.length === 0) {
            return empty;
        }
        const config = this.ir.environments;
        if (config == null) {
            return empty;
        }
        const environments = config.environments;

        const condition = options
            .map(({ optionName }) => `${OPTIONS_PARAMETER_NAME}?.${getPropertyKey(optionName)} != null`)
            .join(" || ");
        const localDeclarations = options
            .map(({ optionName, localName, variable }) => {
                const fallback = variable.default != null ? JSON.stringify(variable.default) : '""';
                return `        const ${localName} = ${OPTIONS_PARAMETER_NAME}?.${getPropertyKey(optionName)} ?? ${fallback};`;
            })
            .join("\n");
        const environmentsEnum = getTextOfTsNode(context.environments.getReferenceToEnvironmentsEnum().getExpression());

        switch (environments.type) {
            case "singleBaseUrl": {
                const templatedEnvironments = environments.environments.flatMap((env) =>
                    env.urlTemplate != null ? [{ env, urlTemplate: env.urlTemplate }] : []
                );
                const firstTemplate = templatedEnvironments[0]?.urlTemplate;
                if (firstTemplate == null) {
                    return empty;
                }
                const entries = templatedEnvironments.map(({ env, urlTemplate }) => {
                    const environmentName = this.caseConverter.pascalUnsafe(env.name);
                    const literal = urlTemplateToTemplateLiteral(urlTemplate, options);
                    return `                [${environmentsEnum}.${environmentName}, ${literal}],`;
                });
                const section = `    let baseUrl = ${OPTIONS_PARAMETER_NAME}?.baseUrl;
    if (baseUrl == null && (${condition})) {
${localDeclarations}
        if (baseUrl == null) {
            const _environmentUrls = new Map<unknown, string>([
${entries.join("\n")}
            ]);
            baseUrl = _environmentUrls.get(${OPTIONS_PARAMETER_NAME}?.environment) ?? ${urlTemplateToTemplateLiteral(firstTemplate, options)};
        }
    }

`;
                return { section, returnFields: "\n        baseUrl," };
            }
            case "multipleBaseUrls": {
                const templatedEnvironments = environments.environments.filter((env) => env.urlTemplates != null);
                const firstTemplatedEnvironment = templatedEnvironments[0];
                if (firstTemplatedEnvironment == null) {
                    return empty;
                }
                const environmentUrlsType = getTextOfTsNode(
                    context.environments.getReferenceToEnvironmentUrls().getTypeNode()
                );
                const getUrlEntries = (env: FernIr.MultipleBaseUrlsEnvironment, indent: string): string[] =>
                    environments.baseUrls.map((baseUrl) => {
                        const propertyKey = getPropertyKey(this.caseConverter.camelUnsafe(baseUrl.name));
                        const template = env.urlTemplates?.[baseUrl.id];
                        if (template != null) {
                            return `${indent}${propertyKey}: ${urlTemplateToTemplateLiteral(template, options)},`;
                        }
                        return `${indent}${propertyKey}: ${JSON.stringify(env.urls[baseUrl.id] ?? "")},`;
                    });
                const entries = templatedEnvironments.map((env) => {
                    const environmentName = this.caseConverter.pascalUnsafe(env.name);
                    return `                [
                    ${environmentsEnum}.${environmentName},
                    {
${getUrlEntries(env, "                        ").join("\n")}
                    },
                ],`;
                });
                const section = `    let environment = ${OPTIONS_PARAMETER_NAME}?.environment;
    if (environment == null && (${condition})) {
${localDeclarations}
        if (environment == null) {
            environment = {
${getUrlEntries(firstTemplatedEnvironment, "                ").join("\n")}
            };
        } else {
            const _environmentUrls = new Map<unknown, ${environmentUrlsType}>([
${entries.join("\n")}
            ]);
            environment = _environmentUrls.get(environment) ?? environment;
        }
    }

`;
                return { section, returnFields: "\n        environment," };
            }
            default:
                assertNever(environments);
        }
    }

    private getRootPathParameterDefaults(): string {
        const lines: string[] = [];
        for (const param of this.ir.pathParameters) {
            if (param.location !== "ROOT" || param.clientDefault == null) {
                continue;
            }
            const defaultValue = getClientDefaultValue(param.clientDefault);
            if (defaultValue == null) {
                continue;
            }
            const propertyKey = getPropertyKey(
                getParameterNameForRootPathParameter({
                    pathParameter: param,
                    retainOriginalCasing: this.retainOriginalCasing,
                    parameterNaming: this.parameterNaming,
                    caseConverter: this.caseConverter
                })
            );
            const literal =
                typeof defaultValue === "string"
                    ? JSON.stringify(defaultValue)
                    : typeof defaultValue === "boolean"
                      ? defaultValue
                          ? "true"
                          : "false"
                      : JSON.stringify(defaultValue);
            lines.push(`        ${propertyKey}: ${OPTIONS_PARAMETER_NAME}?.${propertyKey} ?? ${literal},`);
        }
        if (lines.length === 0) {
            return "";
        }
        return "\n" + lines.join("\n");
    }

    private shouldGenerateAuthCode(): boolean {
        return this.ir.auth.schemes.length > 0;
    }

    private generateNormalizedClientOptionsTypes(context: FileContext): void {
        const shouldGenerateAuthCode = this.shouldGenerateAuthCode();

        const authProviderProperty = shouldGenerateAuthCode
            ? `\n    authProvider?: ${getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())};`
            : "";

        let typesCode = `
export type NormalizedClientOptions<T extends BaseClientOptions = BaseClientOptions> = T & {
    logging: ${getTextOfTsNode(context.coreUtilities.logging.Logger._getReferenceToType())};${authProviderProperty}
}`;

        if (shouldGenerateAuthCode) {
            typesCode += `

export type NormalizedClientOptionsWithAuth<T extends BaseClientOptions = BaseClientOptions> = NormalizedClientOptions<T> & {
    authProvider: ${getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())};
}`;
        }

        context.sourceFile.addStatements(typesCode);
    }

    private hasOAuthScheme(): boolean {
        return this.ir.auth.schemes.some((scheme) => scheme.type === "oauth");
    }

    private generateNormalizeClientOptionsWithAuthFunction(context: FileContext): void {
        let authProviderCreation = "";
        const authRequirement = this.ir.auth.requirement;

        if (authRequirement === "ANY") {
            // Use AnyAuthProvider for ANY auth - tries all providers in sequence
            context.sourceFile.addImportDeclaration({
                moduleSpecifier: "./auth/AnyAuthProvider",
                namedImports: ["AnyAuthProvider"]
            });

            const providerClassNames: string[] = [];

            for (const authScheme of this.ir.auth.schemes) {
                switch (authScheme.type) {
                    case "bearer":
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/BearerAuthProvider",
                            namedImports: ["BearerAuthProvider"]
                        });
                        providerClassNames.push("BearerAuthProvider");
                        break;
                    case "basic":
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/BasicAuthProvider",
                            namedImports: ["BasicAuthProvider"]
                        });
                        providerClassNames.push("BasicAuthProvider");
                        break;
                    case "header":
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/HeaderAuthProvider",
                            namedImports: ["HeaderAuthProvider"]
                        });
                        providerClassNames.push("HeaderAuthProvider");
                        break;
                    case "oauth":
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/OAuthAuthProvider",
                            namedImports: ["OAuthAuthProvider"]
                        });
                        providerClassNames.push("OAuthAuthProvider");
                        break;
                    case "inferred":
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/InferredAuthProvider",
                            namedImports: ["InferredAuthProvider"]
                        });
                        providerClassNames.push("InferredAuthProvider");
                        break;
                    default:
                        assertNever(authScheme);
                }
            }

            const providerList = providerClassNames.join(", ");

            authProviderCreation = `AnyAuthProvider.createInstance(normalizedWithNoOpAuthProvider, [${providerList}])`;
        } else if (authRequirement === "ENDPOINT_SECURITY") {
            // Use RoutingAuthProvider for ENDPOINT_SECURITY - routes based on endpoint metadata
            context.sourceFile.addImportDeclaration({
                moduleSpecifier: "./auth/RoutingAuthProvider",
                namedImports: ["RoutingAuthProvider"]
            });

            const providerClassNames: string[] = [];

            for (const authScheme of this.ir.auth.schemes) {
                switch (authScheme.type) {
                    case "bearer":
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/BearerAuthProvider",
                            namedImports: ["BearerAuthProvider"]
                        });
                        providerClassNames.push("BearerAuthProvider");
                        break;
                    case "basic":
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/BasicAuthProvider",
                            namedImports: ["BasicAuthProvider"]
                        });
                        providerClassNames.push("BasicAuthProvider");
                        break;
                    case "header":
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/HeaderAuthProvider",
                            namedImports: ["HeaderAuthProvider"]
                        });
                        providerClassNames.push("HeaderAuthProvider");
                        break;
                    case "oauth":
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/OAuthAuthProvider",
                            namedImports: ["OAuthAuthProvider"]
                        });
                        providerClassNames.push("OAuthAuthProvider");
                        break;
                    case "inferred":
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/InferredAuthProvider",
                            namedImports: ["InferredAuthProvider"]
                        });
                        providerClassNames.push("InferredAuthProvider");
                        break;
                    default:
                        assertNever(authScheme);
                }
            }

            const providerList = providerClassNames.join(", ");

            authProviderCreation = `RoutingAuthProvider.createInstance(normalizedWithNoOpAuthProvider, [${providerList}])`;
        } else {
            for (const authScheme of this.ir.auth.schemes) {
                switch (authScheme.type) {
                    case "bearer":
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/BearerAuthProvider",
                            namedImports: ["BearerAuthProvider"]
                        });
                        authProviderCreation = "new BearerAuthProvider(normalizedWithNoOpAuthProvider)";
                        break;
                    case "basic":
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/BasicAuthProvider",
                            namedImports: ["BasicAuthProvider"]
                        });
                        authProviderCreation = "new BasicAuthProvider(normalizedWithNoOpAuthProvider)";
                        break;
                    case "header":
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/HeaderAuthProvider",
                            namedImports: ["HeaderAuthProvider"]
                        });
                        authProviderCreation = "new HeaderAuthProvider(normalizedWithNoOpAuthProvider)";
                        break;
                    case "oauth":
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/OAuthAuthProvider",
                            namedImports: ["OAuthAuthProvider"]
                        });
                        authProviderCreation = "OAuthAuthProvider.createInstance(normalizedWithNoOpAuthProvider)";
                        break;
                    case "inferred":
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/InferredAuthProvider",
                            namedImports: ["InferredAuthProvider"]
                        });
                        authProviderCreation = "new InferredAuthProvider(normalizedWithNoOpAuthProvider)";
                        break;
                    default:
                        assertNever(authScheme);
                }
            }
        }

        if (!authProviderCreation) {
            return;
        }

        const noOpAuthProviderRef = getTextOfTsNode(context.coreUtilities.auth.NoOpAuthProvider._getReferenceTo());
        const isAuthProviderRef = getTextOfTsNode(context.coreUtilities.auth.isAuthProvider._getReferenceTo());

        const hasAuthOptions = this.getAuthOptionsTypes(context).length > 0;
        const authBlock = hasAuthOptions
            ? `
    if (${OPTIONS_PARAMETER_NAME}.auth === false) {
        normalized.authProvider = new ${noOpAuthProviderRef}();
        return normalized;
    }
    if (${OPTIONS_PARAMETER_NAME}.auth != null) {
        if (typeof ${OPTIONS_PARAMETER_NAME}.auth === "function") {
            normalized.authProvider = { getAuthRequest: ${OPTIONS_PARAMETER_NAME}.auth };
            return normalized;
        }
        if (${isAuthProviderRef}(${OPTIONS_PARAMETER_NAME}.auth)) {
            normalized.authProvider = ${OPTIONS_PARAMETER_NAME}.auth;
            return normalized;
        }
        Object.assign(normalized, ${OPTIONS_PARAMETER_NAME}.auth);
    }
`
            : "";

        const functionCode = `
export function normalizeClientOptionsWithAuth<T extends BaseClientOptions = BaseClientOptions>(
    ${OPTIONS_PARAMETER_NAME}: T
): NormalizedClientOptionsWithAuth<T> {
    const normalized = normalizeClientOptions(${OPTIONS_PARAMETER_NAME}) as NormalizedClientOptionsWithAuth<T>;
${authBlock}
    const normalizedWithNoOpAuthProvider = withNoOpAuthProvider(normalized);
    normalized.authProvider ??= ${authProviderCreation};
    return normalized;
}

function withNoOpAuthProvider<T extends BaseClientOptions = BaseClientOptions>(
    options: NormalizedClientOptions<T>
): NormalizedClientOptionsWithAuth<T> {
    return {
        ...options,
        authProvider: new ${noOpAuthProviderRef}()
    };
}`;

        context.sourceFile.addStatements(functionCode);
    }

    private getRootHeaders(context: FileContext): GeneratedHeader[] {
        const headers: GeneratedHeader[] = [
            ...this.ir.headers
                .filter((header) => !this.isAuthorizationHeader(header))
                .map((header) => {
                    const headerName = this.getOptionKeyForHeader(header, context);
                    const literalValue = getLiteralValueForHeader(header, context);

                    let value: ts.Expression;
                    if (literalValue != null) {
                        if (typeof literalValue === "boolean") {
                            const booleanLiteral = literalValue ? ts.factory.createTrue() : ts.factory.createFalse();
                            value = ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createParenthesizedExpression(
                                        ts.factory.createBinaryExpression(
                                            ts.factory.createPropertyAccessChain(
                                                ts.factory.createIdentifier(OPTIONS_PARAMETER_NAME),
                                                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                                ts.factory.createIdentifier(headerName)
                                            ),
                                            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                            booleanLiteral
                                        )
                                    ),
                                    ts.factory.createIdentifier("toString")
                                ),
                                undefined,
                                []
                            );
                        } else {
                            value = ts.factory.createBinaryExpression(
                                ts.factory.createPropertyAccessChain(
                                    ts.factory.createIdentifier(OPTIONS_PARAMETER_NAME),
                                    ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                    ts.factory.createIdentifier(headerName)
                                ),
                                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                ts.factory.createStringLiteral(literalValue.toString())
                            );
                        }
                    } else {
                        const clientDefaultVal = getClientDefaultValue(header.clientDefault);
                        if (clientDefaultVal != null && !typeContainsNullable(header.valueType, context)) {
                            if (typeof clientDefaultVal === "boolean") {
                                const booleanLiteral = clientDefaultVal
                                    ? ts.factory.createTrue()
                                    : ts.factory.createFalse();
                                value = ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createParenthesizedExpression(
                                            ts.factory.createBinaryExpression(
                                                ts.factory.createPropertyAccessChain(
                                                    ts.factory.createIdentifier(OPTIONS_PARAMETER_NAME),
                                                    ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                                    ts.factory.createIdentifier(headerName)
                                                ),
                                                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                                booleanLiteral
                                            )
                                        ),
                                        ts.factory.createIdentifier("toString")
                                    ),
                                    undefined,
                                    []
                                );
                            } else {
                                value = ts.factory.createBinaryExpression(
                                    ts.factory.createPropertyAccessChain(
                                        ts.factory.createIdentifier(OPTIONS_PARAMETER_NAME),
                                        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                        ts.factory.createIdentifier(headerName)
                                    ),
                                    ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                    ts.factory.createStringLiteral(clientDefaultVal.toString())
                                );
                            }
                        } else {
                            value = ts.factory.createPropertyAccessChain(
                                ts.factory.createIdentifier(OPTIONS_PARAMETER_NAME),
                                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                ts.factory.createIdentifier(this.getOptionKeyForHeader(header, context))
                            );
                        }
                    }

                    return {
                        header: getWireValue(header.name),
                        value
                    };
                })
        ];

        const generatedVersion = context.versionContext.getGeneratedVersion();
        if (generatedVersion != null) {
            const header = generatedVersion.getHeader();
            const headerName = this.getOptionKeyForHeader(header, context);
            const defaultVersion = generatedVersion.getDefaultVersion();

            let value: ts.Expression;
            if (defaultVersion != null) {
                value = ts.factory.createBinaryExpression(
                    ts.factory.createPropertyAccessChain(
                        ts.factory.createIdentifier(OPTIONS_PARAMETER_NAME),
                        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                        ts.factory.createIdentifier(headerName)
                    ),
                    ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                    ts.factory.createStringLiteral(defaultVersion)
                );
            } else {
                value = ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(OPTIONS_PARAMETER_NAME),
                    ts.factory.createIdentifier(headerName)
                );
            }
            headers.push({
                header: getWireValue(header.name),
                value
            });
        }

        return headers;
    }

    private getOptionKeyForHeader(header: FernIr.HttpHeader, context: FileContext): string {
        return context.case.camelUnsafe(header.name);
    }

    private isAuthorizationHeader(header: FernIr.HttpHeader | FernIr.HeaderAuthScheme): boolean {
        const wireValue = getWireValue(header.name);
        return wireValue.toLowerCase() === "authorization";
    }
}
