import Foundation
import InferredAuthImplicit

private func main() async throws {
    let client = InferredAuthImplicitClient(baseURL: "https://api.fern.com")

    try await client.nestedNoAuth.api.getSomething()
}

try await main()
