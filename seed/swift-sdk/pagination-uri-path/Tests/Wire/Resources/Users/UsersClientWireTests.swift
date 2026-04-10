import Foundation
import Testing
import PaginationUriPath

@Suite("UsersClient Wire Tests") struct UsersClientWireTests {
    @Test func listWithUriPagination1() async throws -> Void {
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
        let client = PaginationUriPathClient(
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
            next: Optional("next")
        )
        let response = try await client.users.listWithUriPagination(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listWithPathPagination1() async throws -> Void {
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
        let client = PaginationUriPathClient(
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
            next: Optional("next")
        )
        let response = try await client.users.listWithPathPagination(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}