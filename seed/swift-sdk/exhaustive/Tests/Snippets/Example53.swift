import Foundation
import Exhaustive

enum Example53 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.primitive.getAndReturnBase64(request: "SGVsbG8gd29ybGQh")
    }
}
