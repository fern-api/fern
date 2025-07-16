import { HttpRequestSchema } from "../schemas";
import { parseRawBytesType } from "./parseRawBytesType";

export interface BytesRequest {
    isOptional: boolean;
}

export function parseBytesRequest(request: HttpRequestSchema | string): BytesRequest | undefined {
    const reference =
        typeof request === "string" ? request : typeof request.body === "string" ? request.body : undefined;

    if (reference == null) {
        return undefined;
    }

    return parseRawBytesType(reference);
}
