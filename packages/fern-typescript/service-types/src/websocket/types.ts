import { WebSocketChannelTypeMetadata } from "@fern-typescript/commons";
import { GeneratedRequest } from "../commons/generate-request/generateRequest";
import { InlinedServiceTypeReference, ServiceTypeReference } from "../commons/service-type-reference/types";

export interface GeneratedWebSocketOperationTypes {
    request: GeneratedRequest<WebSocketChannelTypeMetadata>;
    response: {
        reference: InlinedServiceTypeReference<WebSocketChannelTypeMetadata>;
        successBodyReference: ServiceTypeReference<WebSocketChannelTypeMetadata> | undefined;
        errorBodyReference: ServiceTypeReference<WebSocketChannelTypeMetadata> | undefined;
    };
}
