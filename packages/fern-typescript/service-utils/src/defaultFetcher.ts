import axios from "axios";
import { Fetcher } from "./Fetcher";

export const defaultFetcher: Fetcher = async (args) => {
    const headers = {
        ...args.headers,
        "Content-Type": args.body != null ? args.body.contentType : "application/json",
    };

    const token = typeof args.token === "function" ? await args.token() : args.token;
    if (token != null) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios({
        url: args.url,
        params: args.queryParameters,
        method: args.method,
        headers,
        data: args.body?.content,
        responseType: "arraybuffer",
    });

    return {
        statusCode: response.status,
        body: new Uint8Array(await response.data),
    };
};
