import Foundation
import Exhaustive

enum Example39 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.params.modifyWithPath(
            param: "param",
            request: "string"
        )
    }
}
