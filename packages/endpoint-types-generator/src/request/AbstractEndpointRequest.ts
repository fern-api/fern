import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { EndpointTypesContext } from "@fern-typescript/sdk-declaration-handler";
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
}
