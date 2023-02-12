import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { FernRegistry } from "@fern-fern/registry";
import { convertPackage } from "./convertPackage";
import { convertType } from "./convertType";
import { convertTypeNameToId } from "./convertTypeNameToId";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertIrToApi(ir: IntermediateRepresentation): any {
    return {
        types: ir.types.reduce<Record<FernRegistry.TypeId, FernRegistry.TypeDefinition>>((acc, type) => {
            return {
                ...acc,
                [convertTypeNameToId(type.name)]: convertType(type),
            };
        }, {}),
        packages: ir.services.map((service) => convertPackage(service)),
        endpoints: [],
    };
}
