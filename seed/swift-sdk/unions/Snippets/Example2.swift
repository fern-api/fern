import Foundation
import Unions

private func main() async throws {
    let client = UnionsClient(baseURL: "https://api.fern.com")

    _ = try await client.bigunion.updateMany(request: [
        BigUnion.normalSweet(
            .init(
                id: "id",
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                archivedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                value: "value"
            )
        ),
        BigUnion.normalSweet(
            .init(
                id: "id",
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                archivedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                value: "value"
            )
        )
    ])
}

try await main()
