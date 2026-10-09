import Foundation
import Unions

enum Example3 {
    static func snippet() async throws {
        let client = UnionsClient(baseURL: "https://api.fern.com")

        _ = try await client.union.get(id: "id")
    }
}
