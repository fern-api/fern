import { SetRequired } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { getParameterNameForRootPathParameter, getPropertyKey, getTextOfTsNode } from "@fern-typescript/commons";
import { BaseClientContext, SdkContext } from "@fern-typescript/contexts";
import { endpointUtils } from "@fern-typescript/sdk-client-class-generator";
import { InterfaceDeclarationStructure, OptionalKind, PropertySignatureStructure, StructureKind, ts } from "ts-morph";

export declare namespace BaseClientContextImpl {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        allowCustomFetcher: boolean;
        requireDefaultEnvironment: boolean;
        retainOriginalCasing: boolean;
        generateIdempotentRequestOptions: boolean;
    }
}
const OPTIONS_INTERFACE_NAME = "BaseClientOptions";
const REQUEST_OPTIONS_INTERFACE_NAME = "BaseRequestOptions";
const IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME = "BaseIdempotentRequestOptions";
const TIMEOUT_IN_SECONDS_REQUEST_OPTION_PROPERTY_NAME = "timeoutInSeconds";
const MAX_RETRIES_REQUEST_OPTION_PROPERTY_NAME = "maxRetries";
const ABORT_SIGNAL_PROPERTY_NAME = "abortSignal";
const CUSTOM_FETCHER_PROPERTY_NAME = "fetcher";
const ENVIRONMENT_OPTION_PROPERTY_NAME = "environment";
const BASE_URL_OPTION_PROPERTY_NAME = "baseUrl";

export class BaseClientContextImpl implements BaseClientContext {
    private readonly intermediateRepresentation: IntermediateRepresentation;
    private readonly allowCustomFetcher: boolean;
    private readonly requireDefaultEnvironment: boolean;
    private readonly retainOriginalCasing: boolean;
    private readonly generateIdempotentRequestOptions: boolean;

    public static readonly OPTIONS_INTERFACE_NAME = OPTIONS_INTERFACE_NAME;

    public static readonly REQUEST_OPTIONS_INTERFACE_NAME = REQUEST_OPTIONS_INTERFACE_NAME;
    public static readonly TIMEOUT_IN_SECONDS_REQUEST_OPTION_PROPERTY_NAME =
        TIMEOUT_IN_SECONDS_REQUEST_OPTION_PROPERTY_NAME;
    public static readonly MAX_RETRIES_REQUEST_OPTION_PROPERTY_NAME = MAX_RETRIES_REQUEST_OPTION_PROPERTY_NAME;
    public static readonly ABORT_SIGNAL_PROPERTY_NAME = ABORT_SIGNAL_PROPERTY_NAME;
    public static readonly CUSTOM_FETCHER_PROPERTY_NAME = CUSTOM_FETCHER_PROPERTY_NAME;
    public static readonly ENVIRONMENT_OPTION_PROPERTY_NAME = ENVIRONMENT_OPTION_PROPERTY_NAME;
    public static readonly BASE_URL_OPTION_PROPERTY_NAME = BASE_URL_OPTION_PROPERTY_NAME;
    public static readonly IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME = IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME;
    private bearerAuthScheme: FernIr.BearerAuthScheme | undefined;
    private basicAuthScheme: FernIr.BasicAuthScheme | undefined;
    private readonly authHeaders: FernIr.HeaderAuthScheme[];

    constructor({
        intermediateRepresentation,
        allowCustomFetcher,
        requireDefaultEnvironment,
        retainOriginalCasing,
        generateIdempotentRequestOptions
    }: BaseClientContextImpl.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.allowCustomFetcher = allowCustomFetcher;
        this.requireDefaultEnvironment = requireDefaultEnvironment;
        this.retainOriginalCasing = retainOriginalCasing;
        this.generateIdempotentRequestOptions = generateIdempotentRequestOptions;

        this.authHeaders = [];
        for (const authScheme of intermediateRepresentation.auth.schemes) {
            FernIr.AuthScheme._visit(authScheme, {
                basic: (basicAuthScheme) => {
                    this.basicAuthScheme = basicAuthScheme;
                },
                bearer: (bearerAuthScheme) => {
                    this.bearerAuthScheme = bearerAuthScheme;
                },
                header: (header) => {
                    this.authHeaders.push(header);
                },
                oauth: () => undefined,
                inferred: () => undefined,
                _other: () => {
                    throw new Error("Unknown auth scheme: " + authScheme.type);
                }
            });
        }
    }

