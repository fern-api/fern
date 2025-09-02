import Foundation
import Exhaustive

private func main() async throws {
    let client = SeedExhaustiveClient(token: "<token>")

    try await client.endpoints.params.getWithQuery(request: .init(
        query: "query",
        number: 1
    ))
}

try await main()
