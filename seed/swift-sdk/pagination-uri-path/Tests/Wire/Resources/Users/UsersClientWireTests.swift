import Foundation
import Testing
import PaginationUriPath

@Suite("UsersClient Wire Tests") struct UsersClientWireTests {
    @Test func listWithUriPagination1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "data": [
                    {
                      "name": "Alice",
                      "id": 1
                    },
                    {
                      "name": "Bob",
                      "id": 2
                    }
                  ],
                  "next": "next"
                }
                """#.utf8
            )
        )
        let client = PaginationUriPathClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersUriPaginationResponse(
            data: [
                User(
                    name: "Alice",
                    id: 1
                ),
                User(
                    name: "Bob",
                    id: 2
                )
            ],
            next: Optional("next")
        )
        let response = try await client.users.listWithUriPagination(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listWithUriPagination2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "data": [
                    {
                      "name": "Alice",
                      "id": 1
                    },
                    {
                      "name": "Bob",
                      "id": 2
                    }
                  ],
                  "next": ""
                }
                """#.utf8
            )
        )
        let client = PaginationUriPathClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersUriPaginationResponse(
            data: [
                User(
                    name: "Alice",
                    id: 1
                ),
                User(
                    name: "Bob",
                    id: 2
                )
            ],
            next: Optional("")
        )
        let response = try await client.users.listWithUriPagination(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listWithPathPagination1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "data": [
                    {
                      "name": "Alice",
                      "id": 1
                    },
                    {
                      "name": "Bob",
                      "id": 2
                    }
                  ],
                  "next": "next"
                }
                """#.utf8
            )
        )
        let client = PaginationUriPathClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersPathPaginationResponse(
            data: [
                User(
                    name: "Alice",
                    id: 1
                ),
                User(
                    name: "Bob",
                    id: 2
                )
            ],
            next: Optional("next")
        )
        let response = try await client.users.listWithPathPagination(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listWithPathPagination2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "data": [
                    {
                      "name": "Alice",
                      "id": 1
                    },
                    {
                      "name": "Bob",
                      "id": 2
                    }
                  ],
                  "next": ""
                }
                """#.utf8
            )
        )
        let client = PaginationUriPathClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ListUsersPathPaginationResponse(
            data: [
                User(
                    name: "Alice",
                    id: 1
                ),
                User(
                    name: "Bob",
                    id: 2
                )
            ],
            next: Optional("")
        )
        let response = try await client.users.listWithPathPagination(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}