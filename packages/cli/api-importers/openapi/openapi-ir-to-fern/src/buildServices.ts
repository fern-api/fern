import { RawSchemas } from "@fern-api/fern-definition-schema";
import { FernOpenapiIr } from "@fern-api/openapi-ir";
import { RelativeFilePath } from "@fern-api/path-utils";
import { buildEndpoint } from "./buildEndpoint.js";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext.js";
import { State } from "./State.js";
import { convertToSourceSchema } from "./utils/convertToSourceSchema.js";
import { getEndpointLocation } from "./utils/getEndpointLocation.js";

/**
 * Separator used to create unique endpoint keys when endpoints with the same
 * SDK method name have disjoint audiences. The suffix is stripped during IR
 * generation so the SDK method name remains unchanged.
 */
export const AUDIENCE_SUFFIX_SEPARATOR = "__aud_";

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
        if (fileEndpoints != null && fileEndpoints.has(endpointId)) {
            const existingSchema = fileEndpoints.get(endpointId);
            if (
                existingSchema != null &&
                audiencesAreDisjoint(existingSchema.audiences, convertedEndpoint.value.audiences)
            ) {
                // Rename the existing endpoint with its audience suffix
                const existingAudiences = existingSchema.audiences ?? [];
                const existingAudSuffix =
                    existingAudiences.length > 0 ? existingAudiences.join("_") : "default";
                const existingNewKey = `${endpointId}${AUDIENCE_SUFFIX_SEPARATOR}${existingAudSuffix}`;

                // Remove the old key and re-add with the audience-suffixed key
                context.builder.renameEndpoint(file, endpointId, existingNewKey);
                fileEndpoints.delete(endpointId);
                fileEndpoints.set(existingNewKey, existingSchema);

                // Suffix the new endpoint's key
                const newAudiences = convertedEndpoint.value.audiences ?? [];
                const newAudSuffix = newAudiences.length > 0 ? newAudiences.join("_") : "default";
                resolvedEndpointId = `${endpointId}${AUDIENCE_SUFFIX_SEPARATOR}${newAudSuffix}`;
            } else {
                // Check if there's already an audience-suffixed version of this endpoint
                // (i.e., we've already renamed previous collisions)
                const newAudiences = convertedEndpoint.value.audiences ?? [];
                const newAudSuffix = newAudiences.length > 0 ? newAudiences.join("_") : "default";
                const candidateKey = `${endpointId}${AUDIENCE_SUFFIX_SEPARATOR}${newAudSuffix}`;
                if (
                    [...fileEndpoints.keys()].some(
                        (key) => key.startsWith(`${endpointId}${AUDIENCE_SUFFIX_SEPARATOR}`)
                    )
                ) {
                    resolvedEndpointId = candidateKey;
                }
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
