import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.endpoints.primitive.getAndReturnDate(request: try! Date("2023-01-15T00:00:00Z", strategy: .iso8601))
}

try await main()
