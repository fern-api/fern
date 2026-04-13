import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.getresource(
        resourceId: "resourceId",
        includeMetadata: true,
        format: "format"
    )
}

try await main()
