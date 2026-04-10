import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.user.getuser(
        tenantId: "tenant_id",
        userId: "user_id"
    )
}

try await main()
