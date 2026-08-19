import Foundation
import Exhaustive

enum Example37 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.params.getWithPathAndQuery(
            param: "param",
            query: "query"
        )
    }
}
