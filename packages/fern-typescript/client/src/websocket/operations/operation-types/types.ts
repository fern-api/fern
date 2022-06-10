import { GeneratedRequest } from "../../../commons/generate-request/generateRequest";
import { LocalServiceTypeReference, ServiceTypeReference } from "../../../commons/service-types/types";

export interface GeneratedOperationTypes {
    methodName: string;
    request: GeneratedRequest;
    response: {
        reference: LocalServiceTypeReference;
        successBodyReference: ServiceTypeReference | undefined;
    };
}
