import Foundation
import Testing
import Streaming

@Suite("DummyClient Wire Tests") struct DummyClientWireTests {
    @Test func generate1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name"
                }
                """.utf8
            )
        )
        let client = StreamingClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = StreamResponse(
            id: "id",
            name: Optional("name")
        )
        let response = try await client.dummy.generate(request: .init(numEvents: 5))
        try #require(response == expectedResponse)
    }

    @Test func generate2() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name"
                }
                """.utf8
            )
        )
        let client = StreamingClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = StreamResponse(
            id: "id",
            name: Optional("name")
        )
        let response = try await client.dummy.generate(request: .init(numEvents: 1))
        try #require(response == expectedResponse)
    }
}