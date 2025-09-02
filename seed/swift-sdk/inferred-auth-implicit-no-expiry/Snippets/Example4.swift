import Foundation
import InferredAuthImplicitNoExpiry

private func main() async throws {
    let client = InferredAuthImplicitNoExpiryClient()

    try await client.simple.getSomething()
}

try await main()
