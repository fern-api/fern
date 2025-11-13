import { CasingsGenerator } from "@fern-api/casings-generator";
import * as FernIr from "@fern-api/ir-sdk";

export function mergeIntermediateRepresentation(
    ir1: FernIr.IntermediateRepresentation,
    ir2: FernIr.IntermediateRepresentation,
    casingsGenerator: CasingsGenerator
): FernIr.IntermediateRepresentation {
    const { environments, changedBaseUrlIds1, changedBaseUrlIds2 } = mergeEnvironments(
        ir1.environments,
        ir2.environments,
        casingsGenerator
    );
    const { services, websocketChannels } = mergeServicesAndChannels(ir1, ir2, changedBaseUrlIds1, changedBaseUrlIds2);

    return {
        apiName: ir1.apiName,
        basePath: ir1.basePath,
        selfHosted: ir1.selfHosted && ir2.selfHosted,
        apiDisplayName: ir1.apiDisplayName ?? ir2.apiDisplayName,
        apiDocs: ir1.apiDocs ?? ir2.apiDocs,
        auth: {
            requirement: ir1.auth?.requirement ?? ir2.auth?.requirement,
            schemes:
                ir2.auth?.schemes?.length != null && ir2.auth.schemes.length > (ir1.auth?.schemes?.length ?? 0)
                    ? ir2.auth.schemes
                    : (ir1.auth?.schemes ?? []),
            docs: ir1.auth?.docs ?? ir2.auth?.docs
        },
        headers: [...(ir1.headers ?? []), ...(ir2.headers ?? [])],
        environments,
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
        services,
        webhookGroups: {
            ...(ir1.webhookGroups ?? {}),
            ...(ir2.webhookGroups ?? {})
        },
        subpackages: mergeSubpackages(ir1.subpackages, ir2.subpackages),
        websocketChannels,
        rootPackage: {
            service: ir1.rootPackage.service ?? ir2.rootPackage.service,
            types: [...(ir1.rootPackage.types ?? []), ...(ir2.rootPackage.types ?? [])],
            errors: [...(ir1.rootPackage.errors ?? []), ...(ir2.rootPackage.errors ?? [])],
            subpackages: [
                ...(ir1.rootPackage.subpackages ?? []),
                ...(ir2.rootPackage.subpackages ?? []).filter(
                    (subpackage) => !ir1.rootPackage.subpackages?.includes(subpackage)
                )
            ],
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
        sdkConfig: ir1.sdkConfig ?? ir2.sdkConfig,
        audiences: [...(ir1.audiences ?? []), ...(ir2.audiences ?? [])],
        generationMetadata: ir1.generationMetadata ?? ir2.generationMetadata,
        apiPlayground: ir1.apiPlayground ?? ir2.apiPlayground
    };
}

function mergeSubpackages(
    subpackages1: Record<string, FernIr.Subpackage>,
    subpackages2: Record<string, FernIr.Subpackage>
): Record<string, FernIr.Subpackage> {
    const mergedSubpackages: Record<string, FernIr.Subpackage> = subpackages1;
    for (const [subpackageId, subpackage] of Object.entries(subpackages2)) {
        if (mergedSubpackages[subpackageId] == null) {
            mergedSubpackages[subpackageId] = subpackage;
        } else {
            mergedSubpackages[subpackageId] = {
                name: subpackage.name,
                displayName: subpackage.displayName,
                fernFilepath: subpackage.fernFilepath,
                hasEndpointsInTree: mergedSubpackages[subpackageId].hasEndpointsInTree || subpackage.hasEndpointsInTree,
                navigationConfig: mergedSubpackages[subpackageId].navigationConfig ?? subpackage.navigationConfig,
                docs: mergedSubpackages[subpackageId].docs ?? subpackage.docs,
                service: mergedSubpackages[subpackageId].service ?? subpackage.service,
                subpackages: [
                    ...(mergedSubpackages[subpackageId].subpackages ?? []),
                    ...(subpackage.subpackages ?? []).filter(
                        (subpackage) => !mergedSubpackages[subpackageId]?.subpackages?.includes(subpackage)
                    )
                ],
                webhooks: mergedSubpackages[subpackageId].webhooks ?? subpackage.webhooks,
                websocket: mergedSubpackages[subpackageId].websocket ?? subpackage.websocket,
                errors: [...(mergedSubpackages[subpackageId].errors ?? []), ...(subpackage.errors ?? [])],
                types: [...(mergedSubpackages[subpackageId].types ?? []), ...(subpackage.types ?? [])]
            };
        }
    }
    return mergedSubpackages;
}

/**
 * This method merges two environments configurations, which can either be a multiple base URL environment or a
 * single base URL environment (WebSocket or non-WebSocket).
 */
function mergeEnvironments(
    environmentConfig1: FernIr.EnvironmentsConfig | undefined,
    environmentConfig2: FernIr.EnvironmentsConfig | undefined,
    casingsGenerator: CasingsGenerator
): {
    environments: FernIr.EnvironmentsConfig | undefined;
    changedBaseUrlIds1: Record<string, string> | undefined;
    changedBaseUrlIds2: Record<string, string> | undefined;
} {
    if (environmentConfig1 == null && environmentConfig2 == null) {
        return { environments: undefined, changedBaseUrlIds1: undefined, changedBaseUrlIds2: undefined };
    }
    if (environmentConfig2 == null) {
        return {
            environments: environmentConfig1,
            changedBaseUrlIds1: undefined,
            changedBaseUrlIds2: undefined
        };
    }
    if (environmentConfig1 == null) {
        return {
            environments: environmentConfig2,
            changedBaseUrlIds1: undefined,
            changedBaseUrlIds2: undefined
        };
    }
    if (JSON.stringify(environmentConfig1) === JSON.stringify(environmentConfig2)) {
        return {
            environments: environmentConfig1,
            changedBaseUrlIds1: undefined,
            changedBaseUrlIds2: undefined
        };
    }

    const isWebsocketEnvironment1 = isWebsocketEnvironment(environmentConfig1);
    const isWebsocketEnvironment2 = isWebsocketEnvironment(environmentConfig2);

    if (
        isWebsocketEnvironment1 &&
        isWebsocketEnvironment2 &&
        environmentConfig1.environments.type === "singleBaseUrl" &&
        environmentConfig2.environments.type === "singleBaseUrl"
    ) {
        return {
            environments: {
                defaultEnvironment: environmentConfig1.defaultEnvironment ?? environmentConfig2.defaultEnvironment,
                environments: FernIr.Environments.singleBaseUrl({
                    environments: [
                        ...environmentConfig1.environments.environments,
                        ...environmentConfig2.environments.environments
                    ]
                })
            },
            changedBaseUrlIds1: undefined,
            changedBaseUrlIds2: undefined
        };
    }

    const defaultEnvironment: FernIr.EnvironmentId | undefined = isWebsocketEnvironment1
        ? environmentConfig2.defaultEnvironment
        : environmentConfig1.defaultEnvironment;
    const environments1 = environmentConfig1.environments;
    const environments2 = environmentConfig2.environments;

    if (environments1.type === "singleBaseUrl" && environments2.type === "singleBaseUrl") {
        const singleBaseUrlEnvironments1 = isWebsocketEnvironment1 ? environments2 : environments1;
        const singleBaseUrlEnvironments2 = isWebsocketEnvironment1 ? environments1 : environments2;

        const changedBaseUrlIds1: Record<string, string> = {};
        const { deconflictedEnvironments2, changedBaseUrlIds2 } = deconflictSingleEnvironments(
            singleBaseUrlEnvironments1,
            singleBaseUrlEnvironments2,
            casingsGenerator
        );

        if (singleBaseUrlEnvironments1.environments[0] == null) {
            return {
                environments: environmentConfig2,
                changedBaseUrlIds1: undefined,
                changedBaseUrlIds2: undefined
            };
        }

        const environmentId = "Base";
        const environmentName = casingsGenerator.generateName("Base");

        singleBaseUrlEnvironments1.environments.forEach((env) => {
            changedBaseUrlIds1[env.id] = environmentId;
        });

        return {
            environments: {
                defaultEnvironment,
                environments: FernIr.Environments.multipleBaseUrls({
                    baseUrls: [
                        { id: environmentId, name: environmentName },
                        ...deconflictedEnvironments2.environments.map((env) => ({ id: env.id, name: env.name }))
                    ],
                    environments: singleBaseUrlEnvironments1.environments.map((env) => ({
                        id: env.id,
                        name: env.name,
                        urls: {
                            [environmentId]: env.url,
                            ...Object.fromEntries(
                                deconflictedEnvironments2.environments.map((env) => [env.id, env.url])
                            )
                        },
                        docs: undefined
                    }))
                })
            },
            changedBaseUrlIds1: isWebsocketEnvironment1 ? changedBaseUrlIds2 : changedBaseUrlIds1,
            changedBaseUrlIds2: isWebsocketEnvironment1 ? changedBaseUrlIds1 : changedBaseUrlIds2
        };
    }

    if (
        (environments1.type === "multipleBaseUrls" && environments2.type === "singleBaseUrl") ||
        (environments1.type === "singleBaseUrl" && environments2.type === "multipleBaseUrls")
    ) {
        const singleBaseUrlEnvironment =
            environments1.type === "singleBaseUrl"
                ? (environments1 as FernIr.Environments.SingleBaseUrl)
                : (environments2 as FernIr.Environments.SingleBaseUrl);
        const multipleBaseUrlsEnvironment =
            environments1.type === "multipleBaseUrls"
                ? (environments1 as FernIr.Environments.MultipleBaseUrls)
                : (environments2 as FernIr.Environments.MultipleBaseUrls);

        const { deconflictedEnvironments1, changedBaseUrlIds1 } = deconflictHybridEnvironments(
            singleBaseUrlEnvironment,
            multipleBaseUrlsEnvironment,
            casingsGenerator
        );

        return {
            environments: {
                defaultEnvironment,
                environments: FernIr.Environments.multipleBaseUrls({
                    baseUrls: [
                        ...multipleBaseUrlsEnvironment.baseUrls,
                        ...deconflictedEnvironments1.environments.map((env) => ({ id: env.id, name: env.name }))
                    ],
                    environments: multipleBaseUrlsEnvironment.environments.map((env) => ({
                        ...env,
                        urls: {
                            ...env.urls,
                            ...Object.fromEntries(
                                deconflictedEnvironments1.environments.map((env) => [env.id, env.url])
                            )
                        }
                    }))
                })
            },
            changedBaseUrlIds1: environments1.type === "singleBaseUrl" ? changedBaseUrlIds1 : undefined,
            changedBaseUrlIds2: environments1.type === "singleBaseUrl" ? undefined : changedBaseUrlIds1
        };
    }

    if (environments1.type === "multipleBaseUrls" && environments2.type === "multipleBaseUrls") {
        const { deconflictedEnvironments, changedBaseUrlIds } = deconflictMultipleEnvironments(
            environments1,
            environments2,
            casingsGenerator
        );
        return {
            environments: {
                defaultEnvironment,
                environments: FernIr.Environments.multipleBaseUrls({
                    baseUrls: [...environments1.baseUrls, ...deconflictedEnvironments.baseUrls],
                    environments: environments1.environments.flatMap((env1) =>
                        deconflictedEnvironments.environments.map((env2) => ({
                            ...env1,
                            urls: {
                                ...env1.urls,
                                ...env2.urls
                            }
                        }))
                    )
                })
            },
            changedBaseUrlIds1: undefined,
            changedBaseUrlIds2: changedBaseUrlIds
        };
    }

    return {
        environments: environmentConfig1 ?? environmentConfig2,
        changedBaseUrlIds1: undefined,
        changedBaseUrlIds2: undefined
    };
}

/**
 * This method merges the services and websocket channels of two intermediate representations in two steps:
 * 1. Update all outdated baseURL ids to the new, de-duplicated Ids (if applicable)
 * 2. Merge the services and websocket channels
 */
function mergeServicesAndChannels(
    ir1: FernIr.IntermediateRepresentation,
    ir2: FernIr.IntermediateRepresentation,
    changedBaseUrlIds1: Record<string, string> | undefined,
    changedBaseUrlIds2: Record<string, string> | undefined
): { services: Record<string, FernIr.HttpService>; websocketChannels: Record<string, FernIr.WebSocketChannel> } {
    if (changedBaseUrlIds1 != null) {
        for (const [key, value] of Object.entries(changedBaseUrlIds1)) {
            for (const service of Object.values(ir1.services)) {
                for (const endpoint of Object.values(service.endpoints)) {
                    if (endpoint.baseUrl == key) {
                        endpoint.baseUrl = value;
                    }
                    if (endpoint.v2BaseUrls?.includes(key)) {
                        endpoint.v2BaseUrls = endpoint.v2BaseUrls.map((baseUrl) => (baseUrl === key ? value : baseUrl));
                    }
                }
            }
            for (const websocketChannel of Object.values(ir1.websocketChannels ?? {})) {
                if (websocketChannel.baseUrl == key) {
                    websocketChannel.baseUrl = value;
                }
            }
        }
    }
    if (changedBaseUrlIds2 != null) {
        for (const [key, value] of Object.entries(changedBaseUrlIds2)) {
            for (const service of Object.values(ir2.services)) {
                for (const endpoint of Object.values(service.endpoints)) {
                    if (endpoint.baseUrl == key) {
                        endpoint.baseUrl = value;
                    }
                    if (endpoint.v2BaseUrls?.includes(key)) {
                        endpoint.v2BaseUrls = endpoint.v2BaseUrls.map((baseUrl) => (baseUrl === key ? value : baseUrl));
                    }
                }
            }
            for (const websocketChannel of Object.values(ir2.websocketChannels ?? {})) {
                if (websocketChannel.baseUrl == key) {
                    websocketChannel.baseUrl = value;
                }
            }
        }
    }

    const mergedServices: Record<string, FernIr.HttpService> = ir1.services;
    for (const [serviceId, service] of Object.entries(ir2.services)) {
        if (mergedServices[serviceId] == null) {
            mergedServices[serviceId] = service;
        } else {
            mergedServices[serviceId] = {
                availability: service.availability,
                name: service.name,
                displayName: service.displayName,
                basePath: service.basePath,
                endpoints: [...(mergedServices[serviceId].endpoints ?? []), ...service.endpoints],
                pathParameters: [
                    ...(mergedServices[serviceId].pathParameters ?? []),
                    ...(service.pathParameters ?? [])
                ],
                headers: [...(mergedServices[serviceId].headers ?? []), ...(service.headers ?? [])],
                encoding: service.encoding,
                transport: service.transport,
                audiences: [...(mergedServices[serviceId].audiences ?? []), ...(service.audiences ?? [])]
            };
        }
    }

    const websocketChannels = {
        ...(ir1.websocketChannels ?? {}),
        ...(ir2.websocketChannels ?? {})
    };
    return { services: mergedServices, websocketChannels };
}

/**
 * This method deconflicts two single base URL environments. The method performs the following steps:
 * 1. Filter out environments from the second environment that have the same base URL as the first environment
 * 2. Generate unique names for the environments that are duplicated in the first environment
 */
function deconflictSingleEnvironments(
    environments1: FernIr.Environments.SingleBaseUrl,
    environments2: FernIr.Environments.SingleBaseUrl,
    casingsGenerator: CasingsGenerator
): { deconflictedEnvironments2: FernIr.Environments.SingleBaseUrl; changedBaseUrlIds2: Record<string, string> } {
    const changedBaseUrlIds2: Record<string, string> = {};
    const environment1Ids = new Set(environments1.environments.map((env) => env.id));
    const environment1Names = new Set(environments1.environments.map((env) => env.name));
    const environment1UrlToId = new Map(environments1.environments.map((env) => [env.url, env.id]));

    const deconflictedEnvironments = environments2.environments
        .filter((env) => {
            const existingId = environment1UrlToId.get(env.url);
            if (existingId != null) {
                changedBaseUrlIds2[env.id] = existingId;
                return false;
            }
            return true;
        })
        .map((env) => {
            if (environment1Ids.has(env.id) || environment1Names.has(env.name)) {
                const newName = generateUniqueName(env.id, environment1Ids);
                changedBaseUrlIds2[env.id] = newName;
                return {
                    ...env,
                    id: newName,
                    name: casingsGenerator.generateName(newName)
                };
            }
            return env;
        });

    const deconflictedEnvironments2 = FernIr.Environments.singleBaseUrl({
        environments: deconflictedEnvironments
    });
    return { deconflictedEnvironments2, changedBaseUrlIds2 };
}

/**
 * This method deconflicts a single base URL environment with a multiple base URL environment.
 * Environments that have the same name or ID as an environment in the multiple base URL environment will be renamed.
 */
function deconflictHybridEnvironments(
    environments1: FernIr.Environments.SingleBaseUrl,
    environments2: FernIr.Environments.MultipleBaseUrls,
    casingsGenerator: CasingsGenerator
): { deconflictedEnvironments1: FernIr.Environments.SingleBaseUrl; changedBaseUrlIds1: Record<string, string> } {
    const changedBaseUrlIds1: Record<string, string> = {};
    const environment2Ids = new Set(environments2.baseUrls.map((baseUrl) => baseUrl.id));
    const environment2Names = new Set(environments2.baseUrls.map((baseUrl) => baseUrl.name));
    const deconflictedEnvironments = environments1.environments.map((env) => {
        if (environment2Ids.has(env.id) || environment2Names.has(env.name)) {
            const newName = generateUniqueName(env.id, environment2Ids);
            changedBaseUrlIds1[env.id] = newName;
            return {
                ...env,
                id: newName,
                name: casingsGenerator.generateName(newName)
            };
        }
        return env;
    });
    const deconflictedEnvironments1 = FernIr.Environments.singleBaseUrl({
        environments: deconflictedEnvironments
    });
    return { deconflictedEnvironments1, changedBaseUrlIds1 };
}

/**
 * This method deconflicts two multiple base URL environments. The method performs the following steps:
 * 1. Deconflict the base URLs of the second environment with the base URLs of the first environment
 * 2. Deconflict the environments of the second environment with the environments of the first environment
 */
function deconflictMultipleEnvironments(
    environments1: FernIr.Environments.MultipleBaseUrls,
    environments2: FernIr.Environments.MultipleBaseUrls,
    casingsGenerator: CasingsGenerator
): { deconflictedEnvironments: FernIr.Environments.MultipleBaseUrls; changedBaseUrlIds: Record<string, string> } {
    const changedBaseUrlIds: Record<string, string> = {};

    const environment1BaseUrlIds = new Set(environments1.baseUrls.map((baseUrl) => baseUrl.id));
    const environment1BaseUrlNames = new Set(environments1.baseUrls.map((baseUrl) => baseUrl.name));

    const deconflictedBaseUrls = environments2.baseUrls.map((baseUrl) => {
        if (environment1BaseUrlIds.has(baseUrl.id) || environment1BaseUrlNames.has(baseUrl.name)) {
            const newName = generateUniqueName(baseUrl.id, environment1BaseUrlIds);
            changedBaseUrlIds[baseUrl.id] = newName;
            return { ...baseUrl, id: newName, name: casingsGenerator.generateName(newName) };
        }
        return baseUrl;
    });

    const deconflictedEnvironmentsList = environments2.environments.map((env) => {
        return {
            ...env,
            urls: Object.fromEntries(
                Object.entries(env.urls).map(([key, value]) => [changedBaseUrlIds[key] ?? key, value])
            )
        };
    });

    const deconflictedEnvironments = FernIr.Environments.multipleBaseUrls({
        baseUrls: deconflictedBaseUrls,
        environments: deconflictedEnvironmentsList
    });

    return { deconflictedEnvironments, changedBaseUrlIds };
}

function isWebsocketEnvironment(environment: FernIr.EnvironmentsConfig): boolean {
    if (environment.environments.type === "singleBaseUrl") {
        return environment.environments.environments.some(
            (env) => env.url && (env.url.startsWith("ws://") || env.url.startsWith("wss://"))
        );
    } else if (environment.environments.type === "multipleBaseUrls") {
        return environment.environments.environments.some((env) =>
            Object.values(env.urls).some((url) => url && (url.startsWith("ws://") || url.startsWith("wss://")))
        );
    }
    return false;
}

function generateUniqueName(id: string, existingIds: Set<string>): string {
    let uniqueName = id;
    let suffix = 1;
    while (existingIds.has(uniqueName)) {
        uniqueName = `${id}-${suffix}`;
        suffix++;
    }
    return uniqueName;
}
