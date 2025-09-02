import Foundation
import InferredAuthExplicit

private func main() async throws {
    let client = InferredAuthExplicitClient()

    try await client.simple.getSomething()
}

try await main()
