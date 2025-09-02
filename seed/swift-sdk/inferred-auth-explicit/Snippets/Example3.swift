import Foundation
import InferredAuthExplicit

private func main() async throws {
    let client = InferredAuthExplicitClient()

    try await client.nested.api.getSomething()
}

try await main()
