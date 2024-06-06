import { FernFileContext, TypeResolver } from "@fern-api/ir-generator";
import { RawSchemas } from "@fern-api/yaml-schema";
import chalk from "chalk";
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

export async function validateRefreshTokenEndpoint({
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
}): Promise<RuleViolation[]> {
    const violations: RuleViolation[] = [];

    const maybeRefreshToken = refreshEndpoint["request-properties"]?.["refresh-token"];
    if (maybeRefreshToken != null) {
        violations.push(
            ...(await validateRefreshTokenRequestProperty({
                endpointId,
                endpoint,
                typeResolver,
                file,
                refreshTokenProperty: maybeRefreshToken
            }))
        );
    } else {
        const refreshTokenViolations = await validateRefreshTokenRequestProperty({
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

    const resolvedResponseType = await resolveResponseType({ endpoint, typeResolver, file });
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
            ...(await validateAccessTokenResponseProperty({
                endpointId,
                typeResolver,
                file,
                resolvedResponseType,
                accessTokenProperty: maybeAccessToken
            }))
        );
    } else {
        const accessTokenViolations = await validateAccessTokenResponseProperty({
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
            ...(await validateExpiresInResponseProperty({
                endpointId,
                typeResolver,
                file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
                resolvedResponseType,
                expiresInProperty
            }))
        );
    }

    const refreshTokenProperty = refreshEndpoint?.["response-properties"]?.["refresh-token"];
    if (refreshTokenProperty != null) {
        violations.push(
            ...(await validateRefreshTokenResponseProperty({
                endpointId,
                typeResolver,
                file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
                resolvedResponseType,
                refreshTokenProperty
            }))
        );
    }

    return violations;
}
