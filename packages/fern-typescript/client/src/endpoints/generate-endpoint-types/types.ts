import { ts } from "ts-morph";

export interface GeneratedEndpointTypes {
    methodName: string;
    endpointParameter: { name: string; type: ts.TypeNode; identifier: ts.Identifier } | undefined;
    requestBody: { reference: ts.Expression } | undefined;
    responseBody: { propertyName: string; identifier: ts.Identifier } | undefined;
}
