import Foundation
import InferredAuthImplicitNoExpiry

private func main() async throws {
    let client = InferredAuthImplicitNoExpiryClient(baseURL: "https://api.fern.com")

    try await client.simple.getSomething()
}

try await main()
