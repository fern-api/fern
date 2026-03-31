import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId, Reference } from "@fern-typescript/commons";

import { GeneratedExpressEndpointTypeSchemas } from "./GeneratedExpressEndpointTypeSchemas.js";

export interface ExpressEndpointTypeSchemasContext {
    getGeneratedEndpointTypeSchemas: (
        packageId: PackageId,
        endpointName: FernIr.Name
    ) => GeneratedExpressEndpointTypeSchemas;
    getReferenceToEndpointTypeSchemaExport: (
        packageId: PackageId,
        endpointName: FernIr.Name,
        export_: string | string[]
    ) => Reference;
}
