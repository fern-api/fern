import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.search(
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
        neighbor: SearchRequestNeighbor.user(
            User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
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
    )
}

try await main()
