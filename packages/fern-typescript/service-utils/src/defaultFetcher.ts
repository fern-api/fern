import axios from "axios";
import { Fetcher } from "./Fetcher";
import { _NetworkError } from "./NetworkError";

export const defaultFetcher: Fetcher = async (args) => {
    const headers: Record<string, string> = {
        "Content-Type": args.body?.contentType ?? "application/json",
    };
    for (const [key, value] of Object.entries(args.headers)) {
        if (value != null) {
            headers[key] = value;
        }
    }
    if (args.authHeader != null) {
        headers.Authorization = args.authHeader;
    }

    try {
        const response = await axios({
            url: args.url,
            params: args.queryParameters,
            method: args.method,
            headers,
            data: args.body?.content,
        });

        return {
            ok: response.status >= 200 && response.status < 300,
            body: response.data,
        };
    } catch (e) {
        const error: _NetworkError = { _errorName: "_NetworkError" };
        return {
            ok: false,
            body: error,
        };
    }
};
