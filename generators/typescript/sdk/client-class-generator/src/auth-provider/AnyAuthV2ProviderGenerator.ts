import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, getPropertyKey, getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, PropertySignatureStructure, Scope, StructureKind, ts } from "ts-morph";
import { AuthProviderGenerator } from "./AuthProviderGenerator";

export declare namespace AnyAuthV2ProviderGenerator {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
        neverThrowErrors: boolean;
        includeSerdeLayer: boolean;
        oauthTokenOverride: boolean;
    }
}

const CLASS_NAME = "AnyAuthProvider";
const AUTH_OPTIONS_TYPE_NAME = "AuthOptions";
const AUTH_FIELD_NAME = "auth";
const DELEGATE_FIELD_NAME = "delegate";

export class AnyAuthV2ProviderGenerator implements AuthProviderGenerator {
    public static readonly CLASS_NAME = CLASS_NAME;
    public static readonly AUTH_FIELD_NAME = AUTH_FIELD_NAME;
    private readonly ir: FernIr.IntermediateRepresentation;
    private readonly neverThrowErrors: boolean;
    private readonly includeSerdeLayer: boolean;
    private readonly oauthTokenOverride: boolean;

    constructor(init: AnyAuthV2ProviderGenerator.Init) {
        this.ir = init.ir;
        this.neverThrowErrors = init.neverThrowErrors;
        this.includeSerdeLayer = init.includeSerdeLayer;
        this.oauthTokenOverride = init.oauthTokenOverride;
    }

    public getFilePath(): ExportedFilePath {
        return {
            directories: [{ nameOnDisk: "auth" }],
            file: {
                nameOnDisk: `${CLASS_NAME}.ts`,
                exportDeclaration: { namedExports: [CLASS_NAME] }
            }
        };
    }

