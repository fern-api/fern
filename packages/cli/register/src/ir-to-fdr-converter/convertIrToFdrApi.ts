import { entries } from "@fern-api/core-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { FernRegistry } from "@fern-fern/registry-node";
import { convertPackage, convertSubpackageId } from "./convertPackage";
import { convertTypeId, convertTypeShape } from "./convertTypeShape";

export function convertIrToFdrApi(ir: IntermediateRepresentation): FernRegistry.api.v1.register.ApiDefinition {
    const fdrApi: FernRegistry.api.v1.register.ApiDefinition = {
        types: {},
        subpackages: {},
        rootPackage: convertPackage(ir.rootPackage, ir),
    };

    for (const [typeId, type] of entries(ir.types)) {
        fdrApi.types[convertTypeId(typeId)] = {
            description: type.docs ?? undefined,
            name: type.name.name.originalName,
            shape: convertTypeShape(type.shape),
        };
    }

    for (const [subpackageId, subpackage] of entries(ir.subpackages)) {
        const convertedSubpackageId = convertSubpackageId(subpackageId);
        const service = subpackage.service != null ? ir.services[subpackage.service] : undefined;
        fdrApi.subpackages[convertedSubpackageId] = {
            subpackageId: convertedSubpackageId,
            name: service?.displayName ?? subpackage.name.originalName,
            ...convertPackage(subpackage, ir),
        };
    }

    return fdrApi;
}
