import { GeneratedRequest, LocalServiceTypeReference, ServiceTypeReference } from "@fern-typescript/service-types";

export interface GeneratedEndpointTypes {
    methodName: string;
    request: GeneratedRequest;
    response: {
        reference: LocalServiceTypeReference;
        successBodyReference: ServiceTypeReference | undefined;
    };
}
