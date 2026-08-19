import Foundation
import ClientSideParams

enum Example1 {
    static func snippet() async throws {
        let client = ClientSideParamsClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.service.getResource(
            resourceId: "resourceId",
            includeMetadata: true,
            format: "json"
        )
    }
}
