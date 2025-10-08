import Foundation
import Testing
import Version

@Suite("UserClient Wire Tests") struct UserClientWireTests {
    @Test func getUser1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name"
                }
                """.utf8
            )
        )
        let client = VersionClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            id: "id",
            name: "name"
        )
        let response = try await client.user.getUser(userId: "userId")
        try #require(response == expectedResponse)
    }
}