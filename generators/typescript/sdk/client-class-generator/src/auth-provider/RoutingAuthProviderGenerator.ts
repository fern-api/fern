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
        const tupleStr = authOptionsTypes.join(",\n        ");

        const typeCode = `
    type UnionToIntersection<U> =
        (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

    type AtLeastOneOf<T extends any[]> = {
        [K in keyof T]: T[K] & Partial<UnionToIntersection<Exclude<T[number], T[K]>>>;
    }[number];

    export type ${AUTH_OPTIONS_TYPE_NAME} = AtLeastOneOf<[
        ${tupleStr}
    ]>;`;

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
        const authSchemeKeys = this.getAuthSchemeKeys();
        const errorHandling = this.ir.sdkConfig.isAuthMandatory
            ? `throw new Error("No authentication credentials provided. Please provide one of the supported authentication methods.");`
            : `return { headers: {} };`;

        return `
        const security = arg?.endpointMetadata?.security;

        // If no security requirements specified, try all providers in order
        if (security == null || security.length === 0) {
            for (const provider of ${providerMap}.values()) {
                try {
                    const authRequest = await provider.getAuthRequest(arg);
                    if (authRequest.headers.Authorization != null || Object.keys(authRequest.headers).length > 0) {
                        return authRequest;
                    }
                } catch (e) {
                    // Continue to next auth provider
                }
            }
            ${errorHandling}
        }

        // Try each security requirement collection (OR relationship)
        for (const securityRequirement of security) {
            const schemeKeys = Object.keys(securityRequirement);
            let allSchemesSucceeded = true;
            const combinedHeaders: Record<string, string> = {};

            // Try all schemes in this requirement (AND relationship)
            for (const schemeKey of schemeKeys) {
                const provider = ${providerMap}.get(schemeKey);
                if (provider == null) {
                    allSchemesSucceeded = false;
                    break;
                }

                try {
                    const authRequest = await provider.getAuthRequest(arg);
                    if (authRequest.headers.Authorization == null && Object.keys(authRequest.headers).length === 0) {
                        allSchemesSucceeded = false;
                        break;
                    }
                    Object.assign(combinedHeaders, authRequest.headers);
                } catch (e) {
                    allSchemesSucceeded = false;
                    break;
                }
            }

            if (allSchemesSucceeded && Object.keys(combinedHeaders).length > 0) {
                return { headers: combinedHeaders };
            }
        }

        // No security requirement could be satisfied
        ${errorHandling}`;
    }
}
