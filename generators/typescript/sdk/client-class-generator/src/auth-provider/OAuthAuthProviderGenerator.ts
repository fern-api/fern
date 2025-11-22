import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { Scope, StructureKind, ts } from "ts-morph";

import { AuthProviderGenerator } from "./AuthProviderGenerator";

export declare namespace OAuthAuthProviderGenerator {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
        authScheme: FernIr.OAuthScheme;
        neverThrowErrors: boolean;
    }
}

const CLASS_NAME = "OAuthAuthProvider";
const OPTIONS_TYPE_NAME = "Options";
const TOKEN_PROVIDER_FIELD_NAME = "_tokenProvider";

export class OAuthAuthProviderGenerator implements AuthProviderGenerator {
    public static readonly CLASS_NAME = CLASS_NAME;
    private readonly ir: FernIr.IntermediateRepresentation;
    private readonly authScheme: FernIr.OAuthScheme;
    private readonly neverThrowErrors: boolean;

    constructor(init: OAuthAuthProviderGenerator.Init) {
        this.ir = init.ir;
        this.authScheme = init.authScheme;
        this.neverThrowErrors = init.neverThrowErrors;
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
        // Import OAuthTokenProvider from core
        context.importsManager.addImportFromRoot("core/auth", {
            namedImports: ["OAuthTokenProvider"]
        });

        // AuthClient will be imported automatically when the provider is generated

        this.writeOptions(context);
        this.writeClass(context);
    }

    private writeClass(context: SdkContext): void {
        const tokenProviderType = context.coreUtilities.auth.OAuthTokenProvider._getReferenceToType();
        const oauthConfig = this.authScheme.configuration;

        if (oauthConfig.type !== "clientCredentials") {
            return;
        }

        const authEndpointReference = oauthConfig.tokenEndpoint.endpointReference;
        const packageId = authEndpointReference.subpackageId
            ? { isRoot: false as const, subpackageId: authEndpointReference.subpackageId }
            : { isRoot: true as const };
        const authClientReference = context.sdkClientClass.getReferenceToClientClass(packageId);
        const authClientExpression = authClientReference.getExpression();

        const constructorStatements = `
        const authClient = new ${getTextOfTsNode(authClientExpression)}(options);

        this.${TOKEN_PROVIDER_FIELD_NAME} = new core.OAuthTokenProvider({
            clientId: options.clientId,
            clientSecret: options.clientSecret,
            authClient
        });
        `;

        context.sourceFile.addClass({
            name: CLASS_NAME,
            isExported: true,
            implements: [getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())],
            properties: [
                {
                    name: TOKEN_PROVIDER_FIELD_NAME,
                    type: getTextOfTsNode(tokenProviderType),
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
                    statements: [constructorStatements]
                }
            ]
        });
    }

    private generateGetAuthRequestStatements(context: SdkContext): string {
        return `
        const token = await this.${TOKEN_PROVIDER_FIELD_NAME}.getToken();

        return {
            headers: {
                Authorization: \`Bearer \${token}\`
            }
        };
        `;
    }

    private writeOptions(context: SdkContext): void {
        // Import BaseClientOptions
        context.importsManager.addImportFromRoot("BaseClient", {
            namedImports: ["BaseClientOptions"]
        });

        // Get OAuth configuration
        const oauthConfig = this.authScheme.configuration;
        if (oauthConfig.type !== "clientCredentials") {
            return;
        }

        const properties: Array<{
            kind: StructureKind.PropertySignature;
            name: string;
            type: string;
            hasQuestionToken?: boolean;
        }> = [];

        // Add clientId property
        const clientIdProperty = oauthConfig.tokenEndpoint.requestProperties.clientId;
        properties.push({
            kind: StructureKind.PropertySignature,
            name: "clientId",
            type: getTextOfTsNode(
                context.coreUtilities.fetcher.Supplier._getReferenceToType(
                    context.type.getReferenceToType(clientIdProperty.property.valueType).typeNode
                )
            ),
            hasQuestionToken: oauthConfig.clientIdEnvVar != null
        });

        // Add clientSecret property
        const clientSecretProperty = oauthConfig.tokenEndpoint.requestProperties.clientSecret;
        properties.push({
            kind: StructureKind.PropertySignature,
            name: "clientSecret",
            type: getTextOfTsNode(
                context.coreUtilities.fetcher.Supplier._getReferenceToType(
                    context.type.getReferenceToType(clientSecretProperty.property.valueType).typeNode
                )
            ),
            hasQuestionToken: oauthConfig.clientSecretEnvVar != null
        });

        context.sourceFile.addModule({
            name: CLASS_NAME,
            isExported: true,
            kind: StructureKind.Module,
            statements: [
                {
                    kind: StructureKind.Interface,
                    name: OPTIONS_TYPE_NAME,
                    isExported: true,
                    extends: ["BaseClientOptions"],
                    properties
                }
            ]
        });
    }
}
