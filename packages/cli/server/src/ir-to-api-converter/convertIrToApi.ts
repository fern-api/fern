import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { FernApi } from "../generated";
import { convertService } from "./convertService";
import { convertType } from "./convertType";
import { convertTypeNameToId } from "./convertTypeNameToId";

export function convertIrToApi(ir: IntermediateRepresentation): FernApi.api.Api {
    return {
        id: "some-id",
        displayName: "Display Name",
        definition: {
            types: ir.types.reduce<Record<FernApi.api.TypeId, FernApi.api.TypeDefinition>>((acc, type) => {
                return {
                    ...acc,
                    [convertTypeNameToId(type.name)]: convertType(type),
                };
            }, {}),
            services: ir.services.map((service) => convertService(service)),
        },
    };
}
