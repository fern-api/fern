import type { FernIr } from "@fern-fern/ir-sdk";
import { type ExportedFilePath, getPropertyKey, getTextOfTsNode, toCamelCase } from "@fern-typescript/commons";
import type { FileContext } from "@fern-typescript/contexts";
import {
    type OptionalKind,
    type PropertySignatureStructure,
    Scope,
    StatementStructures,
    StructureKind,
    ts,
    WriterFunction
} from "ts-morph";

import type { AuthProviderGenerator } from "./AuthProviderGenerator.js";

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
    private readonly neverThrowErrors: boolean;
    private readonly isAuthMandatory: boolean;
    private readonly shouldUseWrapper: boolean;
    private readonly keepIfWrapper: (str: string) => string;

    constructor(init: BasicAuthProviderGenerator.Init) {
        this.ir = init.ir;
        this.authScheme = init.authScheme;
        this.neverThrowErrors = init.neverThrowErrors;
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

    public getAuthOptionsProperties(context: FileContext): OptionalKind<PropertySignatureStructure>[] | undefined {
        const hasUsernameEnv = this.authScheme.usernameEnvVar != null;
        const hasPasswordEnv = this.authScheme.passwordEnvVar != null;
        const usernameOmit = this.authScheme.usernameOmit === true;
        const passwordOmit = this.authScheme.passwordOmit === true;
        const isUsernameOptional = !this.isAuthMandatory || hasUsernameEnv;
        const isPasswordOptional = !this.isAuthMandatory || hasPasswordEnv;

        // When there's an env var fallback, use Supplier<T> | undefined because the supplier itself can be undefined
        // When there's no env var fallback, use Supplier<T> directly.
        const stringType = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
        const supplierType = context.coreUtilities.fetcher.SupplierOrEndpointSupplier._getReferenceToType(stringType);

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

        // When omit is true, the field is completely removed from the end-user API.
        // Internally, the omitted field is treated as an empty string.
        const properties: OptionalKind<PropertySignatureStructure>[] = [];

        if (!usernameOmit) {
            properties.push({
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(context.case.camelSafe(this.authScheme.username)),
                hasQuestionToken: isUsernameOptional,
                type: getTextOfTsNode(usernamePropertyType),
                docs: this.authScheme.docs ? [this.authScheme.docs] : undefined
            });
        }

        if (!passwordOmit) {
            properties.push({
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(context.case.camelSafe(this.authScheme.password)),
                hasQuestionToken: isPasswordOptional,
                type: getTextOfTsNode(passwordPropertyType),
                docs: this.authScheme.docs ? [this.authScheme.docs] : undefined
            });
        }

        return properties;
    }

    public instantiate(constructorArgs: ts.Expression[]): ts.Expression {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(CLASS_NAME), "createInstance"),
            undefined,
            constructorArgs
        );
    }

    public writeToFile(context: FileContext): void {
        this.writeConstants(context);
        this.writeClass(context);
        this.writeOptions(context);
    }

    private writeConstants(context: FileContext): void {
        const usernameFieldName = context.case.camelSafe(this.authScheme.username);
        const passwordFieldName = context.case.camelSafe(this.authScheme.password);
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

    private writeClass(context: FileContext): void {
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
        const usernameOmit = this.authScheme.usernameOmit === true;
        const passwordOmit = this.authScheme.passwordOmit === true;

        const usernameEnvCheck = usernameEnvVar != null ? " || process.env?.[ENV_USERNAME] != null" : "";
        const passwordEnvCheck = passwordEnvVar != null ? " || process.env?.[ENV_PASSWORD] != null" : "";

        // Per-field checks: omittable fields are always satisfied, required fields must be present
        const usernameCheck = usernameOmit
            ? "true"
            : `options?.${wrapperAccess}[USERNAME_PARAM] != null${usernameEnvCheck}`;
        const passwordCheck = passwordOmit
            ? "true"
            : `options?.${wrapperAccess}[PASSWORD_PARAM] != null${passwordEnvCheck}`;
        return `return (${usernameCheck}) && (${passwordCheck});`;
    }

    private generateGetAuthRequestStatements(context: FileContext): string {
        const usernameVar = context.case.camelUnsafe(this.authScheme.username);
        const passwordVar = context.case.camelUnsafe(this.authScheme.password);
        const usernameEnvVar = this.authScheme.usernameEnvVar;
        const passwordEnvVar = this.authScheme.passwordEnvVar;
        const usernameOmit = this.authScheme.usernameOmit === true;
        const passwordOmit = this.authScheme.passwordOmit === true;

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

        // When a field is omitted, use empty string directly instead of reading from options
        const usernameEnvFallback = usernameOmit
            ? '""'
            : usernameEnvVar != null
              ? `\n            (${usernameSupplierGetCode}) ??\n            process.env?.[ENV_USERNAME]`
              : usernameSupplierGetCode;

        const passwordEnvFallback = passwordOmit
            ? '""'
            : passwordEnvVar != null
              ? `\n            (${passwordSupplierGetCode}) ??\n            process.env?.[ENV_PASSWORD]`
              : passwordSupplierGetCode;

        // Build per-field null checks based on individual omit flags.
        // Interleave declaration and null-check to preserve short-circuit evaluation:
        // if username is null, the password supplier is never evaluated.
        const buildNullChecks = (errorAction: string): string => {
            const lines: string[] = [];
            lines.push(`const ${usernameVar} = ${usernameEnvFallback};`);
            if (!usernameOmit) {
                lines.push(
                    `if (${usernameVar} == null) { ${errorAction.replace("__MSG__", `${CLASS_NAME}.AUTH_CONFIG_ERROR_MESSAGE_USERNAME`)} }`
                );
            }
            lines.push(`const ${passwordVar} = ${passwordEnvFallback};`);
            if (!passwordOmit) {
                lines.push(
                    `if (${passwordVar} == null) { ${errorAction.replace("__MSG__", `${CLASS_NAME}.AUTH_CONFIG_ERROR_MESSAGE_PASSWORD`)} }`
                );
            }
            return lines.map((l) => `        ${l}`).join("\n");
        };

        const authHeaderCode = getTextOfTsNode(
            context.coreUtilities.auth.BasicAuth.toAuthorizationHeader(
                ts.factory.createIdentifier(usernameVar),
                ts.factory.createIdentifier(passwordVar)
            )
        );

        if (this.neverThrowErrors) {
            const errorAction = "return { headers: {} };";
            return `
${buildNullChecks(errorAction)}

        const authHeader = ${authHeaderCode};

        return {
            headers: authHeader != null ? { Authorization: authHeader } : {},
        };
        `;
        } else {
            const errorConstructor = getTextOfTsNode(
                context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression()
            );
            const errorAction = `throw new ${errorConstructor}({ message: __MSG__ });`;
            return `
${buildNullChecks(errorAction)}

        const authHeader = ${authHeaderCode};

        return {
            headers: authHeader != null ? { Authorization: authHeader } : {},
        };
        `;
        }
    }

    private writeOptions(context: FileContext): void {
        const authOptionsProperties = this.getAuthOptionsProperties(context) ?? [];
        const authSchemeKey =
            this.ir.auth.schemes.find((scheme) => scheme.type === "basic" && scheme === this.authScheme)?.key ??
            "BasicAuth";
        const usernameEnvVar = this.authScheme.usernameEnvVar;
        const passwordEnvVar = this.authScheme.passwordEnvVar;
        const usernameOmit = this.authScheme.usernameOmit === true;
        const passwordOmit = this.authScheme.passwordOmit === true;

        const statements: (string | WriterFunction | StatementStructures)[] = [
            `export const AUTH_SCHEME = "${authSchemeKey}" as const;`,
            `export const AUTH_CONFIG_ERROR_MESSAGE: string = "Please provide username and password when initializing the client" as const;`
        ];

        // Add AUTH_CONFIG_ERROR_MESSAGE constants only for non-omitted fields
        if (!usernameOmit) {
            if (usernameEnvVar != null) {
                statements.push(
                    `export const AUTH_CONFIG_ERROR_MESSAGE_USERNAME: string = \`Please provide '\${USERNAME_PARAM}' when initializing the client, or set the '\${ENV_USERNAME}' environment variable\` as const;`
                );
            } else {
                statements.push(
                    `export const AUTH_CONFIG_ERROR_MESSAGE_USERNAME: string = \`Please provide '\${USERNAME_PARAM}' when initializing the client\` as const;`
                );
            }
        }

        if (!passwordOmit) {
            if (passwordEnvVar != null) {
                statements.push(
                    `export const AUTH_CONFIG_ERROR_MESSAGE_PASSWORD: string = \`Please provide '\${PASSWORD_PARAM}' when initializing the client, or set the '\${ENV_PASSWORD}' environment variable\` as const;`
                );
            } else {
                statements.push(
                    `export const AUTH_CONFIG_ERROR_MESSAGE_PASSWORD: string = \`Please provide '\${PASSWORD_PARAM}' when initializing the client\` as const;`
                );
            }
        }

        // Generate AuthOptions type based on keepIfWrapper — omitted fields are excluded
        // Use computed property keys ([USERNAME_PARAM], [PASSWORD_PARAM]) instead of literal names
        const computedPropertyDefs: string[] = [];
        if (!usernameOmit) {
            const isUsernameOptional = !this.isAuthMandatory || usernameEnvVar != null;
            const optMark = isUsernameOptional ? "?" : "";
            const usernameType = authOptionsProperties.find(
                (p) => p.name === getPropertyKey(context.case.camelSafe(this.authScheme.username))
            )?.type;
            computedPropertyDefs.push(`[USERNAME_PARAM]${optMark}: ${usernameType}`);
        }
        if (!passwordOmit) {
            const isPasswordOptional = !this.isAuthMandatory || passwordEnvVar != null;
            const optMark = isPasswordOptional ? "?" : "";
            const passwordType = authOptionsProperties.find(
                (p) => p.name === getPropertyKey(context.case.camelSafe(this.authScheme.password))
            )?.type;
            computedPropertyDefs.push(`[PASSWORD_PARAM]${optMark}: ${passwordType}`);
        }
        const propertyDefs = computedPropertyDefs.join("; ");

        // When wrapped (multiple auth schemes), the wrapper property should be optional
        // When not wrapped, individual fields already have their own ?: markers based on env vars
        const wrapperOptional = this.shouldUseWrapper;
        const optionalMarker = wrapperOptional ? "?" : "";

        const wrappedProperty = this.keepIfWrapper(`[WRAPPER_PROPERTY]${optionalMarker}: { ${propertyDefs} };\n    `);
        const authOptionsType = wrappedProperty ? `{\n        ${wrappedProperty}}` : `{ ${propertyDefs} }`;

        statements.push(
            // Options = AuthOptions (with optional properties handled inline)
            `export type ${OPTIONS_TYPE_NAME} = ${AUTH_OPTIONS_TYPE_NAME};`,
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
