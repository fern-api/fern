import Foundation
import Testing
import Unions

@Suite("UnionClient Wire Tests") struct UnionClientWireTests {
    @Test func get1() async throws -> Void {
        let stub = HTTPStub()
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
        let expectedResponse = Shape.circle(
            .init(
                radius: 1.1,
                additionalProperties: [
                    "type": JSONValue.string("circle"), 
                    "id": JSONValue.string("id")
                ]
            )
        )
        let response = try await client.union.get(
            id: "id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func update1() async throws -> Void {
        let stub = HTTPStub()
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
        let response = try await client.union.update(
            request: Shape.circle(
                Circle(
                    radius: 1.1
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}