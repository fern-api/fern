import fetch, { Headers } from "node-fetch";
import { URL } from "url";
import { Fetcher } from "./Fetcher";

export const defaultFetcher: Fetcher = async (args) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    if (args.token != null) {
        const token = typeof args.token === "string" ? args.token : args.token();
        headers.append("Authorization", `Bearer ${token}`);
    }

    const url = new URL(args.url);
    if (args.queryParameters != null) {
        url.search = args.queryParameters.toString();
    }

    const fetchResponse = await fetch(url.toString(), {
        method: args.method,
        headers: args.headers,
        body: args.body != null ? JSON.stringify(args.body) : undefined,
    });

    return {
        statusCode: fetchResponse.status,
        body: await fetchResponse.json(),
    };
};
