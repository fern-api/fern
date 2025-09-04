import Foundation
import OauthClientCredentials

private func main() async throws {
    let client = OauthClientCredentialsClient(baseURL: "https://api.fern.com")

    try await client.simple.getSomething()
}

try await main()
