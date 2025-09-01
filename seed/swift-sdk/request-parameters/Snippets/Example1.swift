import RequestParameters

let client = SeedRequestParametersClient()

private func main() async throws {
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
}

try await main()
