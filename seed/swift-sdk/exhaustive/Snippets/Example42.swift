import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.primitive.getAndReturnDatetime(request: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))
}

try await main()
