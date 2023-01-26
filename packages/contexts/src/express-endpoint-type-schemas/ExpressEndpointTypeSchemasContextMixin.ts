import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { Reference } from "@fern-typescript/commons";
import { GeneratedExpressEndpointTypeSchemas } from "./GeneratedExpressEndpointTypeSchemas";

export interface ExpressEndpointTypeSchemasContextMixin {
    getGeneratedEndpointTypeSchemas: (service: FernFilepath, endpointName: Name) => GeneratedExpressEndpointTypeSchemas;
    getReferenceToEndpointTypeSchemaExport: (
        service: FernFilepath,
        endpointName: Name,
        export_: string | string[]
    ) => Reference;
}

export interface WithExpressEndpointTypeSchemasContextMixin {
    expressEndpointTypeSchemas: ExpressEndpointTypeSchemasContextMixin;
}
