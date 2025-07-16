import { isFileInGeneric } from '../utils/generics/isFileInGeneric'
import { isGeneric } from '../utils/generics/isGeneric'
import { isTypeInGeneric } from '../utils/generics/isTypeInGeneric'
import { parseGeneric } from '../utils/generics/parseGeneric'
import { parseGenericNested } from '../utils/generics/parseGenericNested'

describe('parseGeneric', () => {
    it('should parse simple generic types', () => {
        const result = parseGeneric('List<string>')
        expect(result).toEqual({
            name: 'List',
            arguments: ['string']
        })
    })

    it('should parse generic types with multiple arguments', () => {
        const result = parseGeneric('Map<string, number>')
        expect(result).toEqual({
            name: 'Map',
            arguments: ['string', 'number']
        })
    })

    it('should parse generic types with spaces', () => {
        const result = parseGeneric('Optional< string >')
        expect(result).toEqual({
            name: 'Optional',
            arguments: ['string']
        })
    })

    it('should parse generic types with namespaced names', () => {
        const result = parseGeneric('com.example.List<string>')
        expect(result).toEqual({
            name: 'com.example.List',
            arguments: ['string']
        })
    })

    it('should return undefined for non-generic types', () => {
        expect(parseGeneric('string')).toBeUndefined()
        expect(parseGeneric('List')).toBeUndefined()
        expect(parseGeneric('')).toBeUndefined()
    })

    it('should return undefined for container types', () => {
        // Assuming RawContainerTypes includes common container types
        expect(parseGeneric('list<string>')).toBeUndefined()
        expect(parseGeneric('optional<string>')).toBeUndefined()
        expect(parseGeneric('map<string, number>')).toBeUndefined()
        expect(parseGeneric('set<string>')).toBeUndefined()
    })

    it('should handle malformed input gracefully', () => {
        expect(parseGeneric('List<')).toBeUndefined()
        expect(parseGeneric('List>')).toBeUndefined()
        expect(parseGeneric('<string>')).toBeUndefined()
    })
})

describe('parseGenericNested', () => {
    it('should parse simple nested generics', () => {
        const result = parseGenericNested('List<string>')
        expect(result).toEqual({
            name: 'List',
            arguments: ['string']
        })
    })

    it('should parse deeply nested generics', () => {
        const result = parseGenericNested('List<Optional<string>>')
        expect(result).toEqual({
            name: 'List',
            arguments: [
                {
                    name: 'Optional',
                    arguments: ['string']
                }
            ]
        })
    })

    it('should parse multiple nested arguments', () => {
        const result = parseGenericNested('Map<List<string>, Optional<number>>')
        expect(result).toEqual({
            name: 'Map',
            arguments: [
                {
                    name: 'List',
                    arguments: ['string']
                },
                {
                    name: 'Optional',
                    arguments: ['number']
                }
            ]
        })
    })

    it('should parse very deeply nested generics', () => {
        const result = parseGenericNested('List<Map<string, Optional<List<number>>>>')
        expect(result).toEqual({
            name: 'List',
            arguments: [
                {
                    name: 'Map',
                    arguments: [
                        'string',
                        {
                            name: 'Optional',
                            arguments: [
                                {
                                    name: 'List',
                                    arguments: ['number']
                                }
                            ]
                        }
                    ]
                }
            ]
        })
    })

    it('should handle spaces in nested generics', () => {
        const result = parseGenericNested('List< Map< string , Optional< number > > >')
        expect(result).toEqual({
            name: 'List',
            arguments: [
                {
                    name: 'Map',
                    arguments: [
                        'string',
                        {
                            name: 'Optional',
                            arguments: ['number']
                        }
                    ]
                }
            ]
        })
    })

    it('should return undefined for non-generic types', () => {
        expect(parseGenericNested('string')).toBeUndefined()
        expect(parseGenericNested('List')).toBeUndefined()
        expect(parseGenericNested('')).toBeUndefined()
    })

    it('should throw error for malformed input', () => {
        expect(() => parseGenericNested('List<string')).toThrow(
            "Malformed input: missing closing '>' for generic arguments."
        )
        expect(() => parseGenericNested('List<Map<string, number>')).toThrow(
            "Malformed input: missing closing '>' for generic arguments."
        )
    })

    it('should throw error for excessive recursion depth', () => {
        // Create a deeply nested generic that exceeds MAX_RECURSION_DEPTH
        let deeplyNested = 'A'
        for (let i = 0; i < 130; i++) {
            deeplyNested = `List<${deeplyNested}>`
        }
        expect(() => parseGenericNested(deeplyNested)).toThrow(
            'Internal error; Exceeded maximum recursion depth while parsing generics.'
        )
    })
})

