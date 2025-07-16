import { HttpEndpointReferenceParser } from '../utils/HttpEndpointReferenceParser'

describe('HttpEndpointReferenceParser', () => {
    describe('validate', () => {
        it('should validate a valid endpoint reference', () => {
            const parser = new HttpEndpointReferenceParser()
            const result = parser.validate('GET /users')
            expect(result).toEqual({ type: 'valid' })
        })

        it('should invalidate an endpoint reference with special characters in the method', () => {
            const parser = new HttpEndpointReferenceParser()
            const result = parser.validate('GET! /users')
            expect(result).toEqual({ type: 'invalid' })
        })

        it('should validate an endpoint reference with a period in the path', () => {
            const parser = new HttpEndpointReferenceParser()
            const result = parser.validate('GET /api/v1.0/users')
            expect(result).toEqual({ type: 'valid' })
        })
    })
})
