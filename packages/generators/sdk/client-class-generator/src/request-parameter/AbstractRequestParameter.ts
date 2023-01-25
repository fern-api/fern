import { HttpEndpoint, HttpHeader, HttpService, QueryParameter, SdkRequest } from "@fern-fern/ir-model/http";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkClientClassContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { RequestParameter } from "./RequestParameter";

export declare namespace AbstractRequestParameter {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
        sdkRequest: SdkRequest;
    }
}

export abstract class AbstractRequestParameter implements RequestParameter {
    protected service: HttpService;
    protected endpoint: HttpEndpoint;
    protected sdkRequest: SdkRequest;

    constructor({ service, endpoint, sdkRequest }: AbstractRequestParameter.Init) {
        this.service = service;
        this.endpoint = endpoint;
        this.sdkRequest = sdkRequest;
    }

    public getParameterDeclaration(context: SdkClientClassContext): OptionalKind<ParameterDeclarationStructure> {
        const type = this.getParameterType(context);

        return {
            name: this.getRequestParameterName(),
            type: getTextOfTsNode(type.type),
            hasQuestionToken: type.isOptional,
        };
    }

    protected getRequestParameterName(): string {
        return this.sdkRequest.requestParameterName.camelCase.unsafeName;
    }

    public abstract getAllQueryParameters(context: SdkClientClassContext): QueryParameter[];
    public abstract getAllHeaders(context: SdkClientClassContext): HttpHeader[];
    public abstract getReferenceToRequestBody(context: SdkClientClassContext): ts.Expression | undefined;
    public abstract getReferenceToHeader(header: HttpHeader, context: SdkClientClassContext): ts.Expression;
    public abstract withQueryParameter(
        queryParameter: QueryParameter,
        context: SdkClientClassContext,
        callback: (value: ts.Expression) => ts.Statement[]
    ): ts.Statement[];
    protected abstract getParameterType(contxt: SdkClientClassContext): { type: ts.TypeNode; isOptional: boolean };
}
