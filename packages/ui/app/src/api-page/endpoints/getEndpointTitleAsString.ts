import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { visitDiscriminatedUnion } from "../../utils/visitDiscriminatedUnion";

export function getEndpointTitleAsString(endpoint: FernRegistryApiRead.EndpointDefinition): string {
    return endpoint.name ?? getEndpointPathAsString(endpoint);
}

export function getEndpointPathAsString(endpoint: FernRegistryApiRead.EndpointDefinition): string {
    return (
        endpoint.method +
        " " +
        endpoint.path.parts
            .map((part) =>
                visitDiscriminatedUnion(part, "type")._visit({
                    literal: (literal) => literal.value,
                    pathParameter: (pathParameter) => getPathParameterAsString(pathParameter.value),
                    _other: () => "",
                })
            )
            .join("")
    );
}

export function getPathParameterAsString(pathParameterKey: FernRegistryApiRead.PathParameterKey): string {
    return `:${pathParameterKey}`;
}
