import { FernContainerRegex } from "./visitRawTypeReference"

export interface RawTextType {
    isOptional: boolean
}

const TEXT_TYPE = "text"

export function parseRawTextType(typeReference: string): RawTextType | undefined {
    if (typeReference === TEXT_TYPE) {
        return { isOptional: false }
    }

    const optionalMatch = typeReference.match(FernContainerRegex.OPTIONAL)
    if (optionalMatch?.[1] === TEXT_TYPE) {
        return { isOptional: true }
    }

    return undefined
}
