import { FernRegistry } from "@fern-fern/registry";
import { matchPath, useLocation } from "react-router-dom";
import { DefinitionRoutes } from ".";
import { useAllEnvironments } from "../../queries/useAllEnvironments";
import { LATEST_VERSION_ENVIRONMENT_PATH_PARAMETER } from "./constants";

export type ParsedEnvironmentId =
    | { type: "latest" }
    | { type: "environment"; environmentId: FernRegistry.EnvironmentId };

export function useCurrentEnvironment(): FernRegistry.Environment | undefined {
    const allEnvironments = useAllEnvironments();
    const currentEnvironmentId = useCurrentEnvironmentId();

    if (allEnvironments.type !== "loaded" || currentEnvironmentId.type !== "environment") {
        return undefined;
    }

    return allEnvironments.value.environments.find(
        (environment) => environment.id === currentEnvironmentId.environmentId
    );
}

export function useCurrentEnvironmentId(): ParsedEnvironmentId {
    const location = useLocation();
    return parseEnvironmentIdFromPath(location.pathname);
}

export function parseEnvironmentIdFromPath(path: string): ParsedEnvironmentId {
    const match = matchPath(`${DefinitionRoutes.API_ENVIRONMENT.absolutePath}/*`, path);
    if (
        // default to latest
        match?.params.ENVIRONMENT_ID == null ||
        match.params.ENVIRONMENT_ID === LATEST_VERSION_ENVIRONMENT_PATH_PARAMETER
    ) {
        return { type: "latest" };
    }
    return { type: "environment", environmentId: FernRegistry.EnvironmentId(match.params.ENVIRONMENT_ID) };
}
