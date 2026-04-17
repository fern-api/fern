import { CaseConverter, getOriginalName } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import {
    Fetcher,
    GetReferenceOpts,
    getParameterNameForPositionalPathParameter,
    getTextOfTsNode,
    PackageId
} from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { appendPropertyToFormData } from "../endpoints/utils/appendPropertyToFormData.js";
import { GeneratedQueryParams } from "../endpoints/utils/GeneratedQueryParams.js";
import { generateHeaders, HEADERS_VAR_NAME } from "../endpoints/utils/generateHeaders.js";
import { getParameterNameForFile } from "../endpoints/utils/getParameterNameForFile.js";
import { getPathParametersForEndpointSignature } from "../endpoints/utils/getPathParametersForEndpointSignature.js";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl.js";
import { FileUploadRequestParameter } from "../request-parameter/FileUploadRequestParameter.js";
import { GeneratedEndpointRequest } from "./GeneratedEndpointRequest.js";

export declare namespace GeneratedFileUploadEndpointRequest {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
        packageId: PackageId;
        service: FernIr.HttpService;
        endpoint: FernIr.HttpEndpoint;
        requestBody: FernIr.HttpRequestBody.FileUpload;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        retainOriginalCasing: boolean;
        inlineFileProperties: boolean;
        includeSerdeLayer: boolean;
        allowExtraFields: boolean;
        omitUndefined: boolean;
        formDataSupport: "Node16" | "Node18";
        parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
        caseConverter: CaseConverter;
    }
}

export class GeneratedFileUploadEndpointRequest implements GeneratedEndpointRequest {
    private static readonly FORM_DATA_VARIABLE_NAME = "_body";
    private static readonly FORM_DATA_REQUEST_OPTIONS_VARIABLE_NAME = "_maybeEncodedRequest";

    private readonly ir: FernIr.IntermediateRepresentation;
    private readonly requestParameter: FileUploadRequestParameter | undefined;
    private queryParams: GeneratedQueryParams | undefined;
    private readonly service: FernIr.HttpService;
    private readonly endpoint: FernIr.HttpEndpoint;
    private readonly requestBody: FernIr.HttpRequestBody.FileUpload;
    private readonly generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private readonly retainOriginalCasing: boolean;
    private readonly inlineFileProperties: boolean;
    private readonly includeSerdeLayer: boolean;
    private readonly allowExtraFields: boolean;
    private readonly omitUndefined: boolean;
    private readonly formDataSupport: "Node16" | "Node18";
    private readonly parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    private readonly case: CaseConverter;

    constructor({
        ir,
        packageId,
        service,
        endpoint,
        requestBody,
        generatedSdkClientClass,
        retainOriginalCasing,
        inlineFileProperties,
        includeSerdeLayer,
        allowExtraFields,
        omitUndefined,
        formDataSupport,
        parameterNaming,
        caseConverter
    }: GeneratedFileUploadEndpointRequest.Init) {
        this.ir = ir;
        this.service = service;
        this.endpoint = endpoint;
        this.requestBody = requestBody;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.retainOriginalCasing = retainOriginalCasing;
        this.inlineFileProperties = inlineFileProperties;
        this.includeSerdeLayer = includeSerdeLayer;
        this.allowExtraFields = allowExtraFields;
        this.omitUndefined = omitUndefined;
        this.formDataSupport = formDataSupport;
        this.parameterNaming = parameterNaming;
        this.case = caseConverter;
        if (
            this.inlineFileProperties ||
            requestBody.properties.some((property) => property.type === "bodyProperty") ||
            endpoint.queryParameters.length > 0
        ) {
            if (this.endpoint.sdkRequest == null) {
                throw new Error("SdkRequest is not defined for file upload endpoint");
            }
            if (this.endpoint.sdkRequest.shape.type !== "wrapper") {
                throw new Error("SdkRequest is not a wrapper for file upload endpoint");
            }
            this.requestParameter = new FileUploadRequestParameter({
                packageId,
                service,
                endpoint,
                sdkRequest: this.endpoint.sdkRequest,
                caseConverter: this.case
            });
        }
    }

    public getRequestParameter(context: FileContext): ts.TypeNode | undefined {
        return this.requestParameter?.getType(context);
    }

    public getExampleEndpointImports(): ts.Statement[] {
        return [
            ts.factory.createImportDeclaration(
                undefined,
                ts.factory.createImportClause(
                    false,
                    undefined,
                    ts.factory.createNamedImports([
                        ts.factory.createImportSpecifier(
                            false,
                            undefined,
                            ts.factory.createIdentifier("createReadStream")
                        )
                    ])
                ),
                ts.factory.createStringLiteral("fs"),
                undefined
            )
        ];
    }

