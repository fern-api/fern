import Foundation
import ContentTypes

private func main() async throws {
    let client = SeedContentTypesClient()

    try await client.service.patchComplex(
        id: "id",
        request: .init(
            id: "id",
            name: "name",
            age: 1,
            active: True,
            metadata: [
                "metadata": .object([
                    "key": .string("value")
                ])
            ],
            tags: [
                "tags",
                "tags"
            ],
            email: "email",
            nickname: "nickname",
            bio: "bio",
            profileImageUrl: "profileImageUrl",
            settings: [
                "settings": .object([
                    "key": .string("value")
                ])
            ]
        )
    )
}

try await main()
