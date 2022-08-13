import axios from "axios";
import { Fetcher } from "./Fetcher";

export const defaultFetcher: Fetcher = async (args) => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    for (const [key, value] of Object.entries(args.headers)) {
        if (value != null) {
            headers[key] = value;
        }
    }
    if (args.authHeader != null) {
        headers.Authorization = args.authHeader;
    }

    const response = await axios({
        url: args.url,
        params: args.queryParameters,
        method: args.method,
        headers,
        data: args.body,
    });

    return {
        statusCode: response.status,
        body: response.data,
    };
};
