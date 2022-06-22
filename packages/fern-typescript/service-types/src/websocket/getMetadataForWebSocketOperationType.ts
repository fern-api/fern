import { ServiceName } from "@fern-api/api";
import { ServiceTypeMetadata } from "@fern-typescript/commons";
import { upperFirst } from "lodash";
import { ServiceTypeName } from "../commons/service-type-reference/types";

export function getMetadataForWebSocketOperationType({
    channelName,
    operationId,
    type,
}: {
    channelName: ServiceName;
    operationId: string;
    type: ServiceTypeName;
}): ServiceTypeMetadata {
    const typeName = `_${upperFirst(`${operationId}${type}`)}`;
    return {
        typeName,
        fernFilepath: channelName.fernFilepath,
        relativeFilepathInServiceTypesDirectory: [channelName.name],
    };
}
