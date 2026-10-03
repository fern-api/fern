import type { Uploadable } from "./types.js";
export declare function toBinaryUploadRequest(file: Uploadable): Promise<{
    body: Uploadable.FileLike;
    headers?: Record<string, string>;
}>;
export declare function toMultipartDataPart(file: Uploadable): Promise<{
    data: Uploadable.FileLike;
    filename?: string;
    contentType?: string;
}>;
/**
 * Builds an RFC 6266 Content-Disposition header. The `filename` parameter must be ISO-8859-1 safe
 * (fetch's Headers rejects other code points), so non-ASCII names are downgraded to an ASCII fallback
 * and carried verbatim in a percent-encoded `filename*` (RFC 5987) parameter.
 */
export declare function toContentDisposition(filename: string): string;
