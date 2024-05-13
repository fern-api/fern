import { RUNTIME } from "../runtime";

interface CrossPlatformFormData {
    append(key: string, value: any): void;
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
            if (this.encoder == null) {
                await this.setup();
            }
            return (await import("node:stream")).Readable.from(this.encoder);
        }
    }

    /**
     * @returns headers that need to be added to the multipart form data request
     */
    public async getHeaders(): Promise<Record<string, string>> {
        if (RUNTIME.type !== "node") {
            return {};
        } else {
            if (this.encoder == null) {
                await this.setup();
            }
            return {
                "Content-Length": this.encoder.length,
            };
        }
    }
}

/**
 * FormDataWrapper is a utility to make form data
 * requests across both Browser and Node.js runtimes.
 */
export class FormDataWrapper {
    private fd: CrossPlatformFormData | undefined;

    public async append(name: string, value: any): Promise<void> {
        if (this.fd == null) {
            if (RUNTIME.type === "node") {
                this.fd = new (await import("formdata-node")).FormData();
            } else {
                this.fd = new (await import("form-data")).default();
            }
        }
        this.fd.append(name, value);
    }

    public getRequest(): FormDataRequestBody {
        return new FormDataRequestBody(this.fd);
    }
}
