import Foundation
import Exhaustive

enum Example5 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.container.getAndReturnMapOfPrimToObject(request: [
            "string": ObjectWithRequiredField(
                string: "string"
            )
        ])
    }
}
