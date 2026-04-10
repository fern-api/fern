import Foundation
import Testing
import Api

@Suite("UserClient Wire Tests") struct UserClientWireTests {
    @Test func getusername1() async throws -> Void {
        let stub = HTTPStub()
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
        let client = ApiClient(
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
        let response = try await client.user.getusername(
            limit: 1,
            id: "id",
            date: CalendarDate("2023-01-15")!,
            deadline: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            bytes: "bytes",
            user: User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            ),
            optionalDeadline: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            keyValue: [
                "keyValue": "keyValue"
            ],
            optionalString: .value("optionalString"),
            nestedUser: NestedUser(
                name: "name",
                user: User(
                    name: "name",
                    tags: [
                        "tags",
                        "tags"
                    ]
                )
            ),
            optionalUser: User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            ),
            longParam: 1000000,
            bigIntParam: 1,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}