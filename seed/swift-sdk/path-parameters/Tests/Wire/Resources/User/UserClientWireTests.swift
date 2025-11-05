import Foundation
import Testing
import PathParameters

@Suite("UserClient Wire Tests") struct UserClientWireTests {
    @Test func getUser1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name",
                  "tags": [
                    "tags",
                    "tags"
                  ]
                }
                """.utf8
            )
        )
        let client = PathParametersClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        )
        let response = try await client.user.getUser(userId: "user_id")
        try #require(response == expectedResponse)
    }

    @Test func createUser1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name",
                  "tags": [
                    "tags",
                    "tags"
                  ]
                }
                """.utf8
            )
        )
        let client = PathParametersClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        )
        let response = try await client.user.createUser(
            tenantId: "tenant_id",
            request: User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        )
        try #require(response == expectedResponse)
    }

    @Test func updateUser1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name",
                  "tags": [
                    "tags",
                    "tags"
                  ]
                }
                """.utf8
            )
        )
        let client = PathParametersClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        )
        let response = try await client.user.updateUser(
            userId: "user_id",
            request: .init(body: User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            ))
        )
        try #require(response == expectedResponse)
    }

    @Test func searchUsers1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "name": "name",
                    "tags": [
                      "tags",
                      "tags"
                    ]
                  },
                  {
                    "name": "name",
                    "tags": [
                      "tags",
                      "tags"
                    ]
                  }
                ]
                """.utf8
            )
        )
        let client = PathParametersClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            ),
            User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        ]
        let response = try await client.user.searchUsers(
            userId: "user_id",
            limit: 1
        )
        try #require(response == expectedResponse)
    }

    @Test func getUserMetadata1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name",
                  "tags": [
                    "tags",
                    "tags"
                  ]
                }
                """.utf8
            )
        )
        let client = PathParametersClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        )
        let response = try await client.user.getUserMetadata(
            userId: "user_id",
            version: 1
        )
        try #require(response == expectedResponse)
    }
}