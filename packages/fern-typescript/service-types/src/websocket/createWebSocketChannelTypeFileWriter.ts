import { ServiceName, WebSocketOperation } from "@fern-api/api";
import { ModelContext, WebSocketChannelTypeMetadata } from "@fern-typescript/model-context";
import { upperFirst } from "lodash";
import { ServiceTypeFileWriter } from "../commons/service-type-reference/generateServiceTypeReference";
import { getServiceTypeName } from "../commons/service-type-reference/getServiceTypeName";

export function createWebSocketChannelTypeFileWriter({
    modelContext,
    channelName,
    operation: { operationId },
}: {
    modelContext: ModelContext;
    channelName: ServiceName;
    operation: WebSocketOperation;
}): ServiceTypeFileWriter<WebSocketChannelTypeMetadata> {
    return (typeName, withFile) => {
        const transformedTypeName = getServiceTypeName({
            proposedName: `${upperFirst(operationId)}${typeName}`,
            fernFilepath: channelName.fernFilepath,
            modelContext,
        });
        const metadata: WebSocketChannelTypeMetadata = {
            channelName,
            operationId,
            typeName: transformedTypeName,
        };
        modelContext.addWebSocketChannelTypeDefinition(metadata, (file) => withFile(file, transformedTypeName));
        return metadata;
    };
}
