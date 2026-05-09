import Foundation
import BearerTokenEnvironmentVariable

enum Example0 {
    static func snippet() async throws {
        let client = BearerTokenEnvironmentVariableClient(
            baseURL: "https://api.fern.com",
            apiKey: "YOUR_API_KEY"
        )

        _ = try await client.service.getWithBearerToken()
    }
}
