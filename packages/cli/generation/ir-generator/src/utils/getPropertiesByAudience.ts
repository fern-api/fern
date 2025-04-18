import { RawSchemas } from "@fern-api/fern-definition-schema";

import { AudienceId } from "../filtered-ir/ids";

export function getPropertiesByAudience(
    properties: Record<string, RawSchemas.ObjectPropertySchema | RawSchemas.HttpQueryParameterSchema>
): Record<AudienceId, Set<string>> {
    const propertiesByAudience: Record<AudienceId, Set<string>> = {};
    for (const [property, propertyDeclaration] of Object.entries(properties)) {
        if (typeof propertyDeclaration === "string") {
            continue;
        }
        for (const audience of propertyDeclaration.audiences ?? []) {
            if (propertiesByAudience[audience] == null) {
                propertiesByAudience[audience] = new Set();
            }
            propertiesByAudience[audience]?.add(property);
        }
    }
    return propertiesByAudience;
}
