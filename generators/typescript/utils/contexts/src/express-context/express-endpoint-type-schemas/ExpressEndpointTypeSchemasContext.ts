import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId, Reference } from "@fern-typescript/commons";

import { GeneratedExpressEndpointTypeSchemas } from "./GeneratedExpressEndpointTypeSchemas.js";

export interface ExpressEndpointTypeSchemasContext {
    getGeneratedEndpointTypeSchemas: (
        packageId: PackageId,
        endpointName: FernIr.NameOrString
    ) => GeneratedExpressEndpointTypeSchemas;
    getReferenceToEndpointTypeSchemaExport: (
        packageId: PackageId,
        endpointName: FernIr.NameOrString,
        export_: string | string[]
    ) => Reference;
}
