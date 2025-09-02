import Foundation
import InferredAuthImplicitNoExpiry

private func main() async throws {
    let client = SeedInferredAuthImplicitNoExpiryClient()

    try await client.nested.api.getSomething()
}

try await main()
