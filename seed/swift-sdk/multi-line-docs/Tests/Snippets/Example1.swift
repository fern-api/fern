import Foundation
import MultiLineDocs

enum Example1 {
    static func snippet() async throws {
        let client = MultiLineDocsClient(baseURL: "https://api.fern.com")

        _ = try await client.user.createUser(request: .init(
            name: "name",
            age: 1
        ))
    }
}
