import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Returns the refresh endpoint ID of an OAuth refresh-token flow scheme (IR `OAuthConfiguration.refreshToken`),
 * which the IR SDK version this generator is pinned to does not model yet.
 */
export function getOAuthRefreshEndpointId(scheme: FernIr.OAuthScheme): string | undefined {
    const configuration = scheme.configuration as unknown as {
        type: string;
        refreshEndpoint?: FernIr.OAuthRefreshEndpoint;
    };
    return configuration.type === "refreshToken"
        ? configuration.refreshEndpoint?.endpointReference.endpointId
        : undefined;
}
