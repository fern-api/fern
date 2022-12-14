import { HttpEndpoint, HttpHeader, HttpService, QueryParameter, SdkRequest } from "@fern-fern/ir-model/services/http";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { ServiceContext } from "@fern-typescript/contexts";
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

    public getParameterDeclaration(context: ServiceContext): OptionalKind<ParameterDeclarationStructure> {
        const type = this.getParameterType(context);

        return {
            name: this.getRequestParameterName(),
            type: getTextOfTsNode(type.type),
            hasQuestionToken: type.isOptional,
        };
    }

    protected getRequestParameterName(): string {
        return this.sdkRequest.requestParameterName.unsafeName.camelCase;
    }

    public abstract getReferenceToRequestBody(context: ServiceContext): ts.Expression | undefined;
    public abstract getReferenceToQueryParameter(
        queryParameter: QueryParameter,
        context: ServiceContext
    ): ts.Expression;
    public abstract getReferenceToHeader(header: HttpHeader, context: ServiceContext): ts.Expression;
    protected abstract getParameterType(contxt: ServiceContext): { type: ts.TypeNode; isOptional: boolean };
}
