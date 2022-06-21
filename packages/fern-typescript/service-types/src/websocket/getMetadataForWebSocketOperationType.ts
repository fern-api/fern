import { ServiceName } from "@fern-api/api";
import { getFilePathInModel } from "@fern-typescript/commons";
import { upperFirst } from "lodash";
import { Directory } from "ts-morph";
import { ServiceTypeMetadata, ServiceTypeName } from "../commons/service-type-reference/types";

export function getMetadataForWebSocketOperationType({
    modelDirectory,
    channelName,
    operationId,
    type,
}: {
    modelDirectory: Directory;
    channelName: ServiceName;
    operationId: string;
    type: ServiceTypeName;
}): ServiceTypeMetadata {
    const typeName = upperFirst(`${operationId}${type}`);
    const filepath = getFilePathInModel({
        modelDirectory,
        fernFilepath: channelName.fernFilepath,
        intermediateDirectories: ["service-types", channelName.name],
        filenameWithoutExtension: `${typeName}.ts`,
    });
    return { typeName, filepath };
}
