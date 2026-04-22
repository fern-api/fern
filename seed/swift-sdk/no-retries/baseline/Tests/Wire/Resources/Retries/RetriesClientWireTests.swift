import Foundation
import Testing
import NoRetries

@Suite("RetriesClient Wire Tests") struct RetriesClientWireTests {
    @Test func getUsers1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name"
                  },
                  {
                    "id": "id",
                    "name": "name"
                  }
                ]
                """.utf8
            )
        )
        let client = NoRetriesClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                id: "id",
                name: "name"
            ),
            User(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.retries.getUsers(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}