import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, PropertySignatureStructure, Scope, StructureKind, ts } from "ts-morph";
import { AuthProviderGenerator } from "./AuthProviderGenerator";
import { BasicAuthProviderGenerator } from "./BasicAuthProviderGenerator";
import { BearerAuthProviderGenerator } from "./BearerAuthProviderGenerator";
import { HeaderAuthProviderGenerator } from "./HeaderAuthProviderGenerator";
import { InferredAuthProviderGenerator } from "./InferredAuthProviderGenerator";
import { OAuthAuthProviderGenerator } from "./OAuthAuthProviderGenerator";

export declare namespace RoutingAuthProviderGenerator {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
    }
}

const CLASS_NAME = "RoutingAuthProvider";
const AUTH_PROVIDERS_FIELD_NAME = "authProviders";
const AUTH_OPTIONS_TYPE_NAME = "AuthOptions";

export class RoutingAuthProviderGenerator implements AuthProviderGenerator {
    public static readonly CLASS_NAME = CLASS_NAME;
    public static readonly AUTH_PROVIDERS_FIELD_NAME = AUTH_PROVIDERS_FIELD_NAME;
    private readonly ir: FernIr.IntermediateRepresentation;

    constructor(init: RoutingAuthProviderGenerator.Init) {
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
        throw new Error("RoutingAuthProvider does not have an Options type");
    }

    public getAuthOptionsType(): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(`${CLASS_NAME}.${AUTH_OPTIONS_TYPE_NAME}`);
    }

    public getAuthOptionsProperties(_context: SdkContext): OptionalKind<PropertySignatureStructure>[] | undefined {
        return undefined;
    }

    private getChildAuthProviderClassNames(context: SdkContext): string[] {
        const classNames: string[] = [];
        for (const authScheme of this.ir.auth.schemes) {
            switch (authScheme.type) {
                case "bearer":
                    classNames.push(BearerAuthProviderGenerator.CLASS_NAME);
                    break;
                case "basic":
                    classNames.push(BasicAuthProviderGenerator.CLASS_NAME);
                    break;
                case "header":
                    classNames.push(HeaderAuthProviderGenerator.CLASS_NAME);
                    break;
                case "oauth":
                    if (context.generateOAuthClients) {
                        classNames.push(OAuthAuthProviderGenerator.CLASS_NAME);
                    }
                    break;
                case "inferred":
                    classNames.push(InferredAuthProviderGenerator.CLASS_NAME);
                    break;
            }
        }
        return classNames;
    }

    private getAuthSchemeKeys(): string[] {
        return this.ir.auth.schemes.map((scheme) => scheme.key);
    }

    public instantiate(constructorArgs: ts.Expression[]): ts.Expression {
        return ts.factory.createNewExpression(ts.factory.createIdentifier(CLASS_NAME), undefined, constructorArgs);
    }

    public writeToFile(context: SdkContext): void {
        this.writeOptions(context);
        this.writeClass(context);
    }

    private writeOptions(context: SdkContext): void {
        const childClassNames = this.getChildAuthProviderClassNames(context);

        for (const className of childClassNames) {
            context.sourceFile.addImportDeclaration({
                moduleSpecifier: `./${className}.js`,
                namedImports: [className],
                isTypeOnly: true
            });
        }

        const authOptionsTypes = childClassNames.map((className) => `${className}.AuthOptions`);

        // Use Partial intersection of all auth options to allow anonymous endpoints
        // (some endpoints may not require any auth)
        const typeCode = `
    type UnionToIntersection<U> =
        (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

    export type ${AUTH_OPTIONS_TYPE_NAME} = Partial<UnionToIntersection<
        ${authOptionsTypes.join(" | ")}
    >>;`;

        context.sourceFile.addModule({
            name: CLASS_NAME,
            isExported: true,
            kind: StructureKind.Module,
            statements: typeCode
        });
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
                        ts.factory.createTypeReferenceNode("Map", [
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                            context.coreUtilities.auth.AuthProvider._getReferenceToType()
                        ])
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
                                ts.factory.createTypeReferenceNode("Map", [
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                    context.coreUtilities.auth.AuthProvider._getReferenceToType()
                                ])
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
        const providerMap = `this.${AUTH_PROVIDERS_FIELD_NAME}`;

        return `
        const security = arg?.endpointMetadata?.security;

        // If no security requirements specified, endpoint is anonymous - return empty auth request
        if (security == null || security.length === 0) {
            return { headers: {} };
        }

        // First, verify that at least one security requirement can be satisfied by available providers
        const canSatisfyAnyRequirement = security.some((securityRequirement) => {
            const schemeKeys = Object.keys(securityRequirement);
            return schemeKeys.every((schemeKey) => ${providerMap}.has(schemeKey));
        });

        if (!canSatisfyAnyRequirement) {
            const requiredSchemes = security.map((req) => Object.keys(req).join(" AND ")).join(" OR ");
            throw new Error(
                "No authentication credentials provided that satisfy the endpoint's security requirements. " +
                "Required: " + requiredSchemes + ". Please provide the necessary authentication credentials."
            );
        }

        // Get the first security requirement that can be satisfied (OR relationship)
        const satisfiableRequirement = security.find((securityRequirement) => {
            const schemeKeys = Object.keys(securityRequirement);
            return schemeKeys.every((schemeKey) => ${providerMap}.has(schemeKey));
        });

        if (satisfiableRequirement == null) {
            // This should not happen since we already verified above, but handle it gracefully
            const requiredSchemes = security.map((req) => Object.keys(req).join(" AND ")).join(" OR ");
            throw new Error(
                "No authentication credentials provided that satisfy the endpoint's security requirements. " +
                "Required: " + requiredSchemes + ". Please provide the necessary authentication credentials."
            );
        }

        // Get auth for all schemes in the satisfiable requirement (AND relationship)
        const combinedHeaders: Record<string, string> = {};
        for (const schemeKey of Object.keys(satisfiableRequirement)) {
            const provider = ${providerMap}.get(schemeKey);
            if (provider == null) {
                throw new Error("Auth provider not found for scheme: " + schemeKey);
            }
            const authRequest = await provider.getAuthRequest(arg);
            Object.assign(combinedHeaders, authRequest.headers);
        }

        return { headers: combinedHeaders };`;
    }
}
