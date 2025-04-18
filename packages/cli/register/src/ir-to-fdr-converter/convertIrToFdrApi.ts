import { IntermediateRepresentation } from "@fern-api/ir-sdk";

import { FernRegistry as FdrCjsSdk } from "@fern-fern/fdr-cjs-sdk";

import { PlaygroundConfig, convertAuth } from "./convertAuth";
import { convertIrAvailability, convertPackage } from "./convertPackage";
import { convertTypeReference, convertTypeShape } from "./convertTypeShape";

export function convertIrToFdrApi({
    ir,
    snippetsConfig,
    playgroundConfig
}: {
    ir: IntermediateRepresentation;
    snippetsConfig: FdrCjsSdk.api.v1.register.SnippetsConfig;
    playgroundConfig?: PlaygroundConfig;
}): FdrCjsSdk.api.v1.register.ApiDefinition {
    const fdrApi: FdrCjsSdk.api.v1.register.ApiDefinition = {
        types: {},
        subpackages: {},
        rootPackage: convertPackage(ir.rootPackage, ir),
        auth: convertAuth(ir.auth, ir, playgroundConfig),
        snippetsConfiguration: snippetsConfig,
        globalHeaders: ir.headers.map(
            (header): FdrCjsSdk.api.v1.register.Header => ({
                availability: convertIrAvailability(header.availability),
                description: header.docs ?? undefined,
                key: header.name.wireValue,
                type: convertTypeReference(header.valueType)
            })
        ),
        navigation: undefined
    };

    for (const [typeId, type] of Object.entries(ir.types)) {
        fdrApi.types[FdrCjsSdk.TypeId(typeId)] = {
            description: type.docs ?? undefined,
            name: type.name.name.originalName,
            shape: convertTypeShape(type.shape),
            availability: convertIrAvailability(type.availability)
        };
    }

    for (const [subpackageId, subpackage] of Object.entries(ir.subpackages)) {
        const service = subpackage.service != null ? ir.services[subpackage.service] : undefined;
        fdrApi.subpackages[FdrCjsSdk.api.v1.SubpackageId(subpackageId)] = {
            subpackageId: FdrCjsSdk.api.v1.SubpackageId(subpackageId),
            displayName: service?.displayName,
            name: subpackage.name.originalName,
            description: subpackage.docs ?? undefined,
            ...convertPackage(subpackage, ir)
        };
    }

    return fdrApi;
}
