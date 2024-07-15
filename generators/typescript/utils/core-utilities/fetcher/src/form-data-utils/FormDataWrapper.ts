import { Readable } from "stream";
import { RUNTIME } from "../runtime";

interface CrossPlatformFormData {
    append(key: string, value: any): void;
    append(key: string, value: any, fileName?: string): void;
}

class FormDataRequestBody {
    private fd: any;
    private encoder: any;

    constructor(fd: any) {
        this.fd = fd;
    }

    async setup(): Promise<void> {
        if (this.encoder == null && RUNTIME.type === "node") {
            this.encoder = new (await import("form-data-encoder")).FormDataEncoder(this.fd);
        }
    }

    /**
     * @returns the multipart form data request
     */
    public async getBody(): Promise<any> {
        if (RUNTIME.type !== "node") {
            return this.fd;
        } else {
            if (Number(RUNTIME.version?.split(".")[0]) >= 18) {
                if (this.encoder == null) {
                    await this.setup();
                }
                return Readable.from(this.encoder);
            } else {
                return this.fd;
            }
        }
    }

    /**
     * @returns headers that need to be added to the multipart form data request
     */
    public async getHeaders(): Promise<Record<string, string>> {
        if (RUNTIME.type !== "node") {
            return {};
        } else {
            if (Number(RUNTIME.version?.split(".")[0]) >= 18) {
                if (this.encoder == null) {
                    await this.setup();
                }
                return this.encoder.headers;
            } else {
                return this.fd.getHeaders();
            }
        }
    }
}

/**
 * FormDataWrapper is a utility to make form data
 * requests across both Browser and Node.js runtimes.
 */
export class FormDataWrapper {
    private fd: CrossPlatformFormData | undefined;

    public async append(name: string, value: any, fileName?: string): Promise<void> {
        if (this.fd == null) {
            if (RUNTIME.type === "node") {
                if (Number(RUNTIME.version?.split(".")[0]) >= 18) {
                    this.fd = new (await import("formdata-node")).FormData();
                    this.fd.append(
                        name,
                        new (await import("node:buffer")).Blob([value]),
                        fileName === "" ? undefined : fileName
                    );
                } else {
                    this.fd = new (await import("form-data")).default();
                    this.fd.append(name, value);
                }
            } else {
                this.fd = new FormData();
                this.fd.append(name, new Blob([value]), fileName === "" ? undefined : fileName);
            }
        }
    }

    public getRequest(): FormDataRequestBody {
        return new FormDataRequestBody(this.fd);
    }
}
