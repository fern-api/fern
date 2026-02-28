import { AUDIENCE_SUFFIX_SEPARATOR, RawSchemas } from "@fern-api/fern-definition-schema";
import { FernOpenapiIr } from "@fern-api/openapi-ir";
import { RelativeFilePath } from "@fern-api/path-utils";
import { buildEndpoint } from "./buildEndpoint.js";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext.js";
import { State } from "./State.js";
import { convertToSourceSchema } from "./utils/convertToSourceSchema.js";
import { getEndpointLocation } from "./utils/getEndpointLocation.js";

// Re-export for any consumers that imported from here
export { AUDIENCE_SUFFIX_SEPARATOR } from "@fern-api/fern-definition-schema";

export interface ConvertedServicesResponse {
    schemaIdsToExclude: string[];
    sdkGroups: Set<string>;
}

/**
 * Check if two audience sets are disjoint (no overlap).
 * Empty arrays are treated as wildcards (match everything), so they always overlap.
 */
function audiencesAreDisjoint(a: string[] | undefined, b: string[] | undefined): boolean {
    if (a == null || a.length === 0 || b == null || b.length === 0) {
        return false;
    }
    return !a.some((aud) => b.includes(aud));
}

export function buildServices(context: OpenApiIrConverterContext): ConvertedServicesResponse {
    const sdkGroups = new Set<string>();
    const { endpoints, tags } = context.ir;
    let schemaIdsToExclude: string[] = [];

    // Track endpoints added per file to detect collisions
    const endpointsByFile = new Map<RelativeFilePath, Map<string, RawSchemas.HttpEndpointSchema>>();
    // Track which original endpointIds have been expanded into audience-suffixed keys per file
    const expandedEndpointIds = new Map<RelativeFilePath, Set<string>>();

    for (const endpoint of endpoints) {
        const { endpointId, file, tag } = getEndpointLocation(endpoint);
        const sdkGroup = file.split(".")[0];
        if (sdkGroup != null) {
            sdkGroups.add(sdkGroup);
        }
        let group = undefined;
        if (endpoint.sdkName != null) {
            const groupInfo: Record<string, FernOpenapiIr.SdkGroupInfo> = context.ir.groups;
            for (const groupName of endpoint.sdkName.groupName) {
                const trueGroupName = typeof groupName === "string" ? groupName : groupName.name;
                const value = groupInfo[trueGroupName];
                if (value == null) {
                    break;
                } else if (value.summary != null || value.description != null) {
                    group = groupInfo[trueGroupName];
                    break;
                }
            }
        }
        const irTag = tag == null ? undefined : tags.tagsById[tag];

        context.setInState(State.Endpoint);
        context.setEndpointMethod(endpoint.method);
        const convertedEndpoint = buildEndpoint({
            context,
            endpoint,
            declarationFile: file
        });
        context.unsetEndpointMethod();
        context.unsetInState(State.Endpoint);

        schemaIdsToExclude = [...schemaIdsToExclude, ...convertedEndpoint.schemaIdsToExclude];

        // Resolve the endpoint key, handling collisions for disjoint audiences
        let resolvedEndpointId = endpointId;
        const fileEndpoints = endpointsByFile.get(file);
        const fileExpanded = expandedEndpointIds.get(file);

        // Check if this endpointId was already expanded into suffixed keys
        if (fileExpanded != null && fileExpanded.has(endpointId)) {
            // Already expanded — verify the new endpoint is disjoint from ALL existing
            // variants before suffixing. An endpoint with no audiences (wildcard) overlaps
            // with everything per audiencesAreDisjoint(), so it won't be suffixed.
            const newAudiences = convertedEndpoint.value.audiences ?? [];
            const isDisjointFromAll =
                fileEndpoints != null &&
                Array.from(fileEndpoints.entries())
                    .filter(([key]) => key.startsWith(`${endpointId}${AUDIENCE_SUFFIX_SEPARATOR}`))
                    .every(([, schema]) => audiencesAreDisjoint(schema.audiences, convertedEndpoint.value.audiences));
            if (isDisjointFromAll && newAudiences.length > 0) {
                resolvedEndpointId = `${endpointId}${AUDIENCE_SUFFIX_SEPARATOR}${newAudiences.join("_")}`;
            }
        } else if (fileEndpoints != null && fileEndpoints.has(endpointId)) {
            const existingSchema = fileEndpoints.get(endpointId);
            if (
                existingSchema != null &&
                audiencesAreDisjoint(existingSchema.audiences, convertedEndpoint.value.audiences)
            ) {
                // First collision: rename the existing endpoint with its audience suffix
                const existingAudiences = existingSchema.audiences ?? [];
                const existingAudSuffix = existingAudiences.length > 0 ? existingAudiences.join("_") : "default";
                const existingNewKey = `${endpointId}${AUDIENCE_SUFFIX_SEPARATOR}${existingAudSuffix}`;

                // Remove the old key and re-add with the audience-suffixed key
                context.builder.renameEndpoint(file, endpointId, existingNewKey);
                fileEndpoints.delete(endpointId);
                fileEndpoints.set(existingNewKey, existingSchema);

                // Suffix the new endpoint's key
                const newAudiences = convertedEndpoint.value.audiences ?? [];
                const newAudSuffix = newAudiences.length > 0 ? newAudiences.join("_") : "default";
                resolvedEndpointId = `${endpointId}${AUDIENCE_SUFFIX_SEPARATOR}${newAudSuffix}`;

                // Mark this endpointId as expanded so subsequent endpoints are handled
                if (!expandedEndpointIds.has(file)) {
                    expandedEndpointIds.set(file, new Set());
                }
                expandedEndpointIds.get(file)?.add(endpointId);
            }
        }

        context.builder.addEndpoint(file, {
            name: resolvedEndpointId,
            schema: convertedEndpoint.value,
            source: endpoint.source != null ? convertToSourceSchema(endpoint.source) : undefined
        });

        // Track the endpoint
        if (!endpointsByFile.has(file)) {
            endpointsByFile.set(file, new Map());
        }
        endpointsByFile.get(file)?.set(resolvedEndpointId, convertedEndpoint.value);

        if (irTag?.id != null || irTag?.description != null) {
            context.builder.setServiceInfo(file, {
                "display-name": group?.summary ?? irTag?.id,
                docs: group?.description ?? irTag?.description ?? undefined
            });
        }
    }
    return { schemaIdsToExclude, sdkGroups };
}
