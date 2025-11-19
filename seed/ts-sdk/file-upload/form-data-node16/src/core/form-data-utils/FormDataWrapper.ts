import { toJson } from "../../core/json.js";
import { RUNTIME } from "../runtime/index.js";
import { toMultipartDataPart, type Uploadable } from "../../core/file/index.js";


export async function toReadableStream(encoder: import("form-data-encoder").FormDataEncoder): Promise<ReadableStream<Uint8Array<ArrayBufferLike>>> {
  const iterator = encoder.encode()

  return new ReadableStream({
    async pull(controller) {
      const {value, done} = await iterator.next()

      if (done) {
        return controller.close()
      }

      controller.enqueue(value)
    }
  })
}


export type MaybePromise<T> = Promise<T> | T;

interface FormDataRequest<Body> {
    body: Body;
    headers: Record<string, string>;
    duplex?: "half";
}

export interface CrossPlatformFormData {
    setup(): Promise<void>;

    append(key: string, value: unknown): void;

    appendFile(key: string, value: Uploadable): Promise<void>;

    getRequest(): MaybePromise<FormDataRequest<unknown>>;
}

export async function newFormData(): Promise<CrossPlatformFormData> {
    let formdata: CrossPlatformFormData;
    if (RUNTIME.type === "node") {
        if (RUNTIME.parsedVersion != null && RUNTIME.parsedVersion >= 18) {
            formdata = new Node18FormData();
        } else {
            formdata = new Node16FormData();
        }
    } else {
        formdata = new WebFormData();
    }
    await formdata.setup();
    return formdata;
}

export type Node18FormDataFd =
    | {
          append(name: string, value: unknown, filename?: string): void;
      }
    | undefined;

/**
 * Form Data Implementation for Node.js 18+
 */
export class Node18FormData implements CrossPlatformFormData {
    private fd: Node18FormDataFd;

    public async setup(): Promise<void> {
        this.fd = new (await import("formdata-node")).FormData();
    }

    public append(key: string, value: any): void {
        this.fd?.append(key, value);
    }

    public async appendFile(key: string, value: Uploadable): Promise<void> {
        const { data, filename } = await toMultipartDataPart(value);

        if (data instanceof Blob) {
            this.fd?.append(key, data, filename);
        } else {
            this.fd?.append(key, {
                type: undefined,
                name: filename,
                [Symbol.toStringTag]: "File",
                stream() {
                    return data;
                }
            });
        }
    }

    public async getRequest(): Promise<FormDataRequest<unknown>> {
        const encoder = new (await import("form-data-encoder")).FormDataEncoder(this.fd as any);
        return {
            body: await toReadableStream(encoder),
            headers: encoder.headers,
            duplex: "half"
        };
    }
}

export type Node16FormDataFd =
    | {
          append(
              name: string,
              value: unknown,
              options?:
                  | string
                  | {
                        header?: string | Headers;
                        knownLength?: number;
                        filename?: string;
                        filepath?: string;
                        contentType?: string;
                    }
          ): void;

          getHeaders(): Record<string, string>;
      }
    | undefined;

/**
 * Form Data Implementation for Node.js 16-18
 */
export class Node16FormData implements CrossPlatformFormData {
    private fd: Node16FormDataFd;

    public async setup(): Promise<void> {
        this.fd = new (await import("form-data")).default();
    }

    public append(key: string, value: any): void {
        this.fd?.append(key, value);
    }

    public async appendFile(key: string, value: Uploadable): Promise<void> {
        const { data, filename } = await toMultipartDataPart(value);

        let bufferedValue;
        if (data instanceof Blob) {
            bufferedValue = Buffer.from(await (data as any).arrayBuffer());
        } else {
            bufferedValue = data;
        }

        if (filename == null) {
            this.fd?.append(key, bufferedValue);
        } else {
            this.fd?.append(key, bufferedValue, { filename });
        }
    }

    public getRequest(): FormDataRequest<Node16FormDataFd> {
        return {
            body: this.fd,
            headers: this.fd ? this.fd.getHeaders() : {}
        };
    }
}

export type WebFormDataFd = { append(name: string, value: string | Blob, filename?: string): void } | undefined;

/**
 * Form Data Implementation for Web
 */
export class WebFormData implements CrossPlatformFormData {
    protected fd: WebFormDataFd;

    public async setup(): Promise<void> {
        this.fd = new FormData();
    }

    public append(key: string, value: any): void {
        this.fd?.append(key, value);
    }

    public async appendFile(key: string, value: Uploadable): Promise<void> {
        const { data, filename, contentType } = await toMultipartDataPart(value);

        if (data instanceof Blob) {
            this.fd?.append(key, data, filename);
            return;
        }
        this.fd?.append(key, await convertToBlob(data, contentType), filename);
    }

    public getRequest(): FormDataRequest<WebFormDataFd> {
        return {
            body: this.fd,
            headers: {},
        };
    }
}


type StreamLike = {
    read?: () => unknown;
    pipe?: (dest: unknown) => unknown;
} & unknown;

function isStreamLike(value: unknown): value is StreamLike {
    return typeof value === "object" && value != null && ("read" in value || "pipe" in value);
}

function isReadableStream(value: unknown): value is ReadableStream {
    return typeof value === "object" && value != null && "getReader" in value;
}

function isBuffer(value: unknown): value is Buffer {
    return typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(value);
}

function isArrayBufferView(value: unknown): value is ArrayBufferView {
    return ArrayBuffer.isView(value);
}

async function streamToBuffer(stream: unknown): Promise<Buffer> {
    if (RUNTIME.type === "node") {
        const { Readable } = await import("stream");

        if (stream instanceof Readable) {
            const chunks: Buffer[] = [];
            for await (const chunk of stream) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            return Buffer.concat(chunks);
        }
    }

    if (isReadableStream(stream)) {
        const reader = stream.getReader();
        const chunks: Uint8Array[] = [];

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
            }
        } finally {
            reader.releaseLock();
        }

        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        return Buffer.from(result);
    }

    throw new Error(
        "Unsupported stream type: " + typeof stream + ". Expected Node.js Readable stream or Web ReadableStream.",
    );
}

async function convertToBlob(value: unknown, contentType?: string): Promise<Blob> {
    if (isStreamLike(value) || isReadableStream(value)) {
        const buffer = await streamToBuffer(value);
        return new Blob([buffer], { type: contentType });
    }

    if (value instanceof Blob) {
        return value;
    }

    if (isBuffer(value)) {
        return new Blob([value], { type: contentType });
    }

    if (value instanceof ArrayBuffer) {
        return new Blob([value], { type: contentType });
    }

    if (isArrayBufferView(value)) {
        return new Blob([value], { type: contentType });
    }

    if (typeof value === "string") {
        return new Blob([value], { type: contentType });
    }

    if (typeof value === "object" && value !== null) {
        return new Blob([toJson(value)], { type: contentType ?? "application/json" });
    }

    return new Blob([String(value)], { type: contentType });
}