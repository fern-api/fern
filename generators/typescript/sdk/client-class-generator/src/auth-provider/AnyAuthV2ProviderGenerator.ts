import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, getPropertyKey, getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, PropertySignatureStructure, Scope, StructureKind, ts } from "ts-morph";
import { AuthProviderGenerator } from "./AuthProviderGenerator";
import { BasicAuthProviderGenerator } from "./BasicAuthProviderGenerator";
import { BearerAuthProviderGenerator } from "./BearerAuthProviderGenerator";
import { HeaderAuthProviderGenerator } from "./HeaderAuthProviderGenerator";
import { OAuthAuthProviderGenerator } from "./OAuthAuthProviderGenerator";

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
const OPTIONS_FIELD_NAME = "options";
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

    private addImports(context: SdkContext): void {
        context.sourceFile.addImportDeclaration({
            moduleSpecifier: "../core/index.js",
            namespaceImport: "core"
        });

        // Import BaseClientOptions for the constructor parameter type
        context.sourceFile.addImportDeclaration({
            moduleSpecifier: "../BaseClient.js",
            namedImports: ["BaseClientOptions"],
            isTypeOnly: true
        });

        // Import individual auth providers based on auth schemes
        const authSchemes = this.ir.auth.schemes;
        for (const authScheme of authSchemes) {
            switch (authScheme.type) {
                case "bearer":
                    context.sourceFile.addImportDeclaration({
                        moduleSpecifier: `./${BearerAuthProviderGenerator.CLASS_NAME}.js`,
                        namedImports: [BearerAuthProviderGenerator.CLASS_NAME]
                    });
                    break;
                case "basic":
                    context.sourceFile.addImportDeclaration({
                        moduleSpecifier: `./${BasicAuthProviderGenerator.CLASS_NAME}.js`,
                        namedImports: [BasicAuthProviderGenerator.CLASS_NAME]
                    });
                    break;
                case "header":
                    context.sourceFile.addImportDeclaration({
                        moduleSpecifier: `./${HeaderAuthProviderGenerator.CLASS_NAME}.js`,
                        namedImports: [HeaderAuthProviderGenerator.CLASS_NAME]
                    });
                    break;
                case "oauth":
                    if (context.generateOAuthClients) {
                        context.sourceFile.addImportDeclaration({
                            moduleSpecifier: `./${OAuthAuthProviderGenerator.CLASS_NAME}.js`,
                            namedImports: [OAuthAuthProviderGenerator.CLASS_NAME]
                        });
                    }
                    break;
                case "inferred":
                    break;
            }
        }
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
                    // Use the BearerAuthProvider.AuthOptions type
                    unionMembers.push(
                        `{ type: "${schemeKey}" } & ${BearerAuthProviderGenerator.CLASS_NAME}.AuthOptions`
                    );
                    break;
                }
                case "basic": {
                    // Use the BasicAuthProvider.AuthOptions type
                    unionMembers.push(
                        `{ type: "${schemeKey}" } & ${BasicAuthProviderGenerator.CLASS_NAME}.AuthOptions`
                    );
                    break;
                }
                case "header": {
                    // Use the HeaderAuthProvider.AuthOptions type
                    unionMembers.push(
                        `{ type: "${schemeKey}" } & ${HeaderAuthProviderGenerator.CLASS_NAME}.AuthOptions`
                    );
                    break;
                }
                case "oauth": {
                    const config = authScheme.configuration;
                    if (config.type === "clientCredentials" && context.generateOAuthClients) {
                        // Use the OAuthAuthProvider.AuthOptions type
                        unionMembers.push(
                            `{ type: "${schemeKey}" } & ${OAuthAuthProviderGenerator.CLASS_NAME}.AuthOptions`
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
                            name: OPTIONS_FIELD_NAME,
                            type: `BaseClientOptions & ${CLASS_NAME}.${AUTH_OPTIONS_TYPE_NAME}`
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

    private generateConstructorStatements(context: SdkContext, authSchemes: FernIr.AuthScheme[]): string {
        const switchCases: string[] = [];

        for (const authScheme of authSchemes) {
            const schemeKey = this.getAuthSchemeKey(authScheme);

            switch (authScheme.type) {
                case "bearer": {
                    const tokenName = getPropertyKey(authScheme.token.camelCase.safeName);
                    // Instantiate BearerAuthProvider with full options spread and auth-specific field
                    // Use narrowed `auth` variable for type safety
                    switchCases.push(`
            case "${schemeKey}":
                this.${DELEGATE_FIELD_NAME} = new ${BearerAuthProviderGenerator.CLASS_NAME}({ ...${OPTIONS_FIELD_NAME}, ${tokenName}: ${AUTH_FIELD_NAME}.${tokenName} });
                break;`);
                    break;
                }
                case "basic": {
                    const usernameName = getPropertyKey(authScheme.username.camelCase.safeName);
                    const passwordName = getPropertyKey(authScheme.password.camelCase.safeName);
                    // Instantiate BasicAuthProvider with full options spread and auth-specific fields
                    // Use narrowed `auth` variable for type safety
                    switchCases.push(`
            case "${schemeKey}":
                this.${DELEGATE_FIELD_NAME} = new ${BasicAuthProviderGenerator.CLASS_NAME}({ ...${OPTIONS_FIELD_NAME}, ${usernameName}: ${AUTH_FIELD_NAME}.${usernameName}, ${passwordName}: ${AUTH_FIELD_NAME}.${passwordName} });
                break;`);
                    break;
                }
                case "header": {
                    const headerName = getPropertyKey(authScheme.name.name.camelCase.safeName);
                    // Instantiate HeaderAuthProvider with full options spread and auth-specific field
                    // Use narrowed `auth` variable for type safety
                    switchCases.push(`
            case "${schemeKey}":
                this.${DELEGATE_FIELD_NAME} = new ${HeaderAuthProviderGenerator.CLASS_NAME}({ ...${OPTIONS_FIELD_NAME}, ${headerName}: ${AUTH_FIELD_NAME}.${headerName} });
                break;`);
                    break;
                }
                case "oauth": {
                    if (context.generateOAuthClients) {
                        // Instantiate OAuthAuthProvider with full options spread and auth-specific fields
                        // Use narrowed `auth` variable for type safety
                        switchCases.push(`
            case "${schemeKey}":
                this.${DELEGATE_FIELD_NAME} = new ${OAuthAuthProviderGenerator.CLASS_NAME}({ ...${OPTIONS_FIELD_NAME}, clientId: ${AUTH_FIELD_NAME}.clientId, clientSecret: ${AUTH_FIELD_NAME}.clientSecret });
                break;`);
                    }
                    break;
                }
                case "inferred":
                    break;
            }
        }

        return `
        const ${AUTH_FIELD_NAME} = ${OPTIONS_FIELD_NAME}.${AUTH_FIELD_NAME};
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
