import Foundation
import Testing
import Pagination

@Suite("ComplexClient Wire Tests") struct ComplexClientWireTests {
    @Test func search1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "conversations": [
                    {
                      "foo": "foo"
                    },
                    {
                      "foo": "foo"
                    }
                  ],
                  "pages": {
                    "next": {
                      "per_page": 1,
                      "starting_after": "starting_after"
                    },
                    "page": 1,
                    "per_page": 1,
                    "total_pages": 1,
                    "type": "pages"
                  },
                  "total_count": 1,
                  "type": "conversation.list"
                }
                """.utf8
            )
        )
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = PaginatedConversationResponse(
            conversations: [
                Conversation(
                    foo: "foo"
                ),
                Conversation(
                    foo: "foo"
                )
            ],
            pages: Optional(CursorPages(
                next: Optional(StartingAfterPaging(
                    perPage: 1,
                    startingAfter: Optional("starting_after")
                )),
                page: Optional(1),
                perPage: Optional(1),
                totalPages: Optional(1),
                type: .pages
            )),
            totalCount: 1,
            type: .conversationList
        )
        let response = try await client.complex.search(
            index: "index",
            request: SearchRequest(
                pagination: StartingAfterPaging(
                    perPage: 1,
                    startingAfter: "starting_after"
                ),
                query: SearchRequestQuery.singleFilterSearchRequest(
                    SingleFilterSearchRequest(
                        field: "field",
                        operator: .equals,
                        value: "value"
                    )
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}