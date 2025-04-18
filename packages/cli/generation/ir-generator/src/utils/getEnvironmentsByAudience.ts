import { RawSchemas } from "@fern-api/fern-definition-schema";

import { AudienceId } from "../filtered-ir/ids";

export function getAudienceForEnvironment(
    environmentId: string,
    rawEnvironments:
        | Record<
              string,
              string | RawSchemas.SingleBaseUrlEnvironmentSchema | RawSchemas.MultipleBaseUrlsEnvironmentSchema
          >
        | undefined
): AudienceId[] | undefined {
    if (rawEnvironments) {
        for (const [envId, environment] of Object.entries(rawEnvironments)) {
            if (typeof environment !== "string" && envId === environmentId) {
                return environment.audiences;
            }
        }
    }
    return undefined;
}
