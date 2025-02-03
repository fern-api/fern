import { RUNTIME } from "../runtime";

export type MaybePromise<T> = Promise<T> | T;

interface FormDataRequest<Body> {
    body: Body;
    headers: Record<string, string>;
    duplex?: "half";
}

function isNamedValue(value: unknown): value is { name: string } {
    return typeof value === "object" && value != null && "name" in value;
}

export interface CrossPlatformFormData {
    setup(): Promise<void>;

    append(key: string, value: unknown): void;

    appendFile(key: string, value: unknown, fileName?: string): Promise<void>;

    getRequest(): MaybePromise<FormDataRequest<unknown>>;
}

export async function newFormData(): Promise<CrossPlatformFormData> {
    let formdata: CrossPlatformFormData;
    if (RUNTIME.type === "node") {
        formdata = new NodeFormData();
    } else {
        formdata = new WebFormData();
    }
    await formdata.setup();
    return formdata;
}

export type NodeFormDataFd =
    | {
          append(name: string, value: unknown, fileName?: string): void;
      }
    | undefined;

/**
 * Form Data Implementation for Node.js
 */
export class NodeFormData implements CrossPlatformFormData {
    private fd: NodeFormDataFd;

    public async setup() {
        this.fd = new (await import("formdata-node")).FormData();
    }

    public append(key: string, value: any): void {
        this.fd?.append(key, value);
    }

    public async appendFile(key: string, value: unknown, fileName?: string): Promise<void> {
        if (fileName == null && isNamedValue(value)) {
            fileName = value.name;
        }

        if (value instanceof Blob) {
            this.fd?.append(key, value, fileName);
        } else {
            this.fd?.append(key, {
                type: undefined,
                name: fileName,
                [Symbol.toStringTag]: "File",
                stream() {
                    return value;
                },
            });
        }
    }

    public async getRequest(): Promise<FormDataRequest<unknown>> {
        const encoder = new (await import("form-data-encoder")).FormDataEncoder(this.fd as any);
        return {
            body: (await import("readable-stream")).Readable.from(encoder),
            headers: encoder.headers,
            duplex: "half",
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

    public async appendFile(key: string, value: any, fileName?: string): Promise<void> {
        if (fileName == null && isNamedValue(value)) {
            fileName = value.name;
        }
        if (value instanceof Blob) {
            this.fd?.append(key, value, fileName);
            return;
        }
        this.fd?.append(key, new Blob([value]), fileName);
    }

    public getRequest(): FormDataRequest<WebFormDataFd> {
        return {
            body: this.fd,
            headers: {},
        };
    }
}
