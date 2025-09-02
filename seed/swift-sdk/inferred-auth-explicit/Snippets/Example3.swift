import Foundation
import InferredAuthExplicit

private func main() async throws {
    let client = SeedInferredAuthExplicitClient()

    try await client.nested.api.getSomething()
}

try await main()
