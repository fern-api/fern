import Foundation
import Unions

private func main() async throws {
    let client = UnionsClient(baseURL: "https://api.fern.com")

    try await client.bigunion.update(request: BigUnion.normalSweet(
        .init(
            id: "id",
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            archivedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            value: "value"
        )
    ))
}

try await main()
