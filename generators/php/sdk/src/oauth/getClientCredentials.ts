import { GeneratorError } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * The PHP SDK only emits a client-credentials token provider, so the other flows the
 * IR can model are rejected rather than silently generating a client without auth.
 */
export function getClientCredentialsOrThrow(scheme: FernIr.OAuthScheme): FernIr.OAuthClientCredentials {
    if (scheme.configuration.type !== "clientCredentials") {
        throw GeneratorError.irConversionError(
            `OAuth flow "${scheme.configuration.type}" is not supported by the PHP SDK generator`
        );
    }
    return scheme.configuration;
}
