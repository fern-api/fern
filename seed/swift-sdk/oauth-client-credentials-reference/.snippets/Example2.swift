import Foundation
import OauthClientCredentialsReference

private func main() async throws {
    let client = OauthClientCredentialsReferenceClient(baseURL: "https://api.fern.com")

    _ = try await client.simple.getSomething()
}

try await main()
