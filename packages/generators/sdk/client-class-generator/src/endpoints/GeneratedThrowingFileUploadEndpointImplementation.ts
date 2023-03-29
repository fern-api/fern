import {
    FileProperty,
    FileUploadRequestProperty,
    HttpEndpoint,
    HttpRequestBody,
    HttpService,
    PathParameter,
    ResponseError,
} from "@fern-fern/ir-model/http";
import { ErrorDiscriminationByPropertyStrategy, ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { Fetcher, getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import { GeneratedSdkEndpointTypeSchemas, SdkClientClassContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { GeneratedHeader } from "../GeneratedHeader";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { FileUploadRequestParameter } from "../request-parameter/FileUploadRequestParameter";
import { EndpointSignature } from "./GeneratedEndpointImplementation";
import { buildUrl } from "./utils/buildUrl";
import { getParameterNameForPathParameter } from "./utils/getParameterNameForPathParameter";

export declare namespace GeneratedThrowingFileUploadEndpointImplementation {
    export interface Init {
        packageId: PackageId;
        service: HttpService;
        endpoint: HttpEndpoint;
        requestBody: HttpRequestBody.FileUpload;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    }
}

export class GeneratedThrowingFileUploadEndpointImplementation
    implements GeneratedThrowingFileUploadEndpointImplementation
{
    private static RESPONSE_VARIABLE_NAME = "_response";
    private static QUERY_PARAMS_VARIABLE_NAME = "_queryParams";
    private static FORM_DATA_VARIABLE_NAME = "_request";

    public readonly endpoint: HttpEndpoint;
    private packageId: PackageId;
    private service: HttpService;
    private generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private requestParameter: FileUploadRequestParameter;
    private requestBody: HttpRequestBody.FileUpload;
    private includeCredentialsOnCrossOriginRequests: boolean;
    private errorResolver: ErrorResolver;
    private errorDiscriminationStrategy: ErrorDiscriminationStrategy;

    constructor({
        packageId,
        service,
        endpoint,
        requestBody,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
        errorDiscriminationStrategy,
        errorResolver,
    }: GeneratedThrowingFileUploadEndpointImplementation.Init) {
        this.packageId = packageId;
        this.service = service;
        this.endpoint = endpoint;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;
        this.errorResolver = errorResolver;
        this.errorDiscriminationStrategy = errorDiscriminationStrategy;
        this.requestBody = requestBody;

        if (this.endpoint.sdkRequest == null) {
            throw new Error("SdkRequest is not defined for file upload endpoint");
        }
        if (this.endpoint.sdkRequest.shape.type != "wrapper") {
            throw new Error("SdkRequest is not a wrapper for file upload endpoint");
        }
        this.requestParameter = new FileUploadRequestParameter({
            packageId,
            service,
            endpoint,
            sdkRequest: this.endpoint.sdkRequest,
        });
    }

    public getOverloads(): EndpointSignature[] {
        return [];
    }

    public getSignature(
        context: SdkClientClassContext,
        { requestBodyIntersection }: { requestBodyIntersection?: ts.TypeNode } = {}
    ): EndpointSignature {
        return {
            parameters: this.getEndpointParameters(context, { requestBodyIntersection }),
            returnTypeWithoutPromise: this.getResponseType(context),
        };
    }

    public getDocs(context: SdkClientClassContext): string | undefined {
        const lines: string[] = [];
        if (this.endpoint.docs != null) {
            lines.push(this.endpoint.docs);
        }

        for (const error of this.endpoint.errors) {
            const referenceToError = context.sdkError
                .getReferenceToError(error.error)
                .getExpression({ isForComment: true });
            lines.push(`@throws {${getTextOfTsNode(referenceToError)}}`);
        }

        if (lines.length === 0) {
            return undefined;
        }

        return lines.join("\n");
    }

    private getEndpointParameters(
        context: SdkClientClassContext,
        { requestBodyIntersection }: { requestBodyIntersection: ts.TypeNode | undefined }
    ): OptionalKind<ParameterDeclarationStructure>[] {
        const parameters: OptionalKind<ParameterDeclarationStructure>[] = [];
        for (const property of this.requestBody.properties) {
            if (property.type === "file") {
                parameters.push({
                    name: this.getParameterNameForFile(property),
                    type: getTextOfTsNode(this.getFileParameterType(property, context)),
                });
            }
        }
        for (const pathParameter of this.getAllPathParameters()) {
            parameters.push({
                name: getParameterNameForPathParameter(pathParameter),
                type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode),
            });
        }
        parameters.push(
            this.requestParameter.getParameterDeclaration(context, { typeIntersection: requestBodyIntersection })
        );
        return parameters;
    }

    private getFileParameterType(property: FileProperty, context: SdkClientClassContext): ts.TypeNode {
        const types = [
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("File"), undefined),
            context.base.externalDependencies.fs.ReadStream._getReferenceToType(),
        ];
        if (property.isOptional) {
            types.push(ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword));
        }
        return ts.factory.createUnionTypeNode(types);
    }

    private getAllPathParameters(): PathParameter[] {
        return [...this.service.pathParameters, ...this.endpoint.pathParameters];
    }

    private getParameterNameForFile(file: FileProperty): string {
        return file.key.name.camelCase.unsafeName;
    }

    public getStatements(context: SdkClientClassContext): ts.Statement[] {
        const statements: ts.Statement[] = [];

        let urlSearchParamsVariable: ts.Expression | undefined;
        statements.push(...this.requestParameter.getInitialStatements());
        const queryParameters = this.requestParameter.getAllQueryParameters(context);
        if (queryParameters.length > 0) {
            statements.push(
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                GeneratedThrowingFileUploadEndpointImplementation.QUERY_PARAMS_VARIABLE_NAME,
                                undefined,
                                undefined,
                                ts.factory.createNewExpression(
                                    ts.factory.createIdentifier("URLSearchParams"),
                                    undefined,
                                    []
                                )
                            ),
                        ],
                        ts.NodeFlags.Const
                    )
                )
            );
            for (const queryParameter of queryParameters) {
                statements.push(
                    ...this.requestParameter.withQueryParameter(
                        queryParameter,
                        context,
                        (referenceToQueryParameter) => {
                            return [
                                ts.factory.createExpressionStatement(
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier(
                                                GeneratedThrowingFileUploadEndpointImplementation.QUERY_PARAMS_VARIABLE_NAME
                                            ),
                                            ts.factory.createIdentifier("append")
                                        ),
                                        undefined,
                                        [
                                            ts.factory.createStringLiteral(queryParameter.name.wireValue),
                                            context.type.stringify(referenceToQueryParameter, queryParameter.valueType),
                                        ]
                                    )
                                ),
                            ];
                        }
                    )
                );
            }
            urlSearchParamsVariable = ts.factory.createIdentifier(
                GeneratedThrowingFileUploadEndpointImplementation.QUERY_PARAMS_VARIABLE_NAME
            );
        }

        statements.push(
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            GeneratedThrowingFileUploadEndpointImplementation.FORM_DATA_VARIABLE_NAME,
                            undefined,
                            undefined,
                            context.base.externalDependencies.formData._instantiate()
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            )
        );
        for (const property of this.requestBody.properties) {
            statements.push(this.addPropertyToFormData(property, context));
        }

        const fetcherArgs: Fetcher.Args = {
            url: this.getReferenceToEnvironment(context),
            method: ts.factory.createStringLiteral(this.endpoint.method),
            headers: this.getHeaders(context),
            queryParameters: urlSearchParamsVariable,
            body: ts.factory.createIdentifier(
                GeneratedThrowingFileUploadEndpointImplementation.FORM_DATA_VARIABLE_NAME
            ),
            timeoutMs: undefined,
            withCredentials: this.includeCredentialsOnCrossOriginRequests,
            contentType: "multipart/form-data",
        };

        statements.push(...this.invokeFetcher(fetcherArgs, context));

        statements.push(...this.getReturnResponseStatements(context));

        return statements;
    }

    private getReferenceToEnvironment(context: SdkClientClassContext): ts.Expression {
        const referenceToEnvironment = this.generatedSdkClientClass.getEnvironment(context);
        const url = buildUrl({ endpoint: this.endpoint, generatedClientClass: this.generatedSdkClientClass, context });
        if (url != null) {
            return context.base.externalDependencies.urlJoin.invoke([referenceToEnvironment, url]);
        } else {
            return referenceToEnvironment;
        }
    }

    private addPropertyToFormData(property: FileUploadRequestProperty, context: SdkClientClassContext): ts.Statement {
        return FileUploadRequestProperty._visit(property, {
            file: (property) => {
                return context.base.externalDependencies.formData.append({
                    referencetoFormData: ts.factory.createIdentifier(
                        GeneratedThrowingFileUploadEndpointImplementation.FORM_DATA_VARIABLE_NAME
                    ),
                    key: property.key.wireValue,
                    value: {
                        expression: ts.factory.createIdentifier(this.getParameterNameForFile(property)),
                        nullCheck: property.isOptional
                            ? {
                                  expressionToCheck: undefined,
                              }
                            : undefined,
                    },
                });
            },
            bodyProperty: (property) => {
                return context.base.externalDependencies.formData.append({
                    referencetoFormData: ts.factory.createIdentifier(
                        GeneratedThrowingFileUploadEndpointImplementation.FORM_DATA_VARIABLE_NAME
                    ),
                    key: property.name.wireValue,
                    value: {
                        expression: context.type.stringify(
                            this.requestParameter.getReferenceToBodyProperty(property, context),
                            property.valueType
                        ),
                        nullCheck: context.type.getReferenceToType(property.valueType).isOptional
                            ? {
                                  expressionToCheck: this.requestParameter.getReferenceToBodyProperty(
                                      property,
                                      context
                                  ),
                              }
                            : undefined,
                    },
                });
            },
            _unknown: () => {
                throw new Error("Unknown addPropertyToFormData: " + property.type);
            },
        });
    }

    private getHeaders(context: SdkClientClassContext): ts.ObjectLiteralElementLike[] {
        const elements: GeneratedHeader[] = [];

        const authorizationHederValue = this.generatedSdkClientClass.getAuthorizationHeaderValue();
        if (authorizationHederValue != null) {
            elements.push({
                header: "Authorization",
                value: authorizationHederValue,
            });
        }

        elements.push(...this.generatedSdkClientClass.getApiHeaders(context));

        for (const header of this.requestParameter.getAllHeaders(context)) {
            elements.push({
                header: header.name.wireValue,
                value: this.requestParameter.getReferenceToHeader(header, context),
            });
        }

        return elements.map(({ header, value }) =>
            ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(header), value)
        );
    }

    private getReturnResponseStatements(context: SdkClientClassContext): ts.Statement[] {
        return [this.getReturnResponseIfOk(context), ...this.getReturnFailedResponse(context)];
    }

    private getReturnResponseIfOk(context: SdkClientClassContext): ts.Statement {
        return ts.factory.createIfStatement(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedThrowingFileUploadEndpointImplementation.RESPONSE_VARIABLE_NAME),
                ts.factory.createIdentifier("ok")
            ),
            ts.factory.createBlock([ts.factory.createReturnStatement(this.getReturnValueForOkResponse(context))], true)
        );
    }

    private getOkResponseBody(context: SdkClientClassContext): ts.Expression {
        const generatedEndpointTypeSchemas = this.getGeneratedEndpointTypeSchemas(context);
        return generatedEndpointTypeSchemas.deserializeResponse(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedThrowingFileUploadEndpointImplementation.RESPONSE_VARIABLE_NAME),
                context.base.coreUtilities.fetcher.APIResponse.SuccessfulResponse.body
            ),
            context
        );
    }

    private getReferenceToError(context: SdkClientClassContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(GeneratedThrowingFileUploadEndpointImplementation.RESPONSE_VARIABLE_NAME),
            context.base.coreUtilities.fetcher.APIResponse.FailedResponse.error
        );
    }

    private getReferenceToErrorBody(context: SdkClientClassContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            this.getReferenceToError(context),
            context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.body
        );
    }

    private invokeFetcher(fetcherArgs: Fetcher.Args, context: SdkClientClassContext): ts.Statement[] {
        return [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            GeneratedThrowingFileUploadEndpointImplementation.RESPONSE_VARIABLE_NAME,
                            undefined,
                            undefined,
                            context.base.coreUtilities.fetcher.fetcher._invoke(fetcherArgs, {
                                referenceToFetcher: this.generatedSdkClientClass.getReferenceToFetcher(context),
                            })
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            ),
        ];
    }

    private getResponseType(context: SdkClientClassContext): ts.TypeNode {
        return this.endpoint.response != null
            ? context.type.getReferenceToType(this.endpoint.response.responseBodyType).typeNode
            : ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
    }

    private getReturnFailedResponse(context: SdkClientClassContext): ts.Statement[] {
        return [...this.getThrowsForStatusCodeErrors(context), ...this.getThrowsForNonStatusCodeErrors(context)];
    }

    private getThrowsForStatusCodeErrors(context: SdkClientClassContext): ts.Statement[] {
        const referenceToError = this.getReferenceToError(context);
        const referenceToErrorBody = this.getReferenceToErrorBody(context);

        const defaultThrow = ts.factory.createThrowStatement(
            context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                message: undefined,
                statusCode: ts.factory.createPropertyAccessExpression(
                    referenceToError,
                    context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.statusCode
                ),
                responseBody: ts.factory.createPropertyAccessExpression(
                    referenceToError,
                    context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.body
                ),
            })
        );

        return [
            ts.factory.createIfStatement(
                ts.factory.createBinaryExpression(
                    ts.factory.createPropertyAccessExpression(
                        referenceToError,
                        context.base.coreUtilities.fetcher.Fetcher.Error.reason
                    ),
                    ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                    ts.factory.createStringLiteral(
                        context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError._reasonLiteralValue
                    )
                ),
                ts.factory.createBlock(
                    [
                        this.endpoint.errors.length > 0
                            ? this.getSwitchStatementForErrors({
                                  context,
                                  generateCaseBody: (error) => {
                                      const generatedSdkError = context.sdkError.getGeneratedSdkError(error.error);
                                      if (generatedSdkError?.type !== "class") {
                                          throw new Error("Cannot throw error because it's not a class");
                                      }
                                      const generatedSdkErrorSchema = context.sdkErrorSchema.getGeneratedSdkErrorSchema(
                                          error.error
                                      );
                                      return [
                                          ts.factory.createThrowStatement(
                                              generatedSdkError.build(context, {
                                                  referenceToBody:
                                                      generatedSdkErrorSchema != null
                                                          ? generatedSdkErrorSchema.deserializeBody(context, {
                                                                referenceToBody: referenceToErrorBody,
                                                            })
                                                          : undefined,
                                              })
                                          ),
                                      ];
                                  },
                                  defaultBody: [defaultThrow],
                              })
                            : defaultThrow,
                    ],
                    true
                )
            ),
        ];
    }

    private getSwitchStatementForErrors({
        context,
        generateCaseBody,
        defaultBody,
    }: {
        context: SdkClientClassContext;
        generateCaseBody: (responseError: ResponseError) => ts.Statement[];
        defaultBody: ts.Statement[];
    }) {
        return ErrorDiscriminationStrategy._visit(this.errorDiscriminationStrategy, {
            property: (propertyErrorDiscriminationStrategy) =>
                this.getSwitchStatementForPropertyDiscriminatedErrors({
                    context,
                    propertyErrorDiscriminationStrategy,
                    generateCaseBody,
                    defaultBody,
                }),
            statusCode: () =>
                this.getSwitchStatementForStatusCodeDiscriminatedErrors({
                    context,
                    generateCaseBody,
                    defaultBody,
                }),
            _unknown: () => {
                throw new Error("Unknown ErrorDiscriminationStrategy: " + this.errorDiscriminationStrategy.type);
            },
        });
    }

    private getSwitchStatementForPropertyDiscriminatedErrors({
        context,
        propertyErrorDiscriminationStrategy,
        generateCaseBody,
        defaultBody,
    }: {
        context: SdkClientClassContext;
        propertyErrorDiscriminationStrategy: ErrorDiscriminationByPropertyStrategy;
        generateCaseBody: (responseError: ResponseError) => ts.Statement[];
        defaultBody: ts.Statement[];
    }) {
        return ts.factory.createSwitchStatement(
            ts.factory.createElementAccessChain(
                ts.factory.createAsExpression(
                    this.getReferenceToErrorBody(context),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                ),
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                ts.factory.createStringLiteral(propertyErrorDiscriminationStrategy.discriminant.wireValue)
            ),
            ts.factory.createCaseBlock([
                ...this.endpoint.errors.map((error) =>
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.sdkError.getErrorDeclaration(error.error).discriminantValue.wireValue
                        ),
                        generateCaseBody(error)
                    )
                ),
                ts.factory.createDefaultClause(defaultBody),
            ])
        );
    }

    private getSwitchStatementForStatusCodeDiscriminatedErrors({
        context,
        generateCaseBody,
        defaultBody,
    }: {
        context: SdkClientClassContext;
        generateCaseBody: (responseError: ResponseError) => ts.Statement[];
        defaultBody: ts.Statement[];
    }) {
        return ts.factory.createSwitchStatement(
            ts.factory.createPropertyAccessExpression(
                this.getReferenceToError(context),
                context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.statusCode
            ),
            ts.factory.createCaseBlock([
                ...this.endpoint.errors.map((error) => {
                    const errorDeclaration = this.errorResolver.getErrorDeclarationFromName(error.error);
                    return ts.factory.createCaseClause(
                        ts.factory.createNumericLiteral(errorDeclaration.statusCode),
                        generateCaseBody(error)
                    );
                }),
                ts.factory.createDefaultClause(defaultBody),
            ])
        );
    }

    private getThrowsForNonStatusCodeErrors(context: SdkClientClassContext): ts.Statement[] {
        const referenceToError = this.getReferenceToError(context);
        return [
            ts.factory.createSwitchStatement(
                ts.factory.createPropertyAccessExpression(
                    referenceToError,
                    context.base.coreUtilities.fetcher.Fetcher.Error.reason
                ),
                ts.factory.createCaseBlock([
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.base.coreUtilities.fetcher.Fetcher.NonJsonError._reasonLiteralValue
                        ),
                        [
                            ts.factory.createThrowStatement(
                                context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                                    message: undefined,
                                    statusCode: ts.factory.createPropertyAccessExpression(
                                        referenceToError,
                                        context.base.coreUtilities.fetcher.Fetcher.NonJsonError.statusCode
                                    ),
                                    responseBody: ts.factory.createPropertyAccessExpression(
                                        referenceToError,
                                        context.base.coreUtilities.fetcher.Fetcher.NonJsonError.rawBody
                                    ),
                                })
                            ),
                        ]
                    ),
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.base.coreUtilities.fetcher.Fetcher.TimeoutSdkError._reasonLiteralValue
                        ),
                        [
                            ts.factory.createThrowStatement(
                                context.timeoutSdkError.getGeneratedTimeoutSdkError().build(context)
                            ),
                        ]
                    ),
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.base.coreUtilities.fetcher.Fetcher.UnknownError._reasonLiteralValue
                        ),
                        [
                            ts.factory.createThrowStatement(
                                context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                                    message: ts.factory.createPropertyAccessExpression(
                                        referenceToError,
                                        context.base.coreUtilities.fetcher.Fetcher.UnknownError.message
                                    ),
                                    statusCode: undefined,
                                    responseBody: undefined,
                                })
                            ),
                        ]
                    ),
                ])
            ),
        ];
    }

    private getGeneratedEndpointTypeSchemas(context: SdkClientClassContext): GeneratedSdkEndpointTypeSchemas {
        return context.sdkEndpointTypeSchemas.getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name);
    }

    private getReturnValueForOkResponse(context: SdkClientClassContext): ts.Expression | undefined {
        return this.endpoint.response != null ? this.getOkResponseBody(context) : undefined;
    }
}
