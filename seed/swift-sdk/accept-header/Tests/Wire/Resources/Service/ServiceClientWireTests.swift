import Foundation
import Testing
import Accept

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func endpoint1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = AcceptClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        try await client.service.endpoint(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
    }

    @Test func endpointThrowsNotFoundError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 404,
            body: Foundation.Data(
                #"""
                {
                  "key": "value"
                }
                """#.utf8
            )
        )
        let client = AcceptClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        do {
            try await client.service.endpoint(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
            Issue.record("Expected AcceptError.httpError with status code 404")
        } catch AcceptError.httpError(let httpError) {
            #expect(httpError.statusCode == 404)
            let body = try #require(httpError.body)
            #expect(body.code == 404)
            #expect(body.type == nil)
            #expect(body.message == #"""
            {
              "key": "value"
            }
            """#)
        }
    }
}