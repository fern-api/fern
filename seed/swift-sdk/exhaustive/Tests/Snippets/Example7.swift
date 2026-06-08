import Foundation
import Exhaustive

enum Example7 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.container.getAndReturnOptional(request: ObjectWithRequiredField(
            string: "string"
        ))
    }
}
