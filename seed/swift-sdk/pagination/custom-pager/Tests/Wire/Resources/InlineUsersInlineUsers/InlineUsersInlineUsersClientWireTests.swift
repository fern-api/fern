import Foundation
import Testing
import Api

@Suite("InlineUsersInlineUsersClient Wire Tests") struct InlineUsersInlineUsersClientWireTests {
    @Test func inlineUsersInlineUsersListWithCursorPagination1() async throws -> Void {
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
                  "data": {
                    "users": [
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = InlineUsersListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
            page: Optional(InlineUsersPage(
                page: 1,
                next: Optional(InlineUsersNextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: InlineUsersUsers(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithCursorPagination(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithCursorPagination2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = InlineUsersListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
            page: Optional(InlineUsersPage(
                page: 1,
                next: Optional(InlineUsersNextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: InlineUsersUsers(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    ),
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithCursorPagination(
            page: .value(1),
            perPage: .value(1),
            order: .asc,
            startingAfter: .value("starting_after"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithMixedTypeCursorPagination1() async throws -> Void {
        let stub = HTTPStub()
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
                      }
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
        let expectedResponse = InlineUsersListUsersMixedTypePaginationResponse(
            next: "next",
            data: InlineUsersUsers(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithMixedTypeCursorPagination(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithMixedTypeCursorPagination2() async throws -> Void {
        let stub = HTTPStub()
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = InlineUsersListUsersMixedTypePaginationResponse(
            next: "next",
            data: InlineUsersUsers(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    ),
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithMixedTypeCursorPagination(
            cursor: .value("cursor"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithBodyCursorPagination1() async throws -> Void {
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
                  "data": {
                    "users": [
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = InlineUsersListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
            page: Optional(InlineUsersPage(
                page: 1,
                next: Optional(InlineUsersNextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: InlineUsersUsers(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithBodyCursorPagination(
            request: .init(),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithBodyCursorPagination2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = InlineUsersListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
            page: Optional(InlineUsersPage(
                page: 1,
                next: Optional(InlineUsersNextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: InlineUsersUsers(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    ),
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithBodyCursorPagination(
            request: .init(pagination: InlineUsersWithCursor(
                cursor: .value("cursor")
            )),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithOffsetPagination1() async throws -> Void {
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
                  "data": {
                    "users": [
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = InlineUsersListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
            page: Optional(InlineUsersPage(
                page: 1,
                next: Optional(InlineUsersNextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: InlineUsersUsers(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithOffsetPagination(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithOffsetPagination2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = InlineUsersListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
            page: Optional(InlineUsersPage(
                page: 1,
                next: Optional(InlineUsersNextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: InlineUsersUsers(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    ),
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithOffsetPagination(
            page: .value(1),
            perPage: .value(1),
            order: .asc,
            startingAfter: .value("starting_after"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithDoubleOffsetPagination1() async throws -> Void {
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
                  "data": {
                    "users": [
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = InlineUsersListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
            page: Optional(InlineUsersPage(
                page: 1,
                next: Optional(InlineUsersNextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: InlineUsersUsers(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithDoubleOffsetPagination(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithDoubleOffsetPagination2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = InlineUsersListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
            page: Optional(InlineUsersPage(
                page: 1,
                next: Optional(InlineUsersNextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: InlineUsersUsers(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    ),
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithDoubleOffsetPagination(
            page: .value(1.1),
            perPage: .value(1.1),
            order: .asc,
            startingAfter: .value("starting_after"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithBodyOffsetPagination1() async throws -> Void {
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
                  "data": {
                    "users": [
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = InlineUsersListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
            page: Optional(InlineUsersPage(
                page: 1,
                next: Optional(InlineUsersNextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: InlineUsersUsers(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithBodyOffsetPagination(
            request: .init(),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithBodyOffsetPagination2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = InlineUsersListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
            page: Optional(InlineUsersPage(
                page: 1,
                next: Optional(InlineUsersNextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: InlineUsersUsers(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    ),
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithBodyOffsetPagination(
            request: .init(pagination: InlineUsersWithPage(
                page: .value(1)
            )),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithOffsetStepPagination1() async throws -> Void {
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
                  "data": {
                    "users": [
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = InlineUsersListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
            page: Optional(InlineUsersPage(
                page: 1,
                next: Optional(InlineUsersNextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: InlineUsersUsers(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithOffsetStepPagination(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithOffsetStepPagination2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = InlineUsersListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
            page: Optional(InlineUsersPage(
                page: 1,
                next: Optional(InlineUsersNextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: InlineUsersUsers(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    ),
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithOffsetStepPagination(
            page: .value(1),
            limit: .value(1),
            order: .asc,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithOffsetPaginationHasNextPage1() async throws -> Void {
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
                  "data": {
                    "users": [
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = InlineUsersListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
            page: Optional(InlineUsersPage(
                page: 1,
                next: Optional(InlineUsersNextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: InlineUsersUsers(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithOffsetPaginationHasNextPage(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithOffsetPaginationHasNextPage2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = InlineUsersListUsersPaginationResponse(
            hasNextPage: Optional(Nullable<Bool>.value(true)),
            page: Optional(InlineUsersPage(
                page: 1,
                next: Optional(InlineUsersNextPage(
                    page: 1,
                    startingAfter: "starting_after"
                )),
                perPage: 1,
                totalPage: 1
            )),
            totalCount: 1,
            data: InlineUsersUsers(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    ),
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            )
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithOffsetPaginationHasNextPage(
            page: .value(1),
            limit: .value(1),
            order: .asc,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithExtendedResults1() async throws -> Void {
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
        let expectedResponse = InlineUsersListUsersExtendedResponse(
            data: InlineUsersUserListContainer(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            ),
            next: Optional(Nullable<String>.value("next")),
            totalCount: 1
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithExtendedResults(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithExtendedResults2() async throws -> Void {
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
        let expectedResponse = InlineUsersListUsersExtendedResponse(
            totalCount: 1,
            data: InlineUsersUserListContainer(
                users: [
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    ),
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]
            ),
            next: Optional(Nullable<String>.value("next"))
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithExtendedResults(
            cursor: .value("cursor"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithExtendedResultsAndOptionalData1() async throws -> Void {
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
        let expectedResponse = InlineUsersListUsersExtendedOptionalListResponse(
            data: InlineUsersUserOptionalListContainer(
                users: Optional(Nullable<[InlineUsersUser]>.value([
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]))
            ),
            next: Optional(Nullable<String>.value("next")),
            totalCount: 1
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithExtendedResultsAndOptionalData(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithExtendedResultsAndOptionalData2() async throws -> Void {
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
        let expectedResponse = InlineUsersListUsersExtendedOptionalListResponse(
            totalCount: 1,
            data: InlineUsersUserOptionalListContainer(
                users: Optional(Nullable<[InlineUsersUser]>.value([
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    ),
                    InlineUsersUser(
                        name: "name",
                        id: 1
                    )
                ]))
            ),
            next: Optional(Nullable<String>.value("next"))
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithExtendedResultsAndOptionalData(
            cursor: .value("cursor"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListUsernames1() async throws -> Void {
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
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListUsernames(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListUsernames2() async throws -> Void {
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
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListUsernames(
            startingAfter: .value("starting_after"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithGlobalConfig1() async throws -> Void {
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
        let expectedResponse = InlineUsersUsernameContainer(
            results: [
                "results"
            ]
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithGlobalConfig(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func inlineUsersInlineUsersListWithGlobalConfig2() async throws -> Void {
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
        let expectedResponse = InlineUsersUsernameContainer(
            results: [
                "results",
                "results"
            ]
        )
        let response = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithGlobalConfig(
            offset: .value(1),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}