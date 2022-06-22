import { HttpEndpoint, ServiceName } from "@fern-api/api";
import { HttpServiceTypeMetadata, ModelContext } from "@fern-typescript/commons";
import { upperFirst } from "lodash";
import { ServiceTypeFileWriter } from "../commons/service-type-reference/generateServiceTypeReference";

export function createHttpServiceTypeFileWriter({
    modelContext,
    serviceName,
    endpoint: { endpointId },
}: {
    modelContext: ModelContext;
    serviceName: ServiceName;
    endpoint: HttpEndpoint;
}): ServiceTypeFileWriter<HttpServiceTypeMetadata> {
    return (typeName, withFile) => {
        const transformedTypeName = `_${upperFirst(endpointId)}${typeName}`;
        const metadata: HttpServiceTypeMetadata = {
            serviceName,
            endpointId,
            typeName: transformedTypeName,
        };
        modelContext.addHttpServiceTypeDefinition(metadata, (file) => withFile(file, transformedTypeName));
        return metadata;
    };
}
