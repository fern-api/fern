import { GeneratorError, getOriginalName } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * The C# SDK only emits a client-credentials token provider, so the other flows the IR can
 * model are rejected rather than silently generating a client without auth.
 */
export function getClientCredentialsOrThrow(scheme: FernIr.OAuthScheme): FernIr.OAuthClientCredentials {
    if (scheme.configuration.type !== "clientCredentials") {
        throw GeneratorError.irConversionError(
            `OAuth flow "${scheme.configuration.type}" is not supported by the C# SDK generator`
        );
    }
    return scheme.configuration;
}

const GRANT_TYPE_WIRE_VALUE = "grant_type";

/**
 * The client-credentials grant type is synthesized in the token request
 * rather than surfaced as a constructor parameter.
 */
export function isGrantTypeProperty(requestProperty: FernIr.RequestProperty): boolean {
    return getOriginalName(requestProperty.property.name) === GRANT_TYPE_WIRE_VALUE;
}