describe('isGeneric', () => {
    it('should return true for generic types', () => {
        expect(isGeneric('List<string>')).toBe(true)
        expect(isGeneric('Map<string, number>')).toBe(true)
        expect(isGeneric('Optional<User>')).toBe(true)
    })

    it('should return false for non-generic types', () => {
        expect(isGeneric('string')).toBe(false)
        expect(isGeneric('List')).toBe(false)
        expect(isGeneric('User')).toBe(false)
        expect(isGeneric('')).toBe(false)
    })

    it('should return false for container types', () => {
        expect(isGeneric('list<string>')).toBe(false)
        expect(isGeneric('optional<string>')).toBe(false)
        expect(isGeneric('map<string, number>')).toBe(false)
    })
})

describe('isTypeInGeneric', () => {
    it('should find type in top-level arguments', () => {
        const input = {
            name: 'List',
            arguments: ['string', 'number']
        }
        expect(isTypeInGeneric({ input, typeName: 'string' })).toBe(true)
        expect(isTypeInGeneric({ input, typeName: 'number' })).toBe(true)
        expect(isTypeInGeneric({ input, typeName: 'boolean' })).toBe(false)
    })

    it('should find type in nested arguments', () => {
        const input = {
            name: 'List',
            arguments: [
                {
                    name: 'Optional',
                    arguments: ['string']
                }
            ]
        }
        expect(isTypeInGeneric({ input, typeName: 'string' })).toBe(true)
        expect(isTypeInGeneric({ input, typeName: 'Optional' })).toBe(false)
        expect(isTypeInGeneric({ input, typeName: 'number' })).toBe(false)
    })

    it('should find type in deeply nested arguments', () => {
        const input = {
            name: 'List',
            arguments: [
                {
                    name: 'Map',
                    arguments: [
                        'string',
                        {
                            name: 'Optional',
                            arguments: ['file']
                        }
                    ]
                }
            ]
        }
        expect(isTypeInGeneric({ input, typeName: 'file' })).toBe(true)
        expect(isTypeInGeneric({ input, typeName: 'string' })).toBe(true)
        expect(isTypeInGeneric({ input, typeName: 'number' })).toBe(false)
    })

    it('should handle empty arguments', () => {
        const input = {
            name: 'Empty',
            arguments: []
        }
        expect(isTypeInGeneric({ input, typeName: 'string' })).toBe(false)
    })
})

describe('isFileInGeneric', () => {
    it('should return true when file type is present', () => {
        const input = {
            name: 'List',
            arguments: ['file', 'string']
        }
        expect(isFileInGeneric(input)).toBe(true)
    })

    it('should return true when file type is in nested arguments', () => {
        const input = {
            name: 'Optional',
            arguments: [
                {
                    name: 'List',
                    arguments: ['file']
                }
            ]
        }
        expect(isFileInGeneric(input)).toBe(true)
    })

    it('should return false when file type is not present', () => {
        const input = {
            name: 'List',
            arguments: ['string', 'number']
        }
        expect(isFileInGeneric(input)).toBe(false)
    })

    it('should return false for empty arguments', () => {
        const input = {
            name: 'Empty',
            arguments: []
        }
        expect(isFileInGeneric(input)).toBe(false)
    })
})
