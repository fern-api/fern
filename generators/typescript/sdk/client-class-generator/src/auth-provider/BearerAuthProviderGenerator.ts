import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, getPropertyKey, getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { PropertySignatureStructure, Scope, StructureKind, ts } from "ts-morph";

import { AuthProviderGenerator } from "./AuthProviderGenerator";

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

export class BearerAuthProviderGenerator implements AuthProviderGenerator {
    public static readonly CLASS_NAME = CLASS_NAME;
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

    public instantiate(constructorArgs: ts.Expression[]): ts.Expression {
        return ts.factory.createNewExpression(ts.factory.createIdentifier(CLASS_NAME), undefined, constructorArgs);
    }

    public writeToFile(context: SdkContext): void {
        this.writeOptions(context);
        this.writeClass(context);
    }

    private writeClass(context: SdkContext): void {
        const hasTokenEnv = this.authScheme.tokenEnvVar != null;

        // Match the same logic as BaseClientOptions and Options interface
        const tokenType =
            this.isAuthMandatory && !hasTokenEnv
                ? context.coreUtilities.auth.BearerToken._getReferenceToType()
                : ts.factory.createUnionTypeNode([
                      context.coreUtilities.auth.BearerToken._getReferenceToType(),
                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                  ]);

        const tokenFieldType = hasTokenEnv
            ? ts.factory.createUnionTypeNode([
                  context.coreUtilities.fetcher.Supplier._getReferenceToType(tokenType),
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
              ])
            : context.coreUtilities.fetcher.Supplier._getReferenceToType(tokenType);

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
                    statements: [`this.${TOKEN_FIELD_NAME} = options.${this.authScheme.token.camelCase.safeName};`]
                }
            ]
        });
    }

    private generateGetAuthRequestStatements(context: SdkContext): string {
        const tokenVar = this.authScheme.token.camelCase.unsafeName;
        const tokenFieldName = this.authScheme.token.camelCase.safeName;

        const tokenExpression =
            this.authScheme.tokenEnvVar != null
                ? `(${getTextOfTsNode(
                      context.coreUtilities.fetcher.Supplier.get(
                          ts.factory.createPropertyAccessExpression(
                              ts.factory.createThis(),
                              ts.factory.createIdentifier(TOKEN_FIELD_NAME)
                          )
                      )
                  )}) ?? process.env?.["${this.authScheme.tokenEnvVar}"]`
                : getTextOfTsNode(
                      context.coreUtilities.fetcher.Supplier.get(
                          ts.factory.createPropertyAccessExpression(
                              ts.factory.createThis(),
                              ts.factory.createIdentifier(TOKEN_FIELD_NAME)
                          )
                      )
                  );

        if (this.neverThrowErrors) {
            return `
        const ${tokenVar} = ${tokenExpression};
        
        const authHeader = ${tokenVar} != null ? ${getTextOfTsNode(
            context.coreUtilities.auth.BearerToken.toAuthorizationHeader(ts.factory.createIdentifier(tokenVar))
        )} : undefined;
        
        return {
            headers: authHeader != null ? { Authorization: authHeader } : {}
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
        
        const authHeader = ${getTextOfTsNode(
            context.coreUtilities.auth.BearerToken.toAuthorizationHeader(ts.factory.createIdentifier(tokenVar))
        )};
        
        return {
            headers: authHeader != null ? { Authorization: authHeader } : {}
        };
        `;
    }

    private writeOptions(context: SdkContext): void {
        const hasTokenEnv = this.authScheme.tokenEnvVar != null;

        // Match the same logic as BaseClientOptions:
        // - token is optional when auth is not mandatory OR when there's an env var
        // - token type includes undefined when auth is not mandatory OR when there's an env var
        const isTokenOptional = !this.isAuthMandatory || hasTokenEnv;
        const tokenType =
            this.isAuthMandatory && !hasTokenEnv
                ? context.coreUtilities.auth.BearerToken._getReferenceToType()
                : ts.factory.createUnionTypeNode([
                      context.coreUtilities.auth.BearerToken._getReferenceToType(),
                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                  ]);

        const tokenProperty: PropertySignatureStructure = {
            kind: StructureKind.PropertySignature,
            name: getPropertyKey(this.authScheme.token.camelCase.safeName),
            hasQuestionToken: isTokenOptional,
            type: getTextOfTsNode(context.coreUtilities.fetcher.Supplier._getReferenceToType(tokenType)),
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
                    properties: [tokenProperty]
                }
            ]
        });
    }
}
