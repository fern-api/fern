import Foundation
import Api

enum Example3 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.contacts.get(id: "id")
    }
}
