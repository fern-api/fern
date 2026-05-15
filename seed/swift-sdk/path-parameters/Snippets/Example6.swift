import Foundation
import PathParameters

private func main() async throws {
    let client = PathParametersClient(baseURL: "https://api.fern.com")

    _ = try await client.user.searchUsers(
        tenantId: "tenant_id",
        userId: "user_id",
        limit: 1
    )
}

try await main()
