import Foundation
import Testing
import Pagination

@Suite("UsersClient Wire Tests") struct UsersClientWireTests {
    @Test func listWithCursorPagination1() async throws -> Void {
        let stub = HTTPStub()
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
                  "data": [
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
                """.utf8
            )
        )
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersPaginationResponseType(
            hasNextPage: Optional(true),
            page: Optional(PageType(
                page: 1,
                next: Optional(NextPageType(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: [
                UserType(
                    name: "name",
                    id: 1
                ),
                UserType(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listWithCursorPagination(
            page: 1,
            perPage: 1,
            order: .asc,
            startingAfter: "starting_after",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listWithMixedTypeCursorPagination1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "next": "next",
                  "data": [
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
                """.utf8
            )
        )
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersMixedTypePaginationResponseType(
            next: "next",
            data: [
                UserType(
                    name: "name",
                    id: 1
                ),
                UserType(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listWithMixedTypeCursorPagination(
            cursor: "cursor",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listWithBodyCursorPagination1() async throws -> Void {
        let stub = HTTPStub()
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
                  "data": [
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
                """.utf8
            )
        )
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersPaginationResponseType(
            hasNextPage: Optional(true),
            page: Optional(PageType(
                page: 1,
                next: Optional(NextPageType(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: [
                UserType(
                    name: "name",
                    id: 1
                ),
                UserType(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listWithBodyCursorPagination(
            request: .init(pagination: WithCursorType(
                cursor: "cursor"
            )),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listWithOffsetPagination1() async throws -> Void {
        let stub = HTTPStub()
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
                  "data": [
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
                """.utf8
            )
        )
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersPaginationResponseType(
            hasNextPage: Optional(true),
            page: Optional(PageType(
                page: 1,
                next: Optional(NextPageType(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: [
                UserType(
                    name: "name",
                    id: 1
                ),
                UserType(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listWithOffsetPagination(
            page: 1,
            perPage: 1,
            order: .asc,
            startingAfter: "starting_after",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listWithDoubleOffsetPagination1() async throws -> Void {
        let stub = HTTPStub()
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
                  "data": [
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
                """.utf8
            )
        )
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersPaginationResponseType(
            hasNextPage: Optional(true),
            page: Optional(PageType(
                page: 1,
                next: Optional(NextPageType(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: [
                UserType(
                    name: "name",
                    id: 1
                ),
                UserType(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listWithDoubleOffsetPagination(
            page: 1.1,
            perPage: 1.1,
            order: .asc,
            startingAfter: "starting_after",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listWithBodyOffsetPagination1() async throws -> Void {
        let stub = HTTPStub()
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
                  "data": [
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
                """.utf8
            )
        )
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersPaginationResponseType(
            hasNextPage: Optional(true),
            page: Optional(PageType(
                page: 1,
                next: Optional(NextPageType(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: [
                UserType(
                    name: "name",
                    id: 1
                ),
                UserType(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listWithBodyOffsetPagination(
            request: .init(pagination: WithPageType(
                page: 1
            )),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listWithOffsetStepPagination1() async throws -> Void {
        let stub = HTTPStub()
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
                  "data": [
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
                """.utf8
            )
        )
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersPaginationResponseType(
            hasNextPage: Optional(true),
            page: Optional(PageType(
                page: 1,
                next: Optional(NextPageType(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: [
                UserType(
                    name: "name",
                    id: 1
                ),
                UserType(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listWithOffsetStepPagination(
            page: 1,
            limit: 1,
            order: .asc,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listWithOffsetPaginationHasNextPage1() async throws -> Void {
        let stub = HTTPStub()
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
                  "data": [
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
                """.utf8
            )
        )
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersPaginationResponseType(
            hasNextPage: Optional(true),
            page: Optional(PageType(
                page: 1,
                next: Optional(NextPageType(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: [
                UserType(
                    name: "name",
                    id: 1
                ),
                UserType(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listWithOffsetPaginationHasNextPage(
            page: 1,
            limit: 1,
            order: .asc,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listWithExtendedResults1() async throws -> Void {
        let stub = HTTPStub()
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
        let expectedResponse = ListUsersExtendedResponseType(
            totalCount: 1,
            data: UserListContainerType(
                users: [
                    UserType(
                        name: "name",
                        id: 1
                    ),
                    UserType(
                        name: "name",
                        id: 1
                    )
                ]
            ),
            next: Optional(UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!)
        )
        let response = try await client.users.listWithExtendedResults(
            cursor: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listWithExtendedResultsAndOptionalData1() async throws -> Void {
        let stub = HTTPStub()
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
        let expectedResponse = ListUsersExtendedOptionalListResponseType(
            totalCount: 1,
            data: UserOptionalListContainerType(
                users: Optional([
                    UserType(
                        name: "name",
                        id: 1
                    ),
                    UserType(
                        name: "name",
                        id: 1
                    )
                ])
            ),
            next: Optional(UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!)
        )
        let response = try await client.users.listWithExtendedResultsAndOptionalData(
            cursor: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listUsernames1() async throws -> Void {
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
        let response = try await client.users.listUsernames(
            startingAfter: "starting_after",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listWithGlobalConfig1() async throws -> Void {
        let stub = HTTPStub()
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
        let expectedResponse = UsernameContainerType(
            results: [
                "results",
                "results"
            ]
        )
        let response = try await client.users.listWithGlobalConfig(
            offset: 1,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}