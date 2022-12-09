import { HttpEndpoint, HttpHeader, HttpService, QueryParameter } from "@fern-fern/ir-model/services/http";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { EndpointTypesContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { GeneratedEndpointRequest } from "./GeneratedEndpointRequest";

export declare namespace AbstractEndpointRequest {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
    }
}

export abstract class AbstractEndpointRequest implements GeneratedEndpointRequest {
    protected service: HttpService;
    protected endpoint: HttpEndpoint;

    constructor({ service, endpoint }: AbstractEndpointRequest.Init) {
        this.service = service;
        this.endpoint = endpoint;
    }

    public abstract writeToFile(context: EndpointTypesContext): void;
    public abstract getRequestParameterType(context: EndpointTypesContext): TypeReferenceNode | undefined;
    public abstract getReferenceToRequestBody(requestParameter: ts.Expression): ts.Expression;
    public abstract getReferenceToQueryParameter(
        queryParameter: QueryParameter,
        requestParameter: ts.Expression
    ): ts.Expression;
    public abstract getReferenceToPathParameter(
        pathParameterKey: string,
        requestParameter: ts.Expression
    ): ts.Expression;
    public abstract getReferenceToHeader(header: HttpHeader, requestParameter: ts.Expression): ts.Expression;
}
