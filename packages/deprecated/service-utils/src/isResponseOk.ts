import { Fetcher } from "./Fetcher";

export function isResponseOk({ statusCode }: Fetcher.Response): boolean {
    return statusCode >= 200 && statusCode < 300;
}
