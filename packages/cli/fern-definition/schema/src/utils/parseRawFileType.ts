import { FernContainerRegex } from './visitRawTypeReference'

export interface RawFileType {
    isOptional: boolean
    isArray: boolean
}

const FILE_TYPE = 'file'

function isFileArray(typeReference: string): boolean {
    const listMatch = typeReference.match(FernContainerRegex.LIST)
    if (listMatch?.[1] === FILE_TYPE) {
        return true
    }
    return false
}

export function parseRawFileType(typeReference: string): RawFileType | undefined {
    if (typeReference === FILE_TYPE) {
        return { isOptional: false, isArray: false }
    }

    const optionalMatch = typeReference.match(FernContainerRegex.OPTIONAL)
    if (optionalMatch?.[1] !== undefined) {
        if (optionalMatch[1] === FILE_TYPE) {
            return { isOptional: true, isArray: false }
        } else if (isFileArray(optionalMatch[1])) {
            return { isOptional: true, isArray: true }
        }
    }

    if (isFileArray(typeReference)) {
        return { isOptional: false, isArray: true }
    }

    return undefined
}
