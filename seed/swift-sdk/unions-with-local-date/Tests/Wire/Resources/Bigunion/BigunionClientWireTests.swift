import Foundation
import Testing
import Unions

@Suite("BigunionClient Wire Tests") struct BigunionClientWireTests {
    @Test func get1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "type": "normalSweet",
                  "value": "value",
                  "id": "id",
                  "created-at": "2024-01-15T09:30:00Z",
                  "archived-at": "2024-01-15T09:30:00Z"
                }
                """.utf8
            )
        )
        let client = UnionsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = .normalSweet(
            .init(
                value: "value"
            )
        )
        let response = try await client.bigunion.get(
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
        let response = try await client.bigunion.update(
            request: BigUnion.normalSweet(
                .init(
                    id: "id",
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    archivedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    value: "value"
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updateMany1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "string": true
                }
                """.utf8
            )
        )
        let client = UnionsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "string": true
        ]
        let response = try await client.bigunion.updateMany(
            request: [
                BigUnion.normalSweet(
                    .init(
                        id: "id",
                        createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        archivedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        value: "value"
                    )
                ),
                BigUnion.normalSweet(
                    .init(
                        id: "id",
                        createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        archivedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                        value: "value"
                    )
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}