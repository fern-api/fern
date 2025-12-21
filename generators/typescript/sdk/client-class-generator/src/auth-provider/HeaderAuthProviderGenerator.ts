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

export declare namespace HeaderAuthProviderGenerator {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
        authScheme: FernIr.HeaderAuthScheme;
        neverThrowErrors: boolean;
        isAuthMandatory: boolean;
        shouldUseWrapper: boolean;
    }
}

const CLASS_NAME = "HeaderAuthProvider";
const OPTIONS_TYPE_NAME = "Options";
const AUTH_OPTIONS_TYPE_NAME = "AuthOptions";

export class HeaderAuthProviderGenerator implements AuthProviderGenerator {
    public static readonly CLASS_NAME = CLASS_NAME;
    public static readonly OPTIONS_TYPE_NAME = OPTIONS_TYPE_NAME;
    private readonly ir: FernIr.IntermediateRepresentation;
    private readonly authScheme: FernIr.HeaderAuthScheme;
    private readonly neverThrowErrors: boolean;
    private readonly isAuthMandatory: boolean;
    private readonly shouldUseWrapper: boolean;
    private readonly keepIfWrapper: (str: string) => string;

    constructor(init: HeaderAuthProviderGenerator.Init) {
        this.ir = init.ir;
        this.authScheme = init.authScheme;
        this.neverThrowErrors = init.neverThrowErrors;
        this.isAuthMandatory = init.isAuthMandatory;
        this.shouldUseWrapper = init.shouldUseWrapper;
        this.keepIfWrapper = init.shouldUseWrapper ? (str: string) => str : () => "";
    }

