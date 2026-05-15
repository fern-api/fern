import Foundation
import PathParameters

private func main() async throws {
    let client = PathParametersClient(baseURL: "https://api.fern.com")

    _ = try await client.user.getUserMetadata(
        tenantId: "tenant_id",
        userId: "user_id",
        version: "1"
    )
}

try await main()
