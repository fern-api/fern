import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.user.searchusers(
        tenantId: "tenant_id",
        userId: "user_id",
        limit: .value(1)
    )
}

try await main()
