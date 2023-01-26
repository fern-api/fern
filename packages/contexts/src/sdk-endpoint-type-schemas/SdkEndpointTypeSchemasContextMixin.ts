import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { Reference } from "@fern-typescript/commons";
import { GeneratedSdkEndpointTypeSchemas } from "./GeneratedSdkEndpointTypeSchemas";

export interface SdkEndpointTypeSchemasContextMixin {
    getGeneratedEndpointTypeSchemas: (service: FernFilepath, endpointName: Name) => GeneratedSdkEndpointTypeSchemas;
    getReferenceToEndpointTypeSchemaExport: (
        service: FernFilepath,
        endpointName: Name,
        export_: string | string[]
    ) => Reference;
}

export interface WithSdkEndpointTypeSchemasContextMixin {
    sdkEndpointTypeSchemas: SdkEndpointTypeSchemasContextMixin;
}
