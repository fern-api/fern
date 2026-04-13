import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.user.getusername(
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
        bigIntParam: 1
    )
}

try await main()
