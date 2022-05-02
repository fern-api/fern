import { SourceFile, ts } from "ts-morph";

export interface GeneratedEndpointTypes {
    methodName: string;
    endpointParameter: EndpointParameterReference | undefined;
    requestBody: WireMessageBodyReference | undefined;
    responseBody: WireMessageBodyReference | undefined;
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

export interface LocalWireMessageBodyReference {
    // is located in a file local to this service, not imported from the model
    isLocal: true;
    typeName: ts.Identifier;
    // if specified, then you can access the body using this property
    // (e.g. request[propertyName])
    propertyName?: string;
}

export interface ModelWireMessageBodyReference {
    // is imported from the model
    isLocal: false;
    generateTypeReference: (referencedIn: SourceFile) => ts.TypeNode;
    // if specified, then you can access the body using this property
    // (e.g. request[propertyName])
    propertyName?: string;
}
