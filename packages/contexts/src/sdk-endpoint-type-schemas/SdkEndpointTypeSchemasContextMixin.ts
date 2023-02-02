import { Name } from "@fern-fern/ir-model/commons";
import { DeclaredServiceName } from "@fern-fern/ir-model/http";
import { Reference } from "@fern-typescript/commons";
import { GeneratedSdkEndpointTypeSchemas } from "./GeneratedSdkEndpointTypeSchemas";

export interface SdkEndpointTypeSchemasContextMixin {
    getGeneratedEndpointTypeSchemas: (
        service: DeclaredServiceName,
        endpointName: Name
    ) => GeneratedSdkEndpointTypeSchemas;
    getReferenceToEndpointTypeSchemaExport: (
        service: DeclaredServiceName,
        endpointName: Name,
        export_: string | string[]
    ) => Reference;
}

export interface WithSdkEndpointTypeSchemasContextMixin {
    sdkEndpointTypeSchemas: SdkEndpointTypeSchemasContextMixin;
}
