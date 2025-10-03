import Foundation
import Testing
import Literal

@Suite("HeadersClient Wire Tests") struct HeadersClientWireTests {
    @Test func send1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "message": "The weather is sunny",
                  "status": 200,
                  "success": true
                }
                """.utf8
            )
        )
        let client = LiteralClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = SendResponse(
            message: "The weather is sunny",
            status: 200
        )
        let response = try await client.headers.send(request: .init(query: "What is the weather today"))
        try #require(response == expectedResponse)
    }

    @Test func send2() async throws -> Void {
        let stub = WireStub()
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
        let client = LiteralClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = SendResponse(
            message: "message",
            status: 1
        )
        let response = try await client.headers.send(request: .init(query: "query"))
        try #require(response == expectedResponse)
    }
}