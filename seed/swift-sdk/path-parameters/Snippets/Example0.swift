import Foundation
import PathParameters

private func main() async throws {
    let client = PathParametersClient(baseURL: "https://api.fern.com")

    try await client.organizations.getOrganization(
        tenantId: "tenant_id",
        organizationId: "organization_id"
    )
}

try await main()
