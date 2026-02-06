import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId, Reference } from "@fern-typescript/commons";

import { GeneratedEndpointErrorUnion } from "./GeneratedEndpointErrorUnion.js";

export interface EndpointErrorUnionContext {
    getGeneratedEndpointErrorUnion: (packageId: PackageId, endpointName: FernIr.Name) => GeneratedEndpointErrorUnion;
    getReferenceToEndpointTypeExport: (
        packageId: PackageId,
        endpointName: FernIr.Name,
        export_: string | string[]
    ) => Reference;
}
