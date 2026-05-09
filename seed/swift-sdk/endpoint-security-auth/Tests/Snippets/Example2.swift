import Foundation
import EndpointSecurityAuth

enum Example2 {
    static func snippet() async throws {
        let client = EndpointSecurityAuthClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.user.getWithApiKey()
    }
}
