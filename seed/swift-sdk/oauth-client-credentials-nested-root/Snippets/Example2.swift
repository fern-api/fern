import Foundation
import OauthClientCredentials

private func main() async throws {
    let client = OauthClientCredentialsClient(baseURL: "https://api.fern.com")

    try await client.nested.api.getSomething()
}

try await main()
