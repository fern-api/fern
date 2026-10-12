import Foundation
import Api

enum Example4 {
    static func snippet() async throws {
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.files.upload(request: .init(
            name: "name",
            parentId: "parent_id"
        ))
    }
}
