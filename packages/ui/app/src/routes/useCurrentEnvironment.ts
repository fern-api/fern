import { FernRegistry } from "@fern-fern/registry";
import { useParams } from "react-router-dom";
import { FernRoutes } from ".";
import { useAllEnvironments } from "../api-page/queries/useAllEnvironments";

export function useCurrentEnvironment(): FernRegistry.Environment | undefined {
    const allEnvironments = useAllEnvironments();
    const currentEnvironmentId = useCurrentEnvironmentId();

    if (allEnvironments.type !== "loaded" || !allEnvironments.value.ok || currentEnvironmentId == null) {
        return undefined;
    }
    return allEnvironments.value.body.environments.find((environment) => environment.id === currentEnvironmentId);
}

export function useCurrentEnvironmentId(): FernRegistry.EnvironmentId | undefined {
    const { [FernRoutes.API_DEFINITION.parameters.ENVIRONMENT_ID]: environmentParam } = useParams();

    if (environmentParam == null) {
        return undefined;
    }

    return FernRegistry.EnvironmentId(environmentParam);
}

export function useCurrentEnvironmentIdOrThrow(): FernRegistry.EnvironmentId {
    const environment = useCurrentEnvironmentId();
    if (environment == null) {
        throw new Error("Environment is not in the URL");
    }
    return environment;
}
