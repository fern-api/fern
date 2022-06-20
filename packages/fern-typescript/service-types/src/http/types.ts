import { GeneratedRequest } from "../commons/generate-request/generateRequest";
import { LocalServiceTypeReference, ServiceTypeReference } from "../commons/service-type-reference/types";

export interface GeneratedHttpEndpointTypes {
    methodName: string;
    request: GeneratedRequest;
    response: {
        reference: LocalServiceTypeReference;
        successBodyReference: ServiceTypeReference | undefined;
    };
}
