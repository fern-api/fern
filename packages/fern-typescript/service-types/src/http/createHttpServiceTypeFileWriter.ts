import { HttpEndpoint, ServiceName } from "@fern-fern/ir-model";
import { HttpServiceTypeMetadata, ModelContext } from "@fern-typescript/model-context";
import { upperFirst } from "lodash";
import { ServiceTypeFileWriter } from "../commons/service-type-reference/generateServiceTypeReference";
import { getServiceTypeName } from "../commons/service-type-reference/getServiceTypeName";

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
        const transformedTypeName = getServiceTypeName({
            proposedName: `${upperFirst(endpointId)}${typeName}`,
            fernFilepath: serviceName.fernFilepath,
            modelContext,
        });
        const metadata: HttpServiceTypeMetadata = {
            serviceName,
            endpointId,
            typeName: transformedTypeName,
        };
        modelContext.addHttpServiceTypeDeclaration(metadata, (file) => withFile(file, transformedTypeName));
        return metadata;
    };
}
