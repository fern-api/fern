import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { Scope, StructureKind, ts } from "ts-morph";
import { AuthProviderGenerator } from "./AuthProviderGenerator";

export declare namespace AnyAuthProviderGenerator {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
    }
}

const CLASS_NAME = "AnyAuthProvider";
const AUTH_PROVIDERS_FIELD_NAME = "authProviders";

export class AnyAuthProviderGenerator implements AuthProviderGenerator {
    public static readonly CLASS_NAME = CLASS_NAME;
    public static readonly AUTH_PROVIDERS_FIELD_NAME = AUTH_PROVIDERS_FIELD_NAME;
    private readonly ir: FernIr.IntermediateRepresentation;

    constructor(init: AnyAuthProviderGenerator.Init) {
        this.ir = init.ir;
    }

    public getFilePath(): ExportedFilePath {
        return {
            directories: [{ nameOnDisk: "auth" }],
            file: {
                nameOnDisk: `${CLASS_NAME}.ts`,
                exportDeclaration: { namedExports: [CLASS_NAME] }
            }
        };
    }

    public getAuthProviderClassType(): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(CLASS_NAME);
    }

    public getOptionsType(): ts.TypeNode {
        throw new Error("AnyAuthProvider does not have an Options type");
    }

    public instantiate(constructorArgs: ts.Expression[]): ts.Expression {
        return ts.factory.createNewExpression(ts.factory.createIdentifier(CLASS_NAME), undefined, constructorArgs);
    }

    public writeToFile(context: SdkContext): void {
        this.writeClass(context);
    }

    private writeClass(context: SdkContext): void {
        context.sourceFile.addClass({
            name: CLASS_NAME,
            isExported: true,
            implements: [getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())],
            properties: [
                {
                    name: AUTH_PROVIDERS_FIELD_NAME,
                    type: getTextOfTsNode(
                        ts.factory.createArrayTypeNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())
                    ),
                    hasQuestionToken: false,
                    isReadonly: true,
                    scope: Scope.Private
                }
            ],
            ctors: [
                {
                    parameters: [
                        {
                            name: "authProviders",
                            type: getTextOfTsNode(
                                ts.factory.createArrayTypeNode(
                                    context.coreUtilities.auth.AuthProvider._getReferenceToType()
                                )
                            )
                        }
                    ],
                    statements: [`this.${AUTH_PROVIDERS_FIELD_NAME} = authProviders;`]
                }
            ],
            methods: [
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
                        ts.factory.createTypeReferenceNode("Promise", [
                            context.coreUtilities.auth.AuthRequest._getReferenceToType()
                        ])
                    ),
                    statements: this.generateGetAuthRequestStatements()
                }
            ]
        });
    }

    private generateGetAuthRequestStatements(): string {
        const providerArray = `this.${AUTH_PROVIDERS_FIELD_NAME}`;
        const errorHandling = this.ir.sdkConfig.isAuthMandatory
            ? `throw new Error("No authentication credentials provided. Please provide one of the supported authentication methods.");`
            : `return { headers: {} };`;

        return `
        const availableProviders = ${providerArray};

        for (const provider of availableProviders) {
            try {
                const authRequest = await provider.getAuthRequest(arg);
                if (authRequest.headers.Authorization != null || Object.keys(authRequest.headers).length > 0) {
                    return authRequest;
                }
            } catch (e) {
                // Continue to next auth provider
            }
        }

        // No auth credentials found
        ${errorHandling}`;
    }
}
