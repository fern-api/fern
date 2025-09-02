import Foundation
import PathParameters

private func main() async throws {
    let client = SeedPathParametersClient()

    try await client.organizations.getOrganizationUser(
        organizationId: "organization_id",
        userId: "user_id",
        request: .init(
            organizationId: "organization_id",
            userId: "user_id"
        )
    )
}

try await main()
