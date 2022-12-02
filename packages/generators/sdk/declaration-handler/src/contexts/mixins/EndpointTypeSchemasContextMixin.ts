import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpointId } from "@fern-fern/ir-model/services/http";
import { GeneratedEndpointTypeSchemas } from "../../generated-types";
import { Reference } from "../../Reference";

export interface EndpointTypeSchemasContextMixin {
    getGeneratedEndpointTypeSchemas: (
        serviceName: DeclaredServiceName,
        endpointId: HttpEndpointId
    ) => GeneratedEndpointTypeSchemas;
    getReferenceToEndpointTypeSchemaExport: (
        serviceName: DeclaredServiceName,
        endpointId: HttpEndpointId,
        export_: string | string[]
    ) => Reference;
}

export interface WithEndpointTypeSchemasContextMixin {
    endpointTypeSchemas: EndpointTypeSchemasContextMixin;
}