    public getAuthProviderClassType(): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(CLASS_NAME);
    }

    public getOptionsType(): ts.TypeNode {
        throw new Error("AnyAuthProvider does not have an Options type");
    }

    public getAuthOptionsType(): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(`${CLASS_NAME}.${AUTH_OPTIONS_TYPE_NAME}`);
    }

    public getAuthOptionsProperties(_context: SdkContext): OptionalKind<PropertySignatureStructure>[] | undefined {
        return undefined;
    }

    public instantiate(constructorArgs: ts.Expression[]): ts.Expression {
        return ts.factory.createNewExpression(ts.factory.createIdentifier(CLASS_NAME), undefined, constructorArgs);
    }

    public writeToFile(context: SdkContext): void {
        this.addImports(context);
        this.writeAuthOptionsType(context);
        this.writeClass(context);
    }

    private addImports(_context: SdkContext): void {
        _context.sourceFile.addImportDeclaration({
            moduleSpecifier: "../core/index.js",
            namespaceImport: "core"
        });
    }

    private getAuthSchemeKey(authScheme: FernIr.AuthScheme): string {
        switch (authScheme.type) {
            case "bearer":
                return authScheme.key;
            case "basic":
                return authScheme.key;
            case "header":
                return authScheme.key;
            case "oauth":
                return authScheme.key;
            case "inferred":
                return authScheme.key;
            default:
                throw new Error(`Unknown auth scheme type: ${(authScheme as FernIr.AuthScheme).type}`);
        }
    }

    private writeAuthOptionsType(context: SdkContext): void {
        const authSchemes = this.ir.auth.schemes;
        const unionMembers: string[] = [];

        for (const authScheme of authSchemes) {
            const schemeKey = this.getAuthSchemeKey(authScheme);

            switch (authScheme.type) {
                case "bearer": {
                    const tokenName = getPropertyKey(authScheme.token.camelCase.safeName);
                    const hasTokenEnv = authScheme.tokenEnvVar != null;
                    const isOptional = !this.ir.sdkConfig.isAuthMandatory || hasTokenEnv;
                    const optionalMarker = isOptional ? "?" : "";
                    const tokenType = context.coreUtilities.auth.BearerToken._getReferenceToType();
                    const supplierType = getTextOfTsNode(
                        context.coreUtilities.fetcher.Supplier._getReferenceToType(tokenType)
                    );
                    unionMembers.push(`{ type: "${schemeKey}"; ${tokenName}${optionalMarker}: ${supplierType}; }`);
                    break;
                }
                case "basic": {
                    const usernameName = getPropertyKey(authScheme.username.camelCase.safeName);
                    const passwordName = getPropertyKey(authScheme.password.camelCase.safeName);
                    const hasUsernameEnv = authScheme.usernameEnvVar != null;
                    const hasPasswordEnv = authScheme.passwordEnvVar != null;
                    const isUsernameOptional = !this.ir.sdkConfig.isAuthMandatory || hasUsernameEnv;
                    const isPasswordOptional = !this.ir.sdkConfig.isAuthMandatory || hasPasswordEnv;
                    const usernameOptional = isUsernameOptional ? "?" : "";
                    const passwordOptional = isPasswordOptional ? "?" : "";
                    const stringType = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
                    const supplierType = getTextOfTsNode(
                        context.coreUtilities.fetcher.Supplier._getReferenceToType(stringType)
                    );
                    unionMembers.push(
                        `{ type: "${schemeKey}"; ${usernameName}${usernameOptional}: ${supplierType}; ${passwordName}${passwordOptional}: ${supplierType}; }`
                    );
                    break;
                }
                case "header": {
                    const headerName = getPropertyKey(authScheme.name.name.camelCase.safeName);
                    const hasHeaderEnv = authScheme.headerEnvVar != null;
                    const isOptional = !this.ir.sdkConfig.isAuthMandatory || hasHeaderEnv;
                    const optionalMarker = isOptional ? "?" : "";
                    const stringType = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
                    const supplierType = getTextOfTsNode(
                        context.coreUtilities.fetcher.Supplier._getReferenceToType(stringType)
                    );
                    unionMembers.push(`{ type: "${schemeKey}"; ${headerName}${optionalMarker}: ${supplierType}; }`);
                    break;
                }
                case "oauth": {
                    const config = authScheme.configuration;
                    if (config.type === "clientCredentials" && context.generateOAuthClients) {
                        const clientIdName = "clientId";
                        const clientSecretName = "clientSecret";
                        const hasClientIdEnv = config.clientIdEnvVar != null;
                        const hasClientSecretEnv = config.clientSecretEnvVar != null;
                        const isClientIdOptional = !this.ir.sdkConfig.isAuthMandatory || hasClientIdEnv;
                        const isClientSecretOptional = !this.ir.sdkConfig.isAuthMandatory || hasClientSecretEnv;
                        const clientIdOptional = isClientIdOptional ? "?" : "";
                        const clientSecretOptional = isClientSecretOptional ? "?" : "";
                        const stringType = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
                        const supplierType = getTextOfTsNode(
                            context.coreUtilities.fetcher.Supplier._getReferenceToType(stringType)
                        );
                        unionMembers.push(
                            `{ type: "${schemeKey}"; ${clientIdName}${clientIdOptional}: ${supplierType}; ${clientSecretName}${clientSecretOptional}: ${supplierType}; }`
                        );
                    }
                    break;
                }
                case "inferred":
                    break;
            }
        }

        if (unionMembers.length === 0) {
            return;
        }

        const unionTypeStr = unionMembers.join(" | ");

        context.sourceFile.addModule({
            name: CLASS_NAME,
            isExported: true,
            kind: StructureKind.Module,
            statements: `export type ${AUTH_OPTIONS_TYPE_NAME} = { ${AUTH_FIELD_NAME}: ${unionTypeStr} };`
        });
    }

    private writeClass(context: SdkContext): void {
        const authSchemes = this.ir.auth.schemes;

        context.sourceFile.addClass({
            name: CLASS_NAME,
            isExported: true,
            implements: [getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())],
            properties: [
                {
                    name: DELEGATE_FIELD_NAME,
                    type: getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType()),
                    hasQuestionToken: false,
                    isReadonly: true,
                    scope: Scope.Private
                }
            ],
            ctors: [
                {
                    parameters: [
                        {
                            name: AUTH_FIELD_NAME,
                            type: `${CLASS_NAME}.${AUTH_OPTIONS_TYPE_NAME}["${AUTH_FIELD_NAME}"]`
                        }
                    ],
                    statements: this.generateConstructorStatements(context, authSchemes)
                }
            ],
            methods: [
                {
                    kind: StructureKind.Method,
                    scope: Scope.Public,
                    name: "getAuthRequest",
                    isAsync: true,
                    parameters: [
                        {
                            name: "arg",
                            hasQuestionToken: true,
                            type: getTextOfTsNode(
                                ts.factory.createTypeLiteralNode([
                                    ts.factory.createPropertySignature(
                                        undefined,
                                        "endpointMetadata",
                                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                        context.coreUtilities.fetcher.EndpointMetadata._getReferenceToType()
                                    )
                                ])
                            )
                        }
                    ],
                    returnType: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode("Promise", [
                            context.coreUtilities.auth.AuthRequest._getReferenceToType()
                        ])
                    ),
                    statements: `return this.${DELEGATE_FIELD_NAME}.getAuthRequest(arg);`
                }
            ]
        });
    }

    private generateConstructorStatements(_context: SdkContext, authSchemes: FernIr.AuthScheme[]): string {
        const switchCases: string[] = [];

        for (const authScheme of authSchemes) {
            const schemeKey = this.getAuthSchemeKey(authScheme);

            switch (authScheme.type) {
                case "bearer": {
                    const tokenName = getPropertyKey(authScheme.token.camelCase.safeName);
                    const tokenEnvVar = authScheme.tokenEnvVar;
                    const tokenFallback = tokenEnvVar != null ? ` ?? process.env?.["${tokenEnvVar}"]` : "";
                    switchCases.push(`
            case "${schemeKey}":
                this.${DELEGATE_FIELD_NAME} = {
                    getAuthRequest: async (): Promise<core.AuthRequest> => {
                        const tokenValue = ${AUTH_FIELD_NAME}.${tokenName};
                        const token = await core.Supplier.get(tokenValue)${tokenFallback};
                        if (token != null) {
                            return { headers: { Authorization: \`Bearer \${token}\` } };
                        }
                        return { headers: {} };
                    }
                };
                break;`);
                    break;
                }
                case "basic": {
                    const usernameName = getPropertyKey(authScheme.username.camelCase.safeName);
                    const passwordName = getPropertyKey(authScheme.password.camelCase.safeName);
                    const usernameEnvVar = authScheme.usernameEnvVar;
                    const passwordEnvVar = authScheme.passwordEnvVar;
                    const usernameFallback = usernameEnvVar != null ? ` ?? process.env?.["${usernameEnvVar}"]` : "";
                    const passwordFallback = passwordEnvVar != null ? ` ?? process.env?.["${passwordEnvVar}"]` : "";
                    switchCases.push(`
            case "${schemeKey}":
                this.${DELEGATE_FIELD_NAME} = {
                    getAuthRequest: async (): Promise<core.AuthRequest> => {
                        const usernameValue = ${AUTH_FIELD_NAME}.${usernameName};
                        const passwordValue = ${AUTH_FIELD_NAME}.${passwordName};
                        const username = await core.Supplier.get(usernameValue)${usernameFallback};
                        const password = await core.Supplier.get(passwordValue)${passwordFallback};
                        if (username != null && password != null) {
                            const credentials = Buffer.from(\`\${username}:\${password}\`).toString("base64");
                            return { headers: { Authorization: \`Basic \${credentials}\` } };
                        }
                        return { headers: {} };
                    }
                };
                break;`);
                    break;
                }
                case "header": {
                    const headerName = getPropertyKey(authScheme.name.name.camelCase.safeName);
                    const headerWireValue = authScheme.name.wireValue;
                    const headerEnvVar = authScheme.headerEnvVar;
                    const headerFallback = headerEnvVar != null ? ` ?? process.env?.["${headerEnvVar}"]` : "";
                    const prefix = authScheme.prefix != null ? `"${authScheme.prefix} " + ` : "";
                    switchCases.push(`
            case "${schemeKey}":
                this.${DELEGATE_FIELD_NAME} = {
                    getAuthRequest: async (): Promise<core.AuthRequest> => {
                        const headerValue = ${AUTH_FIELD_NAME}.${headerName};
                        const header = await core.Supplier.get(headerValue)${headerFallback};
                        if (header != null) {
                            return { headers: { "${headerWireValue}": ${prefix}header } };
                        }
                        return { headers: {} };
                    }
                };
                break;`);
                    break;
                }
                case "oauth": {
                    if (_context.generateOAuthClients) {
                        switchCases.push(`
            case "${schemeKey}":
                throw new Error("OAuth authentication in AnyAuthProvider v2 is not yet supported. Please use the OAuth token endpoint directly.");`);
                    }
                    break;
                }
                case "inferred":
                    break;
            }
        }

        return `
        if (${AUTH_FIELD_NAME} == null) {
            this.${DELEGATE_FIELD_NAME} = new core.NoOpAuthProvider();
            return;
        }
        switch (${AUTH_FIELD_NAME}.type) {${switchCases.join("")}
            default: {
                const _exhaustive: never = ${AUTH_FIELD_NAME};
                throw new Error(\`Unknown auth type: \${(${AUTH_FIELD_NAME} as any).type}\`);
            }
        }`;
    }
}
