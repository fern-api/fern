import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, PropertySignatureStructure, Scope, StructureKind, ts } from "ts-morph";
import { AuthProviderGenerator } from "./AuthProviderGenerator";
import { BasicAuthProviderGenerator } from "./BasicAuthProviderGenerator";
import { BearerAuthProviderGenerator } from "./BearerAuthProviderGenerator";
import { HeaderAuthProviderGenerator } from "./HeaderAuthProviderGenerator";
import { InferredAuthProviderGenerator } from "./InferredAuthProviderGenerator";
import { OAuthAuthProviderGenerator } from "./OAuthAuthProviderGenerator";

export declare namespace RoutingAuthProviderGenerator {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
    }
}

const CLASS_NAME = "RoutingAuthProvider";
const AUTH_PROVIDERS_FIELD_NAME = "authProviders";
const AUTH_OPTIONS_TYPE_NAME = "AuthOptions";

export class RoutingAuthProviderGenerator implements AuthProviderGenerator {
    public static readonly CLASS_NAME = CLASS_NAME;
    public static readonly AUTH_PROVIDERS_FIELD_NAME = AUTH_PROVIDERS_FIELD_NAME;
    private readonly ir: FernIr.IntermediateRepresentation;

    constructor(init: RoutingAuthProviderGenerator.Init) {
        this.ir = init.ir;
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
        throw new Error("RoutingAuthProvider does not have an Options type");
    }

