import Foundation
import NurseryApi

enum Example0 {
    static func snippet() async throws {
        let client = NurseryApiClient(baseURL: "https://api.fern.com")

        _ = try await client.package.test(for: "for")
    }
}
