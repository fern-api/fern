import Foundation
import ContentTypes

enum Example2 {
    static func snippet() async throws {
        let client = ContentTypesClient(baseURL: "https://api.fern.com")

        _ = try await client.service.namedPatchWithMixed(
            id: "id",
            request: .init(
                appId: "appId",
                instructions: .value("instructions"),
                active: .value(true)
            )
        )
    }
}
