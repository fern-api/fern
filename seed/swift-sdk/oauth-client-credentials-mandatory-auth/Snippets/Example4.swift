import Foundation
import OauthClientCredentialsMandatoryAuth

private func main() async throws {
    let client = OauthClientCredentialsMandatoryAuthClient(baseURL: "https://api.fern.com")

    _ = try await client.nested.api.getSomething()
}

try await main()
