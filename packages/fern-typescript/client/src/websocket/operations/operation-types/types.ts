import { GeneratedRequest } from "@fern-typescript/service-types";
import {
    LocalServiceTypeReference,
    ServiceTypeReference,
} from "@fern-typescript/service-types/src/service-type-reference/types";

export interface GeneratedOperationTypes {
    methodName: string;
    request: GeneratedRequest;
    response: {
        reference: LocalServiceTypeReference;
        successBodyReference: ServiceTypeReference | undefined;
    };
}
