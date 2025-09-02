import Foundation
import OauthClientCredentialsDefault

private func main() async throws {
    let client = OauthClientCredentialsDefaultClient()

    try await client.simple.getSomething()
}

try await main()
