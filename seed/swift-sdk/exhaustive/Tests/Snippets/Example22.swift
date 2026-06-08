import Foundation
import Exhaustive

enum Example22 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.object.getAndReturnWithUnknownField(request: ObjectWithUnknownField(
            unknown: .object([
                "$ref": .string("https://example.com/schema")
            ])
        ))
    }
}
