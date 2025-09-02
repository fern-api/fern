import Foundation
import Exhaustive

private func main() async throws {
    let client = SeedExhaustiveClient(token: "<token>")

    try await client.endpoints.primitive.getAndReturnLong(request: 1000000)
}

try await main()
