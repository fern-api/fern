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
                displayName: irTag?.id,
                docs: irTag?.description ?? undefined
            });
        }
    }
    return { schemaIdsToExclude, sdkGroups };
}
