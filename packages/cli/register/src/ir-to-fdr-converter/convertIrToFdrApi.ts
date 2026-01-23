import { FdrAPI as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { convertAllAuthSchemes, convertAuth, PlaygroundConfig } from "./convertAuth";
import { convertIrAvailability, convertPackage } from "./convertPackage";
import { convertTypeReference, convertTypeShape } from "./convertTypeShape";

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
    // Log GraphQL operations and types received in convertIrToFdrApi
    const operationCount = Object.keys(graphqlOperations).length;
    const typeCount = Object.keys(graphqlTypes).length;
    context.logger.debug(
        `convertIrToFdrApi received ${operationCount} GraphQL operations and ${typeCount} GraphQL types`
    );
    if (operationCount > 0) {
        context.logger.debug(
            `GraphQL operation IDs in convertIrToFdrApi: ${JSON.stringify(Object.keys(graphqlOperations))}`
        );
    }
    if (typeCount > 0) {
        context.logger.debug(`GraphQL type IDs in convertIrToFdrApi: ${JSON.stringify(Object.keys(graphqlTypes))}`);
    }
    const fdrApi: FdrCjsSdk.api.v1.register.ApiDefinition = {
        types: {},
        subpackages: {},
        rootPackage: convertPackage(ir.rootPackage, ir, graphqlOperations),
        apiName: apiNameOverride ?? ir.apiName.originalName,
        auth: convertAuth({ auth: ir.auth, playgroundConfig, context }),
        authSchemes: convertAllAuthSchemes({ auth: ir.auth, playgroundConfig, context }),
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

    // Log GraphQL operations added to rootPackage
    const finalOperationCount = fdrApi.rootPackage.graphqlOperations?.length ?? 0;
    context.logger.debug(`API definition created with ${finalOperationCount} GraphQL operations in rootPackage`);
    if (finalOperationCount > 0 && fdrApi.rootPackage.graphqlOperations) {
        context.logger.debug(
            `Final rootPackage GraphQL operations: ${JSON.stringify(fdrApi.rootPackage.graphqlOperations.map((op) => op.id))}`
        );
    }

    for (const [typeId, type] of Object.entries(ir.types)) {
        fdrApi.types[FdrCjsSdk.TypeId(typeId)] = {
            description: type.docs ?? undefined,
            name: type.name.name.originalName,
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
        fdrApi.subpackages[FdrCjsSdk.api.v1.SubpackageId(subpackageId)] = {
            subpackageId: FdrCjsSdk.api.v1.SubpackageId(subpackageId),
            displayName: service?.displayName ?? subpackage.displayName,
            name: subpackage.name.originalName,
            description: subpackage.docs ?? undefined,
            ...convertPackage(subpackage, ir)
        };
    }

    return fdrApi;
}
