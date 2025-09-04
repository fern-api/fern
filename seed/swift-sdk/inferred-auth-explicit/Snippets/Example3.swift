import Foundation
import InferredAuthExplicit

private func main() async throws {
    let client = InferredAuthExplicitClient(baseURL: "https://api.fern.com")

    try await client.nested.api.getSomething()
}

try await main()
