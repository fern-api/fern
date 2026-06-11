import Foundation
import Exhaustive

enum Example23 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.object.getAndReturnWithUnknownField(request: ObjectWithUnknownField(
            unknown: .object([
                "key": .string("value")
            ])
        ))
    }
}
