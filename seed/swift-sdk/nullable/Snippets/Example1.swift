import Nullable

let client = SeedNullableClient()

try await client.nullable.createUser(
    request: .init(
        username: "username",
        tags: [
            "tags",
            "tags"
        ],
        metadata: Metadata(
            createdAt: Date(timeIntervalSince1970: 1705311000),
            updatedAt: Date(timeIntervalSince1970: 1705311000),
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
    )
)
