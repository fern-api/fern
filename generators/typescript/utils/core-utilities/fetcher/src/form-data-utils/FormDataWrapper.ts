import { RUNTIME } from "../runtime";

export type MaybePromise<T> = Promise<T> | T;

export interface CrossPlatformFormData {
    setup(): Promise<void>;

    append(key: string, value: unknown): void;

    appendFile(key: string, value: unknown, fileName?: string): Promise<void>;

    getBody(): MaybePromise<unknown>;

    getHeaders(): MaybePromise<Record<string, string>>;
}

export async function newFormData(): Promise<CrossPlatformFormData> {
    let formdata: CrossPlatformFormData;
    if (RUNTIME.type === "node" && RUNTIME.parsedVersion != null && RUNTIME.parsedVersion > 18) {
        formdata = new Node18FormData();
    } else if (RUNTIME.type === "node") {
        formdata = new Node16FormData();
    } else {
        formdata = new WebFormData();
    }
    await formdata.setup();
    return formdata;
}

/**
 * Form Data Implementation for Node.js 18+
 */
class Node18FormData implements CrossPlatformFormData {
    private fd:
        | {
              append(name: string, value: unknown, fileName?: string): void;
          }
        | undefined;
    private encoder: any;

    public async setup() {
        this.fd = new (await import("formdata-node")).FormData();
        this.encoder = new (await import("form-data-encoder")).FormDataEncoder(this.fd as any);
    }

    public append(key: string, value: any): void {
        this.fd?.append(key, value);
    }

    public async appendFile(key: string, value: any, fileName?: string): Promise<void> {
        this.fd?.append(key, new (await import("buffer")).Blob([value]), fileName);
    }

    public async getBody(): Promise<unknown> {
        return (await import("stream")).Readable.from(this.encoder);
    }

    public getHeaders(): Promise<Record<string, string>> {
        return this.encoder.headers;
    }
}

/**
 * Form Data Implementation for Node.js 16-18
 */
class Node16FormData implements CrossPlatformFormData {
    private fd:
        | {
              append(
                  name: string,
                  value: unknown,
                  options?: {
                      header?: string | Headers;
                      knownLength?: number;
                      filename?: string;
                      filepath?: string;
                      contentType?: string;
                  }
              ): void;
          }
        | undefined;

    public async setup(): Promise<void> {
        this.fd = new (await import("form-data")).default();
    }

    public append(key: string, value: any): void {
        this.fd?.append(key, value);
    }

    public async appendFile(key: string, value: any, fileName?: string): Promise<void> {
        if (fileName == null) {
            this.fd?.append(key, value);
        } else {
            this.fd?.append(key, value, { filename: fileName });
        }
    }

    public getBody(): unknown {
        return this.fd;
    }

    public getHeaders(): Record<string, string> {
        return {};
    }
}

/**
 * Form Data Implementation for Web
 */
class WebFormData implements CrossPlatformFormData {
    private fd: { append(name: string, value: string | Blob, fileName?: string): void } | undefined;

    public async setup(): Promise<void> {
        this.fd = new FormData();
    }

    public append(key: string, value: any): void {
        this.fd?.append(key, value);
    }

    public async appendFile(key: string, value: any, fileName?: string): Promise<void> {
        this.fd?.append(key, new Blob([value]), fileName);
    }

    public getBody(): unknown {
        return this.fd;
    }

    public getHeaders(): Record<string, string> {
        return {};
    }
}
