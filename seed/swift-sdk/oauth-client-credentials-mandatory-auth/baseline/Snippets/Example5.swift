import Foundation
import OauthClientCredentialsMandatoryAuth

private func main() async throws {
    let client = OauthClientCredentialsMandatoryAuthClient(baseURL: "https://api.fern.com")

    _ = try await client.simple.getSomething()
}

try await main()
