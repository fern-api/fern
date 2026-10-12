import Foundation
import Testing
import BasicAuth

@Suite("BasicAuthClient_ Wire Tests") struct BasicAuthClient_WireTests {
    @Test func getWithBasicAuth1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                true
                """#.utf8
            )
        )
        let client = BasicAuthClient(
            baseURL: "https://api.fern.com",
            username: "<username>",
            password: "<password>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.basicAuth.getWithBasicAuth(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getWithBasicAuthThrowsUnauthorizedRequest() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 401,
            body: Foundation.Data(
                #"""
                {
                  "message": "message"
                }
                """#.utf8
            )
        )
        let client = BasicAuthClient(
            baseURL: "https://api.fern.com",
            username: "<username>",
            password: "<password>",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.basicAuth.getWithBasicAuth(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
            Issue.record("Expected BasicAuthError.httpError with status code 401")
        } catch BasicAuthError.httpError(let httpError) {
            #expect(httpError.statusCode == 401)
            let body = try #require(httpError.body)
            #expect(body.code == 401)
            #expect(body.type == nil)
            #expect(body.message == "message")
        }
    }

    @Test func postWithBasicAuth1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                true
                """#.utf8
            )
        )
        let client = BasicAuthClient(
            baseURL: "https://api.fern.com",
            username: "<username>",
            password: "<password>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.basicAuth.postWithBasicAuth(
            request: .object([
                "key": .string("value")
            ]),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func postWithBasicAuthThrowsUnauthorizedRequest() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 401,
            body: Foundation.Data(
                #"""
                {
                  "message": "message"
                }
                """#.utf8
            )
        )
        let client = BasicAuthClient(
            baseURL: "https://api.fern.com",
            username: "<username>",
            password: "<password>",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.basicAuth.postWithBasicAuth(
                request: .object([
                    "key": .string("value")
                ]),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected BasicAuthError.httpError with status code 401")
        } catch BasicAuthError.httpError(let httpError) {
            #expect(httpError.statusCode == 401)
            let body = try #require(httpError.body)
            #expect(body.code == 401)
            #expect(body.type == nil)
            #expect(body.message == "message")
        }
    }

    @Test func postWithBasicAuthThrowsBadRequest() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 400,
            body: Foundation.Data()
        )
        let client = BasicAuthClient(
            baseURL: "https://api.fern.com",
            username: "<username>",
            password: "<password>",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.basicAuth.postWithBasicAuth(
                request: .object([
                    "key": .string("value")
                ]),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected BasicAuthError.httpError with status code 400")
        } catch BasicAuthError.httpError(let httpError) {
            #expect(httpError.statusCode == 400)
            #expect(httpError.body == nil)
        }
    }
}