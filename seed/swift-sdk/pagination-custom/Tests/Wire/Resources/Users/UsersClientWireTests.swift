import Foundation
import Testing
import Pagination

@Suite("UsersClient Wire Tests") struct UsersClientWireTests {
    @Test func listWithCustomPager1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "limit": 1,
                  "count": 1,
                  "has_more": true,
                  "links": [
                    {
                      "rel": "rel",
                      "method": "method",
                      "href": "href"
                    },
                    {
                      "rel": "rel",
                      "method": "method",
                      "href": "href"
                    }
                  ],
                  "data": [
                    "data",
                    "data"
                  ]
                }
                """.utf8
            )
        )
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = UsersListResponse(
            limit: Optional(1),
            count: Optional(1),
            hasMore: Optional(true),
            links: [
                Link(
                    rel: "rel",
                    method: "method",
                    href: "href"
                ),
                Link(
                    rel: "rel",
                    method: "method",
                    href: "href"
                )
            ],
            data: [
                "data",
                "data"
            ]
        )
        let response = try await client.users.listWithCustomPager(
            limit: 1,
            startingAfter: "starting_after",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}