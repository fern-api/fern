import type { FernIr } from "@fern-fern/ir-sdk";
import { type ExportedFilePath, getPropertyKey, getTextOfTsNode } from "@fern-typescript/commons";
import type { SdkContext } from "@fern-typescript/contexts";
import { type OptionalKind, type PropertySignatureStructure, Scope, StructureKind, ts } from "ts-morph";

import type { AuthProviderGenerator } from "./AuthProviderGenerator";

export declare namespace BearerAuthProviderGenerator {
    export interface Init {
        authScheme: FernIr.BearerAuthScheme;
        neverThrowErrors: boolean;
        isAuthMandatory: boolean;
    }
}

const CLASS_NAME = "BearerAuthProvider";
const TOKEN_FIELD_NAME = "token";
const OPTIONS_TYPE_NAME = "Options";
const AUTH_OPTIONS_TYPE_NAME = "AuthOptions";

export class BearerAuthProviderGenerator implements AuthProviderGenerator {
    public static readonly CLASS_NAME = CLASS_NAME;
    public static readonly OPTIONS_TYPE_NAME = OPTIONS_TYPE_NAME;
    private readonly authScheme: FernIr.BearerAuthScheme;
    private readonly neverThrowErrors: boolean;
    private readonly isAuthMandatory: boolean;

    constructor(init: BearerAuthProviderGenerator.Init) {
        this.authScheme = init.authScheme;
        this.neverThrowErrors = init.neverThrowErrors;
        this.isAuthMandatory = init.isAuthMandatory;
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
        return ts.factory.createNewExpression(ts.factory.createIdentifier(CLASS_NAME), undefined, constructorArgs);
    }

    public writeToFile(context: SdkContext): void {
        this.writeOptions(context);
        this.writeClass(context);
    }

    private writeClass(context: SdkContext): void {
        const hasTokenEnv = this.authScheme.tokenEnvVar != null;
        // Token is optional when auth is not mandatory OR when there's an env var fallback
        const isTokenOptional = !this.isAuthMandatory || hasTokenEnv;

        // For class fields, use Supplier<T> | undefined when the token is optional
        const tokenType = context.coreUtilities.auth.BearerToken._getReferenceToType();
        const supplierType = context.coreUtilities.fetcher.SupplierOrEndpointSupplier._getReferenceToType(tokenType);

        const tokenFieldType = isTokenOptional
            ? ts.factory.createUnionTypeNode([
                  supplierType,
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
              ])
            : supplierType;

        context.sourceFile.addClass({
            name: CLASS_NAME,
            isExported: true,
            implements: [getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())],
            properties: [
                {
                    name: TOKEN_FIELD_NAME,
                    type: getTextOfTsNode(tokenFieldType),
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
                            type: getTextOfTsNode(this.getOptionsType())
                        }
                    ],
                    returnType: "boolean",
                    statements: this.generatecanCreateStatements()
                },
                {
                    kind: StructureKind.Method,
                    scope: Scope.Public,
                    isStatic: true,
                    name: "getAuthConfigErrorMessage",
                    returnType: "string",
                    statements: this.generateGetAuthConfigErrorMessageStatements()
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
                            type: getTextOfTsNode(this.getOptionsType())
                        }
                    ],
                    statements: [`this.${TOKEN_FIELD_NAME} = options.${this.authScheme.token.camelCase.safeName};`]
                }
            ]
        });
    }

    private generatecanCreateStatements(): string {
        const tokenFieldName = this.authScheme.token.camelCase.safeName;
        const tokenEnvVar = this.authScheme.tokenEnvVar;

        if (tokenEnvVar != null) {
            return `return options.${tokenFieldName} != null || process.env?.["${tokenEnvVar}"] != null;`;
        }

        return `return options.${tokenFieldName} != null;`;
    }

    private generateGetAuthConfigErrorMessageStatements(): string {
        const tokenFieldName = this.authScheme.token.camelCase.safeName;
        const tokenEnvVar = this.authScheme.tokenEnvVar;

        if (tokenEnvVar != null) {
            return `return "Please provide '${tokenFieldName}' when initializing the client, or set the '${tokenEnvVar}' environment variable";`;
        }

        return `return "Please provide '${tokenFieldName}' when initializing the client";`;
    }

    private generateGetAuthRequestStatements(context: SdkContext): string {
        const tokenVar = this.authScheme.token.camelCase.unsafeName;
        const tokenFieldName = this.authScheme.token.camelCase.safeName;

        const tokenExpression =
            this.authScheme.tokenEnvVar != null
                ? `(${getTextOfTsNode(
                      context.coreUtilities.fetcher.SupplierOrEndpointSupplier.get(
                          ts.factory.createPropertyAccessExpression(
                              ts.factory.createThis(),
                              ts.factory.createIdentifier(TOKEN_FIELD_NAME)
                          ),
                          ts.factory.createObjectLiteralExpression([
                              ts.factory.createShorthandPropertyAssignment("endpointMetadata")
                          ])
                      )
                  )}) ?? process.env?.["${this.authScheme.tokenEnvVar}"]`
                : getTextOfTsNode(
                      context.coreUtilities.fetcher.SupplierOrEndpointSupplier.get(
                          ts.factory.createPropertyAccessExpression(
                              ts.factory.createThis(),
                              ts.factory.createIdentifier(TOKEN_FIELD_NAME)
                          ),
                          ts.factory.createObjectLiteralExpression([
                              ts.factory.createShorthandPropertyAssignment("endpointMetadata")
                          ])
                      )
                  );

        if (this.neverThrowErrors) {
            return `
        const ${tokenVar} = ${tokenExpression};

        return {
            headers: { Authorization: \`Bearer \${${tokenVar}}\` }
        };
        `;
        }

        const tokenErrorMessage =
            this.authScheme.tokenEnvVar != null
                ? `Please specify a ${tokenFieldName} by either passing it in to the constructor or initializing a ${this.authScheme.tokenEnvVar} environment variable`
                : `Please specify a ${tokenFieldName} by passing it in to the constructor`;

        const errorConstructor = getTextOfTsNode(
            context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression()
        );

        return `
        const ${tokenVar} = ${tokenExpression};
        if (${tokenVar} == null) {
            throw new ${errorConstructor}({
                message: "${tokenErrorMessage}"
            });
        }

        return {
            headers: { Authorization: \`Bearer \${${tokenVar}}\` }
        };
        `;
    }

    private writeOptions(context: SdkContext): void {
        const authOptionsProperties = this.getAuthOptionsProperties(context) ?? [];

        context.sourceFile.addModule({
            name: CLASS_NAME,
            isExported: true,
            kind: StructureKind.Module,
            statements: [
                {
                    kind: StructureKind.Interface,
                    name: AUTH_OPTIONS_TYPE_NAME,
                    isExported: true,
                    properties: authOptionsProperties
                },
                {
                    kind: StructureKind.Interface,
                    name: OPTIONS_TYPE_NAME,
                    isExported: true,
                    extends: [AUTH_OPTIONS_TYPE_NAME]
                }
            ]
        });
    }
}
