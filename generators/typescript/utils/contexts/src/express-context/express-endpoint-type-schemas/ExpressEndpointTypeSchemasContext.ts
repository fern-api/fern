import { PackageId, Reference } from "@fern-typescript/commons";

import { Name } from "@fern-fern/ir-sdk";

import { GeneratedExpressEndpointTypeSchemas } from "./GeneratedExpressEndpointTypeSchemas";

export interface ExpressEndpointTypeSchemasContext {
    getGeneratedEndpointTypeSchemas: (packageId: PackageId, endpointName: Name) => GeneratedExpressEndpointTypeSchemas;
    getReferenceToEndpointTypeSchemaExport: (
        packageId: PackageId,
        endpointName: Name,
        export_: string | string[]
    ) => Reference;
}
