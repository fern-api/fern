import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { FernRegistry } from "@fern-fern/registry";
import { convertService } from "./convertService";
import { convertType } from "./convertType";
import { convertTypeNameToId } from "./convertTypeNameToId";

export function convertIrToApi(ir: IntermediateRepresentation): FernRegistry.ApiDefinition {
    return {
        id: FernRegistry.ApiId("some-id"),
        version: FernRegistry.ApiVersion("0.0.0"),
        types: ir.types.reduce<Record<FernRegistry.TypeId, FernRegistry.TypeDefinition>>((acc, type) => {
            return {
                ...acc,
                [convertTypeNameToId(type.name)]: convertType(type),
            };
        }, {}),
        services: ir.services.map((service) => convertService(service)),
    };
}