    public getExampleEndpointParameters({
        context,
        example,
        opts
    }: {
        context: FileContext;
        example: FernIr.ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression[] | undefined {
        const exampleParameters = [...example.servicePathParameters, ...example.endpointPathParameters];
        const result: ts.Expression[] = [];
        if (!context.inlineFileProperties) {
            for (const property of this.requestBody.properties) {
                if (property.type === "file") {
                    const createReadStream = ts.factory.createCallExpression(
                        ts.factory.createIdentifier("createReadStream"),
                        undefined,
                        [ts.factory.createStringLiteral("path/to/file")]
                    );
                    if (property.value.type === "fileArray") {
                        result.push(ts.factory.createArrayLiteralExpression([createReadStream]));
                    } else {
                        result.push(createReadStream);
                    }
                }
            }
        }
        for (const pathParameter of getPathParametersForEndpointSignature({
            service: this.service,
            endpoint: this.endpoint,
            context
        })) {
            const exampleParameter = exampleParameters.find(
                (param) => getOriginalName(param.name) === getOriginalName(pathParameter.name)
            );
            if (exampleParameter == null) {
                result.push(ts.factory.createIdentifier("undefined"));
            } else {
                const generatedExample = context.type.getGeneratedExample(exampleParameter.value);
                result.push(generatedExample.build(context, opts));
            }
        }
        if (this.requestParameter != null) {
            const requestParameterExample = this.requestParameter.generateExample({ context, example, opts });
            if (
                requestParameterExample != null &&
                getTextOfTsNode(requestParameterExample) === "{}" &&
                this.requestParameter.isOptional({ context })
            ) {
                // pass
            } else if (requestParameterExample != null) {
                result.push(requestParameterExample);
            } else if (!this.requestParameter.isOptional({ context })) {
                return undefined;
            }
        }
        return result;
    }

    public getEndpointParameters(context: FileContext): OptionalKind<ParameterDeclarationStructure>[] {
        const parameters: OptionalKind<ParameterDeclarationStructure>[] = [];
        if (!context.inlineFileProperties) {
            for (const property of this.requestBody.properties) {
                if (property.type === "file") {
                    parameters.push({
                        name: getParameterNameForFile({
                            property: property.value,
                            wrapperName:
                                this.endpoint.sdkRequest != null
                                    ? context.case.camelSafe(this.endpoint.sdkRequest.requestParameterName)
                                    : "request",
                            includeSerdeLayer: context.includeSerdeLayer,
                            retainOriginalCasing: context.retainOriginalCasing,
                            inlineFileProperties: context.inlineFileProperties,
                            caseConverter: context.case
                        }),
                        type: getTextOfTsNode(this.getFileParameterType(property.value, context))
                    });
                }
            }
        }
        for (const pathParameter of getPathParametersForEndpointSignature({
            service: this.service,
            endpoint: this.endpoint,
            context
        })) {
            parameters.push({
                name: getParameterNameForPositionalPathParameter({
                    pathParameter,
                    retainOriginalCasing: this.retainOriginalCasing,
                    parameterNaming: this.parameterNaming,
                    caseConverter: context.case
                }),
                type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode)
            });
        }

        if (this.requestParameter != null) {
            parameters.push(this.requestParameter.getParameterDeclaration(context));
        }
        return parameters;
    }

    private getFileParameterType(property: FernIr.FileProperty, context: FileContext): ts.TypeNode {
        const types: ts.TypeNode[] = [];

        if (this.formDataSupport === "Node16") {
            types.push(
                this.maybeWrapFileArray({
                    property,
                    value: ts.factory.createTypeReferenceNode("File")
                })
            );
            types.push(
                this.maybeWrapFileArray({
                    property,
                    value: context.externalDependencies.fs.ReadStream._getReferenceToType()
                })
            );

            types.push(
                this.maybeWrapFileArray({
                    property,
                    value: context.externalDependencies.blob.Blob._getReferenceToType()
                })
            );
        } else {
            types.push(
                this.maybeWrapFileArray({
                    property,
                    value: context.coreUtilities.fileUtils.Uploadable._getReferenceToType()
                })
            );
        }

        if (property.isOptional) {
            types.push(ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword));
        }

        return ts.factory.createUnionTypeNode(types);
    }

    private maybeWrapFileArray({
        property,
        value
    }: {
        property: FernIr.FileProperty;
        value: ts.TypeNode;
    }): ts.TypeNode {
        return property.type === "fileArray" ? ts.factory.createArrayTypeNode(value) : value;
    }

