import Foundation
import Testing
import Pagination

@Suite("InlineUsersInlineUsersClient Wire Tests") struct InlineUsersInlineUsersClientWireTests {
    @Test func listWithCursorPagination1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "hasNextPage": true,
                  "page": {
                    "page": 1,
                    "next": {
                      "page": 1,
                      "starting_after": "starting_after"
                    },
                    "per_page": 1,
                    "total_page": 1
                  },
                  "total_count": 1,
                  "data": {
                    "users": [
                      {
                        "name": "name",
                        "id": 1
                      },
                      {
                        "name": "name",
                        "id": 1
                      }
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
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(true),
            page: Optional(Page(
                page: 1,
                next: Optional(NextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: Users(
                users: [
                    User(
                        name: "name",
                        id: 1
                    ),
                    User(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsers.inlineUsers.listWithCursorPagination(
            page: 1,
            perPage: 1,
            order: .asc,
            startingAfter: "starting_after"
        )
        try #require(response == expectedResponse)
    }

    @Test func listWithMixedTypeCursorPagination1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "next": "next",
                  "data": {
                    "users": [
                      {
                        "name": "name",
                        "id": 1
                      },
                      {
                        "name": "name",
                        "id": 1
                      }
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
        let expectedResponse = ListUsersMixedTypePaginationResponse(
            next: "next",
            data: Users(
                users: [
                    User(
                        name: "name",
                        id: 1
                    ),
                    User(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsers.inlineUsers.listWithMixedTypeCursorPagination(cursor: "cursor")
        try #require(response == expectedResponse)
    }

    @Test func listWithBodyCursorPagination1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "hasNextPage": true,
                  "page": {
                    "page": 1,
                    "next": {
                      "page": 1,
                      "starting_after": "starting_after"
                    },
                    "per_page": 1,
                    "total_page": 1
                  },
                  "total_count": 1,
                  "data": {
                    "users": [
                      {
                        "name": "name",
                        "id": 1
                      },
                      {
                        "name": "name",
                        "id": 1
                      }
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
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(true),
            page: Optional(Page(
                page: 1,
                next: Optional(NextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: Users(
                users: [
                    User(
                        name: "name",
                        id: 1
                    ),
                    User(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsers.inlineUsers.listWithBodyCursorPagination(request: .init(pagination: WithCursor(
            cursor: "cursor"
        )))
        try #require(response == expectedResponse)
    }

    @Test func listWithOffsetPagination1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "hasNextPage": true,
                  "page": {
                    "page": 1,
                    "next": {
                      "page": 1,
                      "starting_after": "starting_after"
                    },
                    "per_page": 1,
                    "total_page": 1
                  },
                  "total_count": 1,
                  "data": {
                    "users": [
                      {
                        "name": "name",
                        "id": 1
                      },
                      {
                        "name": "name",
                        "id": 1
                      }
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
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(true),
            page: Optional(Page(
                page: 1,
                next: Optional(NextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: Users(
                users: [
                    User(
                        name: "name",
                        id: 1
                    ),
                    User(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsers.inlineUsers.listWithOffsetPagination(
            page: 1,
            perPage: 1,
            order: .asc,
            startingAfter: "starting_after"
        )
        try #require(response == expectedResponse)
    }

    @Test func listWithDoubleOffsetPagination1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "hasNextPage": true,
                  "page": {
                    "page": 1,
                    "next": {
                      "page": 1,
                      "starting_after": "starting_after"
                    },
                    "per_page": 1,
                    "total_page": 1
                  },
                  "total_count": 1,
                  "data": {
                    "users": [
                      {
                        "name": "name",
                        "id": 1
                      },
                      {
                        "name": "name",
                        "id": 1
                      }
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
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(true),
            page: Optional(Page(
                page: 1,
                next: Optional(NextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: Users(
                users: [
                    User(
                        name: "name",
                        id: 1
                    ),
                    User(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsers.inlineUsers.listWithDoubleOffsetPagination(
            page: 1.1,
            perPage: 1.1,
            order: .asc,
            startingAfter: "starting_after"
        )
        try #require(response == expectedResponse)
    }

    @Test func listWithBodyOffsetPagination1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "hasNextPage": true,
                  "page": {
                    "page": 1,
                    "next": {
                      "page": 1,
                      "starting_after": "starting_after"
                    },
                    "per_page": 1,
                    "total_page": 1
                  },
                  "total_count": 1,
                  "data": {
                    "users": [
                      {
                        "name": "name",
                        "id": 1
                      },
                      {
                        "name": "name",
                        "id": 1
                      }
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
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(true),
            page: Optional(Page(
                page: 1,
                next: Optional(NextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: Users(
                users: [
                    User(
                        name: "name",
                        id: 1
                    ),
                    User(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsers.inlineUsers.listWithBodyOffsetPagination(request: .init(pagination: WithPage(
            page: 1
        )))
        try #require(response == expectedResponse)
    }

    @Test func listWithOffsetStepPagination1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "hasNextPage": true,
                  "page": {
                    "page": 1,
                    "next": {
                      "page": 1,
                      "starting_after": "starting_after"
                    },
                    "per_page": 1,
                    "total_page": 1
                  },
                  "total_count": 1,
                  "data": {
                    "users": [
                      {
                        "name": "name",
                        "id": 1
                      },
                      {
                        "name": "name",
                        "id": 1
                      }
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
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(true),
            page: Optional(Page(
                page: 1,
                next: Optional(NextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: Users(
                users: [
                    User(
                        name: "name",
                        id: 1
                    ),
                    User(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsers.inlineUsers.listWithOffsetStepPagination(
            page: 1,
            limit: 1,
            order: .asc
        )
        try #require(response == expectedResponse)
    }

    @Test func listWithOffsetPaginationHasNextPage1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "hasNextPage": true,
                  "page": {
                    "page": 1,
                    "next": {
                      "page": 1,
                      "starting_after": "starting_after"
                    },
                    "per_page": 1,
                    "total_page": 1
                  },
                  "total_count": 1,
                  "data": {
                    "users": [
                      {
                        "name": "name",
                        "id": 1
                      },
                      {
                        "name": "name",
                        "id": 1
                      }
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
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(true),
            page: Optional(Page(
                page: 1,
                next: Optional(NextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: Users(
                users: [
                    User(
                        name: "name",
                        id: 1
                    ),
                    User(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsers.inlineUsers.listWithOffsetPaginationHasNextPage(
            page: 1,
            limit: 1,
            order: .asc
        )
        try #require(response == expectedResponse)
    }

    @Test func listWithExtendedResults1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "total_count": 1,
                  "data": {
                    "users": [
                      {
                        "name": "name",
                        "id": 1
                      },
                      {
                        "name": "name",
                        "id": 1
                      }
                    ]
                  },
                  "next": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
                }
                """.utf8
            )
        )
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersExtendedResponse(
            totalCount: 1,
            data: UserListContainer(
                users: [
                    User(
                        name: "name",
                        id: 1
                    ),
                    User(
                        name: "name",
                        id: 1
                    )
                ]
            ),
            next: Optional(UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!)
        )
        let response = try await client.inlineUsers.inlineUsers.listWithExtendedResults(cursor: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!)
        try #require(response == expectedResponse)
    }

    @Test func listWithExtendedResultsAndOptionalData1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "total_count": 1,
                  "data": {
                    "users": [
                      {
                        "name": "name",
                        "id": 1
                      },
                      {
                        "name": "name",
                        "id": 1
                      }
                    ]
                  },
                  "next": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
                }
                """.utf8
            )
        )
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersExtendedOptionalListResponse(
            totalCount: 1,
            data: UserOptionalListContainer(
                users: Optional([
                    User(
                        name: "name",
                        id: 1
                    ),
                    User(
                        name: "name",
                        id: 1
                    )
                ])
            ),
            next: Optional(UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!)
        )
        let response = try await client.inlineUsers.inlineUsers.listWithExtendedResultsAndOptionalData(cursor: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!)
        try #require(response == expectedResponse)
    }

    @Test func listUsernames1() async throws -> Void {
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
                after: Optional("after"),
                data: [
                    "data",
                    "data"
                ]
            )
        )
        let response = try await client.inlineUsers.inlineUsers.listUsernames(startingAfter: "starting_after")
        try #require(response == expectedResponse)
    }

    @Test func listWithGlobalConfig1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "results": [
                    "results",
                    "results"
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
        let expectedResponse = UsernameContainer(
            results: [
                "results",
                "results"
            ]
        )
        let response = try await client.inlineUsers.inlineUsers.listWithGlobalConfig(offset: 1)
        try #require(response == expectedResponse)
    }
}