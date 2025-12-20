import type { FernIr } from "@fern-fern/ir-sdk";
import { type ExportedFilePath, getPropertyKey, getTextOfTsNode, toCamelCase } from "@fern-typescript/commons";
import type { SdkContext } from "@fern-typescript/contexts";
import {
    type OptionalKind,
    type PropertySignatureStructure,
    Scope,
    StatementStructures,
    StructureKind,
    ts,
    WriterFunction
} from "ts-morph";

import type { AuthProviderGenerator } from "./AuthProviderGenerator";

export declare namespace BasicAuthProviderGenerator {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
        authScheme: FernIr.BasicAuthScheme;
        neverThrowErrors: boolean;
        isAuthMandatory: boolean;
        shouldUseWrapper: boolean;
    }
}

const CLASS_NAME = "BasicAuthProvider";
const OPTIONS_TYPE_NAME = "Options";
const AUTH_OPTIONS_TYPE_NAME = "AuthOptions";

export class BasicAuthProviderGenerator implements AuthProviderGenerator {
    public static readonly CLASS_NAME = CLASS_NAME;
    public static readonly OPTIONS_TYPE_NAME = OPTIONS_TYPE_NAME;
    private readonly ir: FernIr.IntermediateRepresentation;
    private readonly authScheme: FernIr.BasicAuthScheme;
    private readonly isAuthMandatory: boolean;
    private readonly shouldUseWrapper: boolean;
    private readonly keepIfWrapper: (str: string) => string;

    constructor(init: BasicAuthProviderGenerator.Init) {
        this.ir = init.ir;
        this.authScheme = init.authScheme;
        this.isAuthMandatory = init.isAuthMandatory;
        this.shouldUseWrapper = init.shouldUseWrapper;
        this.keepIfWrapper = init.shouldUseWrapper ? (str: string) => str : () => "";
    }

