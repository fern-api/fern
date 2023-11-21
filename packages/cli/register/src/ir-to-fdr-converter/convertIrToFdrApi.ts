import { entries } from "@fern-api/core-utils";
import { APIV1Write } from "@fern-api/fdr-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { convertPackage } from "./convertPackage";
import { convertTypeShape } from "./convertTypeShape";
import { convertAuth } from "./covertAuth";

export function convertIrToFdrApi(
    ir: IntermediateRepresentation,
    snippetsConfig: APIV1Write.SnippetsConfig
): APIV1Write.ApiDefinition {
    const fdrApi: APIV1Write.ApiDefinition = {
        types: {},
        subpackages: {},
        rootPackage: convertPackage(ir.rootPackage, ir),
        auth: convertAuth(ir.auth),
        snippetsConfiguration: snippetsConfig,
    };

    for (const [typeId, type] of entries(ir.types)) {
        fdrApi.types[typeId] = {
            description: type.docs ?? undefined,
            name: type.name.name.originalName,
            shape: convertTypeShape(type.shape),
        };
    }

    for (const [subpackageId, subpackage] of entries(ir.subpackages)) {
        const service = subpackage.service != null ? ir.services[subpackage.service] : undefined;
        fdrApi.subpackages[subpackageId] = {
            subpackageId,
            name: service?.displayName ?? subpackage.name.originalName,
            description: subpackage.docs ?? undefined,
            ...convertPackage(subpackage, ir),
        };
    }

    return fdrApi;
}
