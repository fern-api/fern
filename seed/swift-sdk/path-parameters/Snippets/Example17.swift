import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.user.getuserspecifics(
        tenantId: "tenant_id",
        userId: "user_id",
        version: 1,
        thought: "thought"
    )
}

try await main()
