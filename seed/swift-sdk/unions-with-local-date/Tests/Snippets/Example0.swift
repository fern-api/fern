import Foundation
import Unions

enum Example0 {
    static func snippet() async throws {
        let client = UnionsClient(baseURL: "https://api.fern.com")

        _ = try await client.bigunion.get(id: "id")
    }
}
