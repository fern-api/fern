import RequestParameters

private func main() async throws {
    let client = SeedRequestParametersClient()

    try await client.user.createUsernameWithReferencedType(request: .init(
        tags: [
            "tags",
            "tags"
        ],
        body: CreateUsernameBody(
            username: "username",
            password: "password",
            name: "test"
        )
    ))
}

try await main()
