import RequestParameters

let client = SeedRequestParametersClient()

private func main() async throws {
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
}

try await main()
