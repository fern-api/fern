import Foundation
import Exhaustive

private func main() async throws {
    let client = SeedExhaustiveClient(token: "<token>")

    try await client.endpoints.urls.noEndingSlash()
}

try await main()
