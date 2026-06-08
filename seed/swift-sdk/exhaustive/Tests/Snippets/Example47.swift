import Foundation
import Exhaustive

enum Example47 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.primitive.getAndReturnLong(request: 1000000)
    }
}
