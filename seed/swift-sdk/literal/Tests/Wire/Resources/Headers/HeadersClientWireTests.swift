import Foundation
import Testing
import Api

@Suite("HeadersClient Wire Tests") struct HeadersClientWireTests {
    @Test func send1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "message": "message",
                  "status": 1,
                  "success": true
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = SendResponse(
            message: "message",
            status: 1,
            success: true
        )
        let response = try await client.headers.send(
            request: .init(query: "query"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func send2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "message": "message",
                  "status": 1,
                  "success": true
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = SendResponse(
            message: "message",
            status: 1,
            success: true
        )
        let response = try await client.headers.send(
            request: .init(query: "query"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}