import { entries } from "@fern-api/core-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { FernRegistry } from "@fern-fern/registry";
import { convertPackage, convertSubpackageId } from "./convertPackage";
import { convertTypeId, convertTypeShape } from "./convertTypeShape";

export function convertIrToFdrApi(ir: IntermediateRepresentation): FernRegistry.ApiDefinition {
    const fdrApi: FernRegistry.ApiDefinition = {
        types: {},
        subpackages: {},
        rootPackage: convertPackage(ir.rootPackage, ir),
    };

    for (const [typeId, type] of entries(ir.types)) {
        fdrApi.types[convertTypeId(typeId)] = {
            description: type.docs ?? undefined,
            name: type.name.name.originalName,
            shape: convertTypeShape(type.shape),
            examples: type.examples.map((example) => ({
                json: example.jsonExample,
            })),
        };
    }

    for (const [subpackageId, subpackage] of entries(ir.subpackages)) {
        fdrApi.subpackages[convertSubpackageId(subpackageId)] = {
            name: subpackage.name.originalName,
            ...convertPackage(subpackage, ir),
        };
    }

    return fdrApi;
}
