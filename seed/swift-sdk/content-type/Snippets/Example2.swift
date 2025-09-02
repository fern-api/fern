import Foundation
import ContentTypes

private func main() async throws {
    let client = SeedContentTypesClient()

    try await client.service.namedPatchWithMixed(
        id: "id",
        request: .init(
            id: "id",
            appId: "appId",
            instructions: "instructions",
            active: True
        )
    )
}

try await main()
