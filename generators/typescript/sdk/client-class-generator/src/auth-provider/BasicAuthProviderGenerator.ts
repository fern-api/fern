import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, getPropertyKey, getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, PropertySignatureStructure, Scope, StructureKind, ts } from "ts-morph";

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
const AUTH_OPTIONS_TYPE_NAME = "AuthOptions";

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

    public getAuthOptionsType(): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(`${CLASS_NAME}.${AUTH_OPTIONS_TYPE_NAME}`);
    }

    public getAuthOptionsProperties(context: SdkContext): OptionalKind<PropertySignatureStructure>[] | undefined {
        const hasUsernameEnv = this.authScheme.usernameEnvVar != null;
        const hasPasswordEnv = this.authScheme.passwordEnvVar != null;

        // When there's an env var fallback, use Supplier<T> | undefined because the supplier itself can be undefined
        // When there's no env var fallback, use Supplier<T> directly.
        const stringType = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
        const supplierType = context.coreUtilities.fetcher.Supplier._getReferenceToType(stringType);

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
                hasQuestionToken: hasUsernameEnv,
                type: getTextOfTsNode(usernamePropertyType),
                docs: this.authScheme.docs != null ? [this.authScheme.docs] : undefined
            },
            {
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(this.authScheme.password.camelCase.safeName),
                hasQuestionToken: hasPasswordEnv,
                type: getTextOfTsNode(passwordPropertyType),
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
        const hasUsernameEnv = this.authScheme.usernameEnvVar != null;
        const hasPasswordEnv = this.authScheme.passwordEnvVar != null;

        // For class fields, use Supplier<T> | undefined when env var fallback exists
        const stringType = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
        const supplierType = context.coreUtilities.fetcher.Supplier._getReferenceToType(stringType);

        const usernameFieldType = hasUsernameEnv
            ? ts.factory.createUnionTypeNode([
                  supplierType,
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
              ])
            : supplierType;

        const passwordFieldType = hasPasswordEnv
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
                    name: USERNAME_FIELD_NAME,
                    type: getTextOfTsNode(usernameFieldType),
                    hasQuestionToken: false,
                    isReadonly: true,
                    scope: Scope.Private
                },
                {
                    name: PASSWORD_FIELD_NAME,
                    type: getTextOfTsNode(passwordFieldType),
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
                        `this.${USERNAME_FIELD_NAME} = options.${this.authScheme.username.camelCase.safeName};`,
                        `this.${PASSWORD_FIELD_NAME} = options.${this.authScheme.password.camelCase.safeName};`
                    ]
                }
            ]
        });
    }

    private generateGetAuthRequestStatements(context: SdkContext): string {
        const usernameVar = this.authScheme.username.camelCase.unsafeName;
        const passwordVar = this.authScheme.password.camelCase.unsafeName;
        const usernameFieldName = this.authScheme.username.camelCase.safeName;
        const passwordFieldName = this.authScheme.password.camelCase.safeName;

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

        const usernameErrorMessage =
            this.authScheme.usernameEnvVar != null
                ? `Please specify a ${usernameFieldName} by either passing it in to the constructor or initializing a ${this.authScheme.usernameEnvVar} environment variable`
                : `Please specify a ${usernameFieldName} by passing it in to the constructor`;

        const passwordErrorMessage =
            this.authScheme.passwordEnvVar != null
                ? `Please specify a ${passwordFieldName} by either passing it in to the constructor or initializing a ${this.authScheme.passwordEnvVar} environment variable`
                : `Please specify a ${passwordFieldName} by passing it in to the constructor`;

        const errorConstructor = getTextOfTsNode(
            context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression()
        );

        return `
        const ${usernameVar} = ${usernameExpression};
        if (${usernameVar} == null) {
            throw new ${errorConstructor}({
                message: "${usernameErrorMessage}"
            });
        }

        const ${passwordVar} = ${passwordExpression};
        if (${passwordVar} == null) {
            throw new ${errorConstructor}({
                message: "${passwordErrorMessage}"
            });
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
