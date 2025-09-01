import RequestParameters

private func main() async throws {
    let client = SeedRequestParametersClient()

    try await client.user.createUsername(request: .init(
        tags: [
            "tags",
            "tags"
        ],
        username: "username",
        password: "password",
        name: "test"
    ))
}

try await main()
