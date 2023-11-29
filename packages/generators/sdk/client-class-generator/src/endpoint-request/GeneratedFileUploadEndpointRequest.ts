import { noop } from "@fern-api/core-utils";
import {
    FileProperty,
    HttpEndpoint,
    HttpRequestBody,
    HttpService,
    IntermediateRepresentation,
} from "@fern-fern/ir-sdk/api";
import {
    Fetcher,
    getTextOfTsNode,
    JavaScriptRuntime,
    PackageId,
    visitJavaScriptRuntime,
} from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { appendPropertyToFormData } from "../endpoints/utils/appendPropertyToFormData";
import { GeneratedQueryParams } from "../endpoints/utils/GeneratedQueryParams";
import { generateHeaders } from "../endpoints/utils/generateHeaders";
import { getParameterNameForFile } from "../endpoints/utils/getParameterNameForFile";
import { getParameterNameForPathParameter } from "../endpoints/utils/getParameterNameForPathParameter";
import { getPathParametersForEndpointSignature } from "../endpoints/utils/getPathParametersForEndpointSignature";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { FileUploadRequestParameter } from "../request-parameter/FileUploadRequestParameter";
import { GeneratedEndpointRequest } from "./GeneratedEndpointRequest";

export declare namespace GeneratedFileUploadEndpointRequest {
    export interface Init {
        ir: IntermediateRepresentation;
        packageId: PackageId;
        service: HttpService;
        endpoint: HttpEndpoint;
        requestBody: HttpRequestBody.FileUpload;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        targetRuntime: JavaScriptRuntime;
    }
}

export class GeneratedFileUploadEndpointRequest implements GeneratedEndpointRequest {
    private static FORM_DATA_VARIABLE_NAME = "_request";
    private static OPTS_PARAMETER_NAME = "opts";
    private static ON_UPLOAD_PROGRESS_OPT_NAME = "onUploadProgress";

    private ir: IntermediateRepresentation;
    private requestParameter: FileUploadRequestParameter | undefined;
    private queryParams: GeneratedQueryParams | undefined;
    private service: HttpService;
    private endpoint: HttpEndpoint;
    private requestBody: HttpRequestBody.FileUpload;
    private generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private targetRuntime: JavaScriptRuntime;

    constructor({
        ir,
        packageId,
        service,
        endpoint,
        requestBody,
        generatedSdkClientClass,
        targetRuntime,
    }: GeneratedFileUploadEndpointRequest.Init) {
        this.ir = ir;
        this.service = service;
        this.endpoint = endpoint;
        this.requestBody = requestBody;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.targetRuntime = targetRuntime;

        if (requestBody.properties.some((property) => property.type === "bodyProperty")) {
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

            this.queryParams = new GeneratedQueryParams({
                requestParameter: this.requestParameter,
            });
        }
    }

    public getExampleEndpointParameters(): ts.Expression[] | undefined {
        return undefined;
    }

    public getEndpointParameters(context: SdkContext): OptionalKind<ParameterDeclarationStructure>[] {
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
            parameters.push(this.requestParameter.getParameterDeclaration(context));
        }

        visitJavaScriptRuntime(this.targetRuntime, {
            node: noop,
            browser: () => {
                parameters.push({
                    name: GeneratedFileUploadEndpointRequest.OPTS_PARAMETER_NAME,
                    type: getTextOfTsNode(
                        ts.factory.createTypeLiteralNode([
                            ts.factory.createPropertySignature(
                                undefined,
                                GeneratedFileUploadEndpointRequest.ON_UPLOAD_PROGRESS_OPT_NAME,
                                undefined,
                                ts.factory.createFunctionTypeNode(
                                    undefined,
                                    [
                                        ts.factory.createParameterDeclaration(
                                            undefined,
                                            undefined,
                                            undefined,
                                            ts.factory.createIdentifier("event"),
                                            undefined,
                                            ts.factory.createTypeReferenceNode(
                                                ts.factory.createIdentifier("ProgressEvent"),
                                                undefined
                                            )
                                        ),
                                    ],
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                                )
                            ),
                        ])
                    ),
                    hasQuestionToken: true,
                });
            },
        });

