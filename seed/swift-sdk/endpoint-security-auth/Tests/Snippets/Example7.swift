import Foundation
import EndpointSecurityAuth

enum Example7 {
    static func snippet() async throws {
        let client = EndpointSecurityAuthClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.user.getWithAllAuth()
    }
}
