import Foundation
import PathParameters

private func main() async throws {
    let client = PathParametersClient(baseURL: "https://api.fern.com")

    _ = try await client.organizations.getOrganizationUser(
        organizationId: "organization_id",
        userId: "user_id"
    )
}

try await main()
