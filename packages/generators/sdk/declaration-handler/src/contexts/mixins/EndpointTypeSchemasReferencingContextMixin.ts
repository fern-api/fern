import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpointId } from "@fern-fern/ir-model/services/http";
import { GeneratedEndpointTypeSchemas } from "../../generated-types";

export interface EndpointTypeSchemasReferencingContextMixin {
    getGeneratedEndpointTypeSchemas: (
        serviceName: DeclaredServiceName,
        endpointId: HttpEndpointId
    ) => GeneratedEndpointTypeSchemas;
}
