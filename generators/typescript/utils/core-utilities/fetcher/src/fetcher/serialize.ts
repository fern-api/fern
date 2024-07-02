import qs from "qs";

import { RUNTIME } from "../runtime";

export function createRequestUrl(
    baseUrl: string,
    queryParameters?: Record<string, string | string[] | object | object[]>
): string {
    return Object.keys(queryParameters ?? {}).length > 0
        ? `${baseUrl}?${qs.stringify(queryParameters, { arrayFormat: "repeat" })}`
        : baseUrl;
}

export const maybeStringifyBody = (requestBody: any, contentType: string): Uint8Array | string => {
    if (requestBody instanceof Uint8Array) {
        return requestBody;
    } else if (contentType === "application/x-www-form-urlencoded" && typeof requestBody === "string") {
        return requestBody;
    } else {
        return JSON.stringify(requestBody);
    }
};

export async function getRequestBody(body: any, contentType: string): Promise<BodyInit | undefined> {
    let requestBody: BodyInit;
    if (RUNTIME.type === "node") {
        if (body instanceof (await import("formdata-node")).FormData) {
            // @ts-expect-error
            requestBody = body;
        } else {
            requestBody = maybeStringifyBody(body, contentType ?? "");
        }
    } else {
        if (body instanceof (await import("form-data")).default) {
            // @ts-expect-error
            requestBody = args.body;
        } else {
            requestBody = maybeStringifyBody(body, contentType ?? "");
        }
    }
    return requestBody;
}

export async function getResponseBody(response: Response, responseType?: string): Promise<unknown> {
    if (response.body != null && responseType === "blob") {
        return await response.blob();
    } else if (response.body != null && responseType === "streaming") {
        return response.body;
    } else if (response.body != null && responseType === "text") {
        return await response.text();
    } else {
        const text = await response.text();
        if (text.length > 0) {
            try {
                let responseBody = JSON.parse(text);
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
    }
}
