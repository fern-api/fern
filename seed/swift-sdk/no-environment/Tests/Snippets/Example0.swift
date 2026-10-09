import Foundation
import NoEnvironment

enum Example0 {
    static func snippet() async throws {
        let client = NoEnvironmentClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.dummy.getDummy()
    }
}
