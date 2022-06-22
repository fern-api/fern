import { EndpointId, ServiceName } from "@fern-api/api";
import { ServiceTypeMetadata } from "@fern-typescript/commons";
import { upperFirst } from "lodash";
import { ServiceTypeName } from "../commons/service-type-reference/types";

export function getMetadataForHttpServiceType({
    serviceName,
    endpointId,
    type,
}: {
    serviceName: ServiceName;
    endpointId: EndpointId;
    type: ServiceTypeName;
}): ServiceTypeMetadata {
    const typeName = `_${upperFirst(`${endpointId}${type}`)}`;
    return {
        typeName,
        fernFilepath: serviceName.fernFilepath,
        relativeFilepathInServiceTypesDirectory: [serviceName.name],
    };
}
