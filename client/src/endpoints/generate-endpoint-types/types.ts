import { Encoding } from "@fern-api/api";
import { SourceFile, ts } from "ts-morph";

export interface GeneratedEndpointTypes {
    methodName: string;
    /**
     * the parameter that the generated endpoint should take.
     * - Request, if there are path or query params
     * - RequestBody, if there is a body but no params
     * - undefined, if there is no body and no params
     */
    endpointParameter: EndpointParameterReference | undefined;
    requestBody: { encoding: Encoding; reference: WireMessageBodyReference } | undefined;
    response: {
        encoding: Encoding;
        successBodyReference: WireMessageBodyReference | undefined;
    };
}

export type EndpointParameterReference = LocalEndpointParameterReference | ModelEndpointParameterReference;

export interface LocalEndpointParameterReference {
    // is located in a file local to this service, not imported from the model
    isLocal: true;
    typeName: ts.Identifier;
}

export interface ModelEndpointParameterReference {
    // is imported from the model
    isLocal: false;
    generateTypeReference: (referencedIn: SourceFile) => ts.TypeNode;
}

export type WireMessageBodyReference = LocalWireMessageBodyReference | ModelWireMessageBodyReference;

export interface LocalWireMessageBodyReference extends BaseWireMessageBodyReference {
    // is located in a file local to this service, not imported from the model
    isLocal: true;
    typeName: ts.Identifier;
}

export interface ModelWireMessageBodyReference extends BaseWireMessageBodyReference {
    // is imported from the model
    isLocal: false;
    generateTypeReference: (referencedIn: SourceFile) => ts.TypeNode;
}

export interface BaseWireMessageBodyReference {
    // if specified, then you can access the body using this property
    // (e.g. request[propertyName])
    propertyName?: string;
}
