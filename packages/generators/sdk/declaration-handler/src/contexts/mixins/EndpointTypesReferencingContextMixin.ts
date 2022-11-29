import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpointId } from "@fern-fern/ir-model/services/http";
import { GeneratedEndpointTypes } from "../../generated-types";
import { Reference } from "../../Reference";

export interface EndpointTypesReferencingContextMixin {
    getGeneratedEndpointTypes: (serviceName: DeclaredServiceName, endpointId: HttpEndpointId) => GeneratedEndpointTypes;
    getReferenceToEndpointTypeExport: (
        serviceName: DeclaredServiceName,
        endpointId: HttpEndpointId,
        export_: string | string[]
    ) => Reference;
}
