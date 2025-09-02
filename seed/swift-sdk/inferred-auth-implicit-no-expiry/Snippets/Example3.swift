import Foundation
import InferredAuthImplicitNoExpiry

private func main() async throws {
    let client = InferredAuthImplicitNoExpiryClient()

    try await client.nested.api.getSomething()
}

try await main()
