import { Name } from "@fern-fern/ir-model/commons";
import { PackageId, Reference } from "@fern-typescript/commons";
import { GeneratedSdkEndpointTypeSchemas } from "./GeneratedSdkEndpointTypeSchemas";

export interface SdkEndpointTypeSchemasContextMixin {
    getGeneratedEndpointTypeSchemas: (packageId: PackageId, endpointName: Name) => GeneratedSdkEndpointTypeSchemas;
    getReferenceToEndpointTypeSchemaExport: (
        packageId: PackageId,
        endpointName: Name,
        export_: string | string[]
    ) => Reference;
}

export interface WithSdkEndpointTypeSchemasContextMixin {
    sdkEndpointTypeSchemas: SdkEndpointTypeSchemasContextMixin;
}
