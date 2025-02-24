import { IntermediateRepresentation } from "@fern-api/ir-sdk";

import { FernRegistry as FdrCjsSdk } from "@fern-fern/fdr-cjs-sdk";

import { PlaygroundConfig, convertAuth } from "./convertAuth";
import { convertIrAvailability, convertPackage } from "./convertPackage";
import { convertType, convertTypeReference } from "./convertTypeShape";

import { v4 as uuid } from "uuid";


export function convertIrToFdrApi({
    ir,
    snippetsConfig,
    playgroundConfig
}: {
    ir: IntermediateRepresentation;
    snippetsConfig: FdrCjsSdk.api.v1.register.SnippetsConfig;
    playgroundConfig?: PlaygroundConfig;
}): FdrCjsSdk.api.latest.ApiDefinition {
    // rootPackage: convertPackage(ir.rootPackage, ir),
    const fdrApi: FdrCjsSdk.api.latest.ApiDefinition = {
        id: FdrCjsSdk.ApiDefinitionId(uuid()),
        endpoints: {},
        websockets: {},
        webhooks: {},
        types: {},
        subpackages: {},
        auths: ir.auth != null ? Object.entries(ir.auth).reduce(
            (acc, [authId, authScheme]) => ({
                ...acc,
                [authId]: convertAuth({ scheme: authScheme, playgroundConfig })
            }),
            {}
        ) : {},
        // snippetsConfiguration: snippetsConfig,
        globalHeaders: ir.headers.map(
            (header): FdrCjsSdk.api.latest.ObjectProperty => ({
                availability: convertIrAvailability(header.availability),
                description: header.docs ?? undefined,
                key: FdrCjsSdk.PropertyKey(header.name.wireValue),
                valueShape: convertTypeReference(header.valueType)
            })
        ),
        // navigation: undefined
    };

    for (const [typeId, type] of Object.entries(ir.types)) {
        fdrApi.types[FdrCjsSdk.TypeId(typeId)] = {
            description: type.docs ?? undefined,
            name: type.name.name.originalName,
            shape: convertType(type.shape),
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
