import Foundation
import ContentTypes

private func main() async throws {
    let client = ContentTypesClient(baseURL: "https://api.fern.com")

    try await client.service.namedPatchWithMixed(
        id: "id",
        request: .init(
            appId: "appId",
            instructions: .value("instructions"),
            active: .value(true)
        )
    )
}

try await main()
