import chalk from "chalk";

import { RawSchemas } from "@fern-api/fern-definition-schema";
import { FernFileContext, TypeResolver } from "@fern-api/ir-generator";

import { RuleViolation } from "../../Rule";
import { maybeFileFromResolvedType, resolveResponseType } from "../../utils/propertyValidatorUtils";
import {
    DEFAULT_ACCESS_TOKEN,
    DEFAULT_REFRESH_TOKEN,
    validateAccessTokenResponseProperty,
    validateExpiresInResponseProperty,
    validateRefreshTokenRequestProperty,
    validateRefreshTokenResponseProperty
} from "./validateUtils";

export function validateRefreshTokenEndpoint({
    endpointId,
    endpoint,
    typeResolver,
    file,
    refreshEndpoint
}: {
    endpointId: string;
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
    refreshEndpoint: RawSchemas.OAuthRefreshTokenEndpointSchema;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    const maybeRefreshToken = refreshEndpoint["request-properties"]?.["refresh-token"];
    if (maybeRefreshToken != null) {
        violations.push(
            ...validateRefreshTokenRequestProperty({
                endpointId,
                endpoint,
                typeResolver,
                file,
                refreshTokenProperty: maybeRefreshToken
            })
        );
    } else {
        const refreshTokenViolations = validateRefreshTokenRequestProperty({
            endpointId,
            endpoint,
            typeResolver,
            file,
            refreshTokenProperty: DEFAULT_REFRESH_TOKEN
        });
        if (refreshTokenViolations.length > 0) {
            violations.push({
                severity: "error",
                message: `OAuth configuration for endpoint ${chalk.bold(
                    endpointId
                )} is missing a valid refresh-token, such as '${DEFAULT_REFRESH_TOKEN}'.`
            });
        }
    }

    const resolvedResponseType = resolveResponseType({ endpoint, typeResolver, file });
    if (resolvedResponseType == null) {
        violations.push({
            severity: "error",
            message: `OAuth configuration for endpoint ${chalk.bold(endpointId)} must define a response type.`
        });
        return violations;
    }

    const maybeAccessToken = refreshEndpoint["response-properties"]?.["access-token"];
    if (maybeAccessToken != null) {
        violations.push(
            ...validateAccessTokenResponseProperty({
                endpointId,
                typeResolver,
                file,
                resolvedResponseType,
                accessTokenProperty: maybeAccessToken
            })
        );
    } else {
        const accessTokenViolations = validateAccessTokenResponseProperty({
            endpointId,
            typeResolver,
            file,
            resolvedResponseType,
            accessTokenProperty: DEFAULT_ACCESS_TOKEN
        });
        if (accessTokenViolations.length > 0) {
            violations.push({
                severity: "error",
                message: `OAuth configuration for endpoint ${chalk.bold(
                    endpointId
                )} is missing a valid access-token, such as '${DEFAULT_ACCESS_TOKEN}'.`
            });
        }
    }

    const expiresInProperty = refreshEndpoint?.["response-properties"]?.["expires-in"];
    if (expiresInProperty != null) {
        violations.push(
            ...validateExpiresInResponseProperty({
                endpointId,
                typeResolver,
                file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
                resolvedResponseType,
                expiresInProperty
            })
        );
    }

    const refreshTokenProperty = refreshEndpoint?.["response-properties"]?.["refresh-token"];
    if (refreshTokenProperty != null) {
        violations.push(
            ...validateRefreshTokenResponseProperty({
                endpointId,
                typeResolver,
                file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
                resolvedResponseType,
                refreshTokenProperty
            })
        );
    }

    return violations;
}
