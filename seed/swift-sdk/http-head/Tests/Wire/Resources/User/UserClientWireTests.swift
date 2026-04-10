import Foundation
import Testing
import HttpHead

@Suite("UserClient Wire Tests") struct UserClientWireTests {
    @Test func list1() async throws -> Void {
        let stub = HTTPStub()
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
        let client = HttpHeadClient(
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
        let response = try await client.user.list(
            limit: 1,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}