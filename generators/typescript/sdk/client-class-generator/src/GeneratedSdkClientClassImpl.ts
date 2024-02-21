import { assertNever } from "@fern-api/core-utils";
import {
    AuthScheme,
    BasicAuthScheme,
    BearerAuthScheme,
    ExampleEndpointCall,
    HeaderAuthScheme,
    HttpEndpoint,
    HttpHeader,
    HttpResponse,
    IntermediateRepresentation,
    Package,
    PathParameter,
    VariableDeclaration,
    VariableId
} from "@fern-fern/ir-sdk/api";
import { getTextOfTsNode, JavaScriptRuntime, maybeAddDocs, NpmPackage, PackageId } from "@fern-typescript/commons";
import { GeneratedEndpointImplementation, GeneratedSdkClientClass, SdkContext } from "@fern-typescript/contexts";
import { ErrorResolver, PackageResolver } from "@fern-typescript/resolvers";
import { InterfaceDeclarationStructure, OptionalKind, PropertySignatureStructure, Scope, ts } from "ts-morph";
import { GeneratedDefaultEndpointRequest } from "./endpoint-request/GeneratedDefaultEndpointRequest";
import { GeneratedFileUploadEndpointRequest } from "./endpoint-request/GeneratedFileUploadEndpointRequest";
import { GeneratedNonThrowingEndpointResponse } from "./endpoints/default/endpoint-response/GeneratedNonThrowingEndpointResponse";
import { GeneratedThrowingEndpointResponse } from "./endpoints/default/endpoint-response/GeneratedThrowingEndpointResponse";
import { GeneratedDefaultEndpointImplementation } from "./endpoints/default/GeneratedDefaultEndpointImplementation";
import { GeneratedFileDownloadEndpointImplementation } from "./endpoints/GeneratedFileDownloadEndpointImplementation";
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
        defaultTimeoutInSeconds: number | "infinity" | undefined;
        npmPackage: NpmPackage | undefined;
        targetRuntime: JavaScriptRuntime;
        includeContentHeadersOnFileDownloadResponse: boolean;
        includeSerdeLayer: boolean;
    }
}

