import Foundation
import Exhaustive

enum Example66 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.reqWithHeaders.getWithCustomHeader(
            xTestServiceHeader: "X-TEST-SERVICE-HEADER",
            xTestEndpointHeader: "X-TEST-ENDPOINT-HEADER",
            request: "string"
        )
    }
}
