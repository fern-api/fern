import Foundation
import Unions

private func main() async throws {
    let client = UnionsClient()

    try await client.bigunion.update(request: BigUnion.normalSweet(
        .init(
            id: "id",
            createdAt: Date(timeIntervalSince1970: 1705311000),
            archivedAt: Date(timeIntervalSince1970: 1705311000),
            value: "value"
        )
    ))
}

try await main()
