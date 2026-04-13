import Foundation
import Testing
import Api

@Suite("UsersClient Wire Tests") struct UsersClientWireTests {
    @Test func listwithcursorpagination1() async throws -> Void {
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
                    }
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
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: [
                User(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listwithcursorpagination(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listwithcursorpagination2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: [
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
        let response = try await client.users.listwithcursorpagination(
            page: .value(1),
            perPage: .value(1),
            order: .asc,
            startingAfter: .value("starting_after"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listwithmixedtypecursorpagination1() async throws -> Void {
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
                    }
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
        let expectedResponse = ListUsersMixedTypePaginationResponse(
            next: "next",
            data: [
                User(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listwithmixedtypecursorpagination(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listwithmixedtypecursorpagination2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersMixedTypePaginationResponse(
            next: "next",
            data: [
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
        let response = try await client.users.listwithmixedtypecursorpagination(
            cursor: .value("cursor"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listwithbodycursorpagination1() async throws -> Void {
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
                    }
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
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: [
                User(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listwithbodycursorpagination(
            request: .init(),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listwithbodycursorpagination2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: [
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
        let response = try await client.users.listwithbodycursorpagination(
            request: .init(pagination: WithCursor(
                cursor: .value("cursor")
            )),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listwithtoplevelbodycursorpagination1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "next_cursor": "next_cursor",
                  "data": [
                    {
                      "name": "name",
                      "id": 1
                    }
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
        let expectedResponse = ListUsersTopLevelCursorPaginationResponse(
            nextCursor: Optional(Nullable<String>.value("next_cursor")),
            data: [
                User(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listwithtoplevelbodycursorpagination(
            request: .init(),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listwithtoplevelbodycursorpagination2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "next_cursor": "next_cursor",
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersTopLevelCursorPaginationResponse(
            nextCursor: Optional(Nullable<String>.value("next_cursor")),
            data: [
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
        let response = try await client.users.listwithtoplevelbodycursorpagination(
            request: .init(
                cursor: .value("cursor"),
                filter: .value("filter")
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listwithoffsetpagination1() async throws -> Void {
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
                    }
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
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: [
                User(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listwithoffsetpagination(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listwithoffsetpagination2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: [
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
        let response = try await client.users.listwithoffsetpagination(
            page: .value(1),
            perPage: .value(1),
            order: .asc,
            startingAfter: .value("starting_after"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listwithdoubleoffsetpagination1() async throws -> Void {
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
                    }
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
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: [
                User(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listwithdoubleoffsetpagination(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listwithdoubleoffsetpagination2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: [
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
        let response = try await client.users.listwithdoubleoffsetpagination(
            page: .value(1.1),
            perPage: .value(1.1),
            order: .asc,
            startingAfter: .value("starting_after"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listwithbodyoffsetpagination1() async throws -> Void {
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
                    }
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
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: [
                User(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listwithbodyoffsetpagination(
            request: .init(),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listwithbodyoffsetpagination2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: [
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
        let response = try await client.users.listwithbodyoffsetpagination(
            request: .init(pagination: WithPage(
                page: .value(1)
            )),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listwithoffsetsteppagination1() async throws -> Void {
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
                    }
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
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: [
                User(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listwithoffsetsteppagination(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listwithoffsetsteppagination2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: [
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
        let response = try await client.users.listwithoffsetsteppagination(
            page: .value(1),
            limit: .value(1),
            order: .asc,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listwithoffsetpaginationhasnextpage1() async throws -> Void {
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
                    }
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
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: [
                User(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listwithoffsetpaginationhasnextpage(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listwithoffsetpaginationhasnextpage2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: [
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
        let response = try await client.users.listwithoffsetpaginationhasnextpage(
            page: .value(1),
            limit: .value(1),
            order: .asc,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listwithextendedresults1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": {
                    "users": [
                      {
                        "name": "name",
                        "id": 1
                      }
                    ]
                  },
                  "next": "next",
                  "total_count": 1
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersExtendedResponse(
            data: UserListContainer(
                users: [
                    User(
                        name: "name",
                        id: 1
                    )
                ]
            ),
            next: Optional(Nullable<String>.value("next")),
            totalCount: 1
        )
        let response = try await client.users.listwithextendedresults(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listwithextendedresults2() async throws -> Void {
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
                  "next": "next"
                }
                """.utf8
            )
        )
        let client = ApiClient(
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
            next: Optional(Nullable<String>.value("next"))
        )
        let response = try await client.users.listwithextendedresults(
            cursor: .value("cursor"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listwithextendedresultsandoptionaldata1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": {
                    "users": [
                      {
                        "name": "name",
                        "id": 1
                      }
                    ]
                  },
                  "next": "next",
                  "total_count": 1
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersExtendedOptionalListResponse(
            data: UserOptionalListContainer(
                users: Optional(Nullable<[User]>.value([
                    User(
                        name: "name",
                        id: 1
                    )
                ]))
            ),
            next: Optional(Nullable<String>.value("next")),
            totalCount: 1
        )
        let response = try await client.users.listwithextendedresultsandoptionaldata(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listwithextendedresultsandoptionaldata2() async throws -> Void {
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
                  "next": "next"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersExtendedOptionalListResponse(
            totalCount: 1,
            data: UserOptionalListContainer(
                users: Optional(Nullable<[User]>.value([
                    User(
                        name: "name",
                        id: 1
                    ),
                    User(
                        name: "name",
                        id: 1
                    )
                ]))
            ),
            next: Optional(Nullable<String>.value("next"))
        )
        let response = try await client.users.listwithextendedresultsandoptionaldata(
            cursor: .value("cursor"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listusernames1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "cursor": {
                    "after": "after",
                    "data": [
                      "data"
                    ]
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = UsernameCursor(
            cursor: UsernamePage(
                after: Optional(Nullable<String>.value("after")),
                data: [
                    "data"
                ]
            )
        )
        let response = try await client.users.listusernames(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listusernames2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = UsernameCursor(
            cursor: UsernamePage(
                after: Optional(Nullable<String>.value("after")),
                data: [
                    "data",
                    "data"
                ]
            )
        )
        let response = try await client.users.listusernames(
            startingAfter: .value("starting_after"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listusernameswithoptionalresponse1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "cursor": {
                    "after": "after",
                    "data": [
                      "data"
                    ]
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = UsernameCursor(
            cursor: UsernamePage(
                after: Optional(Nullable<String>.value("after")),
                data: [
                    "data"
                ]
            )
        )
        let response = try await client.users.listusernameswithoptionalresponse(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listusernameswithoptionalresponse2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = UsernameCursor(
            cursor: UsernamePage(
                after: Optional(Nullable<String>.value("after")),
                data: [
                    "data",
                    "data"
                ]
            )
        )
        let response = try await client.users.listusernameswithoptionalresponse(
            startingAfter: .value("starting_after"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listwithglobalconfig1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "results": [
                    "results"
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
        let expectedResponse = UsernameContainer(
            results: [
                "results"
            ]
        )
        let response = try await client.users.listwithglobalconfig(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listwithglobalconfig2() async throws -> Void {
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
        let client = ApiClient(
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
        let response = try await client.users.listwithglobalconfig(
            offset: .value(1),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listwithoptionaldata1() async throws -> Void {
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
                    }
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
        let expectedResponse = ListUsersOptionalDataPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: Optional(Nullable<[User]>.value([
                User(
                    name: "name",
                    id: 1
                )
            ]))
        )
        let response = try await client.users.listwithoptionaldata(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listwithoptionaldata2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersOptionalDataPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: Optional(Nullable<[User]>.value([
                User(
                    name: "name",
                    id: 1
                ),
                User(
                    name: "name",
                    id: 1
                )
            ]))
        )
        let response = try await client.users.listwithoptionaldata(
            page: .value(1),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listwithaliaseddata1() async throws -> Void {
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
                    }
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
        let expectedResponse = ListUsersAliasedDataPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: [
                User(
                    name: "name",
                    id: 1
                )
            ]
        )
        let response = try await client.users.listwithaliaseddata(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listwithaliaseddata2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersAliasedDataPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
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
            data: [
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
        let response = try await client.users.listwithaliaseddata(
            page: .value(1),
            perPage: .value(1),
            startingAfter: .value("starting_after"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}