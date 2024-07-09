import { RUNTIME } from "../runtime";

export async function getRequestBody(body: any, contentType: string): Promise<BodyInit | undefined> {
    let requestBody: BodyInit;
    if (RUNTIME.type === "node") {
        if (body instanceof (await import("formdata-node")).FormData) {
            // @ts-expect-error
            requestBody = body;
        } else if (body instanceof (await import("stream")).Readable) {
            // @ts-expect-error
            requestBody = body;
        } else {
            requestBody = maybeStringifyBody(body, contentType ?? "");
        }
    } else {
        if (body instanceof (await import("form-data")).default) {
            // @ts-expect-error
            requestBody = body;
        } else {
            requestBody = maybeStringifyBody(body, contentType ?? "");
        }
    }
    return requestBody;
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
