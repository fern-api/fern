import { PackageId, Reference } from "@fern-typescript/commons";

import { Name } from "@fern-fern/ir-sdk/api";

import { GeneratedSdkEndpointTypeSchemas } from "./GeneratedSdkEndpointTypeSchemas";

export interface SdkEndpointTypeSchemasContext {
    getGeneratedEndpointTypeSchemas: (packageId: PackageId, endpointName: Name) => GeneratedSdkEndpointTypeSchemas;
    getReferenceToEndpointTypeSchemaExport: (
        packageId: PackageId,
        endpointName: Name,
        export_: string | string[]
    ) => Reference;
}
