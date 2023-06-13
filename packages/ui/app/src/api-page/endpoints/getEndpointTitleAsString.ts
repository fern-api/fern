import * as FernRegistryApiRead from "@fern-fern/registry-browser/serialization/resources/api/resources/v1/resources/read";
import { visitDiscriminatedUnion } from "../../utils/visitDiscriminatedUnion";

export function getEndpointTitleAsString(endpoint: FernRegistryApiRead.EndpointDefinition.Raw): string {
    return endpoint.name ?? getEndpointPathAsString(endpoint);
}

export function getEndpointPathAsString(endpoint: FernRegistryApiRead.EndpointDefinition.Raw): string {
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

export function getPathParameterAsString(pathParameterKey: FernRegistryApiRead.PathParameterKey.Raw): string {
    return `:${pathParameterKey}`;
}
