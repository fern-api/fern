import Foundation
import Api

enum Example1 {
    static func snippet() async throws {
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.uploadJsonDocument(request: .init(
            author: "author",
            tags: [
                "tags",
                "tags"
            ],
            title: "title"
        ))
    }
}
