import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.service.patchcomplex(
        id: "id",
        request: .init(
            name: .value("name"),
            age: .value(1),
            active: .value(true),
            metadata: .value([
                "metadata": .object([
                    "key": .string("value")
                ])
            ]),
            tags: .value([
                "tags",
                "tags"
            ]),
            email: .value("email"),
            nickname: .value("nickname"),
            bio: .value("bio"),
            profileImageUrl: .value("profileImageUrl"),
            settings: .value([
                "settings": .object([
                    "key": .string("value")
                ])
            ])
        )
    )
}

try await main()
