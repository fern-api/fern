import Foundation
import Api

enum Example1 {
    static func snippet() async throws {
        let client = ApiClient(token: "<token>")

        _ = try await client.items.listItems()
    }
}
