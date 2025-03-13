import { IntermediateRepresentation } from "@fern-api/ir-sdk";

export function mergeIntermediateRepresentation(
    ir1: IntermediateRepresentation,
    ir2: IntermediateRepresentation
): IntermediateRepresentation {
    return {
        apiName: ir1.apiName,
        basePath: ir1.basePath,
        apiDisplayName: ir1.apiDisplayName ?? ir2.apiDisplayName,
        apiDocs: ir1.apiDocs ?? ir2.apiDocs,
        auth: ir1.auth ?? ir2.auth,
        headers: [...(ir1.headers ?? []), ...(ir2.headers ?? [])],
        environments: ir1.environments ?? ir2.environments,
        types: {
            ...(ir1.types ?? {}),
            ...(ir2.types ?? {})
        },
        constants: {
            ...(ir1.constants ?? {}),
            ...(ir2.constants ?? {})
        },
        errors: {
            ...(ir1.errors ?? {}),
            ...(ir2.errors ?? {})
        },
        services: {
            ...(ir1.services ?? {}),
            ...(ir2.services ?? {})
        },
        webhookGroups: {
            ...(ir1.webhookGroups ?? {}),
            ...(ir2.webhookGroups ?? {})
        },
        subpackages: {
            ...(ir1.subpackages ?? {}),
            ...(ir2.subpackages ?? {})
        },
        websocketChannels: {
            ...(ir1.websocketChannels ?? {}),
            ...(ir2.websocketChannels ?? {})
        },
        rootPackage: {
            service: ir1.rootPackage.service ?? ir2.rootPackage.service,
            types: [...(ir1.rootPackage.types ?? []), ...(ir2.rootPackage.types ?? [])],
            errors: [...(ir1.rootPackage.errors ?? []), ...(ir2.rootPackage.errors ?? [])],
            subpackages: [...(ir1.rootPackage.subpackages ?? []), ...(ir2.rootPackage.subpackages ?? [])],
            fernFilepath: ir1.rootPackage.fernFilepath ?? ir2.rootPackage.fernFilepath,
            webhooks: ir1.rootPackage.webhooks ?? ir2.rootPackage.webhooks,
            websocket: ir1.rootPackage.websocket ?? ir2.rootPackage.websocket,
            hasEndpointsInTree: ir1.rootPackage.hasEndpointsInTree || ir2.rootPackage.hasEndpointsInTree,
            navigationConfig: ir1.rootPackage.navigationConfig ?? ir2.rootPackage.navigationConfig,
            docs: ir1.rootPackage.docs ?? ir2.rootPackage.docs
        },
        fdrApiDefinitionId: ir1.fdrApiDefinitionId ?? ir2.fdrApiDefinitionId,
        apiVersion: ir1.apiVersion ?? ir2.apiVersion,
        idempotencyHeaders: [...(ir1.idempotencyHeaders ?? []), ...(ir2.idempotencyHeaders ?? [])],
        pathParameters: [...(ir1.pathParameters ?? []), ...(ir2.pathParameters ?? [])],
        errorDiscriminationStrategy: ir1.errorDiscriminationStrategy ?? ir2.errorDiscriminationStrategy,
        variables: [...(ir1.variables ?? []), ...(ir2.variables ?? [])],
        serviceTypeReferenceInfo: ir1.serviceTypeReferenceInfo ?? ir2.serviceTypeReferenceInfo,
        readmeConfig: ir1.readmeConfig ?? ir2.readmeConfig,
        sourceConfig: ir1.sourceConfig ?? ir2.sourceConfig,
        publishConfig: ir1.publishConfig ?? ir2.publishConfig,
        dynamic: ir1.dynamic ?? ir2.dynamic,
        sdkConfig: ir1.sdkConfig ?? ir2.sdkConfig
    };
}
