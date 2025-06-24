import { RUNTIME } from "../runtime/index.js";

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
    <% if (formDataSupport === "Node16") { %>
    let formdata: CrossPlatformFormData;
    if (RUNTIME.type === "node" && RUNTIME.parsedVersion != null && RUNTIME.parsedVersion < 18) {
        formdata = new OldNodeFormData();
    } else {
        formdata = new WebFormData();
    }
    <% } else { %>
    let formdata: CrossPlatformFormData = new WebFormData();
    <% } %>
    await formdata.setup();
    return formdata;
}

<% if (formDataSupport === "Node16") { %>

export type OldNodeFormDataFd =
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
                    },
          ): void;
          getHeaders(): Record<string, string>;
      }
    | undefined;

/**
 * Form Data Implementation for Node.js 16-18
 */
export class OldNodeFormData implements CrossPlatformFormData {
    private fd: OldNodeFormDataFd;

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
        // Only Node 16.17.0 and later has a global Blob
        const BlobImport = typeof Blob !== "undefined" ? Blob : (await import("buffer")).Blob;
        if (value instanceof BlobImport) {
            bufferedValue = Buffer.from(await value.arrayBuffer());
        } else {
            bufferedValue = value;
        }

        if (fileName == null) {
            this.fd?.append(key, bufferedValue);
        } else {
            this.fd?.append(key, bufferedValue, { filename: fileName });
        }
    }

    public getRequest(): FormDataRequest<OldNodeFormDataFd> {
        return {
            body: this.fd,
            headers: this.fd ? this.fd.getHeaders() : {},
        };
    }
}

<% } %>

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
            headers: {},
        };
    }
}
