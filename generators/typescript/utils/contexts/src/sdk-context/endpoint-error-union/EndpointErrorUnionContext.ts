import { Name } from "@fern-fern/ir-sdk/api";
import { PackageId, Reference } from "@fern-typescript/commons";

import { GeneratedEndpointErrorUnion } from "./GeneratedEndpointErrorUnion.js";

export interface EndpointErrorUnionContext {
    getGeneratedEndpointErrorUnion: (packageId: PackageId, endpointName: Name) => GeneratedEndpointErrorUnion;
    getReferenceToEndpointTypeExport: (
        packageId: PackageId,
        endpointName: Name,
        export_: string | string[]
    ) => Reference;
}
