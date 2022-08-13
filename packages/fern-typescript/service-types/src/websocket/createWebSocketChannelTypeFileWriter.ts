import { DeclaredServiceName, WebSocketOperation } from "@fern-fern/ir-model/services";
import { ModelContext, WebSocketChannelTypeMetadata } from "@fern-typescript/model-context";
import { ServiceTypeFileWriter } from "../commons/service-type-reference/generateServiceTypeReference";
import { getServiceTypeName } from "../commons/service-type-reference/getServiceTypeName";

export function createWebSocketChannelTypeFileWriter({
    modelContext,
    channelName,
    operation,
}: {
    modelContext: ModelContext;
    channelName: DeclaredServiceName;
    operation: WebSocketOperation;
}): ServiceTypeFileWriter<WebSocketChannelTypeMetadata> {
    return (typeName, withFile) => {
        const transformedTypeName = getServiceTypeName({
            proposedName: `${operation.name.pascalCase}${typeName}`,
            fernFilepath: channelName.fernFilepath,
            modelContext,
        });
        const metadata: WebSocketChannelTypeMetadata = {
            channelName,
            operationId: operation.name.camelCase,
            typeName: transformedTypeName,
        };
        modelContext.addWebSocketChannelTypeDeclaration(metadata, (file) => withFile(file, transformedTypeName));
        return metadata;
    };
}
