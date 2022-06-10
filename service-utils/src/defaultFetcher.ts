import { Fetcher } from "./Fetcher";

export const defaultFetcher: Fetcher = async (args) => {
    const headers = new Headers(args.headers);
    if (args.body != null) {
        headers.append("Content-Type", args.body.contentType);
    }

    const token = typeof args.token === "function" ? await args.token() : args.token;
    if (token != null) {
        headers.append("Authorization", `Bearer ${token}`);
    }

    const url = new URL(args.url);
    if (args.queryParameters != null) {
        url.search = args.queryParameters.toString();
    }

    const fetchResponse = await fetch(url.toString(), {
        method: args.method,
        headers,
        body: args.body?.content,
    });

    return {
        statusCode: fetchResponse.status,
        body: new Uint8Array(await fetchResponse.arrayBuffer()),
    };
};
