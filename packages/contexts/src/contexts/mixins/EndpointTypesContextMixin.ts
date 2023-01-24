import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { GeneratedEndpointTypes } from "../../generated-types";
import { Reference } from "../../Reference";

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
