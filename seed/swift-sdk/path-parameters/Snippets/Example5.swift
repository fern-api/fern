import PathParameters

let client = SeedPathParametersClient()

private func main() async throws {
    try await client.user.updateUser(
        userId: "user_id",
        request: .init(
            userId: "user_id",
            body: User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        )
    )
}

try await main()
