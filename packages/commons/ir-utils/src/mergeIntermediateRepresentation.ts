import { CasingsGenerator } from "@fern-api/casings-generator";
import * as FernIr from "@fern-api/ir-sdk";

export function mergeIntermediateRepresentation(
    ir1: FernIr.IntermediateRepresentation,
    ir2: FernIr.IntermediateRepresentation,
    casingsGenerator: CasingsGenerator
): FernIr.IntermediateRepresentation {
    const { environments, changedEnvironmentIds1, changedEnvironmentIds2 } = mergeEnvironments(
        ir1.environments,
        ir2.environments,
        casingsGenerator
    );
    const { services, websocketChannels } = mergeServicesAndChannels(
        ir1,
        ir2,
        changedEnvironmentIds1,
        changedEnvironmentIds2
    );

    return {
        apiName: ir1.apiName,
        basePath: ir1.basePath,
        apiDisplayName: ir1.apiDisplayName ?? ir2.apiDisplayName,
        apiDocs: ir1.apiDocs ?? ir2.apiDocs,
        auth: ir1.auth ?? ir2.auth,
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
        subpackages: {
            ...(ir1.subpackages ?? {}),
            ...(ir2.subpackages ?? {})
        },
        websocketChannels,
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

function mergeEnvironments(
    environmentConfig1: FernIr.EnvironmentsConfig | undefined,
    environmentConfig2: FernIr.EnvironmentsConfig | undefined,
    casingsGenerator: CasingsGenerator
): {
    environments: FernIr.EnvironmentsConfig | undefined;
    changedEnvironmentIds1: Record<string, string> | undefined;
    changedEnvironmentIds2: Record<string, string> | undefined;
} {
    if (environmentConfig1 == null && environmentConfig2 == null) {
        return { environments: undefined, changedEnvironmentIds1: undefined, changedEnvironmentIds2: undefined };
    }
    if (environmentConfig2 == null) {
        return {
            environments: environmentConfig1,
            changedEnvironmentIds1: undefined,
            changedEnvironmentIds2: undefined
        };
    }
    if (environmentConfig1 == null) {
        return {
            environments: environmentConfig2,
            changedEnvironmentIds1: undefined,
            changedEnvironmentIds2: undefined
        };
    }
    if (JSON.stringify(environmentConfig1) === JSON.stringify(environmentConfig2)) {
        return {
            environments: environmentConfig1,
            changedEnvironmentIds1: undefined,
            changedEnvironmentIds2: undefined
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
            changedEnvironmentIds1: undefined,
            changedEnvironmentIds2: undefined
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

        const changedEnvironmentIds1: Record<string, string> = {};
        const { deconflictedEnvironments2, changedEnvironmentIds2 } = deconflictEnvironments(
            singleBaseUrlEnvironments1,
            singleBaseUrlEnvironments2,
            casingsGenerator
        );

        const environment1UrlToId = new Map(singleBaseUrlEnvironments1.environments.map((env) => [env.url, env.id]));
        const uniqueEnvs2 = deconflictedEnvironments2.environments.filter((env) => !environment1UrlToId.has(env.url));
        deconflictedEnvironments2.environments.forEach((env) => {
            const existingId = environment1UrlToId.get(env.url);
            if (existingId != null) {
                changedEnvironmentIds2[env.id] = existingId;
            }
        });

        if (singleBaseUrlEnvironments1.environments[0] == null) {
            return {
                environments: environmentConfig2,
                changedEnvironmentIds1: undefined,
                changedEnvironmentIds2: undefined
            };
        }

        const environmentId = "Base";
        const environmentName = casingsGenerator.generateName("Base");

        singleBaseUrlEnvironments1.environments.forEach((env) => {
            changedEnvironmentIds1[env.id] = environmentId;
        });

        return {
            environments: {
                defaultEnvironment,
                environments: FernIr.Environments.multipleBaseUrls({
                    baseUrls: [
                        { id: environmentId, name: environmentName },
                        ...uniqueEnvs2.map((env) => ({ id: env.id, name: env.name }))
                    ],
                    environments: singleBaseUrlEnvironments1.environments.map((env) => ({
                        id: env.id,
                        name: env.name,
                        urls: {
                            [environmentId]: env.url,
                            ...Object.fromEntries(uniqueEnvs2.map((env) => [env.id, env.url]))
                        },
                        docs: undefined
                    }))
                })
            },
            changedEnvironmentIds1,
            changedEnvironmentIds2
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

        const { deconflictedEnvironments1, changedEnvironmentIds1 } = deconflictSingleMultipleEnvironments(
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
            changedEnvironmentIds1: environments1.type === "singleBaseUrl" ? changedEnvironmentIds1 : undefined,
            changedEnvironmentIds2: environments1.type === "singleBaseUrl" ? undefined : changedEnvironmentIds1
        };
    }

    if (environments1.type === "multipleBaseUrls" && environments2.type === "multipleBaseUrls") {
        const existingEnvUrls = new Set(environments1.environments.map((env) => env.urls));
        const uniqueEnvs2 = environments2.environments.filter((env) => !existingEnvUrls.has(env.urls));
        // TODO: Handle this case.
        return { environments: undefined, changedEnvironmentIds1: undefined, changedEnvironmentIds2: undefined };
    }

    return {
        environments: environmentConfig1 ?? environmentConfig2,
        changedEnvironmentIds1: undefined,
        changedEnvironmentIds2: undefined
    };
}

function mergeServicesAndChannels(
    ir1: FernIr.IntermediateRepresentation,
    ir2: FernIr.IntermediateRepresentation,
    changedEnvironmentIds1: Record<string, string> | undefined,
    changedEnvironmentIds2: Record<string, string> | undefined
): { services: Record<string, FernIr.HttpService>; websocketChannels: Record<string, FernIr.WebSocketChannel> } {
    if (changedEnvironmentIds1 != null) {
        for (const [key, value] of Object.entries(changedEnvironmentIds1)) {
            for (const service of Object.values(ir1.services)) {
                for (const endpoint of Object.values(service.endpoints)) {
                    if (endpoint.baseUrl == key) {
                        endpoint.baseUrl = value;
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
    if (changedEnvironmentIds2 != null) {
        for (const [key, value] of Object.entries(changedEnvironmentIds2)) {
            for (const service of Object.values(ir2.services)) {
                for (const endpoint of Object.values(service.endpoints)) {
                    if (endpoint.baseUrl == key) {
                        endpoint.baseUrl = value;
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
    const services = {
        ...(ir1.services ?? {}),
        ...(ir2.services ?? {})
    };
    const websocketChannels = {
        ...(ir1.websocketChannels ?? {}),
        ...(ir2.websocketChannels ?? {})
    };
    return { services, websocketChannels };
}

function deconflictEnvironments(
    environments1: FernIr.Environments.SingleBaseUrl,
    environments2: FernIr.Environments.SingleBaseUrl,
    casingsGenerator: CasingsGenerator
): { deconflictedEnvironments2: FernIr.Environments.SingleBaseUrl; changedEnvironmentIds2: Record<string, string> } {
    const changedEnvironmentIds2: Record<string, string> = {};
    const environment1Ids = new Set(environments1.environments.map((env) => env.id));
    const environment1Names = new Set(environments1.environments.map((env) => env.name));
    const deconflictedEnvironments = environments2.environments.map((env) => {
        if (environment1Ids.has(env.id) || environment1Names.has(env.name)) {
            const newName = generateUniqueName(env.id, environment1Ids);
            changedEnvironmentIds2[env.id] = newName;
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
    return { deconflictedEnvironments2, changedEnvironmentIds2 };
}

function deconflictSingleMultipleEnvironments(
    environments1: FernIr.Environments.SingleBaseUrl,
    environments2: FernIr.Environments.MultipleBaseUrls,
    casingsGenerator: CasingsGenerator
): { deconflictedEnvironments1: FernIr.Environments.SingleBaseUrl; changedEnvironmentIds1: Record<string, string> } {
    const changedEnvironmentIds1: Record<string, string> = {};
    const environment2Ids = new Set(environments2.baseUrls.map((baseUrl) => baseUrl.id));
    const environment2Names = new Set(environments2.baseUrls.map((baseUrl) => baseUrl.name));
    const deconflictedEnvironments = environments1.environments.map((env) => {
        if (environment2Ids.has(env.id) || environment2Names.has(env.name)) {
            const newName = generateUniqueName(env.id, environment2Ids);
            changedEnvironmentIds1[env.id] = newName;
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
    return { deconflictedEnvironments1, changedEnvironmentIds1 };
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

function isWebsocketEnvironment(environment: FernIr.EnvironmentsConfig): boolean {
    if (environment.environments.type === "singleBaseUrl") {
        return environment.environments.environments.some(
            (env) => env.url.startsWith("ws://") || env.url.startsWith("wss://")
        );
    } else if (environment.environments.type === "multipleBaseUrls") {
        return environment.environments.environments.some((env) =>
            Object.values(env.urls).some((url) => url.startsWith("ws://") || url.startsWith("wss://"))
        );
    }
    return false;
}
