import { MediaType } from '@fern-api/core-utils'

import {
    AvailabilityUnionSchema,
    HttpInlineRequestBodyPropertySchema,
    HttpInlineRequestBodySchema,
    HttpRequestSchema,
    ObjectPropertySchema
} from '../schemas'
import { isFileInGeneric } from './generics/isFileInGeneric'
import { parseGenericNested } from './generics/parseGenericNested'
import { isInlineRequestBody } from './isInlineRequestBody'
import { parseRawFileType } from './parseRawFileType'

export interface RawFileUploadRequest {
    name: string
    extends: string | string[] | undefined
    properties: RawFileUploadRequest.Property[]
}

export declare namespace RawFileUploadRequest {
    export type Property = FileProperty | InlinedRequestBodyProperty

    export interface FileProperty extends BaseProperty {
        isFile: true
        isOptional: boolean
        isArray: boolean
    }

    export interface InlinedRequestBodyProperty extends BaseProperty {
        isFile: false
        propertyType: ObjectPropertySchema
    }

    export interface BaseProperty {
        docs: string | undefined
        availability?: AvailabilityUnionSchema | undefined
        key: string
        contentType?: string
        style?: 'exploded' | 'json' | 'form'
    }
}

function isFileUploadRequest(request: HttpRequestSchema | string): request is HttpRequestSchema {
    if (typeof request === 'string') {
        return false
    }

    if (MediaType.parse(request['content-type'])?.isMultiPartFormData() ?? false) {
        return true
    }

    if (request.body == null) {
        return false
    }
    if (isInlineRequestBody(request.body)) {
        if (Object.values(request.body.properties ?? []).some(doesPropertyHaveFile)) {
            return true
        }
    }

    return false
}

export function parseFileUploadRequest(request: HttpRequestSchema | string): RawFileUploadRequest | undefined {
    if (!isFileUploadRequest(request) || request.body == null) {
        return undefined
    }

    // TODO: handle case where request.name is undefined
    if (request.name == null) {
        return undefined
    }

    if (request.body != null && isInlineRequestBody(request.body)) {
        return createRawFileUploadRequest(request.name, request.body)
    }

    return undefined
}

function createRawFileUploadRequest(
    requestName: string,
    requestBody: HttpInlineRequestBodySchema
): RawFileUploadRequest | undefined {
    const properties = Object.entries(requestBody.properties ?? []).reduce<RawFileUploadRequest.Property[]>(
        (acc, [key, propertyType]) => {
            const docs = typeof propertyType !== 'string' ? propertyType.docs : undefined
            const contentType = typeof propertyType !== 'string' ? propertyType['content-type'] : undefined
            const style = typeof propertyType !== 'string' ? propertyType.style : undefined
            const maybeParsedFileType = parseRawFileType(
                typeof propertyType === 'string' ? propertyType : propertyType.type
            )
            if (maybeParsedFileType != null) {
                acc.push({
                    isFile: true,
                    key,
                    docs,
                    isOptional: maybeParsedFileType.isOptional,
                    isArray: maybeParsedFileType.isArray,
                    contentType,
                    style
                })
            } else {
                acc.push({ isFile: false, key, propertyType, docs, contentType, style })
            }
            return acc
        },
        []
    )

    if (requestBody['extra-properties']) {
        // TODO: handle extra properties
    }

    return {
        name: requestName,
        // TODO: handle requestBody.extends
        extends: requestBody.extends,
        properties
    }
}

function doesPropertyHaveFile(property: HttpInlineRequestBodyPropertySchema): boolean {
    const propertyType = typeof property === 'string' ? property : property.type
    if (propertyType === 'file') {
        return true
    }
    if (!propertyType.includes('file')) {
        // fast check to avoid unnecessary parsing
        return false
    }
    const generic = parseGenericNested(propertyType)
    if (generic == null) {
        return false
    }

    return isFileInGeneric(generic)
}
