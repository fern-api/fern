import { FernRegistry } from "@fern-fern/registry";
import { matchPath, useLocation } from "react-router-dom";
import { DefinitionRoutes } from ".";
import { useAllEnvironments } from "../../queries/useAllEnvironments";

export function useCurrentEnvironment(): FernRegistry.Environment | undefined {
    const allEnvironments = useAllEnvironments();
    const currentEnvironmentId = useCurrentEnvironmentId();

    if (allEnvironments.type !== "loaded" || currentEnvironmentId == null) {
        return undefined;
    }
    return allEnvironments.value.environments.find((environment) => environment.id === currentEnvironmentId);
}

export function useCurrentEnvironmentId(): FernRegistry.EnvironmentId | undefined {
    const location = useLocation();
    const match = matchPath(DefinitionRoutes.API_ENVIRONMENT.absolutePath, location.pathname);
    if (match?.params.ENVIRONMENT_ID == null) {
        return undefined;
    }
    return FernRegistry.EnvironmentId(match.params.ENVIRONMENT_ID);
}

export function useCurrentEnvironmentIdOrThrow(): FernRegistry.EnvironmentId {
    const environment = useCurrentEnvironmentId();
    if (environment == null) {
        throw new Error("Environment is not in the URL");
    }
    return environment;
}
