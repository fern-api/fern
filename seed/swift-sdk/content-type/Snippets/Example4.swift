import Foundation
import ContentTypes

private func main() async throws {
    let client = SeedContentTypesClient()

    try await client.service.regularPatch(
        id: "id",
        request: .init(
            id: "id",
            field1: "field1",
            field2: 1
        )
    )
}

try await main()
