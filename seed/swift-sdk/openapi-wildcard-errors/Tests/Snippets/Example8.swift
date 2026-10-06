import Foundation
import Api

enum Example8 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.items.getItem(itemId: "item_id")
    }
}
