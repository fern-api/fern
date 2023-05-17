import { assertNever } from "@fern-api/core-utils";
import { AuthScheme, BasicAuthScheme, BearerAuthScheme, HeaderAuthScheme } from "@fern-fern/ir-model/auth";
import { HttpEndpoint, HttpHeader, PathParameter, SdkResponse, StreamingResponse } from "@fern-fern/ir-model/http";
import { IntermediateRepresentation, Package } from "@fern-fern/ir-model/ir";
import { VariableDeclaration, VariableId } from "@fern-fern/ir-model/variables";
import {
    getTextOfTsNode,
    JavaScriptRuntime,
    maybeAddDocs,
    NpmPackage,
    PackageId,
    visitJavaScriptRuntime,
} from "@fern-typescript/commons";
import { GeneratedSdkClientClass, SdkClientClassContext } from "@fern-typescript/contexts";
import { ErrorResolver, PackageResolver } from "@fern-typescript/resolvers";
import { InterfaceDeclarationStructure, OptionalKind, PropertySignatureStructure, Scope, ts } from "ts-morph";
import { GeneratedDefaultEndpointRequest } from "./endpoint-request/GeneratedDefaultEndpointRequest";
import { GeneratedFileUploadEndpointRequest } from "./endpoint-request/GeneratedFileUploadEndpointRequest";
import { GeneratedNonThrowingEndpointResponse } from "./endpoints/default/endpoint-response/GeneratedNonThrowingEndpointResponse";
import { GeneratedThrowingEndpointResponse } from "./endpoints/default/endpoint-response/GeneratedThrowingEndpointResponse";
import { GeneratedDefaultEndpointImplementation } from "./endpoints/default/GeneratedDefaultEndpointImplementation";
import { GeneratedBlobDownloadEndpointImplementation } from "./endpoints/GeneratedBlobDownloadEndpointImplementation";
import { GeneratedEndpointImplementation } from "./endpoints/GeneratedEndpointImplementation";
import { GeneratedMaybeStreamingEndpointImplementation } from "./endpoints/GeneratedMaybeStreamingEndpointImplementation";
import { GeneratedReadableDownloadEndpointImplementation } from "./endpoints/GeneratedReadableDownloadEndpointImplementation";
import { GeneratedStreamingEndpointImplementation } from "./endpoints/GeneratedStreamingEndpointImplementation";
import { getNonVariablePathParameters } from "./endpoints/utils/getNonVariablePathParameters";
import { getParameterNameForPathParameter } from "./endpoints/utils/getParameterNameForPathParameter";
import { getLiteralValueForHeader, isLiteralHeader } from "./endpoints/utils/isLiteralHeader";
import { GeneratedHeader } from "./GeneratedHeader";
import { GeneratedWrappedService } from "./GeneratedWrappedService";

export declare namespace GeneratedSdkClientClassImpl {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        packageId: PackageId;
        serviceClassName: string;
        errorResolver: ErrorResolver;
        packageResolver: PackageResolver;
        neverThrowErrors: boolean;
        includeCredentialsOnCrossOriginRequests: boolean;
        allowCustomFetcher: boolean;
        requireDefaultEnvironment: boolean;
        timeoutInSeconds: number | "infinity" | undefined;
        npmPackage: NpmPackage | undefined;
        targetRuntime: JavaScriptRuntime;
    }
}

export class GeneratedSdkClientClassImpl implements GeneratedSdkClientClass {
    private static OPTIONS_INTERFACE_NAME = "Options";
    private static OPTIONS_PRIVATE_MEMBER = "options";
    private static ENVIRONMENT_OPTION_PROPERTY_NAME = "environment";
    private static BEARER_OPTION_PROPERTY_NAME = "token";
    private static CUSTOM_FETCHER_PROPERTY_NAME = "fetcher";
    private static CUSTOM_STREAMING_FETCHER_PROPERTY_NAME = "streamingFetcher";
    private static AUTHORIZATION_HEADER_HELPER_METHOD_NAME = "_getAuthorizationHeader";

