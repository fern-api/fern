import type { FernIr } from "@fern-fern/ir-sdk";
import { type ExportedFilePath, getPropertyKey, getTextOfTsNode, toCamelCase } from "@fern-typescript/commons";
import type { SdkContext } from "@fern-typescript/contexts";
import { type OptionalKind, type PropertySignatureStructure, Scope, StructureKind, ts } from "ts-morph";

import type { AuthProviderGenerator } from "./AuthProviderGenerator";

export declare namespace BearerAuthProviderGenerator {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
        authScheme: FernIr.BearerAuthScheme;
        neverThrowErrors: boolean;
        isAuthMandatory: boolean;
    }
}

const CLASS_NAME = "BearerAuthProvider";
const OPTIONS_TYPE_NAME = "Options";
const AUTH_OPTIONS_TYPE_NAME = "AuthOptions";

export class BearerAuthProviderGenerator implements AuthProviderGenerator {
    public static readonly CLASS_NAME = CLASS_NAME;
    public static readonly OPTIONS_TYPE_NAME = OPTIONS_TYPE_NAME;
    private readonly ir: FernIr.IntermediateRepresentation;
    private readonly authScheme: FernIr.BearerAuthScheme;
    private readonly isAuthMandatory: boolean;

    constructor(init: BearerAuthProviderGenerator.Init) {
        this.ir = init.ir;
        this.authScheme = init.authScheme;
        this.isAuthMandatory = init.isAuthMandatory;
    }

    /**
     * Gets the wrapper property name for this Bearer auth scheme.
     * This is used to namespace Bearer options when multiple auth schemes are present.
     * e.g., "Bearer" -> "bearer", "MyAuth" -> "myAuth"
     */
    public getWrapperPropertyName(): string {
        // Find the auth scheme key in the IR
        const authScheme = this.ir.auth.schemes.find(
            (scheme) => scheme.type === "bearer" && scheme === this.authScheme
        );
        if (authScheme == null) {
            throw new Error("Failed to find bearer auth scheme in IR");
        }
        return toCamelCase(authScheme.key);
    }

    public getFilePath(): ExportedFilePath {
        return {
            directories: [
                {
                    nameOnDisk: "auth"
                }
            ],
            file: {
                nameOnDisk: `${CLASS_NAME}.ts`,
                exportDeclaration: {
                    namedExports: [CLASS_NAME]
                }
            }
        };
    }

