import { EndpointId, ServiceName } from "@fern-api/api";
import { upperFirst } from "lodash";
import { ServiceTypeMetadata, ServiceTypeName } from "../commons/service-type-reference/types";

export function getMetadataForHttpServiceType({
    serviceName,
    endpointId,
    type,
}: {
    serviceName: ServiceName;
    endpointId: EndpointId;
    type: ServiceTypeName;
}): ServiceTypeMetadata {
    const typeName = upperFirst(`${endpointId}${type}`);
    return {
        typeName,
        fernFilepath: serviceName.fernFilepath,
        relativeFilepathInServiceTypesDirectory: ["service-types", serviceName.name],
    };
}
