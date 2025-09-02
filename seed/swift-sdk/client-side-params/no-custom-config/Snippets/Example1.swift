import Foundation
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(token: "<token>")

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
