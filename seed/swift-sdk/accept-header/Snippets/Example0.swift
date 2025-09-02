import Foundation
import Accept

private func main() async throws {
    let client = SeedAcceptClient(token: "<token>")

    try await client.service.endpoint()
}

try await main()
