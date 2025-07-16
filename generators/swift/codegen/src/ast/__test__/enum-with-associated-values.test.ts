import { swift } from '../..'
import { AccessLevel } from '../AccessLevel'

describe('EnumWithAssociatedValues', () => {
    describe('write', () => {
        it('should write basic enum with associated values', () => {
            const enum_ = swift.enumWithAssociatedValues({
                name: 'NetworkResponse',
                cases: [
                    { unsafeName: 'success', associatedValue: [swift.Type.string()] },
                    { unsafeName: 'error', associatedValue: [swift.Type.int(), swift.Type.string()] }
                ]
            })

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "enum NetworkResponse {
                  case success(String)
                  case error(Int, String)
              }"
            `)
        })

        it('should write enum with access level and conformances', () => {
            const enum_ = swift.enumWithAssociatedValues({
                name: 'Result',
                accessLevel: AccessLevel.Public,
                conformances: ['Codable', 'Equatable'],
                cases: [
                    { unsafeName: 'success', associatedValue: [swift.Type.string()] },
                    { unsafeName: 'failure', associatedValue: [swift.Type.string()] }
                ]
            })

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "public enum Result: Codable, Equatable {
                  case success(String)
                  case failure(String)
              }"
            `)
        })

        it('should handle complex associated values', () => {
            const enum_ = swift.enumWithAssociatedValues({
                name: 'ComplexEnum',
                cases: [
                    {
                        unsafeName: 'complex',
                        associatedValue: [
                            swift.Type.array(swift.Type.string()),
                            swift.Type.dictionary(swift.Type.string(), swift.Type.int()),
                            swift.Type.tuple([swift.Type.string(), swift.Type.bool()])
                        ]
                    }
                ]
            })

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "enum ComplexEnum {
                  case complex([String], [String: Int], (String, Bool))
              }"
            `)
        })

        it('should handle reserved keywords in case names', () => {
            const enum_ = swift.enumWithAssociatedValues({
                name: 'KeywordEnum',
                cases: [
                    { unsafeName: 'class', associatedValue: [swift.Type.string()] },
                    { unsafeName: 'struct', associatedValue: [swift.Type.int()] }
                ]
            })

            expect(enum_.toString()).toMatchInlineSnapshot(`
              "enum KeywordEnum {
                  case \`class\`(String)
                  case \`struct\`(Int)
              }"
            `)
        })
    })
})
