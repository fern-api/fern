import { DeclaredServiceName, HttpEndpoint } from "@fern-fern/ir-model/services";
import { HttpServiceTypeMetadata, ModelContext } from "@fern-typescript/model-context";
import { ServiceTypeFileWriter } from "../commons/service-type-reference/generateServiceTypeReference";
import { getServiceTypeName } from "../commons/service-type-reference/getServiceTypeName";

export function createHttpServiceTypeFileWriter({
    modelContext,
    serviceName,
    endpoint,
}: {
    modelContext: ModelContext;
    serviceName: DeclaredServiceName;
    endpoint: HttpEndpoint;
}): ServiceTypeFileWriter<HttpServiceTypeMetadata> {
    return (typeName, withFile) => {
        const transformedTypeName = getServiceTypeName({
            proposedName: `${endpoint.name.pascalCase}${typeName}`,
            fernFilepath: serviceName.fernFilepath,
            modelContext,
        });
        const metadata: HttpServiceTypeMetadata = {
            serviceName,
            endpointId: endpoint.name.camelCase,
            typeName: transformedTypeName,
        };
        modelContext.addHttpServiceTypeDeclaration(metadata, (file) => withFile(file, transformedTypeName));
        return metadata;
    };
}