    public anyRequiredBaseClientOptions(context: SdkContext): boolean {
        return this.generateBaseClientOptionsInterface(context).properties.some(isPropertyRequired);
    }

    public generateBaseClientOptionsInterface(
        context: SdkContext
    ): SetRequired<InterfaceDeclarationStructure, "properties"> {
        const properties: PropertySignatureStructure[] = [];
        const supplier = context.coreUtilities.fetcher.SupplierOrEndpointSupplier;

        if (!this.requireDefaultEnvironment) {
            const generatedEnvironments = context.environments.getGeneratedEnvironments();
            properties.push({
                kind: StructureKind.PropertySignature,
                name: ENVIRONMENT_OPTION_PROPERTY_NAME,
                type: getTextOfTsNode(
                    context.coreUtilities.fetcher.Supplier._getReferenceToType(
                        generatedEnvironments.getTypeForUserSuppliedEnvironment(context)
                    )
                ),
                hasQuestionToken: generatedEnvironments.hasDefaultEnvironment()
            });
        }

        properties.push({
            kind: StructureKind.PropertySignature,
            name: BASE_URL_OPTION_PROPERTY_NAME,
            type: getTextOfTsNode(
                context.coreUtilities.fetcher.Supplier._getReferenceToType(
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                )
            ),
            hasQuestionToken: true,
            docs: ["Specify a custom URL to connect the client to."]
        });

        for (const variable of this.intermediateRepresentation.variables) {
            const variableType = context.type.getReferenceToType(variable.type);
            properties.push({
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(this.getOptionNameForVariable(variable)),
                type: getTextOfTsNode(variableType.typeNodeWithoutUndefined),
                hasQuestionToken: variableType.isOptional
            });
        }

        for (const pathParameter of endpointUtils.getNonVariablePathParameters(
            this.intermediateRepresentation.pathParameters
        )) {
            properties.push({
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(
                    getParameterNameForRootPathParameter({
                        pathParameter,
                        retainOriginalCasing: this.retainOriginalCasing
                    })
                ),
                type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode)
            });
        }

        if (this.bearerAuthScheme != null) {
            properties.push({
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(this.getBearerAuthOptionKey(this.bearerAuthScheme)),
                type: getTextOfTsNode(
                    supplier._getReferenceToType(
                        this.intermediateRepresentation.sdkConfig.isAuthMandatory &&
                            this.bearerAuthScheme.tokenEnvVar == null
                            ? context.coreUtilities.auth.BearerToken._getReferenceToType()
                            : ts.factory.createUnionTypeNode([
                                  context.coreUtilities.auth.BearerToken._getReferenceToType(),
                                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                              ])
                    )
                ),
                hasQuestionToken:
                    !this.intermediateRepresentation.sdkConfig.isAuthMandatory ||
                    this.bearerAuthScheme.tokenEnvVar != null
            });
        }

        if (this.basicAuthScheme != null) {
            properties.push(
                {
                    kind: StructureKind.PropertySignature,
                    name: getPropertyKey(this.getBasicAuthUsernameOptionKey(this.basicAuthScheme)),
                    type: getTextOfTsNode(
                        context.coreUtilities.fetcher.Supplier._getReferenceToType(
                            this.intermediateRepresentation.sdkConfig.isAuthMandatory &&
                                this.basicAuthScheme.passwordEnvVar == null &&
                                this.basicAuthScheme.usernameEnvVar == null
                                ? ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                                : ts.factory.createUnionTypeNode([
                                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                                  ])
                        )
                    ),
                    hasQuestionToken:
                        !this.intermediateRepresentation.sdkConfig.isAuthMandatory ||
                        (this.basicAuthScheme.passwordEnvVar != null && this.basicAuthScheme.usernameEnvVar != null)
                },
                {
                    kind: StructureKind.PropertySignature,
                    name: getPropertyKey(this.getBasicAuthPasswordOptionKey(this.basicAuthScheme)),
                    type: getTextOfTsNode(
                        context.coreUtilities.fetcher.Supplier._getReferenceToType(
                            this.intermediateRepresentation.sdkConfig.isAuthMandatory &&
                                this.basicAuthScheme.passwordEnvVar == null &&
                                this.basicAuthScheme.usernameEnvVar == null
                                ? ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                                : ts.factory.createUnionTypeNode([
                                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                                  ])
                        )
                    ),
                    hasQuestionToken:
                        !this.intermediateRepresentation.sdkConfig.isAuthMandatory ||
                        (this.basicAuthScheme.passwordEnvVar != null && this.basicAuthScheme.usernameEnvVar != null)
                }
            );
        }

