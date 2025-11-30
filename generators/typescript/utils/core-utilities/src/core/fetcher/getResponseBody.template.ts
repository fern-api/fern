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

    // if responseType is "json" or not specified, parse as JSON
    // Use text() first for better React Native compatibility
    try {
        const text = await response.text();
        if (text.length === 0) {
            // Empty response body - return a structured object instead of undefined
            return {
                _error: true,
                reason: "empty-response",
                message: "Response body is empty",
                statusCode: response.status,
                success: false,
            };
        }
        try {
            const parsed = fromJson(text);
            return parsed;
        } catch (err) {
            // Invalid JSON - return structured error object
            return {
                _error: true,
                reason: "invalid-json",
                message: `Failed to parse JSON response: ${err instanceof Error ? err.message : String(err)}`,
                statusCode: response.status,
                rawBody: text,
                success: false,
            };
        }
    } catch (err) {
        // response.text() failed - return structured error object
        return {
            _error: true,
            reason: "read-error",
            message: `Failed to read response body: ${err instanceof Error ? err.message : String(err)}`,
            statusCode: response.status,
            success: false,
        };
    }
}
