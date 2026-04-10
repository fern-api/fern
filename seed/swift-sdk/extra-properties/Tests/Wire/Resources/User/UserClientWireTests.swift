import Foundation
import Testing
import Api

@Suite("UserClient Wire Tests") struct UserClientWireTests {
    @Test func createuser1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            name: "name"
        )
        let response = try await client.user.createuser(
            request: .init(
                type: .createUserRequest,
                version: .v1,
                name: "name"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createuser2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            name: "name"
        )
        let response = try await client.user.createuser(
            request: .init(
                type: .createUserRequest,
                version: .v1,
                name: "name"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}