import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(token: "<token>")

    try await client.service.refreshToken(request: RefreshTokenRequest(
        ttl: 1
    ))
}

try await main()