export class GeneratedSdkClientClassImpl implements GeneratedSdkClientClass {
    private static REQUEST_OPTIONS_INTERFACE_NAME = "RequestOptions";
    private static IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME = "IdempotentRequestOptions";
    private static TIMEOUT_IN_SECONDS_REQUEST_OPTION_PROPERTY_NAME = "timeoutInSeconds";
    private static MAX_RETRIES_REQUEST_OPTION_PROPERTY_NAME = "maxRetries";
    private static OPTIONS_INTERFACE_NAME = "Options";
    private static OPTIONS_PRIVATE_MEMBER = "_options";
    private static ENVIRONMENT_OPTION_PROPERTY_NAME = "environment";
    private static CUSTOM_FETCHER_PROPERTY_NAME = "fetcher";
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
    private packageId: PackageId;

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
        defaultTimeoutInSeconds,
        npmPackage,
        targetRuntime,
        includeContentHeadersOnFileDownloadResponse,
        includeSerdeLayer
    }: GeneratedSdkClientClassImpl.Init) {
        this.packageId = packageId;
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
                    if (requestBody?.type === "bytes") {
                        throw new Error("bytes is not supported");
                    }
                    if (requestBody?.type === "fileUpload") {
                        return new GeneratedFileUploadEndpointRequest({
                            ir: this.intermediateRepresentation,
                            packageId,
                            service,
                            endpoint,
                            requestBody,
                            generatedSdkClientClass: this,
                            targetRuntime: this.targetRuntime
                        });
                    } else {
                        return new GeneratedDefaultEndpointRequest({
                            ir: this.intermediateRepresentation,
                            packageId,
                            sdkRequest: endpoint.sdkRequest ?? undefined,
                            service,
                            endpoint,
                            requestBody,
                            generatedSdkClientClass: this
                        });
                    }
                };

                const getGeneratedEndpointResponse = ({
                    response
                }: {
                    response: HttpResponse.Json | HttpResponse.FileDownload | HttpResponse.Streaming | undefined;
                }) => {
                    if (neverThrowErrors) {
                        return new GeneratedNonThrowingEndpointResponse({
                            packageId,
                            endpoint,
                            errorDiscriminationStrategy: intermediateRepresentation.errorDiscriminationStrategy,
                            errorResolver,
                            response,
                            includeSerdeLayer
                        });
                    } else {
                        return new GeneratedThrowingEndpointResponse({
                            packageId,
                            endpoint,
                            errorDiscriminationStrategy: intermediateRepresentation.errorDiscriminationStrategy,
                            errorResolver,
                            response,
                            includeContentHeadersOnResponse: includeContentHeadersOnFileDownloadResponse
                        });
                    }
                };

                const getDefaultEndpointImplementation = ({
                    response
                }: {
                    response: HttpResponse.Json | HttpResponse.FileDownload | undefined;
                }) => {
                    return new GeneratedDefaultEndpointImplementation({
                        endpoint,
                        request: getGeneratedEndpointRequest(),
                        response: getGeneratedEndpointResponse({ response }),
                        generatedSdkClientClass: this,
                        includeCredentialsOnCrossOriginRequests,
                        defaultTimeoutInSeconds,
                        includeSerdeLayer
                    });
                };

                if (endpoint.response == null) {
                    return getDefaultEndpointImplementation({ response: undefined });
                }

                return HttpResponse._visit<GeneratedEndpointImplementation>(endpoint.response, {
                    fileDownload: (fileDownload) =>
                        new GeneratedFileDownloadEndpointImplementation({
                            endpoint,
                            generatedSdkClientClass: this,
                            includeCredentialsOnCrossOriginRequests,
                            defaultTimeoutInSeconds,
                            request: getGeneratedEndpointRequest(),
                            response: getGeneratedEndpointResponse({
                                response: HttpResponse.fileDownload(fileDownload)
                            }),
                            includeSerdeLayer
                        }),
                    json: (jsonResponse) =>
                        getDefaultEndpointImplementation({
                            response: HttpResponse.json(jsonResponse)
                        }),
                    streaming: (streamingResponse) =>
                        new GeneratedStreamingEndpointImplementation({
                            packageId,
                            endpoint,
                            generatedSdkClientClass: this,
                            includeCredentialsOnCrossOriginRequests,
                            response: getGeneratedEndpointResponse({
                                response: HttpResponse.streaming(streamingResponse)
                            }),
                            defaultTimeoutInSeconds,
                            request: getGeneratedEndpointRequest(),
                            includeSerdeLayer
                        }),
                    text: () => {
                        throw new Error("Text responses are unsupported");
                    },
                    _other: () => {
                        throw new Error("Unknown Response type: " + endpoint.response?.type);
                    }
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
                            wrapperService: this
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
                _other: () => {
                    throw new Error("Unknown auth scheme: " + authScheme.type);
                }
            });
        }
    }

    public invokeEndpoint(args: {
        context: SdkContext;
        endpointId: string;
        example: ExampleEndpointCall;
        clientReference: ts.Identifier;
    }): ts.Expression | undefined {
        const generatedEndpoint = this.generatedEndpointImplementations.find((generatedEndpoint) => {
            return generatedEndpoint.endpoint.id === args.endpointId;
        });
        if (generatedEndpoint == null) {
            return undefined;
        }
        return generatedEndpoint.getExample({
            ...args,
            opts: {}
        });
    }

    public getEndpoint(args: { context: SdkContext; endpointId: string }): GeneratedEndpointImplementation | undefined {
        const generatedEndpoint = this.generatedEndpointImplementations.find((generatedEndpoint) => {
            return generatedEndpoint.endpoint.id === args.endpointId;
        });
        return generatedEndpoint;
    }

    public accessFromRootClient(args: { referenceToRootClient: ts.Expression }): ts.Expression {
        return [...this.package_.fernFilepath.allParts].reduce<ts.Expression>(
            (acc, part) => ts.factory.createPropertyAccessExpression(acc, part.camelCase.unsafeName),
            args.referenceToRootClient
        );
    }

    public instantiate({
        referenceToClient,
        referenceToOptions
    }: {
        referenceToClient: ts.Expression;
        referenceToOptions: ts.Expression;
    }): ts.Expression {
        return ts.factory.createNewExpression(referenceToClient, undefined, [referenceToOptions]);
    }

    public instantiateAsRoot(args: { context: SdkContext; npmPackage: NpmPackage }): ts.Expression {
        const rootSdkClientName = args.context.sdkClientClass.getReferenceToClientClass(this.packageId, {
            npmPackage: args.npmPackage
        });
        const optionsProperties = this.getOptionsPropertiesForSnippet(args.context);
        return ts.factory.createNewExpression(
            rootSdkClientName.getExpression(),
            undefined,
            optionsProperties.length > 0 ? [ts.factory.createObjectLiteralExpression(optionsProperties)] : undefined
        );
    }

    public writeToFile(context: SdkContext): void {
        const serviceModule = context.sourceFile.addModule({
            name: this.serviceClassName,
            isExported: true,
            hasDeclareKeyword: true
        });

        const optionsInterface = serviceModule.addInterface(this.generateOptionsInterface(context));
        serviceModule.addInterface(this.generateRequestOptionsInterface());

        const serviceClass = context.sourceFile.addClass({
            name: this.serviceClassName,
            isExported: true
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
                    initializer: optionsInterface.getProperties().every((property) => property.hasQuestionToken())
                        ? "{}"
                        : undefined
                }
            ]
        });

        let isIdempotent = false;

        for (const endpoint of this.generatedEndpointImplementations) {
            const signature = endpoint.getSignature(context);
            const docs = endpoint.getDocs(context);
            const overloads = endpoint.getOverloads(context);

            if (!isIdempotent && endpoint.endpoint.idempotent) {
                isIdempotent = true;
            }

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
                    )
                }))
            });

            if (overloads.length === 0) {
                maybeAddDocs(method, docs);
            }
        }

        if (isIdempotent) {
            serviceModule.addInterface(this.generateIdempotentRequestOptionsInterface(context));
        }

        for (const wrappedService of this.generatedWrappedServices) {
            wrappedService.addToServiceClass(serviceClass, context);
        }

        if (this.shouldGenerateAuthorizationHeaderHelperMethod()) {
            serviceClass.addMethod({
                scope: Scope.Protected,
                isAsync: true,
                name: GeneratedSdkClientClassImpl.AUTHORIZATION_HEADER_HELPER_METHOD_NAME,
                statements: this.getAuthorizationHeaderStatements(context).map(getTextOfTsNode)
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

    public getEnvironment(endpoint: HttpEndpoint, context: SdkContext): ts.Expression {
        let referenceToEnvironmentValue = this.getReferenceToEnvironment(context);

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
            baseUrlId: endpoint.baseUrl ?? undefined
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

    public getHeaders(context: SdkContext): GeneratedHeader[] {
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
                                ? ts.factory.createStringLiteral(literalValue.toString())
                                : context.type.stringify(
                                      context.coreUtilities.fetcher.Supplier.get(
                                          this.getReferenceToOption(this.getOptionKeyForNonLiteralHeader(header))
                                      ),
                                      header.valueType,
                                      { includeNullCheckIfOptional: true }
                                  )
                    };
                }),
            ...this.authHeaders
                .filter((header) => !this.isAuthorizationHeader(header))
                .map((header) => ({
                    header: header.name.wireValue,
                    value: context.coreUtilities.fetcher.Supplier.get(
                        this.getReferenceToOption(this.getOptionKeyForAuthHeader(header))
                    )
                })),
            {
                header: this.intermediateRepresentation.sdkConfig.platformHeaders.language,
                value: ts.factory.createStringLiteral("JavaScript")
            }
        ];

        if (this.npmPackage != null) {
            headers.push(
                {
                    header: this.intermediateRepresentation.sdkConfig.platformHeaders.sdkName,
                    value: ts.factory.createStringLiteral(this.npmPackage.packageName)
                },
                {
                    header: this.intermediateRepresentation.sdkConfig.platformHeaders.sdkVersion,
                    value: ts.factory.createStringLiteral(this.npmPackage.version)
                }
            );
        }

        headers.push(
            {
                header: "X-Fern-Runtime",
                value: context.coreUtilities.runtime.type._getReferenceTo()
            },
            {
                header: "X-Fern-Runtime-Version",
                value: context.coreUtilities.runtime.version._getReferenceTo()
            }
        );

        return headers;
    }

    /*******************
     * REQUEST OPTIONS *
     *******************/

    private generateRequestOptionsInterface(): OptionalKind<InterfaceDeclarationStructure> {
        return {
            name: GeneratedSdkClientClassImpl.REQUEST_OPTIONS_INTERFACE_NAME,
            properties: [
                {
                    name: GeneratedSdkClientClassImpl.TIMEOUT_IN_SECONDS_REQUEST_OPTION_PROPERTY_NAME,
                    type: getTextOfTsNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)),
                    hasQuestionToken: true
                },
                {
                    name: GeneratedSdkClientClassImpl.MAX_RETRIES_REQUEST_OPTION_PROPERTY_NAME,
                    type: getTextOfTsNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)),
                    hasQuestionToken: true
                }
            ]
        };
    }

    /******************************
     * IDEMPOTENT REQUEST OPTIONS *
     ******************************/

    private generateIdempotentRequestOptionsInterface(
        context: SdkContext
    ): OptionalKind<InterfaceDeclarationStructure> {
        const properties: OptionalKind<PropertySignatureStructure>[] = [];
        for (const header of this.intermediateRepresentation.idempotencyHeaders) {
            if (!isLiteralHeader(header, context)) {
                const type = context.type.getReferenceToType(header.valueType);
                properties.push({
                    name: this.getOptionKeyForNonLiteralHeader(header),
                    type: getTextOfTsNode(type.typeNode),
                    hasQuestionToken: type.isOptional
                });
            }
        }
        return {
            name: GeneratedSdkClientClassImpl.IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME,
            extends: [GeneratedSdkClientClassImpl.REQUEST_OPTIONS_INTERFACE_NAME],
            properties
        };
    }

    /***********
     * OPTIONS *
     ***********/

    public getOptionsPropertiesForSnippet(context: SdkContext): ts.ObjectLiteralElementLike[] {
        const properties: ts.ObjectLiteralElementLike[] = [];

        if (this.bearerAuthScheme != null) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    this.getBearerAuthOptionKey(this.bearerAuthScheme),
                    ts.factory.createStringLiteral(`YOUR_${this.bearerAuthScheme.token.screamingSnakeCase.unsafeName}`)
                )
            );
        }

        if (this.basicAuthScheme != null) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    this.getBasicAuthUsernameOptionKey(this.basicAuthScheme),
                    ts.factory.createStringLiteral(
                        `YOUR_${this.basicAuthScheme.username.screamingSnakeCase.unsafeName}`
                    )
                )
            );
            properties.push(
                ts.factory.createPropertyAssignment(
                    this.getBasicAuthPasswordOptionKey(this.basicAuthScheme),
                    ts.factory.createStringLiteral(
                        `YOUR_${this.basicAuthScheme.password.screamingSnakeCase.unsafeName}`
                    )
                )
            );
        }

        for (const header of this.authHeaders) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    this.getOptionKeyForAuthHeader(header),
                    ts.factory.createStringLiteral(`YOUR_${header.name.name.screamingSnakeCase.unsafeName}`)
                )
            );
        }

        for (const header of this.intermediateRepresentation.headers) {
            if (!isLiteralHeader(header, context)) {
                properties.push(
                    ts.factory.createPropertyAssignment(
                        this.getOptionKeyForNonLiteralHeader(header),
                        ts.factory.createStringLiteral(`YOUR_${header.name.name.screamingSnakeCase.unsafeName}`)
                    )
                );
            }
        }

        return properties;
    }

    private generateOptionsInterface(context: SdkContext): OptionalKind<InterfaceDeclarationStructure> {
        const properties: OptionalKind<PropertySignatureStructure>[] = [];

        if (!this.requireDefaultEnvironment) {
            const generatedEnvironments = context.environments.getGeneratedEnvironments();
            properties.push({
                name: GeneratedSdkClientClassImpl.ENVIRONMENT_OPTION_PROPERTY_NAME,
                type: getTextOfTsNode(
                    context.coreUtilities.fetcher.Supplier._getReferenceToType(
                        generatedEnvironments.getTypeForUserSuppliedEnvironment(context)
                    )
                ),
                hasQuestionToken: generatedEnvironments.hasDefaultEnvironment()
            });
        }

        for (const variable of this.intermediateRepresentation.variables) {
            const variableType = context.type.getReferenceToType(variable.type);
            properties.push({
                name: this.getOptionNameForVariable(variable),
                type: getTextOfTsNode(variableType.typeNodeWithoutUndefined),
                hasQuestionToken: variableType.isOptional
            });
        }

        for (const pathParameter of getNonVariablePathParameters(this.intermediateRepresentation.pathParameters)) {
            properties.push({
                name: getParameterNameForPathParameter(pathParameter),
                type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode)
            });
        }

        if (this.bearerAuthScheme != null) {
            properties.push({
                name: this.getBearerAuthOptionKey(this.bearerAuthScheme),
                type: getTextOfTsNode(
                    context.coreUtilities.fetcher.Supplier._getReferenceToType(
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
                    name: this.getBasicAuthUsernameOptionKey(this.basicAuthScheme),
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
                    name: this.getBasicAuthPasswordOptionKey(this.basicAuthScheme),
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
                referenceToHeaderType.isOptional || !this.intermediateRepresentation.sdkConfig.isAuthMandatory;
            properties.push({
                name: this.getOptionKeyForAuthHeader(header),
                type: getTextOfTsNode(
                    context.coreUtilities.fetcher.Supplier._getReferenceToType(
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
            if (!isLiteralHeader(header, context)) {
                const type = context.type.getReferenceToType(header.valueType);
                properties.push({
                    name: this.getOptionKeyForNonLiteralHeader(header),
                    type: getTextOfTsNode(context.coreUtilities.fetcher.Supplier._getReferenceToType(type.typeNode)),
                    hasQuestionToken: type.isOptional
                });
            }
        }

        if (this.allowCustomFetcher) {
            properties.push({
                name: GeneratedSdkClientClassImpl.CUSTOM_FETCHER_PROPERTY_NAME,
                type: getTextOfTsNode(context.coreUtilities.fetcher.FetchFunction._getReferenceToType()),
                hasQuestionToken: true
            });
        }

        return {
            name: GeneratedSdkClientClassImpl.OPTIONS_INTERFACE_NAME,
            properties
        };
    }

    private getBearerAuthOptionKey(bearerAuthScheme: BearerAuthScheme): string {
        return bearerAuthScheme.token.camelCase.safeName;
    }

    private getBasicAuthUsernameOptionKey(basicAuthScheme: BasicAuthScheme): string {
        return basicAuthScheme.username.camelCase.safeName;
    }

    private getBasicAuthPasswordOptionKey(basicAuthScheme: BasicAuthScheme): string {
        return basicAuthScheme.password.camelCase.safeName;
    }

    private getReferenceToEnvironment(context: SdkContext): ts.Expression {
        return context.coreUtilities.fetcher.Supplier.get(
            this.getReferenceToOption(GeneratedSdkClientClassImpl.ENVIRONMENT_OPTION_PROPERTY_NAME)
        );
    }

    public getReferenceToRequestOptions(endpoint: HttpEndpoint): ts.TypeReferenceNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                ts.factory.createIdentifier(this.serviceClassName),
                ts.factory.createIdentifier(
                    endpoint.idempotent
                        ? GeneratedSdkClientClassImpl.IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME
                        : GeneratedSdkClientClassImpl.REQUEST_OPTIONS_INTERFACE_NAME
                )
            )
        );
    }

    public getReferenceToTimeoutInSeconds({
        referenceToRequestOptions,
        isNullable
    }: {
        referenceToRequestOptions: ts.Expression;
        isNullable: boolean;
    }): ts.Expression {
        return isNullable
            ? ts.factory.createPropertyAccessChain(
                  referenceToRequestOptions,
                  ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                  ts.factory.createIdentifier(
                      GeneratedSdkClientClassImpl.TIMEOUT_IN_SECONDS_REQUEST_OPTION_PROPERTY_NAME
                  )
              )
            : ts.factory.createPropertyAccessExpression(
                  referenceToRequestOptions,
                  ts.factory.createIdentifier(
                      GeneratedSdkClientClassImpl.TIMEOUT_IN_SECONDS_REQUEST_OPTION_PROPERTY_NAME
                  )
              );
    }

    public getReferenceToMaxRetries({
        referenceToRequestOptions,
        isNullable
    }: {
        referenceToRequestOptions: ts.Expression;
        isNullable: boolean;
    }): ts.Expression {
        return isNullable
            ? ts.factory.createPropertyAccessChain(
                  referenceToRequestOptions,
                  ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                  ts.factory.createIdentifier(GeneratedSdkClientClassImpl.MAX_RETRIES_REQUEST_OPTION_PROPERTY_NAME)
              )
            : ts.factory.createPropertyAccessExpression(
                  referenceToRequestOptions,
                  ts.factory.createIdentifier(GeneratedSdkClientClassImpl.MAX_RETRIES_REQUEST_OPTION_PROPERTY_NAME)
              );
    }

    public getReferenceToOptions(): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
        );
    }

    public getReferenceToFetcher(context: SdkContext): ts.Expression {
        if (this.allowCustomFetcher) {
            return ts.factory.createBinaryExpression(
                this.getReferenceToOption(GeneratedSdkClientClassImpl.CUSTOM_FETCHER_PROPERTY_NAME),
                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                context.coreUtilities.fetcher.fetcher._getReferenceTo()
            );
        } else {
            return context.coreUtilities.fetcher.fetcher._getReferenceTo();
        }
    }

    private getReferenceToOption(option: string): ts.Expression {
        return ts.factory.createPropertyAccessExpression(this.getReferenceToOptions(), option);
    }

    private getOptionKeyForNonLiteralHeader(header: HttpHeader): string {
        return header.name.name.camelCase.unsafeName;
    }

    private getOptionKeyForAuthHeader(header: HeaderAuthScheme): string {
        return header.name.name.camelCase.unsafeName;
    }

    private getAuthorizationHeaderStatements(context: SdkContext): ts.Statement[] {
        const statements: ts.Statement[] = [];

        if (this.bearerAuthScheme != null) {
            if (
                this.intermediateRepresentation.sdkConfig.isAuthMandatory &&
                this.bearerAuthScheme.tokenEnvVar != null
            ) {
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
                                    ts.factory.createBinaryExpression(
                                        ts.factory.createParenthesizedExpression(
                                            context.coreUtilities.fetcher.Supplier.get(
                                                this.getReferenceToOption(
                                                    this.getBearerAuthOptionKey(this.bearerAuthScheme)
                                                )
                                            )
                                        ),
                                        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                        ts.factory.createElementAccessExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createIdentifier("process"),
                                                ts.factory.createIdentifier("env")
                                            ),
                                            ts.factory.createStringLiteral(this.bearerAuthScheme.tokenEnvVar)
                                        )
                                    )
                                )
                            ],
                            ts.NodeFlags.Const
                        )
                    )
                );

                statements.push(
                    ts.factory.createIfStatement(
                        ts.factory.createBinaryExpression(
                            ts.factory.createIdentifier(BEARER_TOKEN_VARIABLE_NAME),
                            ts.factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
                            ts.factory.createNull()
                        ),
                        ts.factory.createBlock(
                            [
                                ts.factory.createThrowStatement(
                                    context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                                        message: ts.factory.createStringLiteral(
                                            `Please specify ${this.bearerAuthScheme.tokenEnvVar} when instantiating the client.`
                                        ),
                                        statusCode: undefined,
                                        responseBody: undefined
                                    })
                                )
                            ],
                            true
                        )
                    )
                );

                statements.push(
                    ts.factory.createReturnStatement(
                        ts.factory.createTemplateExpression(ts.factory.createTemplateHead("Bearer "), [
                            ts.factory.createTemplateSpan(
                                ts.factory.createIdentifier(BEARER_TOKEN_VARIABLE_NAME),
                                ts.factory.createTemplateTail("", "")
                            )
                        ])
                    )
                );
            } else if (this.intermediateRepresentation.sdkConfig.isAuthMandatory) {
                statements.push(
                    ts.factory.createReturnStatement(
                        ts.factory.createTemplateExpression(ts.factory.createTemplateHead("Bearer "), [
                            ts.factory.createTemplateSpan(
                                context.coreUtilities.fetcher.Supplier.get(
                                    this.getReferenceToOption(this.getBearerAuthOptionKey(this.bearerAuthScheme))
                                ),
                                ts.factory.createTemplateTail("", "")
                            )
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
                                    context.coreUtilities.fetcher.Supplier.get(
                                        this.getReferenceToOption(this.getBearerAuthOptionKey(this.bearerAuthScheme))
                                    )
                                )
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
                                        )
                                    ])
                                )
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
                        context.coreUtilities.auth.BasicAuth.toAuthorizationHeader(
                            context.coreUtilities.fetcher.Supplier.get(
                                this.getReferenceToOption(this.getBasicAuthUsernameOptionKey(this.basicAuthScheme))
                            ),
                            context.coreUtilities.fetcher.Supplier.get(
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
                                    context.coreUtilities.fetcher.Supplier.get(
                                        this.getReferenceToOption(
                                            this.getBasicAuthUsernameOptionKey(this.basicAuthScheme)
                                        )
                                    )
                                )
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
                                    context.coreUtilities.fetcher.Supplier.get(
                                        this.getReferenceToOption(
                                            this.getBasicAuthPasswordOptionKey(this.basicAuthScheme)
                                        )
                                    )
                                )
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
                                    context.coreUtilities.auth.BasicAuth.toAuthorizationHeader(
                                        ts.factory.createIdentifier(USERNAME_VARIABLE_NAME),
                                        ts.factory.createIdentifier(PASSWORD_VARIABLE_NAME)
                                    )
                                )
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
                                context.coreUtilities.fetcher.Supplier.get(
                                    this.getReferenceToOption(this.getKeyForCustomHeader(header))
                                )
                            )
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
                              )
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
                return this.getOptionKeyForNonLiteralHeader(header.header);
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
