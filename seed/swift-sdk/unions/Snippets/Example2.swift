import Foundation
import Unions

private func main() async throws {
    let client = SeedUnionsClient()

    try await client.bigunion.updateMany(request: [
        BigUnion.normalSweet(
            .init(
                id: "id",
                createdAt: Date(timeIntervalSince1970: 1705311000),
                archivedAt: Date(timeIntervalSince1970: 1705311000),
                value: "value"
            )
        ),
        BigUnion.normalSweet(
            .init(
                id: "id",
                createdAt: Date(timeIntervalSince1970: 1705311000),
                archivedAt: Date(timeIntervalSince1970: 1705311000),
                value: "value"
            )
        )
    ])
}

try await main()
