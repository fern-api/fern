import { ReponseWithBody } from "./ReponseWithBody";

export interface FileResponseBody {
    bodyUsed: boolean;
    arrayBuffer: () => Promise<ArrayBuffer>;
    blob: () => Promise<Blob>;
    text: () => Promise<string>;
    stream: () => ReadableStream<Uint8Array>;
}

export function getFileResponseBody(response: ReponseWithBody): FileResponseBody {
    return {
        bodyUsed: response.bodyUsed,
        arrayBuffer: response.arrayBuffer.bind(response),
        blob: response.blob.bind(response),
        text: response.text.bind(response),
        stream: () => response.body,
    };
}
