import Foundation
import Testing
import QueryParameters

@Suite("UserClient Wire Tests") struct UserClientWireTests {
    @Test func getUsername1() async throws -> Void {
        let stub = WireStub()
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
        let client = QueryParametersClient(
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
        let response = try await client.user.getUsername(
            limit: 1,
            id: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
            date: CalendarDate("2023-01-15")!,
            deadline: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            bytes: "SGVsbG8gd29ybGQh",
            user: User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            ),
            userList: [
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
            ],
            optionalDeadline: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            keyValue: [
                "keyValue": "keyValue"
            ],
            optionalString: "optionalString",
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
            )
        )
        try #require(response == expectedResponse)
    }
}