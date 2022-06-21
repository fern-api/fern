import { GeneratedRequest } from "../commons/generate-request/generateRequest";
import { InlinedServiceTypeReference, ServiceTypeReference } from "../commons/service-type-reference/types";

export interface GeneratedWebSocketOperationTypes {
    request: GeneratedRequest;
    response: {
        reference: InlinedServiceTypeReference;
        successBodyReference: ServiceTypeReference | undefined;
        errorBodyReference: ServiceTypeReference | undefined;
    };
}
