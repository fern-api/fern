import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";

export function getEndpointTitleAsString(endpoint: FernRegistryApiRead.EndpointDefinition): string {
    return endpoint.name ?? getEndpointPathAsString(endpoint);
}

export function getEndpointPathAsString(endpoint: FernRegistryApiRead.EndpointDefinition): string {
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

export function getPathParameterAsString(pathParameterKey: FernRegistryApiRead.PathParameterKey): string {
    return `:${pathParameterKey}`;
}
