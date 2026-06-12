import Foundation
import Exhaustive

enum Example26 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.object.getAndReturnWithMixedRequiredAndOptionalFields(request: ObjectWithMixedRequiredAndOptionalFields(
            requiredString: "hello",
            requiredInteger: 0,
            optionalString: "world",
            requiredLong: 0
        ))
    }
}
