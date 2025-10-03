import Foundation
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.getResource(
        resourceId: "resourceId",
        includeMetadata: true,
        format: "json"
    )
}

try await main()
