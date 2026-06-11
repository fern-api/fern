import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

/**
 * A non-literal request property (beyond client id / client secret) that the
 * generated SDK must collect from the user and forward to the OAuth token
 * endpoint. Examples include custom scopes or arbitrary required body
 * properties such as an entity id.
 */
export interface OAuthTokenRequestProperty {
    /** The camelCase parameter/field name used in generated PHP. */
    parameterName: string;
    /** The value type of the property. */
    valueType: FernIr.TypeReference;
    /** Whether the property is optional on the token request. */
    isOptional: boolean;
}

/**
 * Returns the required non-literal request properties (scopes and custom
 * properties) that must be threaded through the generated OAuth token provider.
 * Literal and optional properties are excluded: literals are emitted inline and
 * optional properties default to null on the request object.
 */
export function getOAuthTokenRequestProperties(
    context: SdkGeneratorContext,
    requestProperties: FernIr.OAuthAccessTokenRequestProperties
): OAuthTokenRequestProperty[] {
    const properties: OAuthTokenRequestProperty[] = [];

    const candidates: FernIr.RequestProperty[] = [
        ...(requestProperties.scopes != null ? [requestProperties.scopes] : []),
        ...(requestProperties.customProperties ?? [])
    ];

    for (const candidate of candidates) {
        const valueType = candidate.property.valueType;
        if (context.maybeLiteral(valueType) != null) {
            continue;
        }
        if (context.isOptional(valueType)) {
            continue;
        }
        properties.push({
            parameterName: context.case.camelUnsafe(candidate.property.name),
            valueType,
            isOptional: false
        });
    }

    return properties;
}
