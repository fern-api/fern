import { getFileResponseBody } from "./FileResponseBody";
import { isReponseWithBody } from "./ReponseWithBody";

export async function getResponseBody(response: Response, responseType?: string): Promise<unknown> {
    if (!isReponseWithBody(response)) {
        return undefined;
    }
    switch (responseType) {
        case "file-response-body":
            return getFileResponseBody(response);
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
    return undefined;
}
