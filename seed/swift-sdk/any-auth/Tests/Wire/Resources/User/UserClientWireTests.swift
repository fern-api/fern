import Foundation
import Testing
import AnyAuth

@Suite("UserClient Wire Tests") struct UserClientWireTests {
    @Test func get1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name"
                  },
                  {
                    "id": "id",
                    "name": "name"
                  }
                ]
                """.utf8
            )
        )
        let client = AnyAuthClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                id: "id",
                name: "name"
            ),
            User(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.user.get()
        try #require(response == expectedResponse)
    }

    @Test func getAdmins1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name"
                  },
                  {
                    "id": "id",
                    "name": "name"
                  }
                ]
                """.utf8
            )
        )
        let client = AnyAuthClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                id: "id",
                name: "name"
            ),
            User(
                id: "id",
                name: "name"
            )
        ]
        let response = try await client.user.getAdmins()
        try #require(response == expectedResponse)
    }
}