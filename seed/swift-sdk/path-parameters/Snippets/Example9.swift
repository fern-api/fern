import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.user.updateuser(
        tenantId: "tenant_id",
        userId: "user_id",
        request: .init(body: User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        ))
    )
}

try await main()
