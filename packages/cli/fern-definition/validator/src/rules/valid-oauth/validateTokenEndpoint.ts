import chalk from "chalk";

import { RawSchemas } from "@fern-api/fern-definition-schema";
import { FernFileContext, TypeResolver } from "@fern-api/ir-generator";

import { RuleViolation } from "../../Rule";
import { maybeFileFromResolvedType, resolveResponseType } from "../../utils/propertyValidatorUtils";
import {
    DEFAULT_ACCESS_TOKEN,
    DEFAULT_CLIENT_ID,
    DEFAULT_CLIENT_SECRET,
    validateAccessTokenResponseProperty,
    validateClientIdRequestProperty,
    validateClientSecretRequestProperty,
    validateExpiresInResponseProperty,
    validateRefreshTokenResponseProperty,
    validateScopesRequestProperty
} from "./validateUtils";

export function validateTokenEndpoint({
    endpointId,
    endpoint,
    typeResolver,
    file,
    tokenEndpoint
}: {
    endpointId: string;
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
    tokenEndpoint: RawSchemas.OAuthGetTokenEndpointSchema;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    const maybeClientId = tokenEndpoint["request-properties"]?.["client-id"];
    if (maybeClientId != null) {
        violations.push(
            ...validateClientIdRequestProperty({
                endpointId,
                endpoint,
                typeResolver,
                file,
                clientIdProperty: maybeClientId
            })
        );
    } else {
        const clientIdViolations = validateClientIdRequestProperty({
            endpointId,
            endpoint,
            typeResolver,
            file,
            clientIdProperty: DEFAULT_CLIENT_ID
        });
        if (clientIdViolations.length > 0) {
            violations.push({
                severity: "error",
                message: `OAuth configuration for endpoint ${chalk.bold(
                    endpointId
                )} is missing a valid client-id, such as '${DEFAULT_CLIENT_ID}'.`
            });
        }
    }

    const maybeClientSecret = tokenEndpoint["request-properties"]?.["client-secret"];
    if (maybeClientSecret != null) {
        violations.push(
            ...validateClientSecretRequestProperty({
                endpointId,
                endpoint,
                typeResolver,
                file,
                clientSecretProperty: maybeClientSecret
            })
        );
    } else {
        const clientSecretViolations = validateClientSecretRequestProperty({
            endpointId,
            endpoint,
            typeResolver,
            file,
            clientSecretProperty: DEFAULT_CLIENT_SECRET
        });
        if (clientSecretViolations.length > 0) {
            violations.push({
                severity: "error",
                message: `OAuth configuration for endpoint ${chalk.bold(
                    endpointId
                )} is missing a valid client-secret, such as '${DEFAULT_CLIENT_SECRET}'.`
            });
        }
    }

    const scopesProperty = tokenEndpoint?.["request-properties"]?.scopes;
    if (scopesProperty != null) {
        violations.push(
            ...validateScopesRequestProperty({
                endpointId,
                endpoint,
                typeResolver,
                file,
                scopesProperty
            })
        );
    }

    const resolvedResponseType = resolveResponseType({ endpoint, typeResolver, file });
    if (resolvedResponseType == null) {
        violations.push({
            severity: "error",
            message: `OAuth configuration for endpoint ${chalk.bold(endpointId)} must define a response type.`
        });
        return violations;
    }

    const maybeAccessToken = tokenEndpoint["response-properties"]?.["access-token"];
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

    const expiresInProperty = tokenEndpoint?.["response-properties"]?.["expires-in"];
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

    const refreshTokenProperty = tokenEndpoint?.["response-properties"]?.["refresh-token"];
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
