import Foundation
import Testing
import Api

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func endpoint1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.folder.service.endpoint(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
    }

    @Test func unknownRequest1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.folder.service.unknownRequest(
            request: .object([
                "key": .string("value")
            ]),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func unknownRequestThrowsNotFoundError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 404,
            body: Foundation.Data(
                #"""
                "string"
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            try await client.folder.service.unknownRequest(
                request: .object([
                    "key": .string("value")
                ]),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ApiError.httpError with status code 404")
        } catch ApiError.httpError(let httpError) {
            #expect(httpError.statusCode == 404)
            let body = try #require(httpError.body)
            #expect(body.code == 404)
            #expect(body.type == nil)
            #expect(body.message == "\"string\"")
        }
    }
}