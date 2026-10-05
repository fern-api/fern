import Foundation
import Testing
import Literal

@Suite("HeadersClient Wire Tests") struct HeadersClientWireTests {
    @Test func send1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "message": "The weather is sunny",
                  "status": 200,
                  "success": true
                }
                """#.utf8
            )
        )
        let client = LiteralClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = SendResponse(
            message: "The weather is sunny",
            status: 200,
            success: true
        )
        let response = try await client.headers.send(
            request: .init(query: "What is the weather today"),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func sendLiteralsOnly1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "message": "The weather is sunny",
                  "status": 200,
                  "success": true
                }
                """#.utf8
            )
        )
        let client = LiteralClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = SendResponse(
            message: "The weather is sunny",
            status: 200,
            success: true
        )
        let response = try await client.headers.sendLiteralsOnly(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}