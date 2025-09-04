import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.service.getResource(
        resourceId: "resourceId",
        request: .init(
            resourceId: "resourceId",
            includeMetadata: True,
            format: "json"
        )
    )
}

try await main()
