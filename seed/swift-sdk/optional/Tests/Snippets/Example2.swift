import Foundation
import ObjectsWithImports

enum Example2 {
    static func snippet() async throws {
        let client = ObjectsWithImportsClient(baseURL: "https://api.fern.com")

        _ = try await client.optional.sendOptionalNullableWithAllOptionalProperties(
            actionId: "actionId",
            id: "id",
            request: .value(DeployParams(
                updateDraft: true
            ))
        )
    }
}
