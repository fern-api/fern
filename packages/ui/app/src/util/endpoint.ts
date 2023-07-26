import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";

export type EndpointPathPart =
    | {
          type: "literal";
          value: string;
      }
    | {
          type: "pathParameter";
          name: string;
      };

export function divideEndpointPathToParts(endpoint: FernRegistryApiRead.EndpointDefinition): EndpointPathPart[] {
    const parts: EndpointPathPart[] = [];
    endpoint.path.parts.forEach((part) => {
        if (part.type === "literal") {
            const subparts = part.value.split("/");
            subparts.forEach((subpart) => {
                if (subpart.length > 0) {
                    parts.push({ type: "literal", value: subpart });
                }
            });
        } else {
            if (part.value.length > 0) {
                parts.push({ type: "pathParameter", name: part.value });
            }
        }
    });
    return parts;
}
