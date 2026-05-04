import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId, Reference } from "@fern-typescript/commons";

import { GeneratedEndpointErrorUnion } from "./GeneratedEndpointErrorUnion.js";

export interface EndpointErrorUnionContext {
    getGeneratedEndpointErrorUnion: (
        packageId: PackageId,
        endpointName: FernIr.NameOrString
    ) => GeneratedEndpointErrorUnion;
    getReferenceToEndpointTypeExport: (
        packageId: PackageId,
        endpointName: FernIr.NameOrString,
        export_: string | string[]
    ) => Reference;
}
