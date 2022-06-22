import { GeneratedRequest } from "../commons/generate-request/generateRequest";
import { InlinedServiceTypeReference, ServiceTypeReference } from "../commons/service-type-reference/types";

export interface GeneratedHttpEndpointTypes {
    request: GeneratedRequest;
    response: {
        reference: InlinedServiceTypeReference;
        successBodyReference: ServiceTypeReference | undefined;
        errorBodyReference: ServiceTypeReference | undefined;
    };
}
