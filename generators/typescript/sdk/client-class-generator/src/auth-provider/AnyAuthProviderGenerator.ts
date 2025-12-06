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

export declare namespace AnyAuthProviderGenerator {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
    }
}

const CLASS_NAME = "AnyAuthProvider";
const AUTH_PROVIDERS_FIELD_NAME = "authProviders";
const AUTH_OPTIONS_TYPE_NAME = "AuthOptions";

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

    public getAuthOptionsType(): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(`${CLASS_NAME}.${AUTH_OPTIONS_TYPE_NAME}`);
    }

    public getAuthOptionsProperties(_context: SdkContext): OptionalKind<PropertySignatureStructure>[] | undefined {
        // AnyAuthProvider's AuthOptions extends all child auth providers' AuthOptions,
        // so we don't need to return individual properties here
        return undefined;
    }

    /**
     * Gets the list of auth provider class names that this AnyAuthProvider combines.
     * Used to generate the AuthOptions interface that extends all child auth providers' AuthOptions.
     */
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

    public instantiate(constructorArgs: ts.Expression[]): ts.Expression {
        return ts.factory.createNewExpression(ts.factory.createIdentifier(CLASS_NAME), undefined, constructorArgs);
    }

    public writeToFile(context: SdkContext): void {
        this.writeOptions(context);
        this.writeClass(context);
    }

    private writeOptions(context: SdkContext): void {
        const childClassNames = this.getChildAuthProviderClassNames(context);

        // Add imports for child auth providers
        for (const className of childClassNames) {
            context.sourceFile.addImportDeclaration({
                moduleSpecifier: `./${className}.js`,
                namedImports: [className],
                isTypeOnly: true
            });
        }

        // Generate AuthOptions using AtLeastOneOf pattern
        // This ensures the user must provide at least one complete auth scheme,
        // while other auth schemes are optional (partial)
        const authOptionsTypes = childClassNames.map((className) => `${className}.AuthOptions`);
        const tupleStr = authOptionsTypes.join(",\n        ");

        // Generate the AtLeastOneOf helper types and AuthOptions
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
