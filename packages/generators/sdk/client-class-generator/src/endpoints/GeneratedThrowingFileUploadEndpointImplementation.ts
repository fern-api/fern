import { FileProperty, HttpEndpoint, HttpRequestBody, HttpService, ResponseError } from "@fern-fern/ir-model/http";
import { ErrorDiscriminationByPropertyStrategy, ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { Fetcher, getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import { GeneratedSdkEndpointTypeSchemas, SdkClientClassContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { GeneratedHeader } from "../GeneratedHeader";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { FileUploadRequestParameter } from "../request-parameter/FileUploadRequestParameter";
import { EndpointSignature } from "./GeneratedEndpointImplementation";
import { appendPropertyToFormData } from "./utils/appendPropertyToFormData";
import { buildUrl } from "./utils/buildUrl";
import { GeneratedQueryParams } from "./utils/GeneratedQueryParams";
import { getParameterNameForFile } from "./utils/getParameterNameForFile";
import { getParameterNameForPathParameter } from "./utils/getParameterNameForPathParameter";
import { getPathParametersForEndpointSignature } from "./utils/getPathParametersForEndpointSignature";

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
        timeoutInSeconds: number | "infinity" | undefined;
    }
}

export class GeneratedThrowingFileUploadEndpointImplementation
    implements GeneratedThrowingFileUploadEndpointImplementation
{
    private static RESPONSE_VARIABLE_NAME = "_response";
    private static FORM_DATA_VARIABLE_NAME = "_request";

    public readonly endpoint: HttpEndpoint;
    private packageId: PackageId;
    private service: HttpService;
    private generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private requestParameter: FileUploadRequestParameter | undefined;
    private queryParams: GeneratedQueryParams | undefined;
    private requestBody: HttpRequestBody.FileUpload;
    private includeCredentialsOnCrossOriginRequests: boolean;
    private errorResolver: ErrorResolver;
    private errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    private timeoutInSeconds: number | "infinity" | undefined;

    constructor({
        packageId,
        service,
        endpoint,
        requestBody,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
        errorDiscriminationStrategy,
        errorResolver,
        timeoutInSeconds,
    }: GeneratedThrowingFileUploadEndpointImplementation.Init) {
        this.packageId = packageId;
        this.service = service;
        this.endpoint = endpoint;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;
        this.errorResolver = errorResolver;
        this.errorDiscriminationStrategy = errorDiscriminationStrategy;
        this.requestBody = requestBody;
        this.timeoutInSeconds = timeoutInSeconds;

        if (requestBody.properties.some((property) => property.type === "bodyProperty")) {
            if (this.endpoint.sdkRequest == null) {
                throw new Error("SdkRequest is not defined for file upload endpoint");
            }
            if (this.endpoint.sdkRequest.shape.type != "wrapper") {
                throw new Error("SdkRequest is not a wrapper for file upload endpoint");
            }
            const requestParameter = new FileUploadRequestParameter({
                packageId,
                service,
                endpoint,
                sdkRequest: this.endpoint.sdkRequest,
            });

            this.requestParameter = requestParameter;
            this.queryParams = new GeneratedQueryParams({
                requestParameter,
            });
        }
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
                    name: getParameterNameForFile(property),
                    type: getTextOfTsNode(this.getFileParameterType(property, context)),
                });
            }
        }
        for (const pathParameter of getPathParametersForEndpointSignature(this.service, this.endpoint)) {
            parameters.push({
                name: getParameterNameForPathParameter(pathParameter),
                type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode),
            });
        }

        if (this.requestParameter != null) {
            parameters.push(
                this.requestParameter.getParameterDeclaration(context, { typeIntersection: requestBodyIntersection })
            );
        }
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

    public getStatements(context: SdkClientClassContext): ts.Statement[] {
        const statements: ts.Statement[] = [];

        if (this.requestParameter != null) {
            statements.push(...this.requestParameter.getInitialStatements());
        }

        if (this.queryParams != null) {
            statements.push(...this.queryParams.getBuildStatements(context));
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
            statements.push(
                appendPropertyToFormData({
                    property,
                    context,
                    referenceToFormData: ts.factory.createIdentifier(
                        GeneratedThrowingFileUploadEndpointImplementation.FORM_DATA_VARIABLE_NAME
                    ),
                    requestParameter: this.requestParameter,
                })
            );
        }

        const fetcherArgs: Fetcher.Args = {
            url: this.getReferenceToEnvironment(context),
            method: ts.factory.createStringLiteral(this.endpoint.method),
            headers: this.getHeaders(context),
            queryParameters: this.queryParams != null ? this.queryParams.getReferenceTo(context) : undefined,
            body: ts.factory.createIdentifier(
                GeneratedThrowingFileUploadEndpointImplementation.FORM_DATA_VARIABLE_NAME
            ),
            timeoutInSeconds: this.timeoutInSeconds,
            withCredentials: this.includeCredentialsOnCrossOriginRequests,
            contentType: ts.factory.createBinaryExpression(
                ts.factory.createStringLiteral("multipart/form-data; boundary="),
                ts.factory.createToken(ts.SyntaxKind.PlusToken),
                context.base.externalDependencies.formData.getBoundary({
                    referencetoFormData: ts.factory.createIdentifier(
                        GeneratedThrowingFileUploadEndpointImplementation.FORM_DATA_VARIABLE_NAME
                    ),
                })
            ),
        };

        statements.push(...this.invokeFetcher(fetcherArgs, context));

        statements.push(...this.getReturnResponseStatements(context));

        return statements;
    }

    private getReferenceToEnvironment(context: SdkClientClassContext): ts.Expression {
        const referenceToEnvironment = this.generatedSdkClientClass.getEnvironment(this.endpoint, context);
        const url = buildUrl({ endpoint: this.endpoint, generatedClientClass: this.generatedSdkClientClass, context });
        if (url != null) {
            return context.base.externalDependencies.urlJoin.invoke([referenceToEnvironment, url]);
        } else {
            return referenceToEnvironment;
        }
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

        elements.push(...this.generatedSdkClientClass.getHeaders(context));

        if (this.requestParameter != null) {
            for (const header of this.requestParameter.getAllHeaders(context)) {
                elements.push({
                    header: header.name.wireValue,
                    value: this.requestParameter.getReferenceToHeader(header, context),
                });
            }
        }

        elements.push({
            header: "Content-Length",
            value: context.base.coreUtilities.formDataUtils.getFormDataContentLength({
                referenceToFormData: ts.factory.createIdentifier(
                    GeneratedThrowingFileUploadEndpointImplementation.FORM_DATA_VARIABLE_NAME
                ),
            }),
        });

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
