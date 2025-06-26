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
    let formdata: CrossPlatformFormData = new WebFormData();

    await formdata.setup();
    return formdata;
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
            headers: {},
        };
    }
}
