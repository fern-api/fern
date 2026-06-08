import Foundation
import Exhaustive

enum Example24 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.object.getAndReturnWithDocumentedUnknownType(request: ObjectWithDocumentedUnknownType(
            documentedUnknownType: .object([
                "key": .string("value")
            ])
        ))
    }
}
