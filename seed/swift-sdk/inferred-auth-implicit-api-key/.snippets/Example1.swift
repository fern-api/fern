import Foundation
import InferredAuthImplicitApiKey

private func main() async throws {
    let client = InferredAuthImplicitApiKeyClient(baseURL: "https://api.fern.com")

    _ = try await client.nestedNoAuth.api.getSomething()
}

try await main()