        for (const header of this.authHeaders) {
            const referenceToHeaderType = context.type.getReferenceToType(header.valueType);
            const isOptional =
                referenceToHeaderType.isOptional ||
                !this.intermediateRepresentation.sdkConfig.isAuthMandatory ||
                header.headerEnvVar != null;
            properties.push({
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(this.getOptionKeyForAuthHeader(header)),
                type: getTextOfTsNode(
                    supplier._getReferenceToType(
                        this.intermediateRepresentation.sdkConfig.isAuthMandatory
                            ? referenceToHeaderType.typeNode
                            : ts.factory.createUnionTypeNode([
                                  referenceToHeaderType.typeNodeWithoutUndefined,
                                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                              ])
                    )
                ),
                hasQuestionToken: isOptional
            });
        }

        for (const header of this.intermediateRepresentation.headers) {
            const type = context.type.getReferenceToType(header.valueType);
            if (endpointUtils.isLiteralHeader(header, context)) {
                properties.push({
                    kind: StructureKind.PropertySignature,
                    name: getPropertyKey(this.getOptionKeyForHeader(header)),
                    type: getTextOfTsNode(context.type.getReferenceToType(header.valueType).typeNode),
                    hasQuestionToken: true,
                    docs: [`Override the ${header.name.wireValue} header`]
                });
            } else {
                properties.push({
                    kind: StructureKind.PropertySignature,
                    name: getPropertyKey(this.getOptionKeyForHeader(header)),
                    type: getTextOfTsNode(context.coreUtilities.fetcher.Supplier._getReferenceToType(type.typeNode)),
                    hasQuestionToken: type.isOptional,
                    docs: [`Override the ${header.name.wireValue} header`]
                });
            }
        }

        const generatedVersion = context.versionContext.getGeneratedVersion();
        if (generatedVersion != null) {
            const header = generatedVersion.getHeader();
            properties.push({
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(this.getOptionKeyForHeader(header)),
                type: generatedVersion.getEnumValueUnion(),
                hasQuestionToken: generatedVersion.hasDefaultVersion(),
                docs: [`Override the ${header.name.wireValue} header`]
            });
        }

        properties.push({
            kind: StructureKind.PropertySignature,
            docs: ["Additional headers to include in requests."],
            name: "headers",
            type: `Record<string, string | ${getTextOfTsNode(supplier._getReferenceToType(ts.factory.createTypeReferenceNode("string | null | undefined")))} | null | undefined>`,
            hasQuestionToken: true
        });

