import Foundation
import Api

private func main() async throws {
    let client = ApiClient()

    try await client.search(request: .init(
        limit: 1,
        id: "id",
        date: "date",
        deadline: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
        bytes: "bytes",
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
        neighbor: User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        ),
        neighborRequired: SearchRequestNeighborRequired.user(
            User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        )
    ))
}

try await main()
