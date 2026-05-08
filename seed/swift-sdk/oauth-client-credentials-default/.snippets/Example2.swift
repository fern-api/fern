import Foundation
import OauthClientCredentialsDefault

private func main() async throws {
    let client = OauthClientCredentialsDefaultClient(baseURL: "https://api.fern.com")

    _ = try await client.nested.api.getSomething()
}

try await main()
