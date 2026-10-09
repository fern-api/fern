import Foundation
import PathParameters

enum Example2 {
    static func snippet() async throws {
        let client = PathParametersClient(baseURL: "https://api.fern.com")

        _ = try await client.organizations.searchOrganizations(
            tenantId: "tenant_id",
            organizationId: "organization_id",
            limit: 1
        )
    }
}