    public getAuthProviderClassType(): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(CLASS_NAME);
    }

    public getOptionsType(): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(`${CLASS_NAME}.${OPTIONS_TYPE_NAME}`);
    }

    public getAuthOptionsType(): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(`${CLASS_NAME}.${AUTH_OPTIONS_TYPE_NAME}`);
    }

    public getAuthOptionsProperties(context: SdkContext): OptionalKind<PropertySignatureStructure>[] | undefined {
        const hasTokenEnv = this.authScheme.tokenEnvVar != null;
        const isTokenOptional = !this.isAuthMandatory || hasTokenEnv;
        // When there's an env var fallback, use Supplier<T> | undefined because the supplier itself can be undefined
        // When there's no env var fallback, use Supplier<T> directly.
        const tokenType = context.coreUtilities.auth.BearerToken._getReferenceToType();
        const supplierType = context.coreUtilities.fetcher.SupplierOrEndpointSupplier._getReferenceToType(tokenType);

        // For env var fallback: prop?: Supplier<T> | undefined
        const propertyType = hasTokenEnv
            ? ts.factory.createUnionTypeNode([
                  supplierType,
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
              ])
            : supplierType;

        return [
            {
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(this.authScheme.token.camelCase.safeName),
                hasQuestionToken: isTokenOptional,
                type: getTextOfTsNode(propertyType),
                docs: this.authScheme.docs != null ? [this.authScheme.docs] : undefined
            }
        ];
    }

    public instantiate(constructorArgs: ts.Expression[]): ts.Expression {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(CLASS_NAME), "createInstance"),
            undefined,
            constructorArgs
        );
    }

    public writeToFile(context: SdkContext): void {
        this.writeConstants(context);
        this.writeClass(context);
        this.writeOptions(context);
    }

    private writeConstants(context: SdkContext): void {
        const wrapperPropertyName = this.getWrapperPropertyName();
        const tokenFieldName = this.authScheme.token.camelCase.safeName;
        const tokenEnvVar = this.authScheme.tokenEnvVar;

        const constants: string[] = [];
        constants.push(`const WRAPPER_PROPERTY = "${wrapperPropertyName}" as const;`);
        constants.push(`const TOKEN_PARAM = "${tokenFieldName}" as const;`);

        if (tokenEnvVar != null) {
            constants.push(`const ENV_TOKEN = "${tokenEnvVar}" as const;`);
        }

        for (const constant of constants) {
            context.sourceFile.addStatements(constant);
        }
        context.sourceFile.addStatements(""); // blank line
    }

    private writeClass(context: SdkContext): void {
        context.sourceFile.addClass({
            name: CLASS_NAME,
            isExported: true,
            implements: [getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())],
            properties: [
                {
                    name: "options",
                    type: `${CLASS_NAME}.${OPTIONS_TYPE_NAME}`,
                    hasQuestionToken: false,
                    isReadonly: true,
                    scope: Scope.Private
                }
            ],
            methods: [
                {
                    kind: StructureKind.Method,
                    scope: Scope.Public,
                    isStatic: true,
                    name: "canCreate",
                    parameters: [
                        {
                            name: "options",
                            type: `Partial<${CLASS_NAME}.${OPTIONS_TYPE_NAME}>`
                        }
                    ],
                    returnType: "boolean",
                    statements: this.generatecanCreateStatements()
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
                        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
                            context.coreUtilities.auth.AuthRequest._getReferenceToType()
                        ])
                    ),
                    statements: this.generateGetAuthRequestStatements(context)
                }
            ],
            ctors: [
                {
                    parameters: [
                        {
                            name: "options",
                            type: `${CLASS_NAME}.${OPTIONS_TYPE_NAME}`
                        }
                    ],
                    statements: [`this.options = options;`]
                }
            ]
        });
    }

    private generatecanCreateStatements(): string {
        const tokenEnvVar = this.authScheme.tokenEnvVar;

        if (tokenEnvVar != null) {
            return `return options?.[WRAPPER_PROPERTY]?.[TOKEN_PARAM] != null || process.env?.[ENV_TOKEN] != null;`;
        }

        return `return options?.[WRAPPER_PROPERTY]?.[TOKEN_PARAM] != null;`;
    }

    private generateGetAuthRequestStatements(context: SdkContext): string {
        const tokenVar = this.authScheme.token.camelCase.unsafeName;
        const tokenEnvVar = this.authScheme.tokenEnvVar;
        const errorConstructor = getTextOfTsNode(
            context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression()
        );

        // Build property access chain: this.options[WRAPPER_PROPERTY]?.[TOKEN_PARAM]
        // Start with this.options (no optional chaining on this.options)
        const thisOptionsAccess = ts.factory.createPropertyAccessExpression(ts.factory.createThis(), "options");

        // Add [WRAPPER_PROPERTY] with optional chaining
        const wrapperAccess = ts.factory.createElementAccessExpression(
            thisOptionsAccess,
            ts.factory.createIdentifier("WRAPPER_PROPERTY")
        );

        // Add ?.[TOKEN_PARAM]
        const tokenAccess = ts.factory.createElementAccessChain(
            wrapperAccess,
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier("TOKEN_PARAM")
        );

        const supplierGetCall = context.coreUtilities.fetcher.SupplierOrEndpointSupplier.get(
            tokenAccess,
            ts.factory.createObjectLiteralExpression([ts.factory.createShorthandPropertyAssignment("endpointMetadata")])
        );
        const supplierGetCode = getTextOfTsNode(supplierGetCall);

        if (tokenEnvVar != null) {
            return `
        const ${tokenVar} =
            (${supplierGetCode}) ??
            process.env?.[ENV_TOKEN];
        if (${tokenVar} == null) {
            throw new ${errorConstructor}({
                message: ${CLASS_NAME}.AUTH_CONFIG_ERROR_MESSAGE,
            });
        }

        return {
            headers: { Authorization: \`Bearer \${${tokenVar}}\` },
        };
        `;
        }

        return `
        const ${tokenVar} = ${supplierGetCode};
        if (${tokenVar} == null) {
            throw new ${errorConstructor}({
                message: ${CLASS_NAME}.AUTH_CONFIG_ERROR_MESSAGE,
            });
        }

        return {
            headers: { Authorization: \`Bearer \${${tokenVar}}\` },
        };
        `;
    }

    private writeOptions(context: SdkContext): void {
        const authOptionsProperties = this.getAuthOptionsProperties(context) ?? [];
        const authSchemeKey =
            this.ir.auth.schemes.find((scheme) => scheme.type === "bearer" && scheme === this.authScheme)?.key ??
            "Bearer";
        const tokenEnvVar = this.authScheme.tokenEnvVar;

        const statements: (string | any)[] = [`export const AUTH_SCHEME = "${authSchemeKey}" as const;`];

        // Add AUTH_CONFIG_ERROR_MESSAGE constant
        if (tokenEnvVar != null) {
            statements.push(
                `export const AUTH_CONFIG_ERROR_MESSAGE: string = \`Please provide '\${TOKEN_PARAM}' when initializing the client, or set the '\${ENV_TOKEN}' environment variable\` as const;`
            );
        } else {
            statements.push(
                `export const AUTH_CONFIG_ERROR_MESSAGE: string = \`Please provide '\${TOKEN_PARAM}' when initializing the client\` as const;`
            );
        }

        statements.push(
            // Options = Partial<AuthOptions>
            `export type ${OPTIONS_TYPE_NAME} = Partial<${AUTH_OPTIONS_TYPE_NAME}>;`,
            // AuthOptions with computed property names
            {
                kind: StructureKind.TypeAlias,
                name: AUTH_OPTIONS_TYPE_NAME,
                isExported: true,
                type: `{\n        [WRAPPER_PROPERTY]: { ${authOptionsProperties.map((p) => `[TOKEN_PARAM]${p.hasQuestionToken ? "?" : ""}: ${p.type}`).join("; ")} };\n    }`
            },
            {
                kind: StructureKind.Function,
                name: "createInstance",
                isExported: true,
                parameters: [{ name: "options", type: OPTIONS_TYPE_NAME }],
                returnType: getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType()),
                statements: `return new ${CLASS_NAME}(options);`
            }
        );

        context.sourceFile.addModule({
            name: CLASS_NAME,
            isExported: true,
            kind: StructureKind.Module,
            statements
        });
    }
}
