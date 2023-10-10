import { StreamingFetcher } from "./StreamingFetcher";

export function getHeader(response: StreamingFetcher.Response, header: string): string | undefined {
    for (const [headerKey, headerValue] of Object.entries(response.headers)) {
        if (headerKey.toLowerCase() === header.toLowerCase()) {
            return headerValue;
        }
    }
    return undefined;
}
