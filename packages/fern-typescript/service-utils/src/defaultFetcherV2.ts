import axios from "axios";
import { FetcherV2 } from "./FetcherV2";
import { _NetworkError } from "./NetworkError";

export const defaultFetcherV2: FetcherV2 = async (args) => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (args.headers != null) {
        for (const [key, value] of Object.entries(args.headers)) {
            if (value != null) {
                headers[key] = value;
            }
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
            data: args.body,
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
