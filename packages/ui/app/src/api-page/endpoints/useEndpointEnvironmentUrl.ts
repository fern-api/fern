import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useMemo } from "react";

export function useEndpointEnvironmentUrl(endpoint: FernRegistryApiRead.EndpointDefinition): string | undefined {
    return useMemo(() => {
        if (endpoint.defaultEnvironment != null) {
            const defaultEnvironment = endpoint.environments.find((env) => env.id === endpoint.defaultEnvironment);
            if (defaultEnvironment != null) {
                return defaultEnvironment.baseUrl;
            }
        }
        return endpoint.environments[0]?.baseUrl;
    }, [endpoint.defaultEnvironment, endpoint.environments]);
}
