import { Fetcher } from "./Fetcher";

export const defaultFetcher: Fetcher = async (args) => {
    const headers = new Headers(args.headers);
    if (args.body != null) {
        headers.append("Content-Type", args.body.contentType);
    }
    if (args.token != null) {
        const token = typeof args.token === "string" ? args.token : await args.token();
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

    const body = Buffer.from(await fetchResponse.arrayBuffer());

    return {
        statusCode: fetchResponse.status,
        body,
    };
};
