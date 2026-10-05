import Foundation
import Testing
import Errors

@Suite("SimpleClient Wire Tests") struct SimpleClientWireTests {
    @Test func fooWithoutEndpointError1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "bar": "bar"
                }
                """#.utf8
            )
        )
        let client = ErrorsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = FooResponse(
            bar: "bar"
        )
        let response = try await client.simple.fooWithoutEndpointError(
            request: FooRequest(
                bar: "bar"
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func fooWithoutEndpointErrorThrowsNotFoundError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 404,
            body: Foundation.Data(
                #"""
                {
                  "message": "message",
                  "code": 1
                }
                """#.utf8
            )
        )
        let client = ErrorsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.simple.fooWithoutEndpointError(
                request: FooRequest(
                    bar: "bar"
                ),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ErrorsError.httpError with status code 404")
        } catch ErrorsError.httpError(let httpError) {
            #expect(httpError.statusCode == 404)
            let body = try #require(httpError.body)
            #expect(body.code == 1)
            #expect(body.type == nil)
            #expect(body.message == "message")
        }
    }

    @Test func fooWithoutEndpointErrorThrowsBadRequestError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 400,
            body: Foundation.Data(
                #"""
                {
                  "message": "message",
                  "code": 1
                }
                """#.utf8
            )
        )
        let client = ErrorsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.simple.fooWithoutEndpointError(
                request: FooRequest(
                    bar: "bar"
                ),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ErrorsError.httpError with status code 400")
        } catch ErrorsError.httpError(let httpError) {
            #expect(httpError.statusCode == 400)
            let body = try #require(httpError.body)
            #expect(body.code == 1)
            #expect(body.type == nil)
            #expect(body.message == "message")
        }
    }

    @Test func fooWithoutEndpointErrorThrowsInternalServerError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 500,
            body: Foundation.Data(
                #"""
                {
                  "message": "message",
                  "code": 1
                }
                """#.utf8
            )
        )
        let client = ErrorsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.simple.fooWithoutEndpointError(
                request: FooRequest(
                    bar: "bar"
                ),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ErrorsError.httpError with status code 500")
        } catch ErrorsError.httpError(let httpError) {
            #expect(httpError.statusCode == 500)
            let body = try #require(httpError.body)
            #expect(body.code == 1)
            #expect(body.type == nil)
            #expect(body.message == "message")
        }
    }

    @Test func foo1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "bar": "bar"
                }
                """#.utf8
            )
        )
        let client = ErrorsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = FooResponse(
            bar: "bar"
        )
        let response = try await client.simple.foo(
            request: FooRequest(
                bar: "bar"
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func fooThrowsFooTooMuch() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 429,
            body: Foundation.Data(
                #"""
                {
                  "message": "message",
                  "code": 1
                }
                """#.utf8
            )
        )
        let client = ErrorsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.simple.foo(
                request: FooRequest(
                    bar: "bar"
                ),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ErrorsError.httpError with status code 429")
        } catch ErrorsError.httpError(let httpError) {
            #expect(httpError.statusCode == 429)
            let body = try #require(httpError.body)
            #expect(body.code == 1)
            #expect(body.type == nil)
            #expect(body.message == "message")
        }
    }

    @Test func fooThrowsFooTooLittle() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 500,
            body: Foundation.Data(
                #"""
                {
                  "message": "message",
                  "code": 1
                }
                """#.utf8
            )
        )
        let client = ErrorsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.simple.foo(
                request: FooRequest(
                    bar: "bar"
                ),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ErrorsError.httpError with status code 500")
        } catch ErrorsError.httpError(let httpError) {
            #expect(httpError.statusCode == 500)
            let body = try #require(httpError.body)
            #expect(body.code == 1)
            #expect(body.type == nil)
            #expect(body.message == "message")
        }
    }

    @Test func fooThrowsNotFoundError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 404,
            body: Foundation.Data(
                #"""
                {
                  "message": "message",
                  "code": 1
                }
                """#.utf8
            )
        )
        let client = ErrorsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.simple.foo(
                request: FooRequest(
                    bar: "bar"
                ),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ErrorsError.httpError with status code 404")
        } catch ErrorsError.httpError(let httpError) {
            #expect(httpError.statusCode == 404)
            let body = try #require(httpError.body)
            #expect(body.code == 1)
            #expect(body.type == nil)
            #expect(body.message == "message")
        }
    }

    @Test func fooThrowsBadRequestError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 400,
            body: Foundation.Data(
                #"""
                {
                  "message": "message",
                  "code": 1
                }
                """#.utf8
            )
        )
        let client = ErrorsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.simple.foo(
                request: FooRequest(
                    bar: "bar"
                ),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ErrorsError.httpError with status code 400")
        } catch ErrorsError.httpError(let httpError) {
            #expect(httpError.statusCode == 400)
            let body = try #require(httpError.body)
            #expect(body.code == 1)
            #expect(body.type == nil)
            #expect(body.message == "message")
        }
    }

    @Test func fooWithExamples1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "bar": "hello"
                }
                """#.utf8
            )
        )
        let client = ErrorsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = FooResponse(
            bar: "hello"
        )
        let response = try await client.simple.fooWithExamples(
            request: FooRequest(
                bar: "hello"
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func fooWithExamplesThrowsFooTooMuch() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 429,
            body: Foundation.Data(
                #"""
                {
                  "message": "Too much foo",
                  "code": 1
                }
                """#.utf8
            )
        )
        let client = ErrorsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.simple.fooWithExamples(
                request: FooRequest(
                    bar: "hello"
                ),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ErrorsError.httpError with status code 429")
        } catch ErrorsError.httpError(let httpError) {
            #expect(httpError.statusCode == 429)
            let body = try #require(httpError.body)
            #expect(body.code == 1)
            #expect(body.type == nil)
            #expect(body.message == "Too much foo")
        }
    }

    @Test func fooWithExamplesThrowsFooTooLittle() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 500,
            body: Foundation.Data(
                #"""
                {
                  "message": "Too little foo",
                  "code": 2
                }
                """#.utf8
            )
        )
        let client = ErrorsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.simple.fooWithExamples(
                request: FooRequest(
                    bar: "hello"
                ),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ErrorsError.httpError with status code 500")
        } catch ErrorsError.httpError(let httpError) {
            #expect(httpError.statusCode == 500)
            let body = try #require(httpError.body)
            #expect(body.code == 2)
            #expect(body.type == nil)
            #expect(body.message == "Too little foo")
        }
    }
}