import Foundation
import Testing
import MixedFileDirectory

@Suite("EventsClient Wire Tests") struct EventsClientWireTests {
    @Test func listEvents1() async throws -> Void {
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
        let client = MixedFileDirectoryClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            Event(
                id: "id",
                name: "name"
            ),
            Event(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.user.events.listEvents(
            limit: 1,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}