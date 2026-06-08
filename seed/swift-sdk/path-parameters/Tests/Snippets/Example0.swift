import Foundation
import PathParameters

enum Example0 {
    static func snippet() async throws {
        let client = PathParametersClient(baseURL: "https://api.fern.com")

        _ = try await client.organizations.getOrganization(
            tenantId: "tenant_id",
            organizationId: "organization_id"
        )
    }
}
