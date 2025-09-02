import Foundation
import InferredAuthImplicit

private func main() async throws {
    let client = InferredAuthImplicitClient()

    try await client.simple.getSomething()
}

try await main()
