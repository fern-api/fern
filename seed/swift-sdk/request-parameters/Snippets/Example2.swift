import Foundation
import RequestParameters

private func main() async throws {
    let client = RequestParametersClient(baseURL: "https://api.fern.com")

    try await client.user.getUsername(request: .init(
        limit: 1,
        id: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
        date: try! Date("2023-01-15T00:00:00Z", strategy: .iso8601),
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
        ),
        excludeUser: [
            User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        ],
        filter: [
            "filter"
        ],
        longParam: 1000000,
        bigIntParam: 
    ))
}

try await main()
