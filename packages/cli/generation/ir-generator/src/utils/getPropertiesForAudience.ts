import { RawSchemas } from "@fern-api/yaml-schema";
import { AudienceId } from "../filtered-ir/ids";

export function getPropertiesForAudience(
    properties: Record<string, RawSchemas.ObjectPropertySchema>
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
