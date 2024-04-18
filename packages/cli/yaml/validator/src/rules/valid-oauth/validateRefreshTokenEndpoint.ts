import { FernFileContext, TypeResolver } from "@fern-api/ir-generator";
import { RawSchemas } from "@fern-api/yaml-schema";
import chalk from "chalk";
import { RuleViolation } from "../../Rule";
import { maybeFileFromResolvedType, resolveResponseType } from "../../utils/propertyValidatorUtils";
import {
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

    violations.push(
        ...validateRefreshTokenRequestProperty({
            endpointId,
            endpoint,
            typeResolver,
            file,
            refreshTokenProperty: refreshEndpoint["request-properties"]["refresh-token"]
        })
    );

    const resolvedResponseType = resolveResponseType({ endpoint, typeResolver, file });
    if (resolvedResponseType == null) {
        violations.push({
            severity: "error",
            message: `OAuth configuration for endpoint ${chalk.bold(endpointId)} must define a response type.`
        });
        return violations;
    }

    const accessTokenProperty = refreshEndpoint["response-properties"]["access-token"];
    if (accessTokenProperty != null) {
        violations.push(
            ...validateAccessTokenResponseProperty({
                endpointId,
                typeResolver,
                file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
                resolvedResponseType,
                accessTokenProperty
            })
        );
    }

    const expiresInProperty = refreshEndpoint["response-properties"]["expires-in"];
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

    const refreshTokenProperty = refreshEndpoint["response-properties"]["refresh-token"];
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

    // TODO: Validate the request has 'grant_type: literal<"refresh_token">'.

    return violations;
}
