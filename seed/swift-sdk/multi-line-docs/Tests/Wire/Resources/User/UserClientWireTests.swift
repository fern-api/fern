import Foundation
import Testing
import MultiLineDocs

@Suite("UserClient Wire Tests") struct UserClientWireTests {
    @Test func createUser1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "name": "name",
                  "age": 1
                }
                """.utf8
            )
        )
        let client = MultiLineDocsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = User(
            id: "id",
            name: "name",
            age: 1
        )
        let response = try await client.user.createUser(request: .init(
            name: "name",
            age: 1
        ))
        try #require(response == expectedResponse)
    }
}