import { FernFileContext, ResolvedEndpoint, TypeResolver } from "@fern-api/ir-generator";
import { RawSchemas } from "@fern-api/yaml-schema";
import { RuleViolation } from "../../Rule";
import { validateRefreshTokenEndpoint } from "./validateRefreshTokenEndpoint";
import { validateTokenEndpoint } from "./validateTokenEndpoint";

export async function validateClientCredentials({
    endpointId,
    endpoint,
    typeResolver,
    file,
    resolvedTokenEndpoint,
    resolvedRefreshEndpoint,
    clientCredentials: oauthScheme
}: {
    endpointId: string;
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedTokenEndpoint: ResolvedEndpoint;
    resolvedRefreshEndpoint: ResolvedEndpoint | undefined;
    clientCredentials: RawSchemas.OAuthClientCredentialsSchema;
}): Promise<RuleViolation[]> {
    const violations: RuleViolation[] = [];

    if (endpointId === resolvedTokenEndpoint.endpointId) {
        violations.push(
            ...(await validateTokenEndpoint({
                endpointId,
                endpoint,
                typeResolver,
                file,
                tokenEndpoint: oauthScheme["get-token"]
            }))
        );
    }

    if (oauthScheme["refresh-token"] != null && endpointId === resolvedRefreshEndpoint?.endpointId) {
        violations.push(
            ...(await validateRefreshTokenEndpoint({
                endpointId,
                endpoint,
                typeResolver,
                file,
                refreshEndpoint: oauthScheme["refresh-token"]
            }))
        );
    }

    return violations;
}
