import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

type PathPart =
    | {
          type: "literal";
          value: string;
      }
    | {
          type: "path-parameter";
          unsafeNameCamelCase: string;
          docs: string | undefined;
      };

export type ParseEndpointPathResult = {
    pathParts: PathPart[];
};

export function parseEndpointPath(endpoint: HttpEndpoint): ParseEndpointPathResult {
    const pathParts: PathPart[] = [];

    const pathParameterInfosByOriginalName = Object.fromEntries(
        endpoint.allPathParameters.map((pathParam) => [
            pathParam.name.originalName,
            {
                unsafeNameCamelCase: pathParam.name.camelCase.unsafeName,
                docs: pathParam.docs
            }
        ])
    );

    if (endpoint.fullPath.head != null) {
        pathParts.push({ type: "literal", value: endpoint.fullPath.head });
    }

    for (const pathPart of endpoint.fullPath.parts) {
        const pathParameterInfo = pathParameterInfosByOriginalName[pathPart.pathParameter];
        if (pathParameterInfo != null) {
            pathParts.push({
                type: "path-parameter",
                unsafeNameCamelCase: pathParameterInfo.unsafeNameCamelCase,
                docs: pathParameterInfo.docs
            });
        }
        if (pathPart.tail != null) {
            pathParts.push({ type: "literal", value: pathPart.tail });
        }
    }
    return { pathParts };
}
