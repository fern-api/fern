import { type CaseConverter, getOriginalName, type NameInput } from "@fern-api/base-generator";

export interface EndpointPathInput {
    fullPath: {
        head: string;
        parts: ReadonlyArray<{ pathParameter: string; tail: string }>;
    };
    allPathParameters: ReadonlyArray<{
        name: NameInput;
        docs: string | undefined;
    }>;
}

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

export function parseEndpointPath(endpoint: EndpointPathInput, caseConverter: CaseConverter): ParseEndpointPathResult {
    const pathParts: PathPart[] = [];

    const pathParameterInfosByOriginalName = Object.fromEntries(
        endpoint.allPathParameters.map((pathParam) => {
            return [
                getOriginalName(pathParam.name),
                {
                    unsafeNameCamelCase: caseConverter.camelUnsafe(pathParam.name),
                    docs: pathParam.docs
                }
            ];
        })
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
