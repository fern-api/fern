import type { Uploadable } from "./types.mjs";
export declare function toBinaryUploadRequest(file: Uploadable): Promise<{
    body: Uploadable.FileLike;
    headers?: Record<string, string>;
}>;
export declare function toMultipartDataPart(file: Uploadable): Promise<{
    data: Uploadable.FileLike;
    filename?: string;
    contentType?: string;
}>;
