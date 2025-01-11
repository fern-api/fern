import {
    Fetcher,
    GetReferenceOpts,
    ImportsManager,
    JavaScriptRuntime,
    PackageId,
    getParameterNameForPositionalPathParameter,
    getTextOfTsNode,
    visitJavaScriptRuntime
} from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

import {
    ExampleEndpointCall,
    HttpEndpoint,
    HttpRequestBody,
    HttpService,
    IntermediateRepresentation
} from "@fern-fern/ir-sdk/api";

import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { GeneratedQueryParams } from "../endpoints/utils/GeneratedQueryParams";
import { generateHeaders } from "../endpoints/utils/generateHeaders";
import { getPathParametersForEndpointSignature } from "../endpoints/utils/getPathParametersForEndpointSignature";
import { FileUploadRequestParameter } from "../request-parameter/FileUploadRequestParameter";
import { GeneratedEndpointRequest } from "./GeneratedEndpointRequest";

export declare namespace GeneratedBytesEndpointRequest {
    export interface Init {
        ir: IntermediateRepresentation;
        packageId: PackageId;
        service: HttpService;
        endpoint: HttpEndpoint;
        requestBody: HttpRequestBody.Bytes;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        targetRuntime: JavaScriptRuntime;
        retainOriginalCasing: boolean;
    }
}

export class GeneratedBytesEndpointRequest implements GeneratedEndpointRequest {
    private static BYTES_VARIABLE_NAME = "bytes";

    private ir: IntermediateRepresentation;
    private requestParameter: FileUploadRequestParameter | undefined;
    private queryParams: GeneratedQueryParams | undefined;
    private service: HttpService;
    private endpoint: HttpEndpoint;
    private requestBody: HttpRequestBody.Bytes;
    private generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private targetRuntime: JavaScriptRuntime;
    private retainOriginalCasing: boolean;

    constructor({
        ir,
        packageId,
        service,
        endpoint,
        requestBody,
        generatedSdkClientClass,
        targetRuntime,
        retainOriginalCasing
    }: GeneratedBytesEndpointRequest.Init) {
        this.ir = ir;
        this.service = service;
        this.endpoint = endpoint;
        this.requestBody = requestBody;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.targetRuntime = targetRuntime;
        this.retainOriginalCasing = retainOriginalCasing;

        if (this.endpoint.sdkRequest == null) {
            throw new Error("SdkRequest is not defined for bytes endpoint");
        }

        // You have query parameters
        if (this.endpoint.sdkRequest.shape.type === "wrapper") {
            this.requestParameter = new FileUploadRequestParameter({
                packageId,
                service,
                endpoint,
                sdkRequest: this.endpoint.sdkRequest
            });

            this.queryParams = new GeneratedQueryParams({
                requestParameter: this.requestParameter
            });
        }
    }

    public getRequestParameter(context: SdkContext): ts.TypeNode | undefined {
        return this.requestParameter?.getType(context);
    }

    public getExampleEndpointParameters({
        context,
        example,
        opts
    }: {
        context: SdkContext;
        example: ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression[] | undefined {
        const exampleParameters = [...example.servicePathParameters, ...example.endpointPathParameters];
        const result: ts.Expression[] = [
            context.externalDependencies.fs.createReadStream(ts.factory.createStringLiteral("/path/to/your/file"))
        ];
        for (const pathParameter of getPathParametersForEndpointSignature({
            service: this.service,
            endpoint: this.endpoint,
            context
        })) {
            const exampleParameter = exampleParameters.find(
                (param) => param.name.originalName === pathParameter.name.originalName
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

    public getEndpointParameters(context: SdkContext): OptionalKind<ParameterDeclarationStructure>[] {
        const parameters: OptionalKind<ParameterDeclarationStructure>[] = [
            {
                name: GeneratedBytesEndpointRequest.BYTES_VARIABLE_NAME,
                type: getTextOfTsNode(this.getFileParameterType(context))
            }
        ];

        for (const pathParameter of getPathParametersForEndpointSignature({
            service: this.service,
            endpoint: this.endpoint,
            context
        })) {
            parameters.push({
                name: getParameterNameForPositionalPathParameter({
                    pathParameter,
                    retainOriginalCasing: this.retainOriginalCasing
                }),
                type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode)
            });
        }

        if (this.requestParameter != null) {
            parameters.push(this.requestParameter.getParameterDeclaration(context));
        }

        return parameters;
    }

    private getFileParameterType(context: SdkContext): ts.TypeNode {
        const types: ts.TypeNode[] = [ts.factory.createTypeReferenceNode("File")];

        visitJavaScriptRuntime(this.targetRuntime, {
            node: () => {
                types.push(context.externalDependencies.fs.ReadStream._getReferenceToType());

                types.push(context.externalDependencies.blob.Blob._getReferenceToType());
            },
            browser: () => {
                types.push(ts.factory.createTypeReferenceNode("Blob"));
            }
        });

        if (this.requestBody.isOptional) {
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

        return statements;
    }

    public getFetcherRequestArgs(
        context: SdkContext
    ): Pick<Fetcher.Args, "headers" | "queryParameters" | "body" | "contentType" | "requestType" | "duplex"> {
        return {
            headers: this.getHeaders(context),
            queryParameters: this.queryParams != null ? this.queryParams.getReferenceTo(context) : undefined,
            contentType: this.requestBody.contentType,
            requestType: "bytes",
            body: ts.factory.createIdentifier(GeneratedBytesEndpointRequest.BYTES_VARIABLE_NAME),
            duplex: ts.factory.createStringLiteral("half")
        };
    }

    private getHeaders(context: SdkContext): ts.ObjectLiteralElementLike[] {
        return generateHeaders({
            context,
            requestParameter: this.requestParameter,
            idempotencyHeaders: this.ir.idempotencyHeaders,
            generatedSdkClientClass: this.generatedSdkClientClass,
            service: this.service,
            endpoint: this.endpoint
        });
    }

    public getReferenceToRequestBody(): ts.Expression | undefined {
        return this.requestParameter?.getReferenceToRequestBody();
    }

    public getReferenceToPathParameter(pathParameterKey: string, context: SdkContext): ts.Expression {
        if (this.requestParameter == null) {
            throw new Error("Cannot get reference to path parameter because request parameter is not defined.");
        }
        return this.requestParameter.getReferenceToPathParameter(pathParameterKey, context);
    }

    public getReferenceToQueryParameter(queryParameterKey: string, context: SdkContext): ts.Expression {
        if (this.requestParameter == null) {
            throw new Error("Cannot get reference to query parameter because request parameter is not defined.");
        }
        return this.requestParameter.getReferenceToQueryParameter(queryParameterKey, context);
    }
}
