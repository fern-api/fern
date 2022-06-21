import { EndpointId, ServiceName } from "@fern-api/api";
import { getFilePathInModel } from "@fern-typescript/commons";
import { upperFirst } from "lodash";
import { Directory } from "ts-morph";
import { ServiceTypeMetadata, ServiceTypeName } from "../commons/service-type-reference/types";

export function getMetadataForHttpServiceType({
    modelDirectory,
    serviceName,
    endpointId,
    type,
}: {
    modelDirectory: Directory;
    serviceName: ServiceName;
    endpointId: EndpointId;
    type: ServiceTypeName;
}): ServiceTypeMetadata {
    const typeName = upperFirst(`${endpointId}${type}`);
    const filepath = getFilePathInModel({
        modelDirectory,
        fernFilepath: serviceName.fernFilepath,
        intermediateDirectories: ["service-types", serviceName.name],
        filenameWithoutExtension: `${typeName}.ts`,
    });
    return { typeName, filepath };
}
