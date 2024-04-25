import { entries } from "@fern-api/core-utils";
import { APIV1Write } from "@fern-api/fdr-sdk";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { convertIrAvailability, convertPackage } from "./convertPackage";
import { convertTypeReference, convertTypeShape } from "./convertTypeShape";
import { convertAuth } from "./covertAuth";

export function convertIrToFdrApi({
    ir,
    snippetsConfig
}: {
    ir: IntermediateRepresentation;
    snippetsConfig: APIV1Write.SnippetsConfig;
}): APIV1Write.ApiDefinition {
    const fdrApi: APIV1Write.ApiDefinition = {
        types: {},
        subpackages: {},
        rootPackage: convertPackage(ir.rootPackage, ir),
        auth: convertAuth(ir.auth),
        snippetsConfiguration: snippetsConfig,
        globalHeaders: ir.headers.map(
            (header): APIV1Write.Header => ({
                description: header.docs ?? undefined,
                key: header.name.wireValue,
                type: convertTypeReference(header.valueType)
            })
        )
    };

    for (const [typeId, type] of entries(ir.types)) {
        fdrApi.types[typeId] = {
            description: type.docs ?? undefined,
            name: type.name.name.originalName,
            shape: convertTypeShape(type.shape),
            availability: convertIrAvailability(type.availability)
        };
    }

    for (const [subpackageId, subpackage] of entries(ir.subpackages)) {
        const service = subpackage.service != null ? ir.services[subpackage.service] : undefined;
        fdrApi.subpackages[subpackageId] = {
            subpackageId,
            displayName: service?.displayName,
            name: subpackage.name.originalName,
            description: subpackage.docs ?? undefined,
            ...convertPackage(subpackage, ir)
        };
    }

    return fdrApi;
}
