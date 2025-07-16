import { assertNever } from '@fern-api/core-utils'
import { Schema, SdkGroupName } from '@fern-api/openapi-ir'

export function getGroupNameForSchema(schema: Schema): SdkGroupName | undefined {
    switch (schema.type) {
        case 'object':
        case 'enum':
        case 'array':
        case 'map':
        case 'reference':
        case 'literal':
        case 'optional':
        case 'nullable':
        case 'primitive':
            return schema.groupName ?? undefined
        case 'oneOf':
            return schema.value.groupName ?? undefined
        case 'unknown':
            return undefined
        default:
            assertNever(schema)
    }
}
