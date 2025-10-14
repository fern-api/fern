import Foundation
import ContentTypes

private func main() async throws {
    let client = ContentTypesClient(baseURL: "https://api.fern.com")

    _ = try await client.service.patchComplex(
        id: "id",
        request: .init(
            name: "name",
            age: 1,
            active: true,
            metadata: [
                "metadata": .object([
                    "key": .string("value")
                ])
            ],
            tags: [
                "tags",
                "tags"
            ],
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
