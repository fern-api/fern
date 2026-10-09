import Foundation
import Unions

enum Example4 {
    static func snippet() async throws {
        let client = UnionsClient(baseURL: "https://api.fern.com")

        _ = try await client.types.get(id: "datetime-example")
    }
}
