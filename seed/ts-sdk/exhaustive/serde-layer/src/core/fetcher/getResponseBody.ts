import { getBinaryResponse } from "./BinaryResponse.js";
import { isResponseWithBody } from "./ResponseWithBody.js";
import { fromJson } from "../json.js";

export async function getResponseBody(response: Response, responseType?: string): Promise<unknown> {
    if (!isResponseWithBody(response)) {
        return undefined;
    }
    switch (responseType) {
        case "binary-response":
            return getBinaryResponse(response);
        case "blob":
            return await response.blob();
        case "arrayBuffer":
            return await response.arrayBuffer();
        case "sse":
            return response.body;
        case "streaming":
            return response.body;

        case "text":
            return await response.text();
    }

    // if responseType is "json" or not specified, try to parse as JSON
    const text = await response.text();
    if (text.length > 0) {
        try {
            let responseBody = fromJson(text);
            return responseBody;
        } catch (err) {
            return {
                ok: false,
                error: {
                    reason: "non-json",
                    statusCode: response.status,
                    rawBody: text,
                },
            };
        }
    }
    return undefined;
}
