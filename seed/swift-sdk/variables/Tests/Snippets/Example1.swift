import Foundation
import Variables

enum Example1 {
    static func snippet() async throws {
        let client = VariablesClient(baseURL: "https://api.fern.com")

        _ = try await client.service.post()
    }
}
