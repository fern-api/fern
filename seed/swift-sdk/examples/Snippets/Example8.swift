import Foundation
import Examples

private func main() async throws {
    let client = SeedExamplesClient(token: "<token>")

    try await client.health.service.check(id: "id-3tey93i")
}

try await main()
