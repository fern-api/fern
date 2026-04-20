import { FdrAPI as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { convertAllAuthSchemes, convertAuth, PlaygroundConfig } from "./convertAuth.js";
import { convertIrAvailability, convertPackage } from "./convertPackage.js";
import { convertTypeReference, convertTypeShape } from "./convertTypeShape.js";
import { getOriginalName, getWireValue } from "./nameUtils.js";

export function convertIrToFdrApi({
    ir,
    snippetsConfig,
    playgroundConfig,
    graphqlOperations = {},
    graphqlTypes = {},
    context,
    apiNameOverride
}: {
    ir: IntermediateRepresentation;
    snippetsConfig: FdrCjsSdk.api.v1.register.SnippetsConfig;
    playgroundConfig?: PlaygroundConfig;
    graphqlOperations?: Record<FdrCjsSdk.GraphQlOperationId, FdrCjsSdk.api.v1.register.GraphQlOperation>;
    graphqlTypes?: Record<FdrCjsSdk.TypeId, FdrCjsSdk.api.v1.register.TypeDefinition>;
    context: TaskContext;
    apiNameOverride?: string;
}): FdrCjsSdk.api.v1.register.ApiDefinition {
    const fdrApi: FdrCjsSdk.api.v1.register.ApiDefinition = {
        types: {},
        subpackages: {},
        rootPackage: convertPackage(ir.rootPackage, ir, graphqlOperations, graphqlTypes),
        apiName: apiNameOverride ?? getOriginalName(ir.apiName),
        auth: convertAuth({ auth: ir.auth, playgroundConfig, context }),
        authSchemes: convertAllAuthSchemes({ auth: ir.auth, playgroundConfig, context }),
        snippetsConfiguration: snippetsConfig,
        globalHeaders: ir.headers.map(
            (header): FdrCjsSdk.api.v1.register.Header => ({
                availability: convertIrAvailability(header.availability),
                description: header.docs ?? undefined,
                key: getWireValue(header.name),
                type: convertTypeReference(header.valueType)
            })
        ),
        navigation: undefined
    };

    for (const [typeId, type] of Object.entries(ir.types)) {
        fdrApi.types[FdrCjsSdk.TypeId(typeId)] = {
            description: type.docs ?? undefined,
            name: getOriginalName(type.name.name),
            shape: convertTypeShape(type.shape),
            availability: convertIrAvailability(type.availability),
            displayName: type.name.displayName
        };
    }

    // Merge GraphQL types into the API definition
    for (const [typeId, typeDefinition] of Object.entries(graphqlTypes)) {
        fdrApi.types[FdrCjsSdk.TypeId(typeId)] = typeDefinition;
    }

    for (const [subpackageId, subpackage] of Object.entries(ir.subpackages)) {
        const service = subpackage.service != null ? ir.services[subpackage.service] : undefined;
        fdrApi.subpackages[FdrCjsSdk.SubpackageId(subpackageId)] = {
            subpackageId: FdrCjsSdk.SubpackageId(subpackageId),
            displayName: service?.displayName ?? subpackage.displayName,
            name: getOriginalName(subpackage.name),
            description: subpackage.docs ?? undefined,
            ...convertPackage(subpackage, ir)
        };
    }

    return fdrApi;
}
