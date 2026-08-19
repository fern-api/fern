import Foundation
import NoRetries

enum Example0 {
    static func snippet() async throws {
        let client = NoRetriesClient(baseURL: "https://api.fern.com")

        _ = try await client.retries.getUsers()
    }
}
