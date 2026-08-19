import Foundation
import Exhaustive

enum Example15 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.httpMethods.testDelete(id: "id")
    }
}
