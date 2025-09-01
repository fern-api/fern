import RequestParameters

let client = SeedRequestParametersClient()

try await client.user.createUsernameWithReferencedType(
    request: .init(
        tags: [
            "tags",
            "tags"
        ],
        body: CreateUsernameBody(
            username: "username",
            password: "password",
            name: "test"
        )
    )
)
