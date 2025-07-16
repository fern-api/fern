import { ruby } from '../..'
import { BaseRubyCustomConfigSchema } from '../../custom-config/BaseRubyCustomConfigSchema'
import { MethodKind, MethodVisibility } from '../Method'
import { Type } from '../Type'
import { Writer } from '../core/Writer'

describe('Method', () => {
    let writerConfig: Writer.Args

    beforeEach(() => {
        writerConfig = { customConfig: BaseRubyCustomConfigSchema.parse({ clientClassName: 'Example' }) }
    })

    describe('type definitions', () => {
        test('writes type definition for method with no parameters and untyped return type', () => {
            const method = ruby.method({ name: 'foobar' })

            expect(method.typeDefinitionToString(writerConfig)).toMatchSnapshot()
        })

        test('writes type definition for method with no parameters and typed return', () => {
            const method = ruby.method({ name: 'foobar', returnType: Type.boolean() })

            expect(method.typeDefinitionToString(writerConfig)).toMatchSnapshot()
        })

        test('writes type definition for method with untyped positional parameters', () => {
            const method = ruby.method({
                name: 'foobar',
                parameters: { positional: [ruby.parameters.positional({ name: 'biz', type: Type.untyped() })] },
                returnType: Type.untyped()
            })

            expect(method.typeDefinitionToString(writerConfig)).toMatchSnapshot()
        })

        test('writes type definition for method with typed positional parameters', () => {
            const method = ruby.method({
                name: 'foobar',
                parameters: {
                    positional: [
                        ruby.parameters.positional({ name: 'biz', type: Type.string() }),
                        ruby.parameters.positional({ name: 'baz', type: Type.integer() })
                    ]
                },
                returnType: Type.untyped()
            })

            expect(method.typeDefinitionToString(writerConfig)).toMatchSnapshot()
        })

        test('writes type definition for method with typed (but optional) positional parameters', () => {
            const method = ruby.method({
                name: 'foobar',
                parameters: {
                    positional: [
                        ruby.parameters.positional({ name: 'biz', type: Type.string(), optional: true }),
                        ruby.parameters.positional({ name: 'baz', type: Type.integer(), optional: true })
                    ]
                }
            })

            expect(method.typeDefinitionToString(writerConfig)).toMatchSnapshot()
        })

        test('writes type definition for method with typed keyword parameters', () => {
            const method = ruby.method({
                name: 'foobar',
                parameters: {
                    positional: [
                        ruby.parameters.keyword({ name: 'biz', type: Type.string() }),
                        ruby.parameters.keyword({ name: 'baz', type: Type.integer() })
                    ]
                },
                returnType: Type.boolean()
            })

            expect(method.typeDefinitionToString(writerConfig)).toMatchSnapshot()
        })

        test('writes type definition for method with positional splat parameter', () => {
            const method = ruby.method({
                name: 'valid_name?',
                parameters: {
                    positionalSplat: ruby.parameters.positionalSplat({ name: 'names', type: Type.string() })
                },
                returnType: Type.boolean()
            })

            expect(method.typeDefinitionToString(writerConfig)).toMatchSnapshot()
        })

        test('writes type definition for method with keyword splat parameter', () => {
            const method = ruby.method({
                name: 'valid_name?',
                parameters: {
                    positionalSplat: ruby.parameters.keywordSplat({ name: 'names', type: Type.untyped() })
                },
                returnType: Type.boolean()
            })

            expect(method.typeDefinitionToString(writerConfig)).toMatchSnapshot()
        })
    })

    test('writes method with no parameters', () => {
        const method = ruby.method({ name: 'fizzbuzz' })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })

    test('writes method with empty parameter arrays', () => {
        const method = ruby.method({
            name: 'fizzbuzz',
            parameters: { positional: [], keyword: [] }
        })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })

    test('writes method with special characters in name', () => {
        const method = ruby.method({ name: 'fizz_buzz!' })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })

    test('writes method with positional parameters', () => {
        const method = ruby.method({
            name: 'fizzbuzz',
            parameters: {
                positional: [ruby.parameters.positional({ name: 'one' }), ruby.parameters.positional({ name: 'two' })]
            }
        })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })

    test('writes method with keyword parameters', () => {
        const method = ruby.method({
            name: 'fizzbuzz',
            parameters: {
                keyword: [ruby.parameters.keyword({ name: 'one' }), ruby.parameters.keyword({ name: 'two' })]
            }
        })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })

    test('writes method with single splat parameter', () => {
        const method = ruby.method({
            name: 'fizzbuzz',
            parameters: { positionalSplat: ruby.parameters.positionalSplat({ name: 'one' }) }
        })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })

    test('writes method with double splat parameter', () => {
        const method = ruby.method({
            name: 'fizzbuzz',
            parameters: { keywordSplat: ruby.parameters.keywordSplat({ name: 'one' }) }
        })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })

    test('writes method with yield parameter', () => {
        const method = ruby.method({
            name: 'fizzbuzz',
            parameters: { yield: ruby.parameters.yield({ name: 'one' }) }
        })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })

    test('writes method with mix of positional and keyword parameters', () => {
        const method = ruby.method({
            name: 'fizzbuzz',
            parameters: {
                positional: [ruby.parameters.positional({ name: 'one' }), ruby.parameters.positional({ name: 'two' })],
                keyword: [ruby.parameters.keyword({ name: 'three' }), ruby.parameters.keyword({ name: 'four' })]
            }
        })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })

    test('writes method with mix of positional, keyword, and single-splat parameters', () => {
        const method = ruby.method({
            name: 'fizzbuzz',
            parameters: {
                positional: [ruby.parameters.positional({ name: 'one' }), ruby.parameters.positional({ name: 'two' })],
                keyword: [ruby.parameters.keyword({ name: 'three' }), ruby.parameters.keyword({ name: 'four' })],
                positionalSplat: ruby.parameters.positionalSplat({ name: 'splatted' })
            }
        })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })

    test('writes method with mix of positional, keyword, and double-splat parameters', () => {
        const method = ruby.method({
            name: 'fizzbuzz',
            parameters: {
                positional: [ruby.parameters.positional({ name: 'one' }), ruby.parameters.positional({ name: 'two' })],
                keyword: [ruby.parameters.keyword({ name: 'three' }), ruby.parameters.keyword({ name: 'four' })],
                keywordSplat: ruby.parameters.keywordSplat({ name: 'double_splatted' })
            }
        })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })

    test('writes method with mix of positional, keyword, and yield parameters', () => {
        const method = ruby.method({
            name: 'fizzbuzz',
            parameters: {
                positional: [ruby.parameters.positional({ name: 'one' }), ruby.parameters.positional({ name: 'two' })],
                keyword: [ruby.parameters.keyword({ name: 'three' }), ruby.parameters.keyword({ name: 'four' })],
                yield: ruby.parameters.yield({ name: 'block' })
            }
        })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })

    test('writes method with all parameter types', () => {
        const method = ruby.method({
            name: 'fizzbuzz',
            parameters: {
                positional: [ruby.parameters.positional({ name: 'one' })],
                keyword: [ruby.parameters.keyword({ name: 'two' })],
                positionalSplat: ruby.parameters.positionalSplat({ name: 'three' }),
                keywordSplat: ruby.parameters.keywordSplat({ name: 'four' }),
                yield: ruby.parameters.yield({ name: 'five' })
            }
        })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })

    test('writes private instance methods', () => {
        const method = ruby.method({
            name: 'foobar',
            visibility: MethodVisibility.Private
        })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })

    test('writes protected instance methods', () => {
        const method = ruby.method({
            name: 'foobar',
            visibility: MethodVisibility.Protected
        })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })

    test('writes private class methods', () => {
        const method = ruby.method({
            name: 'foobar',
            visibility: MethodVisibility.Private,
            kind: MethodKind.Class_
        })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })

    test('writes protected class methods', () => {
        const method = ruby.method({
            name: 'foobar',
            visibility: MethodVisibility.Protected,
            kind: MethodKind.Class_
        })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })

    test('writes method with docstring', () => {
        const method = ruby.method({
            name: 'bizbuzz',
            docstring: 'This is a method\nthat does nothing'
        })

        expect(method.toString(writerConfig)).toMatchSnapshot()
    })
})
