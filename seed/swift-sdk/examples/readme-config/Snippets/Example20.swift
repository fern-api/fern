import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.service.refreshToken(request: RefreshTokenRequest(

    ))
}

try await main()
