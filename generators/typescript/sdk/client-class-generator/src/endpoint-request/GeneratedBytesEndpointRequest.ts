import {
    ExampleEndpointCall,
    FileProperty,
    HttpEndpoint,
    HttpRequestBody,
    HttpService,
    IntermediateRepresentation
} from "@fern-fern/ir-sdk/api";
import {
    Fetcher,
    GetReferenceOpts,
    getTextOfTsNode,
    ImportsManager,
    JavaScriptRuntime,
    PackageId,
    visitJavaScriptRuntime
} from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { GeneratedQueryParams } from "../endpoints/utils/GeneratedQueryParams";
import { generateHeaders } from "../endpoints/utils/generateHeaders";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { FileUploadRequestParameter } from "../request-parameter/FileUploadRequestParameter";
import { GeneratedEndpointRequest } from "./GeneratedEndpointRequest";

export declare namespace GeneratedBytesEndpointRequest {
    export interface Init {
        ir: IntermediateRepresentation;
        service: HttpService;
        endpoint: HttpEndpoint;
        requestBody: HttpRequestBody.Bytes;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        targetRuntime: JavaScriptRuntime;
    }
}

export class GeneratedBytesEndpointRequest implements GeneratedEndpointRequest {
    private ir: IntermediateRepresentation;
    private requestParameter: FileUploadRequestParameter | undefined;
    private queryParams: GeneratedQueryParams | undefined;
    private service: HttpService;
    private endpoint: HttpEndpoint;
    private requestBody: HttpRequestBody.Bytes;
    private generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private targetRuntime: JavaScriptRuntime;
    private requestParameterName: string;

    constructor({
        ir,
        service,
        endpoint,
        requestBody,
        generatedSdkClientClass,
        targetRuntime
    }: GeneratedBytesEndpointRequest.Init) {
        this.ir = ir;
        this.service = service;
        this.endpoint = endpoint;
        this.requestBody = requestBody;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.targetRuntime = targetRuntime;

        if (this.endpoint.sdkRequest == null) {
            throw new Error("SdkRequest is not defined for bytes endpoint");
        }

        this.requestParameterName = this.endpoint.sdkRequest.requestParameterName.camelCase.safeName;
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
        return [context.externalDependencies.fs.createReadStream(ts.factory.createStringLiteral("/path/to/your/file"))];
    }

    public getEndpointParameters(context: SdkContext): OptionalKind<ParameterDeclarationStructure>[] {
        return [
            {
                name: this.requestParameterName,
                type: getTextOfTsNode(this.getFileParameterType(context))
            }
        ];
    }

    // TODO: this can likely be shared with the file upload request
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
            queryParameters: undefined,
            contentType: this.requestBody.contentType,
            requestType: "bytes",
            body: ts.factory.createIdentifier(this.requestParameterName)
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

    public getReferenceToQueryParameter(queryParameterKey: string, context: SdkContext): ts.Expression {
        if (this.requestParameter == null) {
            throw new Error("Cannot get reference to query parameter because request parameter is not defined.");
        }
        return this.requestParameter.getReferenceToQueryParameter(queryParameterKey, context);
    }
}
