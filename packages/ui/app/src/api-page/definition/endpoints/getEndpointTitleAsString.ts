import { FernRegistry } from "@fern-fern/registry";

export function getEndpointTitleAsString(endpoint: FernRegistry.EndpointDefinition): string {
    return endpoint.name ?? getEndpointPathAsString(endpoint);
}

export function getEndpointPathAsString(endpoint: FernRegistry.EndpointDefinition): string {
    return (
        "GET" +
        " " +
        endpoint.path.parts
            .map((part) =>
                part._visit({
                    literal: (literal) => literal,
                    pathParameter: getPathParameterAsString,
                    _other: () => "",
                })
            )
            .join("")
    );
}

export function getPathParameterAsString(pathParameterKey: FernRegistry.PathParameterKey): string {
    return `:${pathParameterKey}`;
}
