import Foundation
import MyCustomModule

enum Example1 {
    static func snippet() async throws {
        let client = MyCustomClient(
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
