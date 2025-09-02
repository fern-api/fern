import Foundation
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(
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
