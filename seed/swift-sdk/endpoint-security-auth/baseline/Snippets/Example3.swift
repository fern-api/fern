import Foundation
import EndpointSecurityAuth

private func main() async throws {
    let client = EndpointSecurityAuthClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.user.getWithOAuth()
}

try await main()
