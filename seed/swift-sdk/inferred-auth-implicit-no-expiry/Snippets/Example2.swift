import Foundation
import InferredAuthImplicitNoExpiry

private func main() async throws {
    let client = InferredAuthImplicitNoExpiryClient()

    try await client.nestedNoAuth.api.getSomething()
}

try await main()
