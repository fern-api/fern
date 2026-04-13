import Foundation
import Testing
import Api

@Suite("UsersClient Wire Tests") struct UsersClientWireTests {
    @Test func listwithcustompager1() async throws -> Void {
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
                    }
                  ],
                  "data": [
                    "data"
                  ]
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = UsersListResponse(
            limit: Optional(Nullable<Int>.value(1)),
            count: Optional(Nullable<Int>.value(1)),
            hasMore: Optional(Nullable<Bool>.value(true)),
            links: [
                Link(
                    rel: "rel",
                    method: "method",
                    href: "href"
                )
            ],
            data: [
                "data"
            ]
        )
        let response = try await client.users.listwithcustompager(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listwithcustompager2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = UsersListResponse(
            limit: Optional(Nullable<Int>.value(1)),
            count: Optional(Nullable<Int>.value(1)),
            hasMore: Optional(Nullable<Bool>.value(true)),
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
        let response = try await client.users.listwithcustompager(
            limit: .value(1),
            startingAfter: .value("starting_after"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}