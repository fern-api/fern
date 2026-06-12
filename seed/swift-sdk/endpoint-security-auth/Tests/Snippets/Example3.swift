import Foundation
import EndpointSecurityAuth

enum Example3 {
    static func snippet() async throws {
        let client = EndpointSecurityAuthClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.user.getWithOAuth()
    }
}
