import Foundation
import ContentTypes

private func main() async throws {
    let client = ContentTypesClient(baseURL: "https://api.fern.com")

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
