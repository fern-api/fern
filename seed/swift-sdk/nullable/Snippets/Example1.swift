import Foundation
import Nullable

private func main() async throws {
    let client = NullableClient(baseURL: "https://api.fern.com")

    _ = try await client.nullable.createUser(request: .init(
        username: "username",
        tags: [
            "tags",
            "tags"
        ],
        metadata: Metadata(
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            avatar: .value("avatar"),
            activated: .value(true),
            status: Status.active(
                .init(

                )
            ),
            values: [
                "values": .value("values")
            ]
        ),
        avatar: .value("avatar")
    ))
}

try await main()
