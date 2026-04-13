import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.user.getusermetadata(
        tenantId: "tenant_id",
        userId: "user_id",
        version: 1
    )
}

try await main()