    /**
     * Gets the wrapper property name for this Header auth scheme.
     * This is used to namespace Header options when multiple auth schemes are present.
     * e.g., "ApiKey" -> "apiKey", "MyAuth" -> "myAuth"
     */
    public getWrapperPropertyName(): string {
        // Find the auth scheme key in the IR
        const authScheme = this.ir.auth.schemes.find(
            (scheme) => scheme.type === "header" && scheme === this.authScheme
        );
        if (authScheme == null) {
            throw new Error("Failed to find header auth scheme in IR");
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
        const hasHeaderEnv = this.authScheme.headerEnvVar != null;
        const isHeaderOptional = !this.isAuthMandatory || hasHeaderEnv;
        // When there's an env var fallback, use Supplier<T> | undefined because the supplier itself can be undefined
        // When there's no env var fallback, use Supplier<T> directly.
        const headerType = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
        const supplierType = context.coreUtilities.fetcher.SupplierOrEndpointSupplier._getReferenceToType(headerType);

        // For env var fallback: prop?: Supplier<T> | undefined
        const propertyType = hasHeaderEnv
            ? ts.factory.createUnionTypeNode([
                  supplierType,
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
              ])
            : supplierType;

        return [
            {
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(this.authScheme.name.name.camelCase.safeName),
                hasQuestionToken: isHeaderOptional,
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
        const headerFieldName = this.authScheme.name.name.camelCase.safeName;
        const headerEnvVar = this.authScheme.headerEnvVar;
        const headerName = this.authScheme.name.wireValue;
        const wrapperPropertyName = this.getWrapperPropertyName();

        const constants: string[] = [];

        constants.push(this.keepIfWrapper(`const WRAPPER_PROPERTY = "${wrapperPropertyName}" as const;`));
        constants.push(`const PARAM_KEY = "${headerFieldName}" as const;`);

        if (headerEnvVar != null) {
            constants.push(`const ENV_HEADER_KEY = "${headerEnvVar}" as const;`);
        }
        constants.push(`const HEADER_NAME = "${headerName}" as const;`);

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
        const headerEnvVar = this.authScheme.headerEnvVar;
        const wrapperAccess = this.keepIfWrapper("[WRAPPER_PROPERTY]?.");

        const envCheck = headerEnvVar != null ? " || process.env?.[ENV_HEADER_KEY] != null" : "";
        return `return options?.${wrapperAccess}[PARAM_KEY] != null${envCheck};`;
    }

    private generateGetAuthRequestStatements(context: SdkContext): string {
        const headerVar = "headerValue"; // Always use 'headerValue' as the variable name
        const headerEnvVar = this.authScheme.headerEnvVar;

        // Build property access chain based on keepIfWrapper
        const thisOptionsAccess = ts.factory.createPropertyAccessExpression(ts.factory.createThis(), "options");

        let paramAccess: ts.Expression;
        if (this.shouldUseWrapper) {
            // Wrapped: this.options[WRAPPER_PROPERTY]?.[PARAM_KEY]
            const wrapperAccess = ts.factory.createElementAccessExpression(
                thisOptionsAccess,
                ts.factory.createIdentifier("WRAPPER_PROPERTY")
            );
            paramAccess = ts.factory.createElementAccessChain(
                wrapperAccess,
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                ts.factory.createIdentifier("PARAM_KEY")
            );
        } else {
            // Inlined: this.options[PARAM_KEY]
            paramAccess = ts.factory.createElementAccessExpression(
                thisOptionsAccess,
                ts.factory.createIdentifier("PARAM_KEY")
            );
        }

        const supplierGetCall = context.coreUtilities.fetcher.SupplierOrEndpointSupplier.get(
            paramAccess,
            ts.factory.createObjectLiteralExpression([ts.factory.createShorthandPropertyAssignment("endpointMetadata")])
        );
        const supplierGetCode = getTextOfTsNode(supplierGetCall);

        const envFallback =
            headerEnvVar != null
                ? `\n            (${supplierGetCode}) ??\n            process.env?.[ENV_HEADER_KEY]`
                : supplierGetCode;

        if (this.neverThrowErrors) {
            // When neverThrowErrors is true, return empty headers if header value is missing
            return `
        const ${headerVar} = ${envFallback};
        if (${headerVar} == null) {
            return { headers: {} };
        }

        return {
            headers: { [HEADER_NAME]: ${headerVar} },
        };
        `;
        } else {
            // When neverThrowErrors is false, throw an error if header value is missing
            const errorConstructor = getTextOfTsNode(
                context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression()
            );

            return `
        const ${headerVar} = ${envFallback};
        if (${headerVar} == null) {
            throw new ${errorConstructor}({
                message: ${CLASS_NAME}.AUTH_CONFIG_ERROR_MESSAGE,
            });
        }

        return {
            headers: { [HEADER_NAME]: ${headerVar} },
        };
        `;
        }
    }

    private writeOptions(context: SdkContext): void {
        const authOptionsProperties = this.getAuthOptionsProperties(context) ?? [];
        const authSchemeKey =
            this.ir.auth.schemes.find((scheme) => scheme.type === "header" && scheme === this.authScheme)?.key ??
            "ApiKey";
        const headerEnvVar = this.authScheme.headerEnvVar;

        const statements: (string | WriterFunction | StatementStructures)[] = [
            `export const AUTH_SCHEME = "${authSchemeKey}" as const;`
        ];

        // Add AUTH_CONFIG_ERROR_MESSAGE constant
        if (headerEnvVar != null) {
            statements.push(
                `export const AUTH_CONFIG_ERROR_MESSAGE: string = \`Please provide '\${PARAM_KEY}' when initializing the client, or set the '\${ENV_HEADER_KEY}' environment variable\` as const;`
            );
        } else {
            statements.push(
                `export const AUTH_CONFIG_ERROR_MESSAGE: string = \`Please provide '\${PARAM_KEY}' when initializing the client\` as const;`
            );
        }

        // Generate AuthOptions type based on keepIfWrapper
        const propertyDef = `[PARAM_KEY]${authOptionsProperties[0]?.hasQuestionToken ? "?" : ""}: ${authOptionsProperties[0]?.type}`;

        // When wrapped (multiple auth schemes), the wrapper property should be optional
        // When not wrapped, individual fields already have their own ?: markers based on env vars
        const wrapperOptional = this.shouldUseWrapper;
        const optionalMarker = wrapperOptional ? "?" : "";

        const wrappedProperty = this.keepIfWrapper(`[WRAPPER_PROPERTY]${optionalMarker}: { ${propertyDef} };\n    `);
        const authOptionsType = wrappedProperty ? `{\n        ${wrappedProperty}}` : `{ ${propertyDef} }`;

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
