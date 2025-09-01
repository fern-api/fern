import Api

let client = SeedApiClient(token: "<token>")

private func main() async throws {
    try await client.uploadJsonDocument(
        request: .init(
            author: "author",
            tags: [
                "tags",
                "tags"
            ],
            title: "title"
        )
    )
}

try await main()
