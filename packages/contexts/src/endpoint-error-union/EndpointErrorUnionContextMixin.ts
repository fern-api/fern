import { Name } from "@fern-fern/ir-model/commons";
import { DeclaredServiceName } from "@fern-fern/ir-model/http";
import { Reference } from "@fern-typescript/commons";
import { GeneratedEndpointErrorUnion } from "./GeneratedEndpointErrorUnion";

export interface EndpointErrorUnionContextMixin {
    getGeneratedEndpointErrorUnion: (service: DeclaredServiceName, endpointName: Name) => GeneratedEndpointErrorUnion;
    getReferenceToEndpointTypeExport: (
        service: DeclaredServiceName,
        endpointName: Name,
        export_: string | string[]
    ) => Reference;
}

export interface WithEndpointErrorUnionContextMixin {
    endpointErrorUnion: EndpointErrorUnionContextMixin;
}
