import { FernIr } from "@fern-fern/ir-sdk";
import { parseEndpointPath } from "./parse-endpoint-path.js";

export function formatEndpointPathForSwift(endpoint: FernIr.HttpEndpoint): string {
    let path = "";
    const { pathParts } = parseEndpointPath(endpoint);
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
