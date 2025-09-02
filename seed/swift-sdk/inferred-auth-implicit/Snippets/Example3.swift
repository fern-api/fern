import Foundation
import InferredAuthImplicit

private func main() async throws {
    let client = InferredAuthImplicitClient()

    try await client.nested.api.getSomething()
}

try await main()
