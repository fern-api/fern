import Foundation
import Unions

enum Example2 {
    static func snippet() async throws {
        let client = UnionsClient(baseURL: "https://api.fern.com")

        _ = try await client.bigunion.updateMany(request: [
            BigUnion.normalSweet(
                NormalSweet(
                    value: "value"
                )
            ),
            BigUnion.normalSweet(
                NormalSweet(
                    value: "value"
                )
            )
        ])
    }
}
