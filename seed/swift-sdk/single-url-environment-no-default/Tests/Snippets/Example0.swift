import Foundation
import SingleUrlEnvironmentNoDefault

enum Example0 {
    static func snippet() async throws {
        let client = SingleUrlEnvironmentNoDefaultClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.dummy.getDummy()
    }
}