    private intermediateRepresentation: IntermediateRepresentation;
    private bearerAuthScheme: BearerAuthScheme | undefined;
    private basicAuthScheme: BasicAuthScheme | undefined;
    private authHeaders: HeaderAuthScheme[];
    private serviceClassName: string;
    private package_: Package;
    private generatedEndpointImplementations: GeneratedEndpointImplementation[];
    private generatedWrappedServices: GeneratedWrappedService[];
    private allowCustomFetcher: boolean;
    private packageResolver: PackageResolver;
    private requireDefaultEnvironment: boolean;
    private npmPackage: NpmPackage | undefined;
    private targetRuntime: JavaScriptRuntime;

    constructor({
        intermediateRepresentation,
        serviceClassName,
        packageId,
        errorResolver,
        packageResolver,
        neverThrowErrors,
        includeCredentialsOnCrossOriginRequests,
        allowCustomFetcher,
        requireDefaultEnvironment,
        timeoutInSeconds,
        npmPackage,
        targetRuntime,
    }: GeneratedSdkClientClassImpl.Init) {
        this.serviceClassName = serviceClassName;
        this.intermediateRepresentation = intermediateRepresentation;
        this.allowCustomFetcher = allowCustomFetcher;
        this.packageResolver = packageResolver;
        this.requireDefaultEnvironment = requireDefaultEnvironment;
        this.npmPackage = npmPackage;
        this.targetRuntime = targetRuntime;

        const package_ = packageResolver.resolvePackage(packageId);
        this.package_ = package_;

        const service = packageResolver.getServiceDeclaration(packageId);

        if (service == null) {
            this.generatedEndpointImplementations = [];
        } else {
            this.generatedEndpointImplementations = service.endpoints.map((endpoint) => {
                const requestBody = endpoint.requestBody ?? undefined;

                const getGeneratedEndpointRequest = () => {
                    if (requestBody?.type === "fileUpload") {
                        return new GeneratedFileUploadEndpointRequest({
                            packageId,
                            service,
                            endpoint,
                            requestBody,
                            generatedSdkClientClass: this,
                            targetRuntime: this.targetRuntime,
                        });
                    } else {
                        return new GeneratedDefaultEndpointRequest({
                            packageId,
                            sdkRequest: endpoint.sdkRequest ?? undefined,
                            service,
                            endpoint,
                            requestBody,
                            generatedSdkClientClass: this,
                        });
                    }
                };

                const getGeneratedEndpointResponse = ({
                    response,
                }: {
                    response: SdkResponse.Json | SdkResponse.FileDownload | undefined;
                }) => {
                    if (neverThrowErrors) {
                        return new GeneratedNonThrowingEndpointResponse({
                            packageId,
                            endpoint,
                            errorDiscriminationStrategy: intermediateRepresentation.errorDiscriminationStrategy,
                            errorResolver,
                            response,
                        });
                    } else {
                        return new GeneratedThrowingEndpointResponse({
                            packageId,
                            endpoint,
                            errorDiscriminationStrategy: intermediateRepresentation.errorDiscriminationStrategy,
                            errorResolver,
                            response,
                        });
                    }
                };

                const getDefaultEndpointImplementation = ({
                    response,
                }: {
                    response: SdkResponse.Json | SdkResponse.FileDownload | undefined;
                }) => {
                    return new GeneratedDefaultEndpointImplementation({
                        endpoint,
                        request: getGeneratedEndpointRequest(),
                        response: getGeneratedEndpointResponse({ response }),
                        generatedSdkClientClass: this,
                        includeCredentialsOnCrossOriginRequests,
                        timeoutInSeconds,
                    });
                };

                const getStreamingEndpointImplementation = (streamingResponse: StreamingResponse) => {
                    return new GeneratedStreamingEndpointImplementation({
                        packageId,
                        endpoint,
                        generatedSdkClientClass: this,
                        includeCredentialsOnCrossOriginRequests,
                        response: streamingResponse,
                        timeoutInSeconds,
                        request: getGeneratedEndpointRequest(),
                    });
                };

                if (endpoint.sdkResponse == null) {
                    return getDefaultEndpointImplementation({ response: undefined });
                }

                return SdkResponse._visit<GeneratedEndpointImplementation>(endpoint.sdkResponse, {
                    fileDownload: (fileDownload) =>
                        visitJavaScriptRuntime<GeneratedEndpointImplementation>(targetRuntime, {
                            node: () =>
                                new GeneratedReadableDownloadEndpointImplementation({
                                    endpoint,
                                    generatedSdkClientClass: this,
                                    includeCredentialsOnCrossOriginRequests,
                                    timeoutInSeconds,
                                    request: getGeneratedEndpointRequest(),
                                }),
                            browser: () =>
                                new GeneratedBlobDownloadEndpointImplementation({
                                    endpoint,
                                    generatedSdkClientClass: this,
                                    includeCredentialsOnCrossOriginRequests,
                                    timeoutInSeconds,
                                    request: getGeneratedEndpointRequest(),
                                    response: getGeneratedEndpointResponse({
                                        response: SdkResponse.fileDownload(fileDownload),
                                    }),
                                }),
                        }),
                    json: (jsonResponse) =>
                        getDefaultEndpointImplementation({
                            response: SdkResponse.json(jsonResponse),
                        }),
                    streaming: getStreamingEndpointImplementation,
                    maybeStreaming: (maybeStreamingResponse) => {
                        if (maybeStreamingResponse.nonStreaming.type === "fileDownload") {
                            throw new Error("Streaming condition is not supported with file download");
                        }
                        return new GeneratedMaybeStreamingEndpointImplementation({
                            endpoint,
                            response: maybeStreamingResponse,
                            nonStreamingEndpointImplementation: getDefaultEndpointImplementation({
                                response: maybeStreamingResponse.nonStreaming,
                            }),
                            streamingEndpointImplementation: getStreamingEndpointImplementation(
                                maybeStreamingResponse.streaming
                            ),
                        });
                    },
                    _unknown: () => {
                        throw new Error("Unknown SdkResponse type: " + endpoint.sdkResponse?.type);
                    },
                });
            });
        }

        this.generatedWrappedServices = package_.subpackages.reduce<GeneratedWrappedService[]>(
            (acc, wrappedSubpackageId) => {
                const subpackage = this.packageResolver.resolveSubpackage(wrappedSubpackageId);
                if (subpackage.hasEndpointsInTree) {
                    acc.push(
                        new GeneratedWrappedService({
                            wrappedSubpackageId,
                            wrappedSubpackage: this.packageResolver.resolveSubpackage(wrappedSubpackageId),
                            wrapperService: this,
                        })
                    );
                }
                return acc;
            },
            []
        );

        this.authHeaders = [];
        for (const authScheme of intermediateRepresentation.auth.schemes) {
            AuthScheme._visit(authScheme, {
                basic: (basicAuthScheme) => {
                    this.basicAuthScheme = basicAuthScheme;
                },
                bearer: (bearerAuthScheme) => {
                    this.bearerAuthScheme = bearerAuthScheme;
                },
                header: (header) => {
                    this.authHeaders.push(header);
                },
                _unknown: () => {
                    throw new Error("Unknown auth scheme: " + authScheme._type);
                },
            });
        }
    }

