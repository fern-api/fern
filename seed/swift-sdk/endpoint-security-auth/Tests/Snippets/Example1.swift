import Foundation
import EndpointSecurityAuth

enum Example1 {
    static func snippet() async throws {
        let client = EndpointSecurityAuthClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.user.getWithBearer()
    }
}
