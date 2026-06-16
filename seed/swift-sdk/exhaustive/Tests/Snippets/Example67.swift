import Foundation
import Exhaustive

enum Example67 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.reqWithHeaders.getWithCustomHeader(request: "string")
    }
}
