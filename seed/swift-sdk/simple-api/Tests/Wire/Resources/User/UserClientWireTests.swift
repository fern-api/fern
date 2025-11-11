import Foundation
import Testing
import SimpleApi

@Suite("UserClient Wire Tests") struct UserClientWireTests {
    @Test func get1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name",
                  "email": "email"
                }
                """.utf8
            )
        )
        let client = SimpleApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            id: "id",
            name: "name",
            email: "email"
        )
        let response = try await client.user.get(
            id: "id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}