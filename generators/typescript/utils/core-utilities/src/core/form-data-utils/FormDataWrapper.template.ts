<% if (formDataSupport === "Node16") { %>
import { RUNTIME } from "../runtime/index.js";

<% if (streamType === "wrapper") { %>
export async function toReadableStream(encoder: import("form-data-encoder").FormDataEncoder) {
  return (await import("readable-stream")).Readable.from(encoder)
}
<% } else { %>
export async function toReadableStream(encoder: import("form-data-encoder").FormDataEncoder) {
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
<% } %>

export type MaybePromise<T> = Promise<T> | T;

interface FormDataRequest<Body> {
    body: Body;
    headers: Record<string, string>;
    duplex?: "half";
}

function isNamedValue(value: unknown): value is { name: string } {
    return typeof value === "object" && value != null && "name" in value;
}
function isPathedValue(value: unknown): value is { path: unknown } {
    return typeof value === "object" && value != null && "path" in value;
}

function getLastPathSegment(pathStr: string): string {
    const lastForwardSlash = pathStr.lastIndexOf("/");
    const lastBackSlash = pathStr.lastIndexOf("\\");
    const lastSlashIndex = Math.max(lastForwardSlash, lastBackSlash);
    return lastSlashIndex >= 0 ? pathStr.substring(lastSlashIndex + 1) : pathStr;
}

export interface CrossPlatformFormData {
    setup(): Promise<void>;

    append(key: string, value: unknown): void;

    appendFile(key: string, value: unknown, fileName?: string): Promise<void>;

    getRequest(): MaybePromise<FormDataRequest<unknown>>;
}

export async function newFormData(): Promise<CrossPlatformFormData> {
    let formdata: CrossPlatformFormData;
    if (RUNTIME.type === "node" && RUNTIME.parsedVersion != null && RUNTIME.parsedVersion >= 18) {
        formdata = new Node18FormData();
    } else if (RUNTIME.type === "node") {
        formdata = new Node16FormData();
    } else {
        formdata = new WebFormData();
    }
    await formdata.setup();
    return formdata;
}

export type Node18FormDataFd =
    | {
          append(name: string, value: unknown, fileName?: string): void;
      }
    | undefined;

/**
 * Form Data Implementation for Node.js 18+
 */
export class Node18FormData implements CrossPlatformFormData {
    private fd: Node18FormDataFd;

    public async setup() {
        this.fd = new (await import("formdata-node")).FormData();
    }

    public append(key: string, value: any): void {
        this.fd?.append(key, value);
    }

    private getFileName(value: any, filename?: string): string | undefined {
        if (filename != null) {
            return filename;
        }
        if (isNamedValue(value)) {
            return value.name;
        }
        if (isPathedValue(value) && value.path) {
            return getLastPathSegment(value.path.toString());
        }
        return undefined;
    }

    public async appendFile(key: string, value: unknown, fileName?: string): Promise<void> {
        fileName = this.getFileName(value, fileName);

        if (value instanceof Blob) {
            this.fd?.append(key, value, fileName);
        } else {
            this.fd?.append(key, {
                type: undefined,
                name: fileName,
                [Symbol.toStringTag]: "File",
                stream() {
                    return value;
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

    private getFileName(value: any, filename?: string): string | undefined {
        if (filename != null) {
            return filename;
        }
        if (isNamedValue(value)) {
            return value.name;
        }
        if (isPathedValue(value) && value.path) {
            return getLastPathSegment(value.path.toString());
        }
        return undefined;
    }

    public async appendFile(key: string, value: unknown, fileName?: string): Promise<void> {
        fileName = this.getFileName(value, fileName);

        let bufferedValue;
        if (value instanceof Blob) {
            bufferedValue = Buffer.from(await (value as any).arrayBuffer());
        } else {
            bufferedValue = value;
        }

        if (fileName == null) {
            this.fd?.append(key, bufferedValue);
        } else {
            this.fd?.append(key, bufferedValue, { filename: fileName });
        }
    }

    public getRequest(): FormDataRequest<Node16FormDataFd> {
        return {
            body: this.fd,
            headers: this.fd ? this.fd.getHeaders() : {}
        };
    }
}

export type WebFormDataFd = { append(name: string, value: string | Blob, fileName?: string): void } | undefined;

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

    private getFileName(value: any, filename?: string): string | undefined {
        if (filename != null) {
            return filename;
        }
        if (isNamedValue(value)) {
            return value.name;
        }
        if (isPathedValue(value) && value.path) {
            return getLastPathSegment(value.path.toString());
        }
        return undefined;
    }

    public async appendFile(key: string, value: any, fileName?: string): Promise<void> {
        fileName = this.getFileName(value, fileName);

        if (value instanceof Blob) {
            this.fd?.append(key, value, fileName);
            return;
        }
        this.fd?.append(key, new Blob([value]), fileName);
    }

    public getRequest(): FormDataRequest<WebFormDataFd> {
        return {
            body: this.fd,
            headers: {}
        };
    }
}
<% } else { %>
import { toJson } from "../../core/json.js";
import { RUNTIME } from "../runtime/index.js";

type NamedValue = {
    name: string;
} & unknown;

type PathedValue = {
    path: string | { toString(): string };
} & unknown;

type StreamLike = {
    read?: () => unknown;
    pipe?: (dest: unknown) => unknown;
} & unknown;

function isNamedValue(value: unknown): value is NamedValue {
    return typeof value === "object" && value != null && "name" in value;
}

function isPathedValue(value: unknown): value is PathedValue {
    return typeof value === "object" && value != null && "path" in value;
}

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

interface FormDataRequest<Body> {
    body: Body;
    headers: Record<string, string>;
    duplex?: "half";
}

function getLastPathSegment(pathStr: string): string {
    const lastForwardSlash = pathStr.lastIndexOf("/");
    const lastBackSlash = pathStr.lastIndexOf("\\");
    const lastSlashIndex = Math.max(lastForwardSlash, lastBackSlash);
    return lastSlashIndex >= 0 ? pathStr.substring(lastSlashIndex + 1) : pathStr;
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

    throw new Error("Unsupported stream type: " + typeof stream + ". Expected Node.js Readable stream or Web ReadableStream.");
}

export async function newFormData(): Promise<FormDataWrapper> {
    return new FormDataWrapper();
}

export class FormDataWrapper {
    private fd: FormData = new FormData();

    public async setup(): Promise<void> {
        // noop
    }

    public append(key: string, value: unknown): void {
        this.fd.append(key, String(value));
    }

    private getFileName(value: unknown, filename?: string): string | undefined {
        if (filename != null) {
            return filename;
        }
        if (isNamedValue(value)) {
            return value.name;
        }
        if (isPathedValue(value) && value.path) {
            return getLastPathSegment(value.path.toString());
        }
        return undefined;
    }

    private async convertToBlob(value: unknown): Promise<Blob> {
        if (isStreamLike(value) || isReadableStream(value)) {
            const buffer = await streamToBuffer(value);
            return new Blob([buffer]);
        }

        if (value instanceof Blob) {
            return value;
        }

        if (isBuffer(value)) {
            return new Blob([value]);
        }

        if (value instanceof ArrayBuffer) {
            return new Blob([value]);
        }

        if (isArrayBufferView(value)) {
            return new Blob([value]);
        }

        if (typeof value === "string") {
            return new Blob([value]);
        }

        if (typeof value === "object" && value !== null) {
            return new Blob([toJson(value)], { type: "application/json" });
        }

        return new Blob([String(value)]);
    }

    public async appendFile(key: string, value: unknown, fileName?: string): Promise<void> {
        fileName = this.getFileName(value, fileName);
        const blob = await this.convertToBlob(value);

        if (fileName) {
            this.fd.append(key, blob, fileName);
        } else {
            this.fd.append(key, blob);
        }
    }

    public getRequest(): FormDataRequest<FormData> {
        return {
            body: this.fd,
            headers: {},
            duplex: "half" as const,
        };
    }
}
<% } %>