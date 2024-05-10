import { RUNTIME } from "../runtime";

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

    public async getBody(): Promise<any> {
        if (RUNTIME.type !== "node") {
            return this.fd;
        } else {
            if (this.encoder == null) {
                await this.setup();
            }
<<<<<<< HEAD
            return (await import("node:stream")).Readable.from(this.encoder);
=======
            const Readable = (await import("node:stream")).Readable;
            return Readable.from(this.encoder);
>>>>>>> c592ccbe7 (move back under fetcher)
        }
    }

    public async getHeaders(): Promise<Record<string, string>> {
        if (RUNTIME.type !== "node") {
            return {};
        } else {
            if (this.encoder == null) {
                await this.setup();
            }
            return {
<<<<<<< HEAD
=======
                ...this.encoder.headers,
>>>>>>> c592ccbe7 (move back under fetcher)
                "Content-Length": this.encoder.length,
            };
        }
    }
}

export class FormDataWrapper {
    private fd: any;

    constructor() {}

    async setup(): Promise<void> {
        if (this.fd == null) {
            if (RUNTIME.type === "node") {
                this.fd = new (await import("formdata-node")).FormData();
            } else {
                this.fd = new (await import("form-data")).default();
            }
        }
    }

    public async append(name: string, value: any): Promise<void> {
        await this.setup();
        this.fd.append(name, value);
    }

<<<<<<< HEAD
    public getRequest(): FormDataRequestBody {
=======
    public async getRequest(): Promise<FormDataRequestBody> {
>>>>>>> c592ccbe7 (move back under fetcher)
        return new FormDataRequestBody(this.fd);
    }
}