    public getAuthOptionsType(): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(`${CLASS_NAME}.${AUTH_OPTIONS_TYPE_NAME}`);
    }

    public getAuthOptionsProperties(_context: SdkContext): OptionalKind<PropertySignatureStructure>[] | undefined {
        return undefined;
    }

    private getChildAuthProviderClassNames(context: SdkContext): string[] {
        const classNames: string[] = [];
        for (const authScheme of this.ir.auth.schemes) {
            switch (authScheme.type) {
                case "bearer":
                    classNames.push(BearerAuthProviderGenerator.CLASS_NAME);
                    break;
                case "basic":
                    classNames.push(BasicAuthProviderGenerator.CLASS_NAME);
                    break;
                case "header":
                    classNames.push(HeaderAuthProviderGenerator.CLASS_NAME);
                    break;
                case "oauth":
                    if (context.generateOAuthClients) {
                        classNames.push(OAuthAuthProviderGenerator.CLASS_NAME);
                    }
                    break;
                case "inferred":
                    classNames.push(InferredAuthProviderGenerator.CLASS_NAME);
                    break;
            }
        }
        return classNames;
    }

    private getAuthSchemeKeys(): string[] {
        return this.ir.auth.schemes.map((scheme) => scheme.key);
    }

    public instantiate(constructorArgs: ts.Expression[]): ts.Expression {
        return ts.factory.createNewExpression(ts.factory.createIdentifier(CLASS_NAME), undefined, constructorArgs);
    }

    public writeToFile(context: SdkContext): void {
        this.writeOptions(context);
        this.writeClass(context);
    }

    private writeOptions(context: SdkContext): void {
        const childClassNames = this.getChildAuthProviderClassNames(context);

        for (const className of childClassNames) {
            context.sourceFile.addImportDeclaration({
                moduleSpecifier: `./${className}.js`,
                namedImports: [className],
                isTypeOnly: true
            });
        }

        const authOptionsTypes = childClassNames.map((className) => `${className}.AuthOptions`);

        // Use Partial intersection of all auth options to allow anonymous endpoints
        // (some endpoints may not require any auth)
        const typeCode = `
    type UnionToIntersection<U> =
        (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

    export type ${AUTH_OPTIONS_TYPE_NAME} = Partial<UnionToIntersection<
        ${authOptionsTypes.join(" | ")}
    >>;`;

        context.sourceFile.addModule({
            name: CLASS_NAME,
            isExported: true,
            kind: StructureKind.Module,
            statements: typeCode
        });
    }

    private writeClass(context: SdkContext): void {
        // Generate the error message map for user-friendly error messages
        const errorMessageMapEntries = this.generateErrorMessageMapEntries(context);

        context.sourceFile.addClass({
            name: CLASS_NAME,
            isExported: true,
            implements: [getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())],
            properties: [
                {
                    name: AUTH_PROVIDERS_FIELD_NAME,
                    type: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode("Map", [
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                            context.coreUtilities.auth.AuthProvider._getReferenceToType()
                        ])
                    ),
                    hasQuestionToken: false,
                    isReadonly: true,
                    scope: Scope.Private
                }
            ],
            ctors: [
                {
                    parameters: [
                        {
                            name: "authProviders",
                            type: getTextOfTsNode(
                                ts.factory.createTypeReferenceNode("Map", [
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                    context.coreUtilities.auth.AuthProvider._getReferenceToType()
                                ])
                            )
                        }
                    ],
                    statements: [`this.${AUTH_PROVIDERS_FIELD_NAME} = authProviders;`]
                }
            ],
            methods: [
                {
                    kind: StructureKind.Method,
                    scope: Scope.Private,
                    isStatic: true,
                    name: "getAuthConfigErrorMessage",
                    parameters: [
                        {
                            name: "schemeKey",
                            type: "string"
                        }
                    ],
                    returnType: "string",
                    statements: this.generateGetAuthConfigErrorMessageStatements(errorMessageMapEntries)
                },
                {
                    kind: StructureKind.Method,
                    scope: Scope.Public,
                    name: "getAuthRequest",
                    isAsync: true,
                    parameters: [
                        {
                            name: "{ endpointMetadata }",
                            type: getTextOfTsNode(
                                ts.factory.createTypeLiteralNode([
                                    ts.factory.createPropertySignature(
                                        undefined,
                                        "endpointMetadata",
                                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                        context.coreUtilities.fetcher.EndpointMetadata._getReferenceToType()
                                    )
                                ])
                            ),
                            initializer: "{}"
                        }
                    ],
                    returnType: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode("Promise", [
                            context.coreUtilities.auth.AuthRequest._getReferenceToType()
                        ])
                    ),
                    statements: this.generateGetAuthRequestStatements()
                }
            ]
        });
    }

    private generateErrorMessageMapEntries(context: SdkContext): Map<string, string> {
        const entries = new Map<string, string>();
        for (const authScheme of this.ir.auth.schemes) {
            const schemeKey = authScheme.key;
            switch (authScheme.type) {
                case "bearer": {
                    const tokenFieldName = authScheme.token.camelCase.safeName;
                    const tokenEnvVar = authScheme.tokenEnvVar;
                    if (tokenEnvVar != null) {
                        entries.set(
                            schemeKey,
                            `Please provide 'auth.${tokenFieldName}' or set the '${tokenEnvVar}' environment variable`
                        );
                    } else {
                        entries.set(schemeKey, `Please provide 'auth.${tokenFieldName}'`);
                    }
                    break;
                }
                case "basic": {
                    const usernameFieldName = authScheme.username.camelCase.safeName;
                    const passwordFieldName = authScheme.password.camelCase.safeName;
                    const usernameEnvVar = authScheme.usernameEnvVar;
                    const passwordEnvVar = authScheme.passwordEnvVar;
                    const usernameHint =
                        usernameEnvVar != null
                            ? `'auth.${usernameFieldName}' or '${usernameEnvVar}' env var`
                            : `'auth.${usernameFieldName}'`;
                    const passwordHint =
                        passwordEnvVar != null
                            ? `'auth.${passwordFieldName}' or '${passwordEnvVar}' env var`
                            : `'auth.${passwordFieldName}'`;
                    entries.set(schemeKey, `Please provide ${usernameHint} and ${passwordHint}`);
                    break;
                }
                case "header": {
                    const headerFieldName = authScheme.name.name.camelCase.safeName;
                    const headerEnvVar = authScheme.headerEnvVar;
                    if (headerEnvVar != null) {
                        entries.set(
                            schemeKey,
                            `Please provide 'auth.${headerFieldName}' or set the '${headerEnvVar}' environment variable`
                        );
                    } else {
                        entries.set(schemeKey, `Please provide 'auth.${headerFieldName}'`);
                    }
                    break;
                }
                case "oauth": {
                    if (context.generateOAuthClients && authScheme.configuration.type === "clientCredentials") {
                        const clientIdEnvVar = authScheme.configuration.clientIdEnvVar;
                        const clientSecretEnvVar = authScheme.configuration.clientSecretEnvVar;
                        const clientIdHint =
                            clientIdEnvVar != null
                                ? `'auth.clientId' or '${clientIdEnvVar}' env var`
                                : `'auth.clientId'`;
                        const clientSecretHint =
                            clientSecretEnvVar != null
                                ? `'auth.clientSecret' or '${clientSecretEnvVar}' env var`
                                : `'auth.clientSecret'`;
                        entries.set(schemeKey, `Please provide ${clientIdHint} and ${clientSecretHint}`);
                    }
                    break;
                }
                case "inferred":
                    // Inferred auth doesn't have a simple error message
                    entries.set(schemeKey, `Please provide the required authentication credentials`);
                    break;
            }
        }
        return entries;
    }

    private generateGetAuthConfigErrorMessageStatements(errorMessageMap: Map<string, string>): string {
        const switchCases = Array.from(errorMessageMap.entries())
            .map(([schemeKey, message]) => `case "${schemeKey}": return "${message}";`)
            .join("\n            ");

        return `
        switch (schemeKey) {
            ${switchCases}
            default: return "Please provide the required authentication credentials for " + schemeKey;
        }`;
    }

    private generateGetAuthRequestStatements(): string {
        const providerMap = `this.${AUTH_PROVIDERS_FIELD_NAME}`;

        return `
        const security = endpointMetadata?.security;

        // If no security requirements specified, endpoint is anonymous - return empty auth request
        if (security == null || security.length === 0) {
            return { headers: {} };
        }

        // First, verify that at least one security requirement can be satisfied by available providers
        const canSatisfyAnyRequirement = security.some((securityRequirement) => {
            const schemeKeys = Object.keys(securityRequirement);
            return schemeKeys.every((schemeKey) => ${providerMap}.has(schemeKey));
        });

        if (!canSatisfyAnyRequirement) {
            // Build user-friendly error message showing which auth options are missing
            const missingAuthHints = security.map((req) => {
                const schemeKeys = Object.keys(req);
                const missingSchemes = schemeKeys.filter((key) => !${providerMap}.has(key));
                return missingSchemes.map((key) => ${CLASS_NAME}.getAuthConfigErrorMessage(key)).join(" AND ");
            }).join(" OR ");
            throw new Error(
                "No authentication credentials provided that satisfy the endpoint's security requirements. " +
                missingAuthHints
            );
        }

        // Get the first security requirement that can be satisfied (OR relationship)
        const satisfiableRequirement = security.find((securityRequirement) => {
            const schemeKeys = Object.keys(securityRequirement);
            return schemeKeys.every((schemeKey) => ${providerMap}.has(schemeKey));
        })!;

        // Get auth for all schemes in the satisfiable requirement (AND relationship)
        const combinedHeaders: Record<string, string> = {};
        for (const schemeKey of Object.keys(satisfiableRequirement)) {
            const provider = ${providerMap}.get(schemeKey);
            if (provider == null) {
                throw new Error("Internal error: auth provider not found for scheme: " + schemeKey);
            }
            const authRequest = await provider.getAuthRequest({ endpointMetadata });
            Object.assign(combinedHeaders, authRequest.headers);
        }

        return { headers: combinedHeaders };`;
    }
}
