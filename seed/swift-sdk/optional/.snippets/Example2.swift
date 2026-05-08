import Foundation
import ObjectsWithImports

private func main() async throws {
    let client = ObjectsWithImportsClient(baseURL: "https://api.fern.com")

    _ = try await client.optional.sendOptionalNullableWithAllOptionalProperties(
        actionId: "actionId",
        id: "id",
        request: .value(DeployParams(
            updateDraft: true
        ))
    )
}

try await main()