        properties.push({
            kind: StructureKind.PropertySignature,
            name: getPropertyKey(TIMEOUT_IN_SECONDS_REQUEST_OPTION_PROPERTY_NAME),
            type: getTextOfTsNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)),
            hasQuestionToken: true,
            docs: ["The default maximum time to wait for a response in seconds."]
        });

        properties.push({
            kind: StructureKind.PropertySignature,
            name: getPropertyKey(MAX_RETRIES_REQUEST_OPTION_PROPERTY_NAME),
            type: getTextOfTsNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)),
            hasQuestionToken: true,
            docs: ["The default number of times to retry the request. Defaults to 2."]
        });

        properties.push({
            kind: StructureKind.PropertySignature,
            name: "fetch",
            type: "typeof fetch",
            hasQuestionToken: true,
            docs: [
                "Provide a custom fetch implementation. Useful for environments like React Native that require a custom fetch function."
            ]
        });

        if (this.allowCustomFetcher) {
            properties.push({
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(CUSTOM_FETCHER_PROPERTY_NAME),
                type: getTextOfTsNode(context.coreUtilities.fetcher.FetchFunction._getReferenceToType()),
                hasQuestionToken: true
            });
        }

        return {
            kind: StructureKind.Interface,
            name: OPTIONS_INTERFACE_NAME,
            properties,
            isExported: true
        };
    }

    private getBearerAuthOptionKey(bearerAuthScheme: FernIr.BearerAuthScheme): string {
        return bearerAuthScheme.token.camelCase.safeName;
    }

    private getBasicAuthUsernameOptionKey(basicAuthScheme: FernIr.BasicAuthScheme): string {
        return basicAuthScheme.username.camelCase.safeName;
    }

    private getBasicAuthPasswordOptionKey(basicAuthScheme: FernIr.BasicAuthScheme): string {
        return basicAuthScheme.password.camelCase.safeName;
    }

    public anyRequiredBaseRequestOptions(context: SdkContext): boolean {
        return (
            this.generateBaseRequestOptionsInterface(context).properties.some(isPropertyRequired) ||
            (this.generateIdempotentRequestOptions &&
                this.generateBaseIdempotentRequestOptionsInterface(context).properties.some(isPropertyRequired))
        );
    }

    public generateBaseRequestOptionsInterface(
        context: SdkContext
    ): SetRequired<InterfaceDeclarationStructure, "properties"> {
        const supplier = context.coreUtilities.fetcher.SupplierOrEndpointSupplier;
        const requestOptions: SetRequired<InterfaceDeclarationStructure, "properties"> = {
            kind: StructureKind.Interface,
            name: REQUEST_OPTIONS_INTERFACE_NAME,
            properties: [
                {
                    name: TIMEOUT_IN_SECONDS_REQUEST_OPTION_PROPERTY_NAME,
                    type: "number",
                    hasQuestionToken: true,
                    docs: ["The maximum time to wait for a response in seconds."]
                },
                {
                    name: MAX_RETRIES_REQUEST_OPTION_PROPERTY_NAME,
                    type: "number",
                    hasQuestionToken: true,
                    docs: ["The number of times to retry the request. Defaults to 2."]
                },
                {
                    name: ABORT_SIGNAL_PROPERTY_NAME,
                    type: "AbortSignal",
                    hasQuestionToken: true,
                    docs: ["A hook to abort the request."]
                },
                ...this.intermediateRepresentation.headers.map((header) => {
                    return {
                        name: getPropertyKey(this.getOptionKeyForHeader(header)),
                        type: getTextOfTsNode(context.type.getReferenceToType(header.valueType).typeNode),
                        hasQuestionToken: true,
                        docs: [`Override the ${header.name.wireValue} header`]
                    };
                }),
                {
                    name: endpointUtils.REQUEST_OPTIONS_ADDITIONAL_QUERY_PARAMETERS_PROPERTY_NAME,
                    type: "Record<string, unknown>",
                    hasQuestionToken: true,
                    docs: ["Additional query string parameters to include in the request."]
                },
                {
                    name: "headers",
                    type: `Record<string, string | ${getTextOfTsNode(supplier._getReferenceToType(ts.factory.createTypeReferenceNode("string | null | undefined")))} | null | undefined>`,
                    hasQuestionToken: true,
                    docs: ["Additional headers to include in the request."]
                }
            ],
            isExported: true
        };

        const generatedVersion = context.versionContext.getGeneratedVersion();
        if (generatedVersion != null) {
            const header = generatedVersion.getHeader();
            requestOptions.properties.push({
                name: getPropertyKey(this.getOptionKeyForHeader(header)),
                type: generatedVersion.getEnumValueUnion(),
                hasQuestionToken: true,
                docs: [`Override the ${header.name.wireValue} header`]
            });
        }
        return requestOptions;
    }

    public generateBaseIdempotentRequestOptionsInterface(
        context: SdkContext
    ): SetRequired<InterfaceDeclarationStructure, "properties"> {
        const properties: PropertySignatureStructure[] = [];
        for (const header of this.intermediateRepresentation.idempotencyHeaders) {
            if (!endpointUtils.isLiteralHeader(header, context)) {
                const type = context.type.getReferenceToType(header.valueType);
                properties.push({
                    kind: StructureKind.PropertySignature,
                    name: getPropertyKey(this.getOptionKeyForHeader(header)),
                    type: getTextOfTsNode(type.typeNode),
                    hasQuestionToken: type.isOptional
                });
            }
        }
        return {
            kind: StructureKind.Interface,
            name: IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME,
            properties,
            isExported: true
        };
    }

    private getOptionKeyForHeader(header: FernIr.HttpHeader): string {
        return header.name.name.camelCase.unsafeName;
    }

    private getOptionKeyForAuthHeader(header: FernIr.HeaderAuthScheme): string {
        return header.name.name.camelCase.unsafeName;
    }
    private getOptionNameForVariable(variable: FernIr.VariableDeclaration): string {
        return variable.name.camelCase.unsafeName;
    }
}

function isPropertyRequired(property: OptionalKind<PropertySignatureStructure>): boolean {
    return property.hasQuestionToken !== true;
}
