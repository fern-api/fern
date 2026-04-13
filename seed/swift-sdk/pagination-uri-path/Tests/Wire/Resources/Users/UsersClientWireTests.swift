import Foundation
import Testing
import Api

@Suite("UsersClient Wire Tests") struct UsersClientWireTests {
    @Test func listwithuripagination1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": [
                    {
                      "name": "name",
                      "id": 1
                    }
                  ],
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
        let expectedResponse = ListUsersUriPaginationResponse(
            data: [
                User(
                    name: "name",
                    id: 1
                )
            ],
            next: Optional(Nullable<String>.value("next"))
        )
        let response = try await client.users.listwithuripagination(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listwithuripagination2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": [
                    {
                      "name": "name",
                      "id": 1
                    },
                    {
                      "name": "name",
                      "id": 1
                    }
                  ],
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
        let expectedResponse = ListUsersUriPaginationResponse(
            data: [
                User(
                    name: "name",
                    id: 1
                ),
                User(
                    name: "name",
                    id: 1
                )
            ],
            next: Optional(Nullable<String>.value("next"))
        )
        let response = try await client.users.listwithuripagination(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listwithpathpagination1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": [
                    {
                      "name": "name",
                      "id": 1
                    }
                  ],
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
        let expectedResponse = ListUsersPathPaginationResponse(
            data: [
                User(
                    name: "name",
                    id: 1
                )
            ],
            next: Optional(Nullable<String>.value("next"))
        )
        let response = try await client.users.listwithpathpagination(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listwithpathpagination2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "data": [
                    {
                      "name": "name",
                      "id": 1
                    },
                    {
                      "name": "name",
                      "id": 1
                    }
                  ],
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
        let expectedResponse = ListUsersPathPaginationResponse(
            data: [
                User(
                    name: "name",
                    id: 1
                ),
                User(
                    name: "name",
                    id: 1
                )
            ],
            next: Optional(Nullable<String>.value("next"))
        )
        let response = try await client.users.listwithpathpagination(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}