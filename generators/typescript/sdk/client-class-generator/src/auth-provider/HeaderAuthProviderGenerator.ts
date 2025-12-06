import type { FernIr } from "@fern-fern/ir-sdk";
import { type ExportedFilePath, getPropertyKey, getTextOfTsNode } from "@fern-typescript/commons";
import type { SdkContext } from "@fern-typescript/contexts";
import { type OptionalKind, type PropertySignatureStructure, Scope, StructureKind, ts } from "ts-morph";

import type { AuthProviderGenerator } from "./AuthProviderGenerator";

export declare namespace HeaderAuthProviderGenerator {
    export interface Init {
        authScheme: FernIr.HeaderAuthScheme;
        neverThrowErrors: boolean;
        isAuthMandatory: boolean;
    }
}

const CLASS_NAME = "HeaderAuthProvider";
const HEADER_FIELD_NAME = "headerValue";
const OPTIONS_TYPE_NAME = "Options";
const AUTH_OPTIONS_TYPE_NAME = "AuthOptions";

export class HeaderAuthProviderGenerator implements AuthProviderGenerator {
    public static readonly CLASS_NAME = CLASS_NAME;
    public static readonly HEADER_FIELD_NAME = HEADER_FIELD_NAME;
    public static readonly OPTIONS_TYPE_NAME = OPTIONS_TYPE_NAME;
    private readonly authScheme: FernIr.HeaderAuthScheme;
    private readonly neverThrowErrors: boolean;
    private readonly isAuthMandatory: boolean;

    constructor(init: HeaderAuthProviderGenerator.Init) {
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
        return ts.factory.createNewExpression(ts.factory.createIdentifier(CLASS_NAME), undefined, constructorArgs);
    }

    public writeToFile(context: SdkContext): void {
        this.writeOptions(context);
        this.writeClass(context);
    }

    private writeClass(context: SdkContext): void {
        const hasHeaderEnv = this.authScheme.headerEnvVar != null;
        // Header is optional when auth is not mandatory OR when there's an env var fallback
        const isHeaderOptional = !this.isAuthMandatory || hasHeaderEnv;

        // For class fields, use Supplier<T> | undefined when the header is optional
        const headerType = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
        const supplierType = context.coreUtilities.fetcher.SupplierOrEndpointSupplier._getReferenceToType(headerType);

        const headerFieldType = isHeaderOptional
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
                    name: HEADER_FIELD_NAME,
                    type: getTextOfTsNode(headerFieldType),
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
                    statements: [`this.${HEADER_FIELD_NAME} = options.${this.authScheme.name.name.camelCase.safeName};`]
                }
            ]
        });
    }

    private generatecanCreateStatements(): string {
        const headerFieldName = this.authScheme.name.name.camelCase.safeName;
        const headerEnvVar = this.authScheme.headerEnvVar;

        if (headerEnvVar != null) {
            return `return options.${headerFieldName} != null || process.env?.["${headerEnvVar}"] != null;`;
        }

        return `return options.${headerFieldName} != null;`;
    }

    private generateGetAuthRequestStatements(context: SdkContext): string {
        const headerVar = this.authScheme.name.name.camelCase.unsafeName;
        const headerFieldName = this.authScheme.name.name.camelCase.safeName;

        const headerExpression =
            this.authScheme.headerEnvVar != null
                ? `(${getTextOfTsNode(
                      context.coreUtilities.fetcher.SupplierOrEndpointSupplier.get(
                          ts.factory.createPropertyAccessExpression(
                              ts.factory.createThis(),
                              ts.factory.createIdentifier(HEADER_FIELD_NAME)
                          ),
                          ts.factory.createObjectLiteralExpression([
                              ts.factory.createPropertyAssignment(
                                  "endpointMetadata",
                                  ts.factory.createBinaryExpression(
                                      ts.factory.createPropertyAccessChain(
                                          ts.factory.createIdentifier("arg"),
                                          ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                          "endpointMetadata"
                                      ),
                                      ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                      ts.factory.createObjectLiteralExpression([])
                                  )
                              )
                          ])
                      )
                  )}) ?? process.env?.["${this.authScheme.headerEnvVar}"]`
                : getTextOfTsNode(
                      context.coreUtilities.fetcher.SupplierOrEndpointSupplier.get(
                          ts.factory.createPropertyAccessExpression(
                              ts.factory.createThis(),
                              ts.factory.createIdentifier(HEADER_FIELD_NAME)
                          ),
                          ts.factory.createObjectLiteralExpression([
                              ts.factory.createPropertyAssignment(
                                  "endpointMetadata",
                                  ts.factory.createBinaryExpression(
                                      ts.factory.createPropertyAccessChain(
                                          ts.factory.createIdentifier("arg"),
                                          ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                          "endpointMetadata"
                                      ),
                                      ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                      ts.factory.createObjectLiteralExpression([])
                                  )
                              )
                          ])
                      )
                  );

        if (this.neverThrowErrors) {
            const headerValueExpression =
                this.authScheme.prefix != null
                    ? `${headerVar} != null ? \`${this.authScheme.prefix.trim()} \${${headerVar}}\` : undefined`
                    : headerVar;

            return `
        const ${headerVar} = ${headerExpression};

        const headerValue = ${headerValueExpression};

        return {
            headers: headerValue != null ? { "${this.authScheme.name.wireValue}": headerValue } : {}
        };
        `;
        }

        const headerErrorMessage =
            this.authScheme.headerEnvVar != null
                ? `Please specify a ${headerFieldName} by either passing it in to the constructor or initializing a ${this.authScheme.headerEnvVar} environment variable`
                : `Please specify a ${headerFieldName} by passing it in to the constructor`;

        const errorConstructor = getTextOfTsNode(
            context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression()
        );

        const headerValueExpression =
            this.authScheme.prefix != null ? `\`${this.authScheme.prefix.trim()} \${${headerVar}}\`` : headerVar;

        return `
        const ${headerVar} = ${headerExpression};
        if (${headerVar} == null) {
            throw new ${errorConstructor}({
                message: "${headerErrorMessage}"
            });
        }

        const headerValue = ${headerValueExpression};

        return {
            headers: { "${this.authScheme.name.wireValue}": headerValue }
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
