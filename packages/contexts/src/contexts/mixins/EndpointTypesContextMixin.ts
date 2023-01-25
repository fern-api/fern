import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { Reference } from "@fern-typescript/commons";
import { GeneratedEndpointTypes } from "../../generated-types";

export interface EndpointTypesContextMixin {
    getGeneratedEndpointTypes: (service: FernFilepath, endpointName: Name) => GeneratedEndpointTypes;
    getReferenceToEndpointTypeExport: (
        service: FernFilepath,
        endpointName: Name,
        export_: string | string[]
    ) => Reference;
}

export interface WithEndpointTypesContextMixin {
    endpointTypes: EndpointTypesContextMixin;
}
