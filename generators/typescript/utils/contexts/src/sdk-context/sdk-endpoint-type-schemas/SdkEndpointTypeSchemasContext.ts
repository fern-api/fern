import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId, Reference } from "@fern-typescript/commons";

import { GeneratedSdkEndpointTypeSchemas } from "./GeneratedSdkEndpointTypeSchemas.js";

export interface SdkEndpointTypeSchemasContext {
    getGeneratedEndpointTypeSchemas: (
        packageId: PackageId,
        endpointName: FernIr.Name
    ) => GeneratedSdkEndpointTypeSchemas;
    getReferenceToEndpointTypeSchemaExport: (
        packageId: PackageId,
        endpointName: FernIr.Name,
        export_: string | string[]
    ) => Reference;
}
