import Foundation
import Exhaustive

enum Example13 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.httpMethods.testPut(
            id: "id",
            request: ObjectWithRequiredField(
                string: "string"
            )
        )
    }
}