        return parameters;
    }

    private getFileParameterType(property: FileProperty, context: SdkContext): ts.TypeNode {
        const types: ts.TypeNode[] = [ts.factory.createTypeReferenceNode("File")];

        visitJavaScriptRuntime(this.targetRuntime, {
            node: () => {
                types.push(context.externalDependencies.fs.ReadStream._getReferenceToType());
            },
            browser: () => {
                types.push(ts.factory.createTypeReferenceNode("Blob"));
            },
        });

        if (property.isOptional) {
            types.push(ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword));
        }
        return ts.factory.createUnionTypeNode(types);
    }

    public getBuildRequestStatements(context: SdkContext): ts.Statement[] {
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
                            GeneratedFileUploadEndpointRequest.FORM_DATA_VARIABLE_NAME,
                            undefined,
                            undefined,
                            context.externalDependencies.formData._instantiate()
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
                        GeneratedFileUploadEndpointRequest.FORM_DATA_VARIABLE_NAME
                    ),
                    requestParameter: this.requestParameter,
                })
            );
        }

        return statements;
    }

    public getFetcherRequestArgs(
        context: SdkContext
    ): Pick<Fetcher.Args, "headers" | "queryParameters" | "body" | "contentType" | "onUploadProgress"> {
        return {
            headers: this.getHeaders(context),
            queryParameters: this.queryParams != null ? this.queryParams.getReferenceTo(context) : undefined,
            body: ts.factory.createIdentifier(GeneratedFileUploadEndpointRequest.FORM_DATA_VARIABLE_NAME),
            contentType: ts.factory.createBinaryExpression(
                ts.factory.createStringLiteral("multipart/form-data; boundary="),
                ts.factory.createToken(ts.SyntaxKind.PlusToken),
                context.externalDependencies.formData.getBoundary({
                    referencetoFormData: ts.factory.createIdentifier(
                        GeneratedFileUploadEndpointRequest.FORM_DATA_VARIABLE_NAME
                    ),
                })
            ),
            onUploadProgress: visitJavaScriptRuntime(this.targetRuntime, {
                node: () => undefined,
                browser: () =>
                    ts.factory.createPropertyAccessChain(
                        ts.factory.createIdentifier(GeneratedFileUploadEndpointRequest.OPTS_PARAMETER_NAME),
                        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                        GeneratedFileUploadEndpointRequest.ON_UPLOAD_PROGRESS_OPT_NAME
                    ),
            }),
        };
    }

    private getHeaders(context: SdkContext): ts.ObjectLiteralElementLike[] {
        return generateHeaders({
            context,
            requestParameter: this.requestParameter,
            idempotencyHeaders: this.ir.idempotencyHeaders,
            generatedSdkClientClass: this.generatedSdkClientClass,
            service: this.service,
            endpoint: this.endpoint,
            additionalHeaders: [
                {
                    header: "Content-Length",
                    value: context.coreUtilities.formDataUtils.getFormDataContentLength({
                        referenceToFormData: ts.factory.createIdentifier(
                            GeneratedFileUploadEndpointRequest.FORM_DATA_VARIABLE_NAME
                        ),
                    }),
                },
            ],
        });
    }

    public getReferenceToRequestBody(): ts.Expression | undefined {
        return this.requestParameter?.getReferenceToRequestBody();
    }

    public getReferenceToQueryParameter(queryParameterKey: string, context: SdkContext): ts.Expression {
        if (this.requestParameter == null) {
            throw new Error("Cannot get reference to query parameter because request parameter is not defined.");
        }
        return this.requestParameter.getReferenceToQueryParameter(queryParameterKey, context);
    }
}