    /**
     * Gets the wrapper property name for this Basic auth scheme.
     * This is used to namespace Basic auth options when multiple auth schemes are present.
     * e.g., "BasicAuth" -> "basicAuth", "MyAuth" -> "myAuth"
     */
    public getWrapperPropertyName(): string {
        // Find the auth scheme key in the IR
        const authScheme = this.ir.auth.schemes.find((scheme) => scheme.type === "basic" && scheme === this.authScheme);
        if (authScheme == null) {
            throw new Error("Failed to find basic auth scheme in IR");
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
        const hasUsernameEnv = this.authScheme.usernameEnvVar != null;
        const hasPasswordEnv = this.authScheme.passwordEnvVar != null;
        const isUsernameOptional = !this.isAuthMandatory || hasUsernameEnv;
        const isPasswordOptional = !this.isAuthMandatory || hasPasswordEnv;

        // When there's an env var fallback, use Supplier<T> | undefined because the supplier itself can be undefined
        // When there's no env var fallback, use Supplier<T> directly.
        const stringType = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
        const supplierType = context.coreUtilities.fetcher.SupplierOrEndpointSupplier._getReferenceToType(stringType);

        // For env var fallback: prop?: Supplier<T> | undefined
        const usernamePropertyType = hasUsernameEnv
            ? ts.factory.createUnionTypeNode([
                  supplierType,
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
              ])
            : supplierType;

        const passwordPropertyType = hasPasswordEnv
            ? ts.factory.createUnionTypeNode([
                  supplierType,
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
              ])
            : supplierType;

        return [
            {
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(this.authScheme.username.camelCase.safeName),
                hasQuestionToken: isUsernameOptional,
                type: getTextOfTsNode(usernamePropertyType),
                docs: this.authScheme.docs != null ? [this.authScheme.docs] : undefined
            },
            {
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(this.authScheme.password.camelCase.safeName),
                hasQuestionToken: isPasswordOptional,
                type: getTextOfTsNode(passwordPropertyType),
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
        const usernameFieldName = this.authScheme.username.camelCase.safeName;
        const passwordFieldName = this.authScheme.password.camelCase.safeName;
        const usernameEnvVar = this.authScheme.usernameEnvVar;
        const passwordEnvVar = this.authScheme.passwordEnvVar;
        const wrapperPropertyName = this.getWrapperPropertyName();

        const constants: string[] = [];

        constants.push(this.keepIfWrapper(`const WRAPPER_PROPERTY = "${wrapperPropertyName}" as const;`));
        constants.push(`const USERNAME_PARAM = "${usernameFieldName}" as const;`);
        constants.push(`const PASSWORD_PARAM = "${passwordFieldName}" as const;`);

        if (usernameEnvVar != null) {
            constants.push(`const ENV_USERNAME = "${usernameEnvVar}" as const;`);
        }

        if (passwordEnvVar != null) {
            constants.push(`const ENV_PASSWORD = "${passwordEnvVar}" as const;`);
        }

        for (const constant of constants.filter((c) => c !== "")) {
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
                    statements: this.generateCanCreateStatements()
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

    private generateCanCreateStatements(): string {
        const usernameEnvVar = this.authScheme.usernameEnvVar;
        const passwordEnvVar = this.authScheme.passwordEnvVar;
        const wrapperAccess = this.keepIfWrapper("[WRAPPER_PROPERTY]?.");

        const usernameEnvCheck = usernameEnvVar != null ? " || process.env?.[ENV_USERNAME] != null" : "";
        const passwordEnvCheck = passwordEnvVar != null ? " || process.env?.[ENV_PASSWORD] != null" : "";

        return `return (options?.${wrapperAccess}[USERNAME_PARAM] != null${usernameEnvCheck}) && (options?.${wrapperAccess}[PASSWORD_PARAM] != null${passwordEnvCheck});`;
    }

    private generateGetAuthRequestStatements(context: SdkContext): string {
        const usernameVar = this.authScheme.username.camelCase.unsafeName;
        const passwordVar = this.authScheme.password.camelCase.unsafeName;
        const usernameEnvVar = this.authScheme.usernameEnvVar;
        const passwordEnvVar = this.authScheme.passwordEnvVar;
        const errorConstructor = getTextOfTsNode(
            context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression()
        );

        // Build property access chain based on shouldUseWrapper
        const thisOptionsAccess = ts.factory.createPropertyAccessExpression(ts.factory.createThis(), "options");

        let usernameAccess: ts.Expression;
        let passwordAccess: ts.Expression;

        if (this.shouldUseWrapper) {
            // Wrapped: this.options[WRAPPER_PROPERTY]?.[USERNAME_PARAM]
            const wrapperAccess = ts.factory.createElementAccessExpression(
                thisOptionsAccess,
                ts.factory.createIdentifier("WRAPPER_PROPERTY")
            );
            usernameAccess = ts.factory.createElementAccessChain(
                wrapperAccess,
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                ts.factory.createIdentifier("USERNAME_PARAM")
            );
            passwordAccess = ts.factory.createElementAccessChain(
                wrapperAccess,
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                ts.factory.createIdentifier("PASSWORD_PARAM")
            );
        } else {
            // Inlined: this.options[USERNAME_PARAM]
            usernameAccess = ts.factory.createElementAccessExpression(
                thisOptionsAccess,
                ts.factory.createIdentifier("USERNAME_PARAM")
            );
            passwordAccess = ts.factory.createElementAccessExpression(
                thisOptionsAccess,
                ts.factory.createIdentifier("PASSWORD_PARAM")
            );
        }

        const usernameSupplierGetCall = context.coreUtilities.fetcher.SupplierOrEndpointSupplier.get(
            usernameAccess,
            ts.factory.createObjectLiteralExpression([ts.factory.createShorthandPropertyAssignment("endpointMetadata")])
        );
        const usernameSupplierGetCode = getTextOfTsNode(usernameSupplierGetCall);

        const passwordSupplierGetCall = context.coreUtilities.fetcher.SupplierOrEndpointSupplier.get(
            passwordAccess,
            ts.factory.createObjectLiteralExpression([ts.factory.createShorthandPropertyAssignment("endpointMetadata")])
        );
        const passwordSupplierGetCode = getTextOfTsNode(passwordSupplierGetCall);

        const usernameEnvFallback =
            usernameEnvVar != null
                ? `\n            (${usernameSupplierGetCode}) ??\n            process.env?.[ENV_USERNAME]`
                : usernameSupplierGetCode;

        const passwordEnvFallback =
            passwordEnvVar != null
                ? `\n            (${passwordSupplierGetCode}) ??\n            process.env?.[ENV_PASSWORD]`
                : passwordSupplierGetCode;

        return `
        const ${usernameVar} = ${usernameEnvFallback};
        if (${usernameVar} == null) {
            throw new ${errorConstructor}({
                message: ${CLASS_NAME}.AUTH_CONFIG_ERROR_MESSAGE_USERNAME,
            });
        }

        const ${passwordVar} = ${passwordEnvFallback};
        if (${passwordVar} == null) {
            throw new ${errorConstructor}({
                message: ${CLASS_NAME}.AUTH_CONFIG_ERROR_MESSAGE_PASSWORD,
            });
        }

        const authHeader = ${getTextOfTsNode(
            context.coreUtilities.auth.BasicAuth.toAuthorizationHeader(
                ts.factory.createIdentifier(usernameVar),
                ts.factory.createIdentifier(passwordVar)
            )
        )};

        return {
            headers: authHeader != null ? { Authorization: authHeader } : {},
        };
        `;
    }

    private writeOptions(context: SdkContext): void {
        const authOptionsProperties = this.getAuthOptionsProperties(context) ?? [];
        const authSchemeKey =
            this.ir.auth.schemes.find((scheme) => scheme.type === "basic" && scheme === this.authScheme)?.key ??
            "BasicAuth";
        const usernameEnvVar = this.authScheme.usernameEnvVar;
        const passwordEnvVar = this.authScheme.passwordEnvVar;

        const statements: (string | WriterFunction | StatementStructures)[] = [
            `export const AUTH_SCHEME = "${authSchemeKey}" as const;`
        ];

        // Add AUTH_CONFIG_ERROR_MESSAGE constants for username and password
        if (usernameEnvVar != null) {
            statements.push(
                `export const AUTH_CONFIG_ERROR_MESSAGE_USERNAME: string = \`Please provide '\${USERNAME_PARAM}' when initializing the client, or set the '\${ENV_USERNAME}' environment variable\` as const;`
            );
        } else {
            statements.push(
                `export const AUTH_CONFIG_ERROR_MESSAGE_USERNAME: string = \`Please provide '\${USERNAME_PARAM}' when initializing the client\` as const;`
            );
        }

        if (passwordEnvVar != null) {
            statements.push(
                `export const AUTH_CONFIG_ERROR_MESSAGE_PASSWORD: string = \`Please provide '\${PASSWORD_PARAM}' when initializing the client, or set the '\${ENV_PASSWORD}' environment variable\` as const;`
            );
        } else {
            statements.push(
                `export const AUTH_CONFIG_ERROR_MESSAGE_PASSWORD: string = \`Please provide '\${PASSWORD_PARAM}' when initializing the client\` as const;`
            );
        }

        // Generate AuthOptions type based on keepIfWrapper
        const usernamePropertyDef = `[USERNAME_PARAM]${authOptionsProperties[0]?.hasQuestionToken ? "?" : ""}: ${authOptionsProperties[0]?.type}`;
        const passwordPropertyDef = `[PASSWORD_PARAM]${authOptionsProperties[1]?.hasQuestionToken ? "?" : ""}: ${authOptionsProperties[1]?.type}`;
        const propertyDefs = `${usernamePropertyDef}; ${passwordPropertyDef}`;
        const wrappedProperty = this.keepIfWrapper(`[WRAPPER_PROPERTY]: { ${propertyDefs} };\n    `);
        const authOptionsType = wrappedProperty ? `{\n        ${wrappedProperty}}` : `{ ${propertyDefs} }`;

        statements.push(
            // Options = Partial<AuthOptions>
            `export type ${OPTIONS_TYPE_NAME} = Partial<${AUTH_OPTIONS_TYPE_NAME}>;`,
            // AuthOptions with computed property names
            {
                kind: StructureKind.TypeAlias,
                name: AUTH_OPTIONS_TYPE_NAME,
                isExported: true,
                type: authOptionsType
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
