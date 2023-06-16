import { Name } from "@fern-fern/ir-model/commons";
import { PackageId, Reference } from "@fern-typescript/commons";
import { GeneratedExpressEndpointTypeSchemas } from "./GeneratedExpressEndpointTypeSchemas";

export interface ExpressEndpointTypeSchemasContext {
    getGeneratedEndpointTypeSchemas: (packageId: PackageId, endpointName: Name) => GeneratedExpressEndpointTypeSchemas;
    getReferenceToEndpointTypeSchemaExport: (
        packageId: PackageId,
        endpointName: Name,
        export_: string | string[]
    ) => Reference;
}
