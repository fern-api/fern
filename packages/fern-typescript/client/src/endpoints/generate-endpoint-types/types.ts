import { SourceFile, ts } from "ts-morph";

export interface GeneratedEndpointTypes {
    methodName: string;
    endpointParameter: { typeName: ts.Identifier } | undefined;
    requestBody: WireMessageBodyReference | undefined;
    responseBody: WireMessageBodyReference | undefined;
}

export type WireMessageBodyReference = LocalReference | ReferenceToModel;

export interface LocalReference {
    // is located in a file local to this service, not imported from the model
    isLocal: true;
    typeName: ts.Identifier;
    // if specified, then you can access the body using this property
    // (e.g. request[propertyName])
    propertyName?: string;
}

export interface ReferenceToModel {
    // is imported from the model
    isLocal: false;
    generateTypeReference: (referencedIn: SourceFile) => ts.TypeNode;
    // if specified, then you can access the body using this property
    // (e.g. request[propertyName])
    propertyName?: string;
}
