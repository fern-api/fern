import { FernIr } from "@fern-fern/ir-sdk";

/**
 * The TypeScript SDK only emits a client-credentials token provider, so the other flows the
 * IR can model are rejected rather than silently generating a client without auth.
 */
export function getClientCredentialsOrThrow(scheme: FernIr.OAuthScheme): FernIr.OAuthClientCredentials {
    if (scheme.configuration.type !== "clientCredentials") {
        throw new Error(`OAuth flow "${scheme.configuration.type}" is not supported by the TypeScript SDK generator`);
    }
    return scheme.configuration;
}
