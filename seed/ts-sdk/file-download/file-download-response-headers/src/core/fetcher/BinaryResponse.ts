import { ResponseWithBody } from "./ResponseWithBody.js";

export interface BinaryResponse {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/bodyUsed) */
    bodyUsed: boolean;
    /**
     * Returns a ReadableStream of the response body.
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/body)
     */
    stream: () => ReadableStream<Uint8Array>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/arrayBuffer) */
    arrayBuffer: () => Promise<ArrayBuffer>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/blob) */
    blob: () => Promise<Blob>;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/bytes) */
    bytes(): Promise<Uint8Array>;
}

export function getBinaryResponse(response: ResponseWithBody): BinaryResponse {
    return {
        get bodyUsed() {
            return response.bodyUsed;
        },
        stream: () => response.body,
        arrayBuffer: response.arrayBuffer.bind(response),
        blob: response.blob.bind(response),
        bytes: response.bytes.bind(response),
    };
}
