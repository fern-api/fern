import Foundation
import Testing
import Pagination

@Suite("UsersClient Wire Tests") struct UsersClientWireTests {
    @Test func listUsernamesCustom1() async throws -> Void {
        let stub = HTTPStub()
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
                after: Optional("after"),
                data: [
                    "data",
                    "data"
                ]
            )
        )
        let response = try await client.users.listUsernamesCustom(
            startingAfter: "starting_after",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}