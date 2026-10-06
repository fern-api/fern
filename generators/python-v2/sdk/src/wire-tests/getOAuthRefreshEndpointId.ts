import { FernIr } from "@fern-fern/ir-sdk";

interface ConfigurationWithRefreshEndpoint {
    type: string;
    refreshEndpoint: FernIr.OAuthRefreshEndpoint;
}

/**
 * Returns the refresh endpoint ID of an OAuth refresh-token flow scheme (IR `OAuthConfiguration.refreshToken`),
 * which the IR SDK version this generator is pinned to does not model yet.
 */
export function getOAuthRefreshEndpointId(scheme: FernIr.OAuthScheme): string | undefined {
    const configuration: { type: string } = scheme.configuration;
    return configuration.type === "refreshToken" && hasRefreshEndpoint(configuration)
        ? configuration.refreshEndpoint.endpointReference.endpointId
        : undefined;
}

function hasRefreshEndpoint(configuration: { type: string }): configuration is ConfigurationWithRefreshEndpoint {
    return "refreshEndpoint" in configuration;
}
