import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

type PathPart =
    | {
          type: "literal";
          value: string;
      }
    | {
          type: "path-parameter";
          unsafeNameCamelCase: string;
      };

export type ParseEndpointPathResult = {
    pathParts: PathPart[];
};

export function parseEndpointPath(endpoint: HttpEndpoint): ParseEndpointPathResult {
    const pathParts: PathPart[] = [];

    const pathParameterNamesByOriginalName = Object.fromEntries(
        endpoint.allPathParameters.map((pathParam) => [
            pathParam.name.originalName,
            pathParam.name.camelCase.unsafeName
        ])
    );

    if (endpoint.fullPath.head != null) {
        pathParts.push({ type: "literal", value: endpoint.fullPath.head });
    }

    for (const pathPart of endpoint.fullPath.parts) {
        const pathParameterName = pathParameterNamesByOriginalName[pathPart.pathParameter];
        if (pathParameterName != null) {
            pathParts.push({
                type: "path-parameter",
                unsafeNameCamelCase: pathParameterName
            });
        }
        if (pathPart.tail != null) {
            pathParts.push({ type: "literal", value: pathPart.tail });
        }
    }
    return { pathParts };
}
