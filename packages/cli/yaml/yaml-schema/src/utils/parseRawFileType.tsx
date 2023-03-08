import { FernContainerRegex } from "./visitRawTypeReference";

export interface RawFileType {
    isOptional: boolean;
}

const FILE_TYPE = "file";

export function parseRawFileType(typeReference: string): RawFileType | undefined {
    if (typeReference === FILE_TYPE) {
        return { isOptional: false };
    }

    const optionalMatch = typeReference.match(FernContainerRegex.OPTIONAL);
    if (optionalMatch?.[1] === FILE_TYPE) {
        return { isOptional: true };
    }

    return undefined;
}
