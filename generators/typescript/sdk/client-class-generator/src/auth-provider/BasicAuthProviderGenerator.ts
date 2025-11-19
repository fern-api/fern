import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, getPropertyKey, getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { PropertySignatureStructure, Scope, StructureKind, ts } from "ts-morph";

import { AuthProviderGenerator } from "./AuthProviderGenerator";

export declare namespace BasicAuthProviderGenerator {
    export interface Init {
        authScheme: FernIr.BasicAuthScheme;
    }
}

const CLASS_NAME = "BasicAuthProvider";
const USERNAME_FIELD_NAME = "username";
const PASSWORD_FIELD_NAME = "password";
const OPTIONS_TYPE_NAME = "Options";

export class BasicAuthProviderGenerator implements AuthProviderGenerator {
    public static readonly CLASS_NAME = CLASS_NAME;
    private readonly authScheme: FernIr.BasicAuthScheme;

    constructor(init: BasicAuthProviderGenerator.Init) {
        this.authScheme = init.authScheme;
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

    public instantiate(constructorArgs: ts.Expression[]): ts.Expression {
        return ts.factory.createNewExpression(ts.factory.createIdentifier(CLASS_NAME), undefined, constructorArgs);
    }

    public writeToFile(context: SdkContext): void {
        this.writeOptions(context);
        this.writeClass(context);
    }

    private writeClass(context: SdkContext): void {
        context.sourceFile.addClass({
            name: CLASS_NAME,
            isExported: true,
            implements: [getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())],
            properties: [
                {
                    name: USERNAME_FIELD_NAME,
                    type: getTextOfTsNode(
                        ts.factory.createUnionTypeNode([
                            context.coreUtilities.fetcher.Supplier._getReferenceToType(
                                ts.factory.createUnionTypeNode([
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                                ])
                            ),
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                        ])
                    ),
                    hasQuestionToken: false,
                    isReadonly: true,
                    scope: Scope.Private
                },
                {
                    name: PASSWORD_FIELD_NAME,
                    type: getTextOfTsNode(
                        ts.factory.createUnionTypeNode([
                            context.coreUtilities.fetcher.Supplier._getReferenceToType(
                                ts.factory.createUnionTypeNode([
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                                ])
                            ),
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                        ])
                    ),
                    hasQuestionToken: false,
                    isReadonly: true,
                    scope: Scope.Private
                }
            ],
            methods: [
                {
                    kind: StructureKind.Method,
                    scope: Scope.Public,
                    name: "getAuthRequest",
                    isAsync: true,
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
                    statements: [
                        `this.${USERNAME_FIELD_NAME} = options.${USERNAME_FIELD_NAME};`,
                        `this.${PASSWORD_FIELD_NAME} = options.${PASSWORD_FIELD_NAME};`
                    ]
                }
            ]
        });
    }

    private generateGetAuthRequestStatements(context: SdkContext): string {
        const usernameVar = this.authScheme.username.camelCase.unsafeName;
        const passwordVar = this.authScheme.password.camelCase.unsafeName;

        const usernameExpression =
            this.authScheme.usernameEnvVar != null
                ? `(${getTextOfTsNode(
                      context.coreUtilities.fetcher.Supplier.get(
                          ts.factory.createPropertyAccessExpression(
                              ts.factory.createThis(),
                              ts.factory.createIdentifier(USERNAME_FIELD_NAME)
                          )
                      )
                  )}) ?? process.env?.["${this.authScheme.usernameEnvVar}"]`
                : getTextOfTsNode(
                      context.coreUtilities.fetcher.Supplier.get(
                          ts.factory.createPropertyAccessExpression(
                              ts.factory.createThis(),
                              ts.factory.createIdentifier(USERNAME_FIELD_NAME)
                          )
                      )
                  );

        const passwordExpression =
            this.authScheme.passwordEnvVar != null
                ? `(${getTextOfTsNode(
                      context.coreUtilities.fetcher.Supplier.get(
                          ts.factory.createPropertyAccessExpression(
                              ts.factory.createThis(),
                              ts.factory.createIdentifier(PASSWORD_FIELD_NAME)
                          )
                      )
                  )}) ?? process.env?.["${this.authScheme.passwordEnvVar}"]`
                : getTextOfTsNode(
                      context.coreUtilities.fetcher.Supplier.get(
                          ts.factory.createPropertyAccessExpression(
                              ts.factory.createThis(),
                              ts.factory.createIdentifier(PASSWORD_FIELD_NAME)
                          )
                      )
                  );

        return `
        const ${usernameVar} = ${usernameExpression};
        const ${passwordVar} = ${passwordExpression};
        
        if (${usernameVar} == null || ${passwordVar} == null) {
            return { headers: {} };
        }
        
        const authHeader = ${getTextOfTsNode(
            context.coreUtilities.auth.BasicAuth.toAuthorizationHeader(
                ts.factory.createIdentifier(usernameVar),
                ts.factory.createIdentifier(passwordVar)
            )
        )};
        
        return {
            headers: authHeader != null ? { Authorization: authHeader } : {}
        };
        `;
    }

    private writeOptions(context: SdkContext): void {
        const usernameProperty: PropertySignatureStructure = {
            kind: StructureKind.PropertySignature,
            name: getPropertyKey(this.authScheme.username.camelCase.safeName),
            hasQuestionToken: true,
            type: getTextOfTsNode(
                context.coreUtilities.fetcher.Supplier._getReferenceToType(
                    ts.factory.createUnionTypeNode([
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                    ])
                )
            ),
            docs: this.authScheme.docs != null ? [this.authScheme.docs] : undefined
        };

        const passwordProperty: PropertySignatureStructure = {
            kind: StructureKind.PropertySignature,
            name: getPropertyKey(this.authScheme.password.camelCase.safeName),
            hasQuestionToken: true,
            type: getTextOfTsNode(
                context.coreUtilities.fetcher.Supplier._getReferenceToType(
                    ts.factory.createUnionTypeNode([
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                    ])
                )
            ),
            docs: this.authScheme.docs != null ? [this.authScheme.docs] : undefined
        };

        context.sourceFile.addModule({
            name: CLASS_NAME,
            isExported: true,
            kind: StructureKind.Module,
            statements: [
                {
                    kind: StructureKind.Interface,
                    name: OPTIONS_TYPE_NAME,
                    isExported: true,
                    properties: [usernameProperty, passwordProperty]
                }
            ]
        });
    }
}
