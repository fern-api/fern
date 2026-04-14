import { type CaseConverter } from "@fern-api/base-generator";
import { EndpointPathInput, parseEndpointPath } from "./parse-endpoint-path.js";

export function formatEndpointPathForSwift(endpoint: EndpointPathInput, caseConverter: CaseConverter): string {
    let path = "";
    const { pathParts } = parseEndpointPath(endpoint, caseConverter);
    pathParts.forEach((pathPart) => {
        if (pathPart.type === "literal") {
            path += pathPart.value;
        } else {
            path += `\\(${pathPart.unsafeNameCamelCase})`;
        }
    });
    if (!path.startsWith("/")) {
        path = "/" + path;
    }
    if (path.endsWith("/") && path.length > 1) {
        path = path.slice(0, -1);
    }
    return path;
}
