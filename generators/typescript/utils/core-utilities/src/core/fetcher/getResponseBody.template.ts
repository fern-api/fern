import { getBinaryResponse } from "./BinaryResponse";
import { isResponseWithBody } from "./ResponseWithBody";
import { fromJson } from "../json";
import { RUNTIME } from "../runtime/index";
<% if (streamType === "wrapper") { %>
import { chooseStreamWrapper } from "./stream-wrappers/chooseStreamWrapper";
<% } %>

export async function getResponseBody(response: Response, responseType?: string): Promise<unknown> {
    // In React Native (RUNTIME.type === "react-native"), response.body might not be available
    // even for responses with bodies. We only skip the isResponseWithBody check in React Native.
    const isReactNative = RUNTIME.type === "react-native";

    if (!isReactNative && !isResponseWithBody(response)) {
        return undefined;
    }

    switch (responseType) {
        case "binary-response":
            if (isResponseWithBody(response)) {
                return getBinaryResponse(response);
            }
            // Fallback for React Native: try to get as blob if body stream is not available
            return await response.blob();
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