    public getBuildRequestStatements(context: FileContext): ts.Statement[] {
        const statements: ts.Statement[] = [];

        if (this.requestParameter != null) {
            statements.push(...this.requestParameter.getInitialStatements());
        }

        const queryParams = this.getQueryParams(context);
        if (queryParams != null) {
            statements.push(...queryParams.getBuildStatements(context));
        }

        statements.push(
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            GeneratedFileUploadEndpointRequest.FORM_DATA_VARIABLE_NAME,
                            undefined,
                            undefined,
                            context.coreUtilities.formDataUtils.newFormData()
                        )
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
                        GeneratedFileUploadEndpointRequest.FORM_DATA_VARIABLE_NAME
                    ),
                    wrapperName:
                        this.endpoint.sdkRequest != null
                            ? context.case.camelSafe(this.endpoint.sdkRequest.requestParameterName)
                            : "request",
                    requestParameter: this.requestParameter,
                    includeSerdeLayer: this.includeSerdeLayer,
                    allowExtraFields: this.allowExtraFields,
                    omitUndefined: this.omitUndefined
                })
            );
        }

        statements.push(
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            GeneratedFileUploadEndpointRequest.FORM_DATA_REQUEST_OPTIONS_VARIABLE_NAME,
                            undefined,
                            undefined,
                            ts.factory.createAwaitExpression(
                                context.coreUtilities.formDataUtils.getRequest({
                                    referenceToFormData: ts.factory.createIdentifier(
                                        GeneratedFileUploadEndpointRequest.FORM_DATA_VARIABLE_NAME
                                    )
                                })
                            )
                        )
                    ],
                    ts.NodeFlags.Const
                )
            )
        );

        statements.push(...this.initializeHeaders(context));

        return statements;
    }

    public getBuildHeaderStatements(context: FileContext): ts.Statement[] {
        return this.initializeHeaders(context);
    }

    public getFetcherRequestArgs(
        context: FileContext
    ): Pick<
        Fetcher.Args,
        "headers" | "queryParameters" | "body" | "contentType" | "requestType" | "duplex" | "queryString"
    > {
        const queryParams = this.getQueryParams(context);
        return {
            headers: ts.factory.createIdentifier(HEADERS_VAR_NAME),
            queryParameters: queryParams != null ? queryParams.getReferenceTo() : undefined,
            queryString: queryParams?.getQueryStringExpression(context),
            requestType: "file",
            body: context.coreUtilities.formDataUtils.getBody({
                referenceToFormData: ts.factory.createIdentifier(
                    GeneratedFileUploadEndpointRequest.FORM_DATA_REQUEST_OPTIONS_VARIABLE_NAME
                )
            }),
            duplex: context.coreUtilities.formDataUtils.getDuplexSetting({
                referenceToFormData: ts.factory.createIdentifier(
                    GeneratedFileUploadEndpointRequest.FORM_DATA_REQUEST_OPTIONS_VARIABLE_NAME
                )
            })
        };
    }

    private initializeHeaders(context: FileContext): ts.Statement[] {
        return generateHeaders({
            context,
            intermediateRepresentation: this.ir,
            requestParameter: this.requestParameter,
            idempotencyHeaders: this.ir.idempotencyHeaders,
            generatedSdkClientClass: this.generatedSdkClientClass,
            service: this.service,
            endpoint: this.endpoint,
            additionalSpreadHeaders: [
                context.coreUtilities.formDataUtils.getHeaders({
                    referenceToFormData: ts.factory.createIdentifier(
                        GeneratedFileUploadEndpointRequest.FORM_DATA_REQUEST_OPTIONS_VARIABLE_NAME
                    )
                })
            ]
        });
    }

    public getReferenceToRequestBody(): ts.Expression | undefined {
        return this.requestParameter?.getReferenceToRequestBody();
    }

    public getReferenceToPathParameter(pathParameterKey: string, context: FileContext): ts.Expression {
        if (this.requestParameter == null) {
            throw new Error("Cannot get reference to path parameter because request parameter is not defined.");
        }
        return this.requestParameter.getReferenceToPathParameter(pathParameterKey, context);
    }

    public getReferenceToQueryParameter(queryParameterKey: string, context: FileContext): ts.Expression {
        if (this.requestParameter == null) {
            throw new Error("Cannot get reference to query parameter because request parameter is not defined.");
        }
        return this.requestParameter.getReferenceToQueryParameter(queryParameterKey, context);
    }

    public getQueryParams(context: FileContext): GeneratedQueryParams {
        if (this.queryParams == null) {
            this.queryParams = new GeneratedQueryParams({
                queryParameters: this.requestParameter?.getAllQueryParameters(context),
                referenceToQueryParameterProperty: (key, context) => this.getReferenceToQueryParameter(key, context)
            });
        }
        return this.queryParams;
    }
}
