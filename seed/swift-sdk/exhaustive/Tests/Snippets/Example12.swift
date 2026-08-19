import Foundation
import Exhaustive

enum Example12 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.httpMethods.testPost(request: ObjectWithRequiredField(
            string: "string"
        ))
    }
}
