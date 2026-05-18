import { type Uploadable } from "../../core/file/index.js";
interface FormDataRequest<Body> {
    body: Body;
    headers: Record<string, string>;
    duplex?: "half";
}
export declare function newFormData(): Promise<FormDataWrapper>;
export declare class FormDataWrapper {
    private fd;
    setup(): Promise<void>;
    append(key: string, value: unknown): void;
    appendFile(key: string, value: Uploadable): Promise<void>;
    getRequest(): FormDataRequest<FormData>;
}
export {};
