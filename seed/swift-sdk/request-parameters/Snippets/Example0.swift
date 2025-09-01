import RequestParameters

let client = SeedRequestParametersClient()

try await client.user.createUsername(
    request: .init(
        tags: [
            "tags",
            "tags"
        ],
        username: "username",
        password: "password",
        name: "test"
    )
)
