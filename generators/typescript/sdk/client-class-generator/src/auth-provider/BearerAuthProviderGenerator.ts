import type { FernIr } from "@fern-fern/ir-sdk";
import { type ExportedFilePath, getPropertyKey, getTextOfTsNode, toCamelCase } from "@fern-typescript/commons";
import type { SdkContext } from "@fern-typescript/contexts";
import {
    type OptionalKind,
    type PropertySignatureStructure,
    Scope,
    type StatementStructures,
    StructureKind,
    ts,
    type WriterFunction
} from "ts-morph";

import type { AuthProviderGenerator } from "./AuthProviderGenerator";

export declare namespace BearerAuthProviderGenerator {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
        authScheme: FernIr.BearerAuthScheme;
        neverThrowErrors: boolean;
        isAuthMandatory: boolean;
        shouldUseWrapper: boolean;
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
    private readonly neverThrowErrors: boolean;
    private readonly isAuthMandatory: boolean;
    private readonly shouldUseWrapper: boolean;
    private readonly keepIfWrapper: (str: string) => string;

    constructor(init: BearerAuthProviderGenerator.Init) {
        this.ir = init.ir;
        this.authScheme = init.authScheme;
        this.neverThrowErrors = init.neverThrowErrors;
        this.isAuthMandatory = init.isAuthMandatory;
        this.shouldUseWrapper = init.shouldUseWrapper;
        this.keepIfWrapper = init.shouldUseWrapper ? (str: string) => str : () => "";
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
                docs: this.authScheme.docs ? [this.authScheme.docs] : undefined
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
        const tokenFieldName = this.authScheme.token.camelCase.safeName;
        const tokenEnvVar = this.authScheme.tokenEnvVar;
        const wrapperPropertyName = this.getWrapperPropertyName();

        const constants: string[] = [];

        constants.push(this.keepIfWrapper(`const WRAPPER_PROPERTY = "${wrapperPropertyName}" as const;`));
        constants.push(`const TOKEN_PARAM = "${tokenFieldName}" as const;`);

        if (tokenEnvVar != null) {
            constants.push(`const ENV_TOKEN = "${tokenEnvVar}" as const;`);
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
        const wrapperAccess = this.keepIfWrapper("[WRAPPER_PROPERTY]?.");

        const envCheck = tokenEnvVar != null ? " || process.env?.[ENV_TOKEN] != null" : "";
        return `return options?.${wrapperAccess}[TOKEN_PARAM] != null${envCheck};`;
    }

    private generateGetAuthRequestStatements(context: SdkContext): string {
        const tokenVar = this.authScheme.token.camelCase.unsafeName;
        const tokenEnvVar = this.authScheme.tokenEnvVar;

        // Build property access chain based on shouldUseWrapper
        const thisOptionsAccess = ts.factory.createPropertyAccessExpression(ts.factory.createThis(), "options");

        let tokenAccess: ts.Expression;
        if (this.shouldUseWrapper) {
            // Wrapped: this.options[WRAPPER_PROPERTY]?.[TOKEN_PARAM]
            const wrapperAccess = ts.factory.createElementAccessExpression(
                thisOptionsAccess,
                ts.factory.createIdentifier("WRAPPER_PROPERTY")
            );
            tokenAccess = ts.factory.createElementAccessChain(
                wrapperAccess,
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                ts.factory.createIdentifier("TOKEN_PARAM")
            );
        } else {
            // Inlined: this.options[TOKEN_PARAM]
            tokenAccess = ts.factory.createElementAccessExpression(
                thisOptionsAccess,
                ts.factory.createIdentifier("TOKEN_PARAM")
            );
        }

        const supplierGetCall = context.coreUtilities.fetcher.SupplierOrEndpointSupplier.get(
            tokenAccess,
            ts.factory.createObjectLiteralExpression([ts.factory.createShorthandPropertyAssignment("endpointMetadata")])
        );
        const supplierGetCode = getTextOfTsNode(supplierGetCall);

        const envFallback =
            tokenEnvVar != null
                ? `\n            (${supplierGetCode}) ??\n            process.env?.[ENV_TOKEN]`
                : supplierGetCode;

        if (this.neverThrowErrors) {
            // When neverThrowErrors is true, return empty headers if token is missing
            return `
        const ${tokenVar} = ${envFallback};
        if (${tokenVar} == null) {
            return { headers: {} };
        }

        return {
            headers: { Authorization: \`Bearer \${${tokenVar}}\` },
        };
        `;
        } else {
            // When neverThrowErrors is false, throw an error if token is missing
            const errorConstructor = getTextOfTsNode(
                context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression()
            );

            return `
        const ${tokenVar} = ${envFallback};
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
    }

    private writeOptions(context: SdkContext): void {
        const authOptionsProperties = this.getAuthOptionsProperties(context) ?? [];
        const authSchemeKey =
            this.ir.auth.schemes.find((scheme) => scheme.type === "bearer" && scheme === this.authScheme)?.key ??
            "Bearer";
        const tokenEnvVar = this.authScheme.tokenEnvVar;

        const statements: (string | WriterFunction | StatementStructures)[] = [
            `export const AUTH_SCHEME = "${authSchemeKey}" as const;`
        ];

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

        // Generate AuthOptions type based on keepIfWrapper
        const propertyDefs = authOptionsProperties
            .map((p) => `[TOKEN_PARAM]${p.hasQuestionToken ? "?" : ""}: ${p.type}`)
            .join("; ");

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
