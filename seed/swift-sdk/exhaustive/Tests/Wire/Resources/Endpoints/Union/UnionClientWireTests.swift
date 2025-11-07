import Foundation
import Testing
import Exhaustive

@Suite("UnionClient Wire Tests") struct UnionClientWireTests {
    @Test func getAndReturnUnion1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "animal": "dog",
                  "name": "name",
                  "likesToWoof": true
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = .dog(
            .init(
                name: "name",
                likesToWoof: true
            )
        )
        let response = try await client.endpoints.union.getAndReturnUnion(
            request: Animal.dog(
                .init(
                    name: "name",
                    likesToWoof: true
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}