import Foundation
import Api

enum Example5 {
    static func snippet() async throws {
        let client = ApiClient(token: "<token>")

        _ = try await client.files.upload(request: .init(
            name: "name",
            parentId: "parent_id"
        ))
    }
}
