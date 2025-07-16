import { FernContainerRegex } from "./visitRawTypeReference";

export interface RawBytesType {
    isOptional: boolean;
}

export const BYTES_TYPE = "bytes";

export function parseRawBytesType(typeReference: string): RawBytesType | undefined {
    if (typeReference === BYTES_TYPE) {
        return { isOptional: false };
    }

    const optionalMatch = typeReference.match(FernContainerRegex.OPTIONAL);
    if (optionalMatch?.[1] === BYTES_TYPE) {
        return { isOptional: true };
    }

    return undefined;
}
