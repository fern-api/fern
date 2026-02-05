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

    public instantiate(constructorArgs: ts.Expression[]): ts.Expression {
        return ts.factory.createNewExpression(ts.factory.createIdentifier(CLASS_NAME), undefined, constructorArgs);
    }

    public writeToFile(context: SdkContext): void {
        this.addImports(context);
        this.writeClass(context);
        this.writeOptions(context);
    }

    private addImports(context: SdkContext): void {
        // Import NormalizedClientOptions type
        context.sourceFile.addImportDeclaration({
            moduleSpecifier: "../BaseClient",
            namedImports: ["NormalizedClientOptions"],
            isTypeOnly: true
        });

        // Import child auth provider classes
        const childClassNames = this.getChildAuthProviderClassNames(context);
        for (const className of childClassNames) {
            // Import as value (not type-only) so we can call static methods
            context.sourceFile.addImportDeclaration({
                moduleSpecifier: `./${className}`,
                namedImports: [className],
                isTypeOnly: false
            });
        }
    }

    private writeOptions(context: SdkContext): void {
        // Collect AuthOptions and Options from all providers
        const authOptionsTypes: string[] = [];
        const optionsTypes: string[] = [];

        for (const authScheme of this.ir.auth.schemes) {
            switch (authScheme.type) {
                case "bearer":
                    authOptionsTypes.push(`${BearerAuthProviderGenerator.CLASS_NAME}.AuthOptions`);
                    optionsTypes.push(`${BearerAuthProviderGenerator.CLASS_NAME}.Options`);
                    break;
                case "basic":
                    authOptionsTypes.push(`${BasicAuthProviderGenerator.CLASS_NAME}.AuthOptions`);
                    optionsTypes.push(`${BasicAuthProviderGenerator.CLASS_NAME}.Options`);
                    break;
                case "header":
                    authOptionsTypes.push(`${HeaderAuthProviderGenerator.CLASS_NAME}.AuthOptions`);
                    optionsTypes.push(`${HeaderAuthProviderGenerator.CLASS_NAME}.Options`);
                    break;
                case "oauth":
                    if (context.generateOAuthClients) {
                        authOptionsTypes.push(`${OAuthAuthProviderGenerator.CLASS_NAME}.AuthOptions`);
                        optionsTypes.push(`${OAuthAuthProviderGenerator.CLASS_NAME}.Options`);
                    }
                    break;
                case "inferred":
                    authOptionsTypes.push(`${InferredAuthProviderGenerator.CLASS_NAME}.AuthOptions`);
                    optionsTypes.push(`${InferredAuthProviderGenerator.CLASS_NAME}.Options`);
                    break;
            }
        }

        const normalizedClientOptionsType = "NormalizedClientOptions";

        // Create namespace with types and createInstance function
        context.sourceFile.addModule({
            name: CLASS_NAME,
            isExported: true,
            kind: StructureKind.Module,
            statements: [
                // Helper type to convert union to intersection
                `type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;`,
                "",
                `export type AuthOptions<TAuthProviders extends readonly any[]> = Partial<UnionToIntersection<TAuthProviders[number]>>;`,
                `export type Options<TOptions extends readonly any[]> = Partial<UnionToIntersection<TOptions[number]>>;`,
                "",
                `type InstantiatableAuthProviderWithScheme = {`,
                `    canCreate: (opts: ${normalizedClientOptionsType}) => boolean;`,
                `    createInstance: (opts: ${normalizedClientOptionsType}) => core.AuthProvider;`,
                `    AUTH_SCHEME: string;`,
                `    AUTH_CONFIG_ERROR_MESSAGE: string;`,
                `};`,
                "",
                {
                    kind: StructureKind.Function,
                    name: "createInstance",
                    isExported: true,
                    parameters: [
                        { name: "options", type: normalizedClientOptionsType },
                        { name: "authProviderClasses", type: "InstantiatableAuthProviderWithScheme[]" }
                    ],
                    returnType: getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType()),
                    statements: `
        const authProviders: [AuthScheme, core.AuthProvider, AuthConfigErrorMessage][] = authProviderClasses
            .filter((providerClass) => providerClass.canCreate(options))
            .map((providerClass) => [
                providerClass.AUTH_SCHEME,
                providerClass.createInstance(options),
                providerClass.AUTH_CONFIG_ERROR_MESSAGE,
            ]);

        return new ${CLASS_NAME}(authProviders);`
                }
            ]
        });
    }

    private writeClass(context: SdkContext): void {
        // Add type aliases before the class
        context.sourceFile.addStatements(["type AuthScheme = string;", "type AuthConfigErrorMessage = string;", ""]);

        context.sourceFile.addClass({
            name: CLASS_NAME,
            isExported: true,
            implements: [getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())],
            properties: [
                {
                    name: AUTH_PROVIDERS_FIELD_NAME,
                    type: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode("Map", [
                            ts.factory.createTypeReferenceNode("AuthScheme"),
                            context.coreUtilities.auth.AuthProvider._getReferenceToType()
                        ])
                    ),
                    hasQuestionToken: false,
                    isReadonly: true,
                    scope: Scope.Private
                },
                {
                    name: "authConfigErrorMessages",
                    type: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode("Map", [
                            ts.factory.createTypeReferenceNode("AuthScheme"),
                            ts.factory.createTypeReferenceNode("AuthConfigErrorMessage")
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
                            type: "[AuthScheme, core.AuthProvider, AuthConfigErrorMessage][]"
                        }
                    ],
                    statements: [
                        `this.${AUTH_PROVIDERS_FIELD_NAME} = new Map(authProviders.map(([scheme, provider]) => [scheme, provider]));`,
                        `this.authConfigErrorMessages = new Map(authProviders.map(([scheme, , errorMessage]) => [scheme, errorMessage]));`
                    ]
                }
            ],
            methods: [
                {
                    kind: StructureKind.Method,
                    scope: Scope.Private,
                    isStatic: false,
                    name: "getAuthConfigErrorMessage",
                    parameters: [
                        {
                            name: "schemeKey",
                            type: "string"
                        }
                    ],
                    returnType: "string",
                    statements: this.generateInstanceGetAuthConfigErrorMessageStatements()
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

    private generateInstanceGetAuthConfigErrorMessageStatements(): string {
        return `
        return (
            this.authConfigErrorMessages.get(schemeKey) ??
            \`Please provide the required authentication credentials for \${schemeKey} when initializing the client\`
        );`;
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
                return missingSchemes.map((key) => this.getAuthConfigErrorMessage(key)).join(" AND ");
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
                throw new Error(\`Internal error: auth provider not found for scheme: \${schemeKey}\`);
            }
            const authRequest = await provider.getAuthRequest({ endpointMetadata });
            Object.assign(combinedHeaders, authRequest.headers);
        }

        return { headers: combinedHeaders };`;
    }
}
