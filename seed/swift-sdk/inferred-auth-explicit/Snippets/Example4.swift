import Foundation
import InferredAuthExplicit

private func main() async throws {
    let client = InferredAuthExplicitClient(baseURL: "https://api.fern.com")

    _ = try await client.simple.getSomething()
}

try await main()
