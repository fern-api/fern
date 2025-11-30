import { getBinaryResponse } from "./BinaryResponse";
import { isResponseWithBody } from "./ResponseWithBody";
import { fromJson } from "../json";
<% if (streamType === "wrapper") { %>
import { chooseStreamWrapper } from "./stream-wrappers/chooseStreamWrapper";
<% } %>

export async function getResponseBody(response: Response, responseType?: string): Promise<unknown> {
    // In React Native, response.body might not be available even for responses with bodies
    // So we try to read the body regardless of the isResponseWithBody check
    // Only skip if we explicitly need the body stream (sse/streaming/binary-response) and it's not available
    switch (responseType) {
        case "binary-response":
            if (isResponseWithBody(response)) {
                return getBinaryResponse(response);
            }
            // Fallback: try to get as blob if body stream is not available
            return await response.blob();
        case "blob":
            return await response.blob();
        case "arrayBuffer":
            return await response.arrayBuffer();
        case "sse":
            return response.body ?? null;
        case "streaming":
            <% if (streamType === "wrapper") { %>
            return chooseStreamWrapper(response.body);
            <% } else { %>
            return response.body ?? null;
            <% } %>
        case "text":
            return await response.text();
    }

    // if responseType is "json" or not specified, try to parse as JSON
    // Use text() for better React Native compatibility (response.body may not be available)
    const text = await response.text();
    if (text.length > 0) {
        try {
            const responseBody = fromJson(text);
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
