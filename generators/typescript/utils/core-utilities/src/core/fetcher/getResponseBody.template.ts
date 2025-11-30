import { getBinaryResponse } from "./BinaryResponse";
import { isResponseWithBody } from "./ResponseWithBody";
import { fromJson } from "../json";
import { RUNTIME } from "../runtime/index";
<% if (streamType === "wrapper") { %>
import { chooseStreamWrapper } from "./stream-wrappers/chooseStreamWrapper";
<% } %>

export async function getResponseBody(response: Response, responseType?: string): Promise<unknown> {
    // In React Native (RUNTIME.type === "react-native"), response.body might not be available
    // even for responses with bodies. We only skip the isResponseWithBody check in React Native
    // for types that can use alternative methods (text/blob/arrayBuffer/json).
    // For binary-response, sse, and streaming, we preserve the original behavior.
    const isReactNative = RUNTIME.type === "react-native";

    if (!isResponseWithBody(response)) {
        // Always preserve original behavior for types that require body stream
        if (responseType === "binary-response" || responseType === "sse" || responseType === "streaming") {
            return undefined;
        }
        // For non-RN runtimes, preserve original behavior for all types
        if (!isReactNative) {
            return undefined;
        }
        // React Native + types that can use alternative methods: fall through to switch
    }

    switch (responseType) {
        case "binary-response":
            // Re-check here so TypeScript can narrow to ResponseWithBody
            if (!isResponseWithBody(response)) {
                return undefined;
            }
            return getBinaryResponse(response);
        case "blob":
            return await response.blob();
        case "arrayBuffer":
            return await response.arrayBuffer();
        case "sse":
            return response.body;
        case "streaming":
            <% if (streamType === "wrapper") { %>
            return chooseStreamWrapper(response.body);
            <% } else { %>
            return response.body;
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
