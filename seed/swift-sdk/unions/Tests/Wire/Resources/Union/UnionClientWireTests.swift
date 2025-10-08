import Foundation
import Testing
import Unions

@Suite("UnionClient Wire Tests") struct UnionClientWireTests {
    @Test func get1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "type": "circle",
                  "radius": 1.1,
                  "id": "id"
                }
                """.utf8
            )
        )
        let client = UnionsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = .circle(
            .init(
                radius: 1.1
            )
        )
        let response = try await client.union.get(id: "id")
        try #require(response == expectedResponse)
    }

    @Test func update1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = UnionsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.union.update(request: Shape.circle(
            .init(
                id: "id",
                radius: 1.1
            )
        ))
        try #require(response == expectedResponse)
    }
}