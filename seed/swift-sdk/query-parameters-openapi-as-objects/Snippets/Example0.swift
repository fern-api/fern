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
            name: .value("name"),
            tags: .value([
                "tags",
                "tags"
            ])
        ),
        optionalDeadline: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
        keyValue: .value([
            "keyValue": .value("keyValue")
        ]),
        optionalString: .value("optionalString"),
        nestedUser: .value(NestedUser(
            name: .value("name"),
            user: .value(User(
                name: .value("name"),
                tags: .value([
                    "tags",
                    "tags"
                ])
            ))
        )),
        optionalUser: .value(User(
            name: .value("name"),
            tags: .value([
                "tags",
                "tags"
            ])
        )),
        neighbor: .value(SearchRequestNeighbor.user(
            User(
                name: .value("name"),
                tags: .value([
                    "tags",
                    "tags"
                ])
            )
        )),
        neighborRequired: User(
            name: .value("name"),
            tags: .value([
                "tags",
                "tags"
            ])
        )
    )
}

try await main()
