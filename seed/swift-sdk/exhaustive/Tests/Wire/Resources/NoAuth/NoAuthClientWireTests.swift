import Foundation
import Testing
import Exhaustive

@Suite("NoAuthClient Wire Tests") struct NoAuthClientWireTests {
    @Test func postWithNoAuth1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                true
                """#.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.noAuth.postWithNoAuth(
            request: .object([
                "key": .string("value")
            ]),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func postWithNoAuthThrowsBadRequestBody() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 400,
            body: Foundation.Data(
                #"""
                {
                  "message": "message"
                }
                """#.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.noAuth.postWithNoAuth(
                request: .object([
                    "key": .string("value")
                ]),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ExhaustiveError.httpError with status code 400")
        } catch ExhaustiveError.httpError(let httpError) {
            #expect(httpError.statusCode == 400)
            let body = try #require(httpError.body)
            #expect(body.code == 400)
            #expect(body.type == nil)
            #expect(body.message == "message")
        }
    }
}