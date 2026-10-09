import Foundation
import Exhaustive

enum Example1 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.container.getAndReturnListOfObjects(request: [
            ObjectWithRequiredField(
                string: "string"
            ),
            ObjectWithRequiredField(
                string: "string"
            )
        ])
    }
}
