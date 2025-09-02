import Foundation
import InferredAuthExplicit

private func main() async throws {
    let client = InferredAuthExplicitClient()

    try await client.nestedNoAuth.api.getSomething()
}

try await main()
