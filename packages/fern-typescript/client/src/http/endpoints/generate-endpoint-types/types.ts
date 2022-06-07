import { Encoding, TypeReference } from "@fern-api/api";
import { ServiceTypeReference } from "../../../service-types/types";
import { EndpointTypeName } from "../getLocalEndpointTypeReference";

export interface GeneratedEndpointTypes {
    methodName: string;
    /**
     * the parameter that the generated endpoint should take.
     * - Request, if there are path or query params
     * - RequestBody, if there is a body but no params
     * - undefined, if there is no body and no params
     */
    endpointParameter: EndpointParameterReference | undefined;
    requestBody:
        | {
              encoding: Encoding;
              reference: ServiceTypeReference<EndpointTypeName>;
              // if specified, then you can access the body using this property
              // (e.g. request[propertyName])
              propertyName: string | undefined;
          }
        | undefined;
    response: {
        encoding: Encoding;
        successBodyReference: ServiceTypeReference<EndpointTypeName> | undefined;
    };
}

export type EndpointParameterReference = LocalEndpointParameterReference | ModelEndpointParameterReference;

export interface LocalEndpointParameterReference {
    // is located in a file local to this service, not imported from the model
    isLocal: true;
    typeName: EndpointTypeName;
}

export interface ModelEndpointParameterReference {
    // is imported from the model
    isLocal: false;
    typeReference: TypeReference;
}
