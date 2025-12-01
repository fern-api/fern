import { getBinaryResponse } from "./BinaryResponse";
import { fromJson } from "../json";
<% if (streamType === "wrapper") { %>
import { chooseStreamWrapper } from "./stream-wrappers/chooseStreamWrapper";
<% } %>

export async function getResponseBody(response: Response, responseType?: string): Promise<unknown> {
    switch (responseType) {
        case "binary-response":
            return getBinaryResponse(response);
        case "blob":
            return await response.blob();
        case "arrayBuffer":
            return await response.arrayBuffer();
        case "sse":
            if (response.body == null) {
                return {
                    ok: false,
                    error: {
                        reason: "body-is-null",
                        statusCode: response.status,
                    },
                };
            }
            return response.body;
        case "streaming":
            if (response.body == null) {
                return {
                    ok: false,
                    error: {
                        reason: "body-is-null",
                        statusCode: response.status,
                    },
                };
            }
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
