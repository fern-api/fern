import Foundation
import SingleUrlEnvironmentDefault

enum Example0 {
    static func snippet() async throws {
        let client = SingleUrlEnvironmentDefaultClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.dummy.getDummy()
    }
}