    public instantiate({
        referenceToClient,
        referenceToOptions,
    }: {
        referenceToClient: ts.Expression;
        referenceToOptions: ts.Expression;
    }): ts.Expression {
        return ts.factory.createNewExpression(referenceToClient, undefined, [referenceToOptions]);
    }

    public writeToFile(context: SdkClientClassContext): void {
        const serviceModule = context.base.sourceFile.addModule({
            name: this.serviceClassName,
            isExported: true,
            hasDeclareKeyword: true,
        });

        const optionsInterface = serviceModule.addInterface(this.generateOptionsInterface(context));

        const serviceClass = context.base.sourceFile.addClass({
            name: this.serviceClassName,
            isExported: true,
        });
        maybeAddDocs(serviceClass, this.package_.docs);

        serviceClass.addConstructor({
            parameters: [
                {
                    name: GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER,
                    isReadonly: true,
                    scope: Scope.Protected,
                    type: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createQualifiedName(
                                ts.factory.createIdentifier(serviceModule.getName()),
                                ts.factory.createIdentifier(optionsInterface.getName())
                            )
                        )
                    ),
                },
            ],
        });

        for (const endpoint of this.generatedEndpointImplementations) {
            const signature = endpoint.getSignature(context);
            const docs = endpoint.getDocs(context);
            const overloads = endpoint.getOverloads(context);

            const method = serviceClass.addMethod({
                name: endpoint.endpoint.name.camelCase.unsafeName,
                parameters: signature.parameters,
                returnType: getTextOfTsNode(
                    ts.factory.createTypeReferenceNode("Promise", [signature.returnTypeWithoutPromise])
                ),
                scope: Scope.Public,
                isAsync: true,
                statements: endpoint.getStatements(context).map(getTextOfTsNode),
                overloads: overloads.map((overload, index) => ({
                    docs: index === 0 && docs != null ? ["\n" + docs] : undefined,
                    parameters: overload.parameters,
                    returnType: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode("Promise", [overload.returnTypeWithoutPromise])
                    ),
                })),
            });

            if (overloads.length === 0) {
                maybeAddDocs(method, docs);
            }
        }

        for (const wrappedService of this.generatedWrappedServices) {
            wrappedService.addToServiceClass(serviceClass, context);
        }

        if (this.shouldGenerateAuthorizationHeaderHelperMethod()) {
            serviceClass.addMethod({
                scope: Scope.Protected,
                isAsync: true,
                name: GeneratedSdkClientClassImpl.AUTHORIZATION_HEADER_HELPER_METHOD_NAME,
                statements: this.getAuthorizationHeaderStatements(context).map(getTextOfTsNode),
            });
        }
    }

    private shouldGenerateAuthorizationHeaderHelperMethod(): boolean {
        if (this.generatedEndpointImplementations.length === 0) {
            return false;
        }
        return (
            this.bearerAuthScheme != null ||
            this.basicAuthScheme != null ||
            this.getCustomAuthorizationHeaders().length > 0
        );
    }

    public getEnvironment(endpoint: HttpEndpoint, context: SdkClientClassContext): ts.Expression {
        let referenceToEnvironmentValue = this.getReferenceToEnvironment();

        const defaultEnvironment = context.environments
            .getGeneratedEnvironments()
            .getReferenceToDefaultEnvironment(context);

        if (this.requireDefaultEnvironment) {
            if (defaultEnvironment == null) {
                throw new Error("Cannot use default environment because none exists");
            }
            return defaultEnvironment;
        }

        if (defaultEnvironment != null) {
            referenceToEnvironmentValue = ts.factory.createBinaryExpression(
                referenceToEnvironmentValue,
                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                defaultEnvironment
            );
        }

        return context.environments.getGeneratedEnvironments().getReferenceToEnvironmentUrl({
            referenceToEnvironmentValue,
            baseUrlId: endpoint.baseUrl ?? undefined,
        });
    }

    public getAuthorizationHeaderValue(): ts.Expression | undefined {
        if (this.shouldGenerateAuthorizationHeaderHelperMethod()) {
            return ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createThis(),
                        GeneratedSdkClientClassImpl.AUTHORIZATION_HEADER_HELPER_METHOD_NAME
                    ),
                    undefined,
                    []
                )
            );
        } else {
            return undefined;
        }
    }

    public getHeaders(context: SdkClientClassContext): GeneratedHeader[] {
        const headers: GeneratedHeader[] = [
            ...this.intermediateRepresentation.headers
                // auth headers are handled separately
                .filter((header) => !this.isAuthorizationHeader(header))
                .map((header) => {
                    const literalValue = getLiteralValueForHeader(header, context);
                    return {
                        header: header.name.wireValue,
                        value:
                            literalValue != null
                                ? ts.factory.createStringLiteral(literalValue)
                                : context.type.stringify(
                                      context.base.coreUtilities.fetcher.Supplier.get(
                                          this.getReferenceToOption(this.getOptionKeyForNonLiteralGlobalHeader(header))
                                      ),
                                      header.valueType,
                                      { includeNullCheckIfOptional: true }
                                  ),
                    };
                }),
            ...this.authHeaders
                .filter((header) => !this.isAuthorizationHeader(header))
                .map((header) => ({
                    header: header.name.wireValue,
                    value: context.base.coreUtilities.fetcher.Supplier.get(
                        this.getReferenceToOption(this.getOptionKeyForAuthHeader(header))
                    ),
                })),
            {
                header: this.intermediateRepresentation.sdkConfig.platformHeaders.language,
                value: ts.factory.createStringLiteral("JavaScript"),
            },
        ];

        if (this.npmPackage != null) {
            headers.push(
                {
                    header: this.intermediateRepresentation.sdkConfig.platformHeaders.sdkName,
                    value: ts.factory.createStringLiteral(this.npmPackage.packageName),
                },
                {
                    header: this.intermediateRepresentation.sdkConfig.platformHeaders.sdkVersion,
                    value: ts.factory.createStringLiteral(this.npmPackage.version),
                }
            );
        }

        return headers;
    }

    /***********
     * OPTIONS *
     ***********/

    private generateOptionsInterface(context: SdkClientClassContext): OptionalKind<InterfaceDeclarationStructure> {
        const properties: OptionalKind<PropertySignatureStructure>[] = [];

        if (!this.requireDefaultEnvironment) {
            const generatedEnvironments = context.environments.getGeneratedEnvironments();
            properties.push({
                name: GeneratedSdkClientClassImpl.ENVIRONMENT_OPTION_PROPERTY_NAME,
                type: getTextOfTsNode(generatedEnvironments.getTypeForUserSuppliedEnvironment(context)),
                hasQuestionToken: generatedEnvironments.hasDefaultEnvironment(),
            });
        }

        for (const variable of this.intermediateRepresentation.variables) {
            const variableType = context.type.getReferenceToType(variable.type);
            properties.push({
                name: this.getOptionNameForVariable(variable),
                type: getTextOfTsNode(variableType.typeNodeWithoutUndefined),
                hasQuestionToken: variableType.isOptional,
            });
        }

        for (const pathParameter of getNonVariablePathParameters(this.intermediateRepresentation.pathParameters)) {
            properties.push({
                name: getParameterNameForPathParameter(pathParameter),
                type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode),
            });
        }

        if (this.bearerAuthScheme != null) {
            properties.push({
                name: GeneratedSdkClientClassImpl.BEARER_OPTION_PROPERTY_NAME,
                type: getTextOfTsNode(
                    context.base.coreUtilities.fetcher.Supplier._getReferenceToType(
                        this.intermediateRepresentation.sdkConfig.isAuthMandatory
                            ? context.base.coreUtilities.auth.BearerToken._getReferenceToType()
                            : ts.factory.createUnionTypeNode([
                                  context.base.coreUtilities.auth.BearerToken._getReferenceToType(),
                                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                              ])
                    )
                ),
                hasQuestionToken: !this.intermediateRepresentation.sdkConfig.isAuthMandatory,
            });
        }

        if (this.basicAuthScheme != null) {
            properties.push(
                {
                    name: this.getBasicAuthUsernameOptionKey(this.basicAuthScheme),
                    type: getTextOfTsNode(
                        context.base.coreUtilities.fetcher.Supplier._getReferenceToType(
                            this.intermediateRepresentation.sdkConfig.isAuthMandatory
                                ? ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                                : ts.factory.createUnionTypeNode([
                                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                                  ])
                        )
                    ),
                    hasQuestionToken: !this.intermediateRepresentation.sdkConfig.isAuthMandatory,
                },
                {
                    name: this.getBasicAuthPasswordOptionKey(this.basicAuthScheme),
                    type: getTextOfTsNode(
                        context.base.coreUtilities.fetcher.Supplier._getReferenceToType(
                            this.intermediateRepresentation.sdkConfig.isAuthMandatory
                                ? ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                                : ts.factory.createUnionTypeNode([
                                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                                  ])
                        )
                    ),
                    hasQuestionToken: !this.intermediateRepresentation.sdkConfig.isAuthMandatory,
                }
            );
        }

        for (const header of this.authHeaders) {
            const referenceToHeaderType = context.type.getReferenceToType(header.valueType);
            const isOptional =
                referenceToHeaderType.isOptional || !this.intermediateRepresentation.sdkConfig.isAuthMandatory;
            properties.push({
                name: this.getOptionKeyForAuthHeader(header),
                type: getTextOfTsNode(
                    context.base.coreUtilities.fetcher.Supplier._getReferenceToType(
                        this.intermediateRepresentation.sdkConfig.isAuthMandatory
                            ? referenceToHeaderType.typeNode
                            : ts.factory.createUnionTypeNode([
                                  referenceToHeaderType.typeNodeWithoutUndefined,
                                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                              ])
                    )
                ),
                hasQuestionToken: isOptional,
            });
        }

        for (const header of this.intermediateRepresentation.headers) {
            if (!isLiteralHeader(header, context)) {
                const type = context.type.getReferenceToType(header.valueType);
                properties.push({
                    name: this.getOptionKeyForNonLiteralGlobalHeader(header),
                    type: getTextOfTsNode(
                        context.base.coreUtilities.fetcher.Supplier._getReferenceToType(type.typeNode)
                    ),
                    hasQuestionToken: type.isOptional,
                });
            }
        }

        if (this.allowCustomFetcher) {
            properties.push({
                name: GeneratedSdkClientClassImpl.CUSTOM_FETCHER_PROPERTY_NAME,
                type: getTextOfTsNode(context.base.coreUtilities.fetcher.FetchFunction._getReferenceToType()),
                hasQuestionToken: true,
            });
            if (this.intermediateRepresentation.sdkConfig.hasStreamingEndpoints) {
                properties.push({
                    name: GeneratedSdkClientClassImpl.CUSTOM_STREAMING_FETCHER_PROPERTY_NAME,
                    type: getTextOfTsNode(
                        context.base.coreUtilities.streamingFetcher.StreamingFetchFunction._getReferenceToType()
                    ),
                    hasQuestionToken: true,
                });
            }
        }

        return {
            name: GeneratedSdkClientClassImpl.OPTIONS_INTERFACE_NAME,
            properties,
        };
    }

    private getBasicAuthUsernameOptionKey(basicAuthScheme: BasicAuthScheme): string {
        return basicAuthScheme.username.camelCase.unsafeName;
    }

    private getBasicAuthPasswordOptionKey(basicAuthScheme: BasicAuthScheme): string {
        return basicAuthScheme.password.camelCase.unsafeName;
    }

    private getReferenceToEnvironment(): ts.Expression {
        return this.getReferenceToOption(GeneratedSdkClientClassImpl.ENVIRONMENT_OPTION_PROPERTY_NAME);
    }

    public getReferenceToOptions(): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
        );
    }

    public getReferenceToFetcher(context: SdkClientClassContext): ts.Expression {
        if (this.allowCustomFetcher) {
            return ts.factory.createBinaryExpression(
                this.getReferenceToOption(GeneratedSdkClientClassImpl.CUSTOM_FETCHER_PROPERTY_NAME),
                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                context.base.coreUtilities.fetcher.fetcher._getReferenceTo()
            );
        } else {
            return context.base.coreUtilities.fetcher.fetcher._getReferenceTo();
        }
    }

    public getReferenceToStreamingFetcher(context: SdkClientClassContext): ts.Expression {
        if (this.allowCustomFetcher) {
            return ts.factory.createBinaryExpression(
                this.getReferenceToOption(GeneratedSdkClientClassImpl.CUSTOM_STREAMING_FETCHER_PROPERTY_NAME),
                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                context.base.coreUtilities.streamingFetcher.streamingFetcher._getReferenceTo()
            );
        } else {
            return context.base.coreUtilities.streamingFetcher.streamingFetcher._getReferenceTo();
        }
    }

    private getReferenceToOption(option: string): ts.Expression {
        return ts.factory.createPropertyAccessExpression(this.getReferenceToOptions(), option);
    }

    private getOptionKeyForNonLiteralGlobalHeader(header: HttpHeader): string {
        return header.name.name.camelCase.unsafeName;
    }

    private getOptionKeyForAuthHeader(header: HeaderAuthScheme): string {
        return header.name.name.camelCase.unsafeName;
    }

    private getAuthorizationHeaderStatements(context: SdkClientClassContext): ts.Statement[] {
        const statements: ts.Statement[] = [];

        if (this.bearerAuthScheme != null) {
            if (this.intermediateRepresentation.sdkConfig.isAuthMandatory) {
                statements.push(
                    ts.factory.createReturnStatement(
                        ts.factory.createTemplateExpression(ts.factory.createTemplateHead("Bearer "), [
                            ts.factory.createTemplateSpan(
                                context.base.coreUtilities.fetcher.Supplier.get(
                                    this.getReferenceToOption(GeneratedSdkClientClassImpl.BEARER_OPTION_PROPERTY_NAME)
                                ),
                                ts.factory.createTemplateTail("", "")
                            ),
                        ])
                    )
                );
            } else {
                const BEARER_TOKEN_VARIABLE_NAME = "bearer";
                statements.push(
                    ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    ts.factory.createIdentifier(BEARER_TOKEN_VARIABLE_NAME),
                                    undefined,
                                    undefined,
                                    context.base.coreUtilities.fetcher.Supplier.get(
                                        this.getReferenceToOption(
                                            GeneratedSdkClientClassImpl.BEARER_OPTION_PROPERTY_NAME
                                        )
                                    )
                                ),
                            ],
                            ts.NodeFlags.Const
                        )
                    )
                );

                statements.push(
                    ts.factory.createIfStatement(
                        ts.factory.createBinaryExpression(
                            ts.factory.createIdentifier(BEARER_TOKEN_VARIABLE_NAME),
                            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                            ts.factory.createNull()
                        ),
                        ts.factory.createBlock(
                            [
                                ts.factory.createReturnStatement(
                                    ts.factory.createTemplateExpression(ts.factory.createTemplateHead("Bearer "), [
                                        ts.factory.createTemplateSpan(
                                            ts.factory.createIdentifier(BEARER_TOKEN_VARIABLE_NAME),
                                            ts.factory.createTemplateTail("", "")
                                        ),
                                    ])
                                ),
                            ],
                            true
                        )
                    )
                );
            }
        }

        if (this.basicAuthScheme != null) {
            if (this.intermediateRepresentation.sdkConfig.isAuthMandatory) {
                statements.push(
                    ts.factory.createReturnStatement(
                        context.base.coreUtilities.auth.BasicAuth.toAuthorizationHeader(
                            context.base.coreUtilities.fetcher.Supplier.get(
                                this.getReferenceToOption(this.getBasicAuthUsernameOptionKey(this.basicAuthScheme))
                            ),
                            context.base.coreUtilities.fetcher.Supplier.get(
                                this.getReferenceToOption(this.getBasicAuthPasswordOptionKey(this.basicAuthScheme))
                            )
                        )
                    )
                );
            } else {
                const USERNAME_VARIABLE_NAME = this.basicAuthScheme.username.camelCase.unsafeName;
                const PASSWORD_VARIABLE_NAME = this.basicAuthScheme.password.camelCase.unsafeName;
                statements.push(
                    ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    USERNAME_VARIABLE_NAME,
                                    undefined,
                                    undefined,
                                    context.base.coreUtilities.fetcher.Supplier.get(
                                        this.getReferenceToOption(
                                            this.getBasicAuthUsernameOptionKey(this.basicAuthScheme)
                                        )
                                    )
                                ),
                            ],
                            ts.NodeFlags.Const
                        )
                    ),
                    ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    PASSWORD_VARIABLE_NAME,
                                    undefined,
                                    undefined,
                                    context.base.coreUtilities.fetcher.Supplier.get(
                                        this.getReferenceToOption(
                                            this.getBasicAuthPasswordOptionKey(this.basicAuthScheme)
                                        )
                                    )
                                ),
                            ],
                            ts.NodeFlags.Const
                        )
                    )
                );

                statements.push(
                    ts.factory.createIfStatement(
                        ts.factory.createBinaryExpression(
                            ts.factory.createBinaryExpression(
                                ts.factory.createIdentifier(USERNAME_VARIABLE_NAME),
                                ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                                ts.factory.createNull()
                            ),
                            ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                            ts.factory.createBinaryExpression(
                                ts.factory.createIdentifier(PASSWORD_VARIABLE_NAME),
                                ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                                ts.factory.createNull()
                            )
                        ),
                        ts.factory.createBlock(
                            [
                                ts.factory.createReturnStatement(
                                    context.base.coreUtilities.auth.BasicAuth.toAuthorizationHeader(
                                        ts.factory.createIdentifier(USERNAME_VARIABLE_NAME),
                                        ts.factory.createIdentifier(PASSWORD_VARIABLE_NAME)
                                    )
                                ),
                            ],
                            true
                        )
                    )
                );
            }
        }

        const HEADER_VARIABLE_NAME = "value";
        for (const header of this.getCustomAuthorizationHeaders()) {
            statements.push(
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                ts.factory.createIdentifier(HEADER_VARIABLE_NAME),
                                undefined,
                                undefined,
                                context.base.coreUtilities.fetcher.Supplier.get(
                                    this.getReferenceToOption(this.getKeyForCustomHeader(header))
                                )
                            ),
                        ],
                        ts.NodeFlags.Const
                    )
                )
            );

            const toAuthHeaderStatement = ts.factory.createReturnStatement(
                header.type === "authScheme" && header.header.prefix != null
                    ? ts.factory.createTemplateExpression(
                          ts.factory.createTemplateHead(`${header.header.prefix.trim()} `),
                          [
                              ts.factory.createTemplateSpan(
                                  ts.factory.createIdentifier(HEADER_VARIABLE_NAME),
                                  ts.factory.createTemplateTail("", "")
                              ),
                          ]
                      )
                    : ts.factory.createIdentifier(HEADER_VARIABLE_NAME)
            );

            if (this.intermediateRepresentation.sdkConfig.isAuthMandatory) {
                statements.push(toAuthHeaderStatement);
            } else {
                statements.push(
                    ts.factory.createIfStatement(
                        ts.factory.createBinaryExpression(
                            ts.factory.createIdentifier(HEADER_VARIABLE_NAME),
                            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                            ts.factory.createNull()
                        ),
                        ts.factory.createBlock([toAuthHeaderStatement], true)
                    )
                );
            }
        }

        if (!this.intermediateRepresentation.sdkConfig.isAuthMandatory) {
            statements.push(ts.factory.createReturnStatement(ts.factory.createIdentifier("undefined")));
        }

        return statements;
    }

    private getCustomAuthorizationHeaders(): CustomHeader[] {
        const headers: CustomHeader[] = [];

        for (const header of this.intermediateRepresentation.headers) {
            if (this.isAuthorizationHeader(header)) {
                headers.push({ type: "global", header });
            }
        }

        for (const header of this.authHeaders) {
            if (this.isAuthorizationHeader(header)) {
                headers.push({ type: "authScheme", header });
            }
        }

        return headers;
    }

    private isAuthorizationHeader(header: HttpHeader | HeaderAuthScheme): boolean {
        return header.name.wireValue.toLowerCase() === "authorization";
    }

    private getKeyForCustomHeader(header: CustomHeader): string {
        switch (header.type) {
            case "authScheme":
                return this.getOptionKeyForAuthHeader(header.header);
            case "global":
                return this.getOptionKeyForNonLiteralGlobalHeader(header.header);
            default:
                assertNever(header);
        }
    }

    public getReferenceToRootPathParameter(pathParameter: PathParameter): ts.Expression {
        return this.getReferenceToOption(getParameterNameForPathParameter(pathParameter));
    }

    public getReferenceToVariable(variableId: VariableId): ts.Expression {
        const variable = this.intermediateRepresentation.variables.find((v) => v.id === variableId);
        if (variable == null) {
            throw new Error("Variable does not exist: " + variableId);
        }
        return this.getReferenceToOption(this.getOptionNameForVariable(variable));
    }

    private getOptionNameForVariable(variable: VariableDeclaration): string {
        return variable.name.camelCase.unsafeName;
    }
}

type CustomHeader = { type: "global"; header: HttpHeader } | { type: "authScheme"; header: HeaderAuthScheme };
