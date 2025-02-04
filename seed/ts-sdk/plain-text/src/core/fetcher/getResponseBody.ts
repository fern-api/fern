import stream from "stream";

import { FailedResponse } from "./APIResponse";
import { Fetcher } from "./Fetcher";
import { StreamWrapper, chooseStreamWrapper } from "./stream-wrappers/chooseStreamWrapper";

export async function getResponseBody(response: Response, responseType: "file"): Promise<Fetcher.FileResponseBody>;
export async function getResponseBody(response: Response, responseType: "blob"): Promise<Blob>;
export async function getResponseBody(response: Response, responseType: "arrayBuffer"): Promise<ArrayBuffer>;
export async function getResponseBody(response: Response, responseType: "streaming"): Promise<StreamWrapper<any, any>>;
export async function getResponseBody(
    response: Response,
    responseType: "sse",
): Promise<ReadableStream<Uint8Array<ArrayBufferLike>>>;
export async function getResponseBody(response: Response, responseType: "text"): Promise<string>;
export async function getResponseBody<T>(
    response: Response,
    responseType?: string,
): Promise<T | FailedResponse<{ reason: string; statusCode: number; rawBody: string }>>;
export async function getResponseBody(
    response: Response,
    responseType?: "file" | "blob" | "arrayBuffer" | "streaming" | "sse" | "text" | string,
): Promise<
    | Fetcher.FileResponseBody
    | Blob
    | ArrayBuffer
    | StreamWrapper<any, any>
    | ReadableStream<Uint8Array<ArrayBufferLike>>
    | string
    | FailedResponse<{ reason: string; statusCode: number; rawBody: string }>
    | undefined
> {
    const hasBody = response.body != null;
    if (hasBody) {
        switch (responseType) {
            case "file":
                return {
                    body: response.body,
                    get bodyUsed() {
                        return response.bodyUsed;
                    },
                    arrayBuffer: async () => await response.arrayBuffer(),
                    blob: async () => await response.blob(),
                    bytes: async () => await response.bytes(),
                };
            case "blob":
                return await response.blob();
            case "arrayBuffer":
                return await response.arrayBuffer();
            case "sse":
                return response.body;
            case "streaming":
                return chooseStreamWrapper(response.body);
            case "text":
                return await response.text();
        }
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
    } else {
        return undefined;
    }
}
