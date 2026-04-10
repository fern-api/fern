import Foundation
import Testing
import Api

@Suite("UserEventsClient Wire Tests") struct UserEventsClientWireTests {
    @Test func userEventsListEvents1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name"
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            UserEvent(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.userEvents.userEventsListEvents(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func userEventsListEvents2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            UserEvent(
                id: "id",
                name: "name"
            ),
            UserEvent(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.userEvents.userEventsListEvents(
            limit: .value(1),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}