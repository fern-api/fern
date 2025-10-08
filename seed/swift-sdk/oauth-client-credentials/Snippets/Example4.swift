import Foundation
import OauthClientCredentials

private func main() async throws {
    let client = OauthClientCredentialsClient(baseURL: "https://api.fern.com")

    _ = try await client.nestedNoAuth.api.getSomething()
}

try await main()
