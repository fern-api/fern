import { RawSchemas } from "@fern-api/yaml-schema";
import { AudienceId } from "../filtered-ir/ids";

export function getEnvironmentByAudience(
    environments: Record<
        string,
        string | RawSchemas.SingleBaseUrlEnvironmentSchema | RawSchemas.MultipleBaseUrlsEnvironmentSchema
    >
): Record<AudienceId, Set<string>> {
    const environmentByAudience: Record<AudienceId, Set<string>> = {};
    for (const [environmentId, environment] of Object.entries(environments)) {
        if (typeof environment === "string") {
            continue;
        }
        for (const audience of environment.audiences ?? []) {
            if (environmentByAudience[audience] == null) {
                environmentByAudience[audience] = new Set();
            }
            environmentByAudience[audience]?.add(environmentId);
        }
    }
    return environmentByAudience;
}
