import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    try await client.uploadJsonDocument(request: .init(
        author: "author",
        tags: [
            "tags",
            "tags"
        ],
        title: "title"
    ))
}

try await main()
