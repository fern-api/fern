import { FernOpenapiIr } from "@fern-api/openapi-ir-sdk";
import { buildEndpoint } from "./buildEndpoint";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { getEndpointLocation } from "./utils/getEndpointLocation";

export function buildServices(context: OpenApiIrConverterContext): {
    schemaIdsToExclude: string[];
    sdkGroups: Set<string>;
} {
    const sdkGroups = new Set<string>();
    const { endpoints, tags } = context.ir;
    let schemaIdsToExclude: string[] = [];
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
                const value = groupInfo[groupName];
                if (value == null) {
                    break;
                } else if (value.summary != null || value.description != null) {
                    group = groupInfo[groupName];
                    break;
                }
            }
        }
        const irTag = tag == null ? undefined : tags.tagsById[tag];
        const convertedEndpoint = buildEndpoint({
            context,
            endpoint,
            declarationFile: file
        });
        schemaIdsToExclude = [...schemaIdsToExclude, ...convertedEndpoint.schemaIdsToExclude];
        context.builder.addEndpoint(file, {
            name: endpointId,
            schema: convertedEndpoint.value
        });
        if (irTag?.id != null || irTag?.description != null) {
            context.builder.setServiceInfo(file, {
                displayName: group?.summary ?? irTag?.id,
                docs: group?.description ?? irTag?.description ?? undefined
            });
        }
    }
    return { schemaIdsToExclude, sdkGroups };
}
