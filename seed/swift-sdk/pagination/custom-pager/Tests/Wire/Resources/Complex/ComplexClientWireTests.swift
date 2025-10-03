import Foundation
import Testing
import Pagination

@Suite("ComplexClient Wire Tests") struct ComplexClientWireTests {
    @Test func search1() async throws -> Void {
        let stub = WireStub()
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
            pages: CursorPages(
                next: StartingAfterPaging(
                    perPage: 1,
                    startingAfter: "starting_after"
                ),
                page: 1,
                perPage: 1,
                totalPages: 1,
                type: .pages
            ),
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
            )
        )
        try #require(response == expectedResponse)
    }
}