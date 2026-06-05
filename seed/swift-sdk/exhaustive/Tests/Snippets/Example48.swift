import Foundation
import Exhaustive

enum Example48 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.primitive.getAndReturnDouble(request: 1.1)
    }
}
