import { isHttpUrl } from "@fern-api/core-utils";
export function wrapWithHttps(url: string): string {
    return isHttpUrl(url) ? url : `https://${url}`;
}
