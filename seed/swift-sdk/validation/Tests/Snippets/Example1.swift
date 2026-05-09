import Foundation
import Validation

enum Example1 {
    static func snippet() async throws {
        let client = ValidationClient(baseURL: "https://api.fern.com")

        _ = try await client.get(
            decimal: 2.2,
            even: 100,
            name: "fern"
        )
    }
}
