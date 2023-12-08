import { buildEndpoint } from "./buildEndpoint";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { getEndpointLocation } from "./utils/getEndpointLocation";

export function buildServices(context: OpenApiIrConverterContext): { schemaIdsToExclude: string[] } {
    const { endpoints, tags } = context.ir;
    let schemaIdsToExclude: string[] = [];
    for (const endpoint of endpoints) {
        const { endpointId, file, tag } = getEndpointLocation(endpoint);
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
        if (irTag != null) {
            context.builder.setServiceDisplayName(file, irTag.id);
        }
    }
    return { schemaIdsToExclude };
}
