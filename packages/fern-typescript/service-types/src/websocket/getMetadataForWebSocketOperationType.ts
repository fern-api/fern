import { ServiceName } from "@fern-api/api";
import { upperFirst } from "lodash";
import { ServiceTypeMetadata, ServiceTypeName } from "../commons/service-type-reference/types";

export function getMetadataForWebSocketOperationType({
    channelName,
    operationId,
    type,
}: {
    channelName: ServiceName;
    operationId: string;
    type: ServiceTypeName;
}): ServiceTypeMetadata {
    const typeName = upperFirst(`${operationId}${type}`);
    return {
        typeName,
        fernFilepath: channelName.fernFilepath,
        relativeFilepathInServiceTypesDirectory: ["service-types", channelName.name],
    };
}
