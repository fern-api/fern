import type { FernIr } from "@fern-fern/ir-sdk";
import { getPropertyKey, getTextOfTsNode } from "@fern-typescript/commons";
import type { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { getLiteralValueForHeader } from "./endpoints/utils";
import type { GeneratedHeader } from "./GeneratedHeader";

export declare namespace BaseClientTypeGenerator {
    export interface Init {
        generateIdempotentRequestOptions: boolean;
        ir: FernIr.IntermediateRepresentation;
        omitFernHeaders: boolean;
        oauthTokenOverride: boolean;
        anyAuth: "v1" | "v2";
    }
}

const OPTIONS_PARAMETER_NAME = "options";

export class BaseClientTypeGenerator {
    public static readonly OPTIONS_PARAMETER_NAME = OPTIONS_PARAMETER_NAME;
    private readonly generateIdempotentRequestOptions: boolean;
    private readonly ir: FernIr.IntermediateRepresentation;
    private readonly omitFernHeaders: boolean;
    private readonly oauthTokenOverride: boolean;
    private readonly anyAuth: "v1" | "v2";

    constructor({
        generateIdempotentRequestOptions,
        ir,
        omitFernHeaders,
        oauthTokenOverride,
        anyAuth
    }: BaseClientTypeGenerator.Init) {
        this.generateIdempotentRequestOptions = generateIdempotentRequestOptions;
        this.ir = ir;
        this.omitFernHeaders = omitFernHeaders;
        this.oauthTokenOverride = oauthTokenOverride;
        this.anyAuth = anyAuth;
    }

    public writeToFile(context: SdkContext): void {
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

    private generateBaseClientOptionsType(context: SdkContext): void {
        const baseInterface = context.baseClient.generateBaseClientOptionsInterface(context);
        const authOptionsTypes = this.getAuthOptionsTypes(context);

        if (authOptionsTypes.length === 0) {
            context.sourceFile.addInterface(baseInterface);
            return;
        }

        const basePropertiesStr = baseInterface.properties
            .map((prop) => {
                const docs = prop.docs ? `/** ${prop.docs.join(" ")} */\n    ` : "";
                const questionMark = prop.hasQuestionToken ? "?" : "";
                return `${docs}${prop.name}${questionMark}: ${prop.type};`;
            })
            .join("\n    ");

        const authOptionsIntersection = authOptionsTypes.join(" & ");
        const typeCode = `
export type BaseClientOptions = {
    ${basePropertiesStr}
} & ${authOptionsIntersection};`;

        context.sourceFile.addStatements(typeCode);
    }

    private getAuthOptionsTypes(context: SdkContext): string[] {
        const authOptionsTypes: string[] = [];
        const isAnyAuth = this.ir.auth.requirement === "ANY";

        if (isAnyAuth) {
            if (this.anyAuth === "v2") {
                authOptionsTypes.push("AnyAuthProvider.AuthOptions");
            } else {
                authOptionsTypes.push("AnyAuthProvider.AuthOptions");
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

    private getAuthOptionsTypeForScheme(authScheme: FernIr.AuthScheme, context: SdkContext): string | undefined {
        if (authScheme.type === "bearer") {
            return "BearerAuthProvider.AuthOptions";
        } else if (authScheme.type === "basic") {
            return "BasicAuthProvider.AuthOptions";
        } else if (authScheme.type === "header") {
            return "HeaderAuthProvider.AuthOptions";
        } else if (authScheme.type === "oauth") {
            if (!context.generateOAuthClients) {
                return undefined;
            }
            return "OAuthAuthProvider.AuthOptions";
        } else if (authScheme.type === "inferred") {
            return "InferredAuthProvider.AuthOptions";
        }
        return undefined;
    }

    private generateNormalizeClientOptionsFunction(context: SdkContext): void {
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

            if (this.ir.sdkConfig.platformHeaders.userAgent != null) {
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

            fernHeaderEntries.push(
                ["X-Fern-Runtime", context.coreUtilities.runtime.type._getReferenceTo()],
                ["X-Fern-Runtime-Version", context.coreUtilities.runtime.version._getReferenceTo()]
            );
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

        const functionCode = `
export function normalizeClientOptions<T extends BaseClientOptions>(
    ${OPTIONS_PARAMETER_NAME}: T
): NormalizedClientOptions<T> {${headersSection}    return {
        ...options,
        logging: ${getTextOfTsNode(
            context.coreUtilities.logging.createLogger._invoke(ts.factory.createIdentifier("options?.logging"))
        )},${headersReturn}
    } as NormalizedClientOptions<T>;
}`;

        context.sourceFile.addStatements(functionCode);
    }

    private shouldGenerateAuthCode(): boolean {
        return this.ir.auth.schemes.length > 0;
    }

    private generateNormalizedClientOptionsTypes(context: SdkContext): void {
        const shouldGenerateAuthCode = this.shouldGenerateAuthCode();

        const authProviderProperty = shouldGenerateAuthCode
            ? `\n    authProvider?: ${getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())};`
            : "";

        let typesCode = `
export type NormalizedClientOptions<T extends BaseClientOptions> = T & {
    logging: ${getTextOfTsNode(context.coreUtilities.logging.Logger._getReferenceToType())};${authProviderProperty}
}`;

        if (shouldGenerateAuthCode) {
            typesCode += `

export type NormalizedClientOptionsWithAuth<T extends BaseClientOptions> = NormalizedClientOptions<T> & {
    authProvider: ${getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())};
}`;
        }

        context.sourceFile.addStatements(typesCode);
    }

    private hasOAuthScheme(): boolean {
        return this.ir.auth.schemes.some((scheme) => scheme.type === "oauth");
    }

    private generateNormalizeClientOptionsWithAuthFunction(context: SdkContext): void {
        let authProviderCreation = "";
        const isAnyAuth = this.ir.auth.requirement === "ANY";

        if (isAnyAuth) {
            if (this.anyAuth === "v2") {
                // Use AnyAuthProvider v2 (discriminated union style)
                context.sourceFile.addImportDeclaration({
                    moduleSpecifier: "./auth/AnyAuthProvider.js",
                    namedImports: ["AnyAuthProvider"]
                });

                authProviderCreation = `new AnyAuthProvider(${OPTIONS_PARAMETER_NAME})`;
            } else {
                // Use the existing AnyAuthProvider approach
                context.sourceFile.addImportDeclaration({
                    moduleSpecifier: "./auth/AnyAuthProvider.js",
                    namedImports: ["AnyAuthProvider"]
                });

                const providerImports: string[] = [];
                const providerInstantiations: string[] = [];

                for (const authScheme of this.ir.auth.schemes) {
                    if (authScheme.type === "bearer") {
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/BearerAuthProvider.js",
                            namedImports: ["BearerAuthProvider"]
                        });
                        providerImports.push("BearerAuthProvider");
                        providerInstantiations.push(
                            "if (BearerAuthProvider.canCreate(normalizedWithNoOpAuthProvider)) { authProviders.push(new BearerAuthProvider(normalizedWithNoOpAuthProvider)); }"
                        );
                    } else if (authScheme.type === "basic") {
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/BasicAuthProvider.js",
                            namedImports: ["BasicAuthProvider"]
                        });
                        providerImports.push("BasicAuthProvider");
                        providerInstantiations.push(
                            "if (BasicAuthProvider.canCreate(normalizedWithNoOpAuthProvider)) { authProviders.push(new BasicAuthProvider(normalizedWithNoOpAuthProvider)); }"
                        );
                    } else if (authScheme.type === "header") {
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/HeaderAuthProvider.js",
                            namedImports: ["HeaderAuthProvider"]
                        });
                        providerImports.push("HeaderAuthProvider");
                        providerInstantiations.push(
                            "if (HeaderAuthProvider.canCreate(normalizedWithNoOpAuthProvider)) { authProviders.push(new HeaderAuthProvider(normalizedWithNoOpAuthProvider)); }"
                        );
                    } else if (authScheme.type === "oauth") {
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: "./auth/OAuthAuthProvider.js",
                            namedImports: ["OAuthAuthProvider"]
                        });
                        providerImports.push("OAuthAuthProvider");
                        const oauthCreation = this.oauthTokenOverride
                            ? "if (OAuthAuthProvider.canCreate(normalizedWithNoOpAuthProvider)) { authProviders.push(OAuthAuthProvider.createInstance(normalizedWithNoOpAuthProvider)); }"
                            : "if (OAuthAuthProvider.canCreate(normalizedWithNoOpAuthProvider)) { authProviders.push(new OAuthAuthProvider(normalizedWithNoOpAuthProvider)); }";
                        providerInstantiations.push(oauthCreation);
                    }
                }

                authProviderCreation = `(() => {
        const authProviders: ${getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())}[] = [];
        ${providerInstantiations.join("\n        ")}
        return new AnyAuthProvider(authProviders);
    })()`;
            }
        } else {
            for (const authScheme of this.ir.auth.schemes) {
                if (authScheme.type === "bearer") {
                    context.sourceFile.addImportDeclaration({
                        moduleSpecifier: "./auth/BearerAuthProvider.js",
                        namedImports: ["BearerAuthProvider"]
                    });
                    authProviderCreation = "new BearerAuthProvider(normalizedWithNoOpAuthProvider)";
                    break;
                } else if (authScheme.type === "basic") {
                    context.sourceFile.addImportDeclaration({
                        moduleSpecifier: "./auth/BasicAuthProvider.js",
                        namedImports: ["BasicAuthProvider"]
                    });
                    authProviderCreation = "new BasicAuthProvider(normalizedWithNoOpAuthProvider)";
                    break;
                } else if (authScheme.type === "header") {
                    context.sourceFile.addImportDeclaration({
                        moduleSpecifier: "./auth/HeaderAuthProvider.js",
                        namedImports: ["HeaderAuthProvider"]
                    });
                    authProviderCreation = "new HeaderAuthProvider(normalizedWithNoOpAuthProvider)";
                    break;
                } else if (authScheme.type === "oauth") {
                    context.sourceFile.addImportDeclaration({
                        moduleSpecifier: "./auth/OAuthAuthProvider.js",
                        namedImports: ["OAuthAuthProvider"]
                    });
                    authProviderCreation = this.oauthTokenOverride
                        ? "OAuthAuthProvider.createInstance(normalizedWithNoOpAuthProvider)"
                        : "new OAuthAuthProvider(normalizedWithNoOpAuthProvider)";
                    break;
                } else if (authScheme.type === "inferred") {
                    context.sourceFile.addImportDeclaration({
                        moduleSpecifier: "./auth/InferredAuthProvider.js",
                        namedImports: ["InferredAuthProvider"]
                    });
                    authProviderCreation = "new InferredAuthProvider(normalizedWithNoOpAuthProvider)";
                    break;
                }
            }
        }

        if (!authProviderCreation) {
            return;
        }

        const functionCode = `
export function normalizeClientOptionsWithAuth<T extends BaseClientOptions>(
    ${OPTIONS_PARAMETER_NAME}: T
): NormalizedClientOptionsWithAuth<T> {
    const normalized = normalizeClientOptions(${OPTIONS_PARAMETER_NAME}) as NormalizedClientOptionsWithAuth<T>;
    const normalizedWithNoOpAuthProvider = withNoOpAuthProvider(normalized);
    normalized.authProvider ??= ${authProviderCreation};
    return normalized;
}

function withNoOpAuthProvider<T extends BaseClientOptions>(
    options: NormalizedClientOptions<T>
): NormalizedClientOptionsWithAuth<T> {
    return {
        ...options,
        authProvider: new ${getTextOfTsNode(context.coreUtilities.auth.NoOpAuthProvider._getReferenceTo())}()
    };
}`;

        context.sourceFile.addStatements(functionCode);
    }

    private getRootHeaders(context: SdkContext): GeneratedHeader[] {
        const headers: GeneratedHeader[] = [
            ...this.ir.headers
                .filter((header) => !this.isAuthorizationHeader(header))
                .map((header) => {
                    const headerName = this.getOptionKeyForHeader(header);
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
                        value = ts.factory.createPropertyAccessChain(
                            ts.factory.createIdentifier(OPTIONS_PARAMETER_NAME),
                            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                            ts.factory.createIdentifier(this.getOptionKeyForHeader(header))
                        );
                    }

                    return {
                        header: header.name.wireValue,
                        value
                    };
                })
        ];

        const generatedVersion = context.versionContext.getGeneratedVersion();
        if (generatedVersion != null) {
            const header = generatedVersion.getHeader();
            const headerName = this.getOptionKeyForHeader(header);
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
                header: header.name.wireValue,
                value
            });
        }

        return headers;
    }

    private getOptionKeyForHeader(header: FernIr.HttpHeader): string {
        return header.name.name.camelCase.unsafeName;
    }

    private isAuthorizationHeader(header: FernIr.HttpHeader | FernIr.HeaderAuthScheme): boolean {
        return header.name.wireValue.toLowerCase() === "authorization";
    }
}
