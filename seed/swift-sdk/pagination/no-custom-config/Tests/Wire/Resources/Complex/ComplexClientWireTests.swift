import Foundation
import Testing
import Api

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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = PaginatedConversationResponse(
            conversations: [
                Conversation(
                    foo: "foo"
                )
            ],
            pages: Optional(CursorPages(
                next: Optional(StartingAfterPaging(
                    perPage: 1,
                    startingAfter: Optional(Nullable<String>.value("starting_after"))
                )),
                page: Optional(Nullable<Int>.value(1)),
                perPage: Optional(Nullable<Int>.value(1)),
                totalPages: Optional(Nullable<Int>.value(1)),
                type: .pages
            )),
            totalCount: 1,
            type: .conversationList
        )
        let response = try await client.complex.search(
            index: "index",
            request: .init(query: SearchRequestQuery.singleFilterSearchRequest(
                SingleFilterSearchRequest(

                )
            )),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func search2() async throws -> Void {
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
        let client = ApiClient(
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
                    startingAfter: Optional(Nullable<String>.value("starting_after"))
                )),
                page: Optional(Nullable<Int>.value(1)),
                perPage: Optional(Nullable<Int>.value(1)),
                totalPages: Optional(Nullable<Int>.value(1)),
                type: .pages
            )),
            totalCount: 1,
            type: .conversationList
        )
        let response = try await client.complex.search(
            index: "index",
            request: .init(
                pagination: StartingAfterPaging(
                    perPage: 1,
                    startingAfter: .value("starting_after")
                ),
                query: SearchRequestQuery.singleFilterSearchRequest(
                    SingleFilterSearchRequest(
                        field: .value("field"),
                        operator: .equalTo,
                        value: .value("value")
                    )
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}