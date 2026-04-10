import Foundation
import Testing
import MultiLineDocs

@Suite("UserClient Wire Tests") struct UserClientWireTests {
    @Test func createUser1() async throws -> Void {
        let stub = HTTPStub()
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
            age: Optional(1)
        )
        let response = try await client.user.createUser(
            request: .init(
                name: "name",
                age: 1
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}