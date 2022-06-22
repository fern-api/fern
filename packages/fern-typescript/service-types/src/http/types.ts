import { HttpServiceTypeMetadata } from "@fern-typescript/commons";
import { GeneratedRequest } from "../commons/generate-request/generateRequest";
import { InlinedServiceTypeReference, ServiceTypeReference } from "../commons/service-type-reference/types";

export interface GeneratedHttpEndpointTypes {
    request: GeneratedRequest<HttpServiceTypeMetadata>;
    response: {
        reference: InlinedServiceTypeReference<HttpServiceTypeMetadata>;
        successBodyReference: ServiceTypeReference<HttpServiceTypeMetadata> | undefined;
        errorBodyReference: ServiceTypeReference<HttpServiceTypeMetadata> | undefined;
    };
}
