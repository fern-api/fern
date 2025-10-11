import Foundation
import Testing
import ExtraProperties

@Suite("UserClient Wire Tests") struct UserClientWireTests {
    @Test func createUser1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "Alice",
                  "age": 30,
                  "location": "Wonderland"
                }
                """.utf8
            )
        )
        let client = ExtraPropertiesClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            name: "Alice"
        )
        let response = try await client.user.createUser(request: .init(
            type: .createUserRequest,
            version: .v1,
            name: "Alice"
        ))
        try #require(response == expectedResponse)
    }

    @Test func createUser2() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name"
                }
                """.utf8
            )
        )
        let client = ExtraPropertiesClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            name: "name"
        )
        let response = try await client.user.createUser(request: .init(
            type: .createUserRequest,
            version: .v1,
            name: "name"
        ))
        try #require(response == expectedResponse)
    }
}