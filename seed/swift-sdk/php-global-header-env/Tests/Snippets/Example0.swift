import Foundation
import PhpGlobalHeaderEnv

enum Example0 {
    static func snippet() async throws {
        let client = PhpGlobalHeaderEnvClient(baseURL: "https://api.fern.com")

        _ = try await client.service.getWithApiVersion()
    }
}
