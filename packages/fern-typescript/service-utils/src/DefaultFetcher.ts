import { Fetcher } from "./Fetcher";

export const defaultFetcher: Fetcher = async (args) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    if (args.token != null) {
        headers.append("Authorization", `Bearer ${args.token}`);
    }

    const fetchResponse = await fetch(args.url, {
        method: args.method,
        headers: args.headers,
        body: args.request != null ? JSON.stringify(args.request) : undefined,
    });

    return {
        statusCode: fetchResponse.status,
        body: await fetchResponse.json(),
    };
};
