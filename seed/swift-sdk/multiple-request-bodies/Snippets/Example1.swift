import Api

let client = SeedApiClient(token: "<token>")

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
