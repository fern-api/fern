import Foundation
import Testing
import MixedFileDirectory

@Suite("UserClient Wire Tests") struct UserClientWireTests {
    @Test func list1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "id": "id",
                    "name": "name",
                    "age": 1
                  },
                  {
                    "id": "id",
                    "name": "name",
                    "age": 1
                  }
                ]
                """.utf8
            )
        )
        let client = MixedFileDirectoryClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            User(
                id: "id",
                name: "name",
                age: 1
            ),
            User(
                id: "id",
                name: "name",
                age: 1
            )
        ]
        let response = try await client.user.list(
            limit: 1,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}