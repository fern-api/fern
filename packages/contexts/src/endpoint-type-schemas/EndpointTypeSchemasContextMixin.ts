import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { Reference } from "@fern-typescript/commons";
import { GeneratedEndpointTypeSchemas } from "./GeneratedEndpointTypeSchemas";

export interface EndpointTypeSchemasContextMixin {
    getGeneratedEndpointTypeSchemas: (service: FernFilepath, endpointName: Name) => GeneratedEndpointTypeSchemas;
    getReferenceToEndpointTypeSchemaExport: (
        service: FernFilepath,
        endpointName: Name,
        export_: string | string[]
    ) => Reference;
}

export interface WithEndpointTypeSchemasContextMixin {
    endpointTypeSchemas: EndpointTypeSchemasContextMixin;
}
