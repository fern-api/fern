import Foundation
import Nullable

private func main() async throws {
    let client = NullableClient()

    try await client.nullable.createUser(request: .init(
        username: "username",
        tags: [
            "tags",
            "tags"
        ],
        metadata: Metadata(
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            avatar: "avatar",
            activated: True,
            status: Status.active(
                .init(

                )
            ),
            values: [
                "values": "values"
            ]
        ),
        avatar: "avatar"
    ))
}

try await main()
