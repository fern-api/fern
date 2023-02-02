import { Name } from "@fern-fern/ir-model/commons";
import { DeclaredServiceName } from "@fern-fern/ir-model/http";
import { Reference } from "@fern-typescript/commons";
import { GeneratedExpressEndpointTypeSchemas } from "./GeneratedExpressEndpointTypeSchemas";

export interface ExpressEndpointTypeSchemasContextMixin {
    getGeneratedEndpointTypeSchemas: (
        service: DeclaredServiceName,
        endpointName: Name
    ) => GeneratedExpressEndpointTypeSchemas;
    getReferenceToEndpointTypeSchemaExport: (
        service: DeclaredServiceName,
        endpointName: Name,
        export_: string | string[]
    ) => Reference;
}

export interface WithExpressEndpointTypeSchemasContextMixin {
    expressEndpointTypeSchemas: ExpressEndpointTypeSchemasContextMixin;
}
