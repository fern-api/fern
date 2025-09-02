import Foundation
import PathParameters

private func main() async throws {
    let client = SeedPathParametersClient()

    try await client.organizations.getOrganization(
        tenantId: "tenant_id",
        organizationId: "organization_id"
    )
}

try await main()
