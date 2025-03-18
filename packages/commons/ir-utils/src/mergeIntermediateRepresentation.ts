import { CasingsGenerator } from "@fern-api/casings-generator";
import * as FernIr from "@fern-api/ir-sdk";

export function mergeIntermediateRepresentation(
    ir1: FernIr.IntermediateRepresentation,
    ir2: FernIr.IntermediateRepresentation,
    casingsGenerator: CasingsGenerator
): FernIr.IntermediateRepresentation {
    const environments = mergeEnvironments(ir1.environments, ir2.environments, casingsGenerator);

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

function mergeEnvironments(
    environmentConfig1: FernIr.EnvironmentsConfig | undefined,
    environmentConfig2: FernIr.EnvironmentsConfig | undefined,
    casingsGenerator: CasingsGenerator
): FernIr.EnvironmentsConfig | undefined {
    if (environmentConfig1 == null && environmentConfig2 == null) {
        return undefined;
    }
    if (environmentConfig2 == null) {
        return environmentConfig1;
    }
    if (environmentConfig1 == null) {
        return environmentConfig2;
    }
    if (JSON.stringify(environmentConfig1) === JSON.stringify(environmentConfig2)) {
        return environmentConfig1;
    }

    const defaultEnvironment: FernIr.EnvironmentId | undefined =
        environmentConfig1.defaultEnvironment ?? environmentConfig2.defaultEnvironment;
    const environments1 = environmentConfig1.environments;
    const environments2 = environmentConfig2.environments;

    if (environments1.type === "singleBaseUrl" && environments2.type === "singleBaseUrl") {
        const existingEnvUrls = new Set(environments1.environments.map((env) => env.url));
        const uniqueEnvs2 = environments2.environments.filter((env) => !existingEnvUrls.has(env.url));

        if (environments1.environments[0] == null) {
            return environmentConfig2;
        }

        const environmentId = "Base";
        const environmentName = casingsGenerator.generateName("Base");

        return {
            defaultEnvironment,
            environments: FernIr.Environments.multipleBaseUrls({
                baseUrls: [
                    { id: environmentId, name: environmentName },
                    ...uniqueEnvs2.map((env) => ({ id: env.id, name: env.name }))
                ],
                environments: environments1.environments.map((env) => ({
                    id: env.id,
                    name: env.name,
                    urls: {
                        [environmentId]: env.url,
                        ...Object.fromEntries(uniqueEnvs2.map((env) => [env.id, env.url]))
                    },
                    docs: undefined
                }))
            })
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

        return {
            defaultEnvironment,
            environments: FernIr.Environments.multipleBaseUrls({
                baseUrls: [
                    ...multipleBaseUrlsEnvironment.baseUrls,
                    ...singleBaseUrlEnvironment.environments.map((env) => ({ id: env.id, name: env.name }))
                ],
                environments: multipleBaseUrlsEnvironment.environments.map((env) => ({
                    ...env,
                    urls: {
                        ...env.urls,
                        ...Object.fromEntries(singleBaseUrlEnvironment.environments.map((env) => [env.id, env.url]))
                    }
                }))
            })
        };
    }

    if (environments1.type === "multipleBaseUrls" && environments2.type === "multipleBaseUrls") {
        const existingEnvUrls = new Set(environments1.environments.map((env) => env.urls));
        const uniqueEnvs2 = environments2.environments.filter((env) => !existingEnvUrls.has(env.urls));
        // TODO: Handle this case.
        return undefined;
    }

    return environmentConfig1 ?? environmentConfig2;
}
