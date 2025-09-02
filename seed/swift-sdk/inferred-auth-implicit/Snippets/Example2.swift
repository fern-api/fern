import Foundation
import InferredAuthImplicit

private func main() async throws {
    let client = SeedInferredAuthImplicitClient()

    try await client.nestedNoAuth.api.getSomething()
}

try await main()
