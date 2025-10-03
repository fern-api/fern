import Foundation
import Testing
import Pagination

@Suite("UsersClient Wire Tests") struct UsersClientWireTests {
    @Test func listUsernamesCustom1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "cursor": {
                    "after": "after",
                    "data": [
                      "data",
                      "data"
                    ]
                  }
                }
                """.utf8
            )
        )
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = UsernameCursor(
            cursor: UsernamePage(
                after: "after",
                data: [
                    "data",
                    "data"
                ]
            )
        )
        let response = try await client.users.listUsernamesCustom(startingAfter: "starting_after")
        try #require(response == expectedResponse)
    }
}