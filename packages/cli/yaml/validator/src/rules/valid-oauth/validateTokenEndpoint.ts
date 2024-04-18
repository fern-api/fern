import { FernFileContext, TypeResolver } from "@fern-api/ir-generator";
import { RawSchemas } from "@fern-api/yaml-schema";
import chalk from "chalk";
import { RuleViolation } from "../../Rule";
import { maybeFileFromResolvedType, resolveResponseType } from "../../utils/propertyValidatorUtils";
import {
    validateAccessTokenResponseProperty,
    validateExpiresInResponseProperty,
    validateRefreshTokenResponseProperty
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

    const resolvedResponseType = resolveResponseType({ endpoint, typeResolver, file });
    if (resolvedResponseType == null) {
        violations.push({
            severity: "error",
            message: `OAuth configuration for endpoint ${chalk.bold(endpointId)} must define a response type.`
        });
        return violations;
    }

    violations.push(
        ...validateAccessTokenResponseProperty({
            endpointId,
            typeResolver,
            file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
            resolvedResponseType,
            accessTokenProperty: tokenEndpoint["response-properties"]["access-token"]
        })
    );

    const expiresInProperty = tokenEndpoint["response-properties"]["expires-in"];
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

    const refreshTokenProperty = tokenEndpoint["response-properties"]["refresh-token"];
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

    // TODO: Validate the request has 'grant_type: literal<"client_credentials">'.

    return violations;
}
