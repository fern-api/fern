import Foundation
import Exhaustive

enum Example26 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.object.getAndReturnMapOfDocumentedUnknownType(request: [
            "string": .object([
                "key": .string("value")
            ])
        ])
    }
}
