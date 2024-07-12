interface CrossPlatformFormData {
    append(key: string, value: any): void;
}

class FormDataRequestBody {
    private fd: any;

    constructor(fd: any) {
        this.fd = fd;
    }

    /**
     * @returns the multipart form data request
     */
    public async getBody(): Promise<any> {
        return this.fd;
    }

    /**
     * @returns headers that need to be added to the multipart form data request
     */
    public async getHeaders(): Promise<Record<string, string>> {
        return this.fd.getHeaders();
    }
}

/**
 * FormDataWrapper is a utility to make form data
 * requests across both Browser and Node.js runtimes.
 */
export class FormDataWrapper {
    private fd: CrossPlatformFormData | undefined;

    public async append(name: string, value: any): Promise<void> {
        this.fd = new (await import("form-data")).default();
        this.fd?.append(name, value);
    }

    public getRequest(): FormDataRequestBody {
        return new FormDataRequestBody(this.fd);
    }
}
