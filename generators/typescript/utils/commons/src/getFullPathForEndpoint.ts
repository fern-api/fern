import { FernIr } from "@fern-fern/ir-sdk";
import urlJoin from "url-join";

export function getFullPathForEndpoint(endpoint: FernIr.HttpEndpoint): string {
    let url = "";
    if (endpoint.fullPath.head.length > 0) {
        url = urlJoin(url, endpoint.fullPath.head);
    }
    for (const part of endpoint.fullPath.parts) {
        url = urlJoin(url, "{" + part.pathParameter + "}");
        if (part.tail.length > 0) {
            url = urlJoin(url, part.tail);
        }
    }
    return url.startsWith("/") ? url : `/${url}`;
}
