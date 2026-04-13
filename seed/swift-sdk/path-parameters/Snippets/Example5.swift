import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.organizations.searchorganizations(
        tenantId: "tenant_id",
        organizationId: "organization_id",
        limit: .value(1)
    )
}

try await main()
